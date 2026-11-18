"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MastodonProvider = void 0;
const make_is_1 = require("../../services/make.is");
const make_secure_id_1 = require("../../services/make.secure.id");
const social_abstract_1 = require("../social.abstract");
const ssrf_safe_dispatcher_1 = require("../../dtos/webhooks/ssrf.safe.dispatcher");
const timer_1 = require("../../../../helpers/src/utils/timer");
const dayjs_1 = __importDefault(require("dayjs"));
const form_data_1 = __importDefault(require("form-data"));
const stream_1 = require("stream");
class MastodonProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 10;
        this.identifier = 'mastodon';
        this.name = 'Mastodon';
        this.isBetweenSteps = false;
        this.scopes = ['write:statuses', 'profile', 'write:media'];
        this.editor = 'normal';
    }
    maxLength() {
        return 500;
    }
    handleErrors(body, status) {
        if (body.includes('Your login is currently disabled')) {
            return {
                type: 'refresh-token',
                value: 'Your login is currently disabled',
            };
        }
        if (body.includes('not finished processing')) {
            return {
                type: 'bad-body',
                value: 'The media was still processing when the post was published, please try again',
            };
        }
        if (body.includes('could not be found')) {
            return {
                type: 'bad-body',
                value: 'The uploaded media expired before the post was published, please post again',
            };
        }
        return undefined;
    }
    async refreshToken(refreshToken) {
        return {
            refreshToken: '',
            expiresIn: 0,
            accessToken: '',
            id: '',
            name: '',
            picture: '',
            username: '',
        };
    }
    generateUrlDynamic(customUrl, state, clientId, url) {
        return `${customUrl}/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(`${url}/integrations/social/mastodon`)}&scope=${this.scopes.join('+')}&state=${state}`;
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        const url = this.generateUrlDynamic(process.env.MASTODON_URL || 'https://mastodon.social', state, process.env.MASTODON_CLIENT_ID, process.env.FRONTEND_URL);
        return {
            url,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async dynamicAuthenticate(clientId, clientSecret, url, code) {
        const form = new FormData();
        form.append('client_id', clientId);
        form.append('client_secret', clientSecret);
        form.append('code', code);
        form.append('grant_type', 'authorization_code');
        form.append('redirect_uri', `${process.env.FRONTEND_URL}/integrations/social/mastodon`);
        form.append('scope', this.scopes.join(' '));
        const tokenInformation = await (await this.fetch(`${url}/oauth/token`, {
            method: 'POST',
            body: form,
        })).json();
        const personalInformation = await (await this.fetch(`${url}/api/v1/accounts/verify_credentials`, {
            headers: {
                Authorization: `Bearer ${tokenInformation.access_token}`,
            },
        })).json();
        return {
            id: personalInformation.id,
            name: personalInformation.display_name || personalInformation.acct,
            accessToken: tokenInformation.access_token,
            refreshToken: 'null',
            expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
            picture: personalInformation?.avatar || '',
            username: personalInformation.username,
        };
    }
    async authenticate(params) {
        return this.dynamicAuthenticate(process.env.MASTODON_CLIENT_ID, process.env.MASTODON_CLIENT_SECRET, process.env.MASTODON_URL || 'https://mastodon.social', params.code);
    }
    async uploadFile(instanceUrl, fileUrl, accessToken, alt) {
        const media = await this.runStreamedUpload(async () => {
            const fileResponse = await fetch(fileUrl, {
                headers: { 'accept-encoding': 'identity' },
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            });
            if (!fileResponse.ok || !fileResponse.body) {
                throw new Error(`Failed to fetch media: ${fileResponse.statusText}`);
            }
            const contentLength = Number(fileResponse.headers.get('content-length') || 0);
            const form = new form_data_1.default();
            form.append('file', stream_1.Readable.fromWeb(fileResponse.body), {
                filename: fileUrl.split('/').pop()?.split('?')[0] || 'file',
                ...(contentLength ? { knownLength: contentLength } : {}),
            });
            if (alt) {
                form.append('description', alt);
            }
            const mediaResponse = await fetch(`${instanceUrl}/api/v1/media`, {
                method: 'POST',
                headers: {
                    ...form.getHeaders(),
                    ...(contentLength
                        ? { 'Content-Length': String(form.getLengthSync()) }
                        : {}),
                    Authorization: `Bearer ${accessToken}`,
                },
                body: form.pipe(new stream_1.PassThrough()),
                duplex: 'half',
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            });
            if (mediaResponse.status !== 200 &&
                mediaResponse.status !== 201 &&
                mediaResponse.status !== 202) {
                throw {
                    response: {
                        status: mediaResponse.status,
                        data: await mediaResponse.text().catch(() => '{}'),
                    },
                };
            }
            return (await mediaResponse.json());
        }, this.identifier);
        return media.id;
    }
    async dynamicPostPending(id, accessToken, url, postDetails) {
        const [firstPost] = postDetails;
        const uploadFiles = await Promise.all(firstPost?.media?.map((media) => this.uploadFile(url, media.path, accessToken, media.alt)) || []);
        return [
            {
                id: firstPost.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: {
                    url,
                    message: firstPost.message,
                    mediaIds: uploadFiles.filter(Boolean),
                    idempotencyKey: `${firstPost.id}-${(0, make_is_1.makeId)(5)}`,
                },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        if (!pendingData.mediaIds?.length) {
            return { status: 'ready', pendingData };
        }
        for (const mediaId of pendingData.mediaIds) {
            let response;
            try {
                response = await fetch(`${pendingData.url}/api/v1/media/${mediaId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                });
            }
            catch (err) {
                return { status: 'pending', pendingData };
            }
            if (response.status === 206) {
                await response.text().catch(() => '');
                return { status: 'pending', pendingData };
            }
            if (response.status === 401) {
                throw new social_abstract_1.RefreshToken(this.identifier, await response.text().catch(() => '{}'), '{}');
            }
            if (response.status === 404 || response.status === 410) {
                await response.text().catch(() => '');
                continue;
            }
            if (response.status === 422) {
                throw new social_abstract_1.BadBody(this.identifier, await response.text().catch(() => '{}'), '{}', 'The uploaded media expired before the post was published, please post again');
            }
            await response.text().catch(() => '');
            if (response.status !== 200) {
                return { status: 'pending', pendingData };
            }
        }
        return { status: 'ready', pendingData };
    }
    async finalizePost(accessToken, pendingData, integration) {
        const form = new FormData();
        form.append('status', pendingData.message);
        form.append('visibility', 'public');
        for (const file of pendingData.mediaIds || []) {
            form.append('media_ids[]', file);
        }
        const post = await (await this.fetch(`${pendingData.url}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(pendingData.idempotencyKey
                    ? { 'Idempotency-Key': pendingData.idempotencyKey }
                    : {}),
            },
            body: form,
        })).json();
        return {
            status: 'completed',
            postId: post.id,
            releaseURL: `${pendingData.url}/statuses/${post.id}`,
        };
    }
    async dynamicPost(id, accessToken, url, postDetails) {
        const [response] = await this.dynamicPostPending(id, accessToken, url, postDetails);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            const check = await this.checkPostStatus(accessToken, pendingData, {});
            if (check.status === 'ready') {
                const finalize = await this.finalizePost(accessToken, check.pendingData, {});
                if (finalize.status === 'completed') {
                    return [
                        {
                            id: response.id,
                            postId: finalize.postId,
                            releaseURL: finalize.releaseURL,
                            status: 'completed',
                        },
                    ];
                }
                pendingData = finalize.pendingData;
            }
            else if (check.status === 'completed') {
                return [
                    {
                        id: response.id,
                        postId: check.postId,
                        releaseURL: check.releaseURL,
                        status: 'completed',
                    },
                ];
            }
            else {
                pendingData = check.pendingData;
            }
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody(this.identifier, '{}', '{}', 'The media took too long to process, please try again');
            }
            await (0, timer_1.timer)(20000);
        }
    }
    async dynamicComment(id, postId, lastCommentId, accessToken, url, postDetails) {
        const [commentPost] = postDetails;
        const replyToId = lastCommentId || postId;
        const uploadFiles = await Promise.all(commentPost?.media?.map((media) => this.uploadFile(url, media.path, accessToken, media.alt)) || []);
        const form = new FormData();
        form.append('status', commentPost.message);
        form.append('visibility', 'public');
        form.append('in_reply_to_id', replyToId);
        if (uploadFiles.length) {
            for (const file of uploadFiles) {
                form.append('media_ids[]', file);
            }
        }
        const post = await (await this.fetch(`${url}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: form,
        })).json();
        return [
            {
                id: commentPost.id,
                postId: post.id,
                releaseURL: `${url}/statuses/${post.id}`,
                status: 'completed',
            },
        ];
    }
    async post(id, accessToken, postDetails, integration) {
        return this.dynamicPost(id, accessToken, process.env.MASTODON_URL || 'https://mastodon.social', postDetails);
    }
    async postPending(id, accessToken, postDetails, integration) {
        return this.dynamicPostPending(id, accessToken, process.env.MASTODON_URL || 'https://mastodon.social', postDetails);
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        return this.dynamicComment(id, postId, lastCommentId, accessToken, process.env.MASTODON_URL || 'https://mastodon.social', postDetails);
    }
}
exports.MastodonProvider = MastodonProvider;
//# sourceMappingURL=mastodon.provider.js.map
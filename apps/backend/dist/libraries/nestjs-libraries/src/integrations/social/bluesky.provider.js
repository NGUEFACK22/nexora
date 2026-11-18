"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlueskyProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const temporal_heartbeat_1 = require("../../temporal/temporal.heartbeat");
const social_abstract_1 = require("../social.abstract");
const api_1 = require("@atproto/api");
const dayjs_1 = __importDefault(require("dayjs"));
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
const webhook_url_validator_1 = require("../../dtos/webhooks/webhook.url.validator");
const ssrf_safe_dispatcher_1 = require("../../dtos/webhooks/ssrf.safe.dispatcher");
const sharp_1 = __importDefault(require("sharp"));
const plug_decorator_1 = require("../../../../helpers/src/decorators/plug.decorator");
const timer_1 = require("../../../../helpers/src/utils/timer");
const strip_html_validation_1 = require("../../../../helpers/src/utils/strip.html.validation");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const has_extension_1 = require("../../../../helpers/src/utils/has.extension");
async function reduceImageBySize(url, maxSizeKB = 976) {
    try {
        const response = await (0, ssrf_safe_dispatcher_1.getSsrfSafeAxios)().get(url, {
            responseType: 'arraybuffer',
        });
        let imageBuffer = Buffer.from(response.data);
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
        let width = metadata.width;
        let height = metadata.height;
        while (imageBuffer.length / 1024 > maxSizeKB) {
            width = Math.floor(width * 0.9);
            height = Math.floor(height * 0.9);
            const resizedBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize({ width, height })
                .toBuffer();
            imageBuffer = resizedBuffer;
            if (width < 10 || height < 10)
                break;
        }
        return { width, height, buffer: imageBuffer };
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}
async function startVideoUpload(agent, videoPath) {
    const { data: serviceAuth } = await agent.com.atproto.server.getServiceAuth({
        aud: `did:web:${agent.dispatchUrl.host}`,
        lxm: 'com.atproto.repo.uploadBlob',
        exp: Date.now() / 1000 + 60 * 30,
    });
    (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: video size');
    const headResponse = await fetch(videoPath, {
        method: 'HEAD',
        headers: { 'accept-encoding': 'identity' },
        dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
    });
    const videoSize = Number(headResponse.headers.get('content-length') || 0);
    if (!headResponse.ok || !videoSize) {
        throw new social_abstract_1.BadBody('bluesky', '{}', {}, 'Could not determine the video size for Bluesky upload');
    }
    (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: read video');
    const videoResponse = await fetch(videoPath, {
        headers: { 'accept-encoding': 'identity' },
        dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
    });
    if (!videoResponse.ok || !videoResponse.body) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    console.log('Uploading video', videoPath, videoSize);
    const uploadUrl = new URL('https://video.bsky.app/xrpc/app.bsky.video.uploadVideo');
    uploadUrl.searchParams.append('did', agent.session.did);
    uploadUrl.searchParams.append('name', videoPath.split('/').pop());
    (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: upload video');
    const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${serviceAuth.token}`,
            'Content-Type': 'video/mp4',
            'Content-Length': videoSize.toString(),
        },
        body: videoResponse.body,
        duplex: 'half',
    });
    const jobStatus = (await uploadResponse.json());
    console.log('JobId:', jobStatus.jobId);
    if (jobStatus.state === 'JOB_STATE_FAILED') {
        throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Could not upload video, job failed');
    }
    return jobStatus;
}
async function getVideoJobStatus(jobId) {
    const videoAgent = new api_1.AtpAgent({ service: 'https://video.bsky.app' });
    const { data: status } = await videoAgent.app.bsky.video.getJobStatus({
        jobId,
    });
    return status.jobStatus;
}
async function uploadVideo(agent, videoPath) {
    const jobStatus = await startVideoUpload(agent, videoPath);
    let blob = jobStatus.blob;
    let attempts = 0;
    const maxAttempts = 18;
    while (!blob) {
        if (attempts++ >= maxAttempts) {
            throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Video upload timed out, job did not complete');
        }
        const status = await getVideoJobStatus(jobStatus.jobId);
        console.log('Status:', status.state, status.progress || '');
        if (status.blob) {
            blob = status.blob;
        }
        if (status.state === 'JOB_STATE_FAILED') {
            throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Could not upload video, job failed');
        }
        await (0, timer_1.timer)(30000);
    }
    console.log('posting video...');
    return {
        $type: 'app.bsky.embed.video',
        video: blob,
    };
}
let BlueskyProvider = class BlueskyProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 6;
        this.identifier = 'bluesky';
        this.name = 'Bluesky';
        this.toolTip = 'We don’t currently support two-factor authentication. If it’s enabled on Bluesky, you’ll need to disable it.';
        this.isBetweenSteps = false;
        this.scopes = ['write:statuses', 'profile', 'write:media'];
        this.editor = 'normal';
    }
    maxLength() {
        return 300;
    }
    async checkValidity(posts) {
        if (posts?.some((p) => p?.some((a) => (a?.path?.indexOf?.('mp4') ?? -1) > -1) &&
            (p?.length ?? 0) > 1)) {
            return 'You can only upload one video per post.';
        }
        if (posts?.some((p) => (p?.length ?? 0) > 4)) {
            return 'There can be maximum 4 pictures in a post.';
        }
        return true;
    }
    async customFields() {
        return [
            {
                key: 'service',
                label: 'Service',
                defaultValue: 'https://bsky.social',
                validation: `/^(https?:\\/\\/)?((([a-zA-Z0-9\\-_]{1,256}\\.[a-zA-Z]{2,6})|(([0-9]{1,3}\\.){3}[0-9]{1,3}))(:[0-9]{1,5})?)(\\/[^\\s]*)?$/`,
                type: 'text',
            },
            {
                key: 'identifier',
                label: 'Identifier',
                validation: `/^.+$/`,
                type: 'text',
            },
            {
                key: 'password',
                label: 'Password',
                validation: `/^.{3,}$/`,
                type: 'password',
            },
        ];
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
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: state,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const body = JSON.parse(Buffer.from(params.code, 'base64').toString());
        if (process.env.DISABLE_SSRF_PROTECTION !== 'true' &&
            !(await (0, webhook_url_validator_1.isSafePublicHttpsUrl)(body.service))) {
            return 'Invalid service URL: must be a public HTTPS address';
        }
        try {
            const agent = new api_1.BskyAgent({
                service: body.service,
            });
            const { data: { accessJwt, refreshJwt, handle, did }, } = await agent.login({
                identifier: this.loginIdentifier(body),
                password: body.password,
            });
            const profile = await agent.getProfile({
                actor: did,
            });
            return {
                refreshToken: refreshJwt,
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: accessJwt,
                id: did,
                name: profile.data.displayName,
                picture: profile?.data?.avatar || '',
                username: profile.data.handle,
            };
        }
        catch (e) {
            console.log(e);
            switch (e?.error) {
                case 'RateLimitExceeded':
                    return 'Bluesky is temporarily refusing logins for this account, please try again later';
                case 'XRPCNotSupported':
                    return 'Could not reach a Bluesky server at the Service URL';
                default:
                    return 'Invalid credentials';
            }
        }
    }
    loginIdentifier(body) {
        return String(body.identifier || '').trim().replace(/^@/, '');
    }
    async getAgent(integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        try {
            await agent.login({
                identifier: this.loginIdentifier(body),
                password: body.password,
            });
        }
        catch (err) {
            const status = err?.status;
            if (typeof status === 'number' &&
                status >= 400 &&
                status < 500 &&
                status !== 429) {
                throw new social_abstract_1.RefreshToken('bluesky', JSON.stringify(err), {});
            }
            throw err;
        }
        return agent;
    }
    async uploadMediaForPost(agent, post) {
        const imageMedia = post.media?.filter((p) => !(0, has_extension_1.hasExtension)(p.path, 'mp4')) || [];
        const videoMedia = post.media?.filter((p) => (0, has_extension_1.hasExtension)(p.path, 'mp4')) || [];
        const images = await Promise.all(imageMedia.map(async (p) => {
            const { buffer, width, height } = await reduceImageBySize(p.path);
            return {
                width,
                height,
                buffer: await (async () => {
                    (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: upload blob');
                    return agent.uploadBlob(new Blob([buffer]));
                })(),
            };
        }));
        let videoEmbed = null;
        if (videoMedia.length > 0) {
            videoEmbed = await uploadVideo(agent, videoMedia[0].path);
        }
        let embed = {};
        if (videoEmbed) {
            embed = videoEmbed;
        }
        else if (images.length > 0) {
            embed = {
                $type: 'app.bsky.embed.images',
                images: images.map((p, index) => ({
                    alt: imageMedia?.[index]?.alt || '',
                    image: p.buffer.data.blob,
                    aspectRatio: {
                        width: p.width,
                        height: p.height,
                    },
                })),
            };
        }
        return { embed, images };
    }
    async postPending(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const videoMedia = firstPost.media?.filter((p) => (0, has_extension_1.hasExtension)(p.path, 'mp4')) || [];
        let jobId = '';
        if (videoMedia.length > 0) {
            const agent = await this.getAgent(integration);
            const jobStatus = await startVideoUpload(agent, videoMedia[0].path);
            jobId = jobStatus.jobId;
        }
        return [
            {
                id: firstPost.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: {
                    jobId,
                    message: firstPost.message,
                    media: (firstPost.media || []).map((m) => ({
                        path: m.path,
                        alt: m.alt || '',
                    })),
                },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        if (pendingData.attempting && pendingData.confirmed) {
            throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Bluesky may have already published this post, please check your account before posting again to avoid duplicates');
        }
        const witness = () => pendingData.attempting && !pendingData.confirmed
            ? {
                status: 'ready',
                pendingData: { ...pendingData, confirmed: true },
            }
            : { status: 'ready', pendingData };
        if (!pendingData.jobId) {
            return witness();
        }
        let status;
        try {
            status = await getVideoJobStatus(pendingData.jobId);
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken) {
                throw err;
            }
            return { status: 'pending', pendingData };
        }
        if (status.state === 'JOB_STATE_FAILED') {
            throw new social_abstract_1.BadBody('bluesky', JSON.stringify(status), {}, 'Could not upload video, job failed');
        }
        if (status.blob) {
            return witness();
        }
        return { status: 'pending', pendingData };
    }
    async finalizePost(accessToken, pendingData, integration) {
        if (!pendingData.attempting || !pendingData.confirmed) {
            return {
                status: 'pending',
                pendingData: { ...pendingData, attempting: true, confirmed: false },
            };
        }
        let agent;
        let embed = {};
        let rt;
        try {
            agent = await this.getAgent(integration);
            if (pendingData.jobId) {
                const status = await getVideoJobStatus(pendingData.jobId);
                if (status.state === 'JOB_STATE_FAILED') {
                    throw new social_abstract_1.BadBody('bluesky', JSON.stringify(status), {}, 'Could not upload video, job failed');
                }
                if (!status.blob) {
                    return {
                        status: 'pending',
                        pendingData: {
                            ...pendingData,
                            attempting: false,
                            confirmed: false,
                        },
                    };
                }
                embed = {
                    $type: 'app.bsky.embed.video',
                    video: status.blob,
                };
            }
            else {
                const built = await this.uploadMediaForPost(agent, {
                    media: pendingData.media,
                });
                embed = built.embed;
            }
            rt = new api_1.RichText({
                text: pendingData.message,
            });
            await rt.detectFacets(agent);
        }
        catch (err) {
            if (err instanceof social_abstract_1.BadBody || err instanceof social_abstract_1.RefreshToken) {
                throw err;
            }
            if ((pendingData.prepFailures || 0) >= 4) {
                const reason = err?.message || String(err);
                throw new social_abstract_1.BadBody('bluesky', JSON.stringify({ message: reason }), {}, `Could not prepare the post for Bluesky, nothing was published: ${reason}`);
            }
            return {
                status: 'pending',
                pendingData: {
                    ...pendingData,
                    attempting: false,
                    confirmed: false,
                    prepFailures: (pendingData.prepFailures || 0) + 1,
                },
            };
        }
        let uri;
        try {
            (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: create post');
            const created = await agent.post({
                text: rt.text,
                facets: rt.facets,
                createdAt: new Date().toISOString(),
                ...(Object.keys(embed).length > 0 ? { embed } : {}),
            });
            uri = created.uri;
        }
        catch (err) {
            const status = err?.status;
            if (typeof status === 'number' &&
                status >= 400 &&
                status < 500 &&
                status !== 429) {
                throw new social_abstract_1.BadBody('bluesky', JSON.stringify(err?.error || err?.message || {}), {}, 'Bluesky rejected the post, nothing was published, please check the content and try again');
            }
            throw err;
        }
        return {
            status: 'completed',
            postId: uri,
            releaseURL: `https://bsky.app/profile/${integration.internalId}/post/${uri
                .split('/')
                .pop()}`,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        const [response] = await this.postPending(id, accessToken, postDetails, integration);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody('bluesky', JSON.stringify({}), {}, 'Video upload timed out, job did not complete');
            }
            const check = await this.checkPostStatus(accessToken, pendingData, integration);
            if (check.status === 'pending') {
                pendingData = check.pendingData;
                await (0, timer_1.timer)(20000);
                continue;
            }
            const result = check.status === 'ready'
                ? await this.finalizePost(accessToken, check.pendingData, integration)
                : check;
            if (result.status === 'completed') {
                return [
                    {
                        id: response.id,
                        postId: result.postId,
                        status: 'completed',
                        releaseURL: result.releaseURL,
                    },
                ];
            }
            pendingData = result.pendingData;
            if (!result.pendingData?.attempting) {
                await (0, timer_1.timer)(20000);
            }
        }
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const agent = await this.getAgent(integration);
        const [commentPost] = postDetails;
        const { embed } = await this.uploadMediaForPost(agent, commentPost);
        const rt = new api_1.RichText({
            text: commentPost.message,
        });
        await rt.detectFacets(agent);
        const parentUri = lastCommentId || postId;
        const parentThread = await agent.getPostThread({
            uri: parentUri,
            depth: 0,
        });
        const parentCid = parentThread.data.thread.post?.cid;
        const rootUri = parentThread.data.thread.post?.record?.reply?.root?.uri || postId;
        const rootCid = parentThread.data.thread.post?.record?.reply?.root?.cid || parentCid;
        (0, temporal_heartbeat_1.setHeartbeatDetails)('bluesky: create post');
        const { cid, uri, commit } = await agent.post({
            text: rt.text,
            facets: rt.facets,
            createdAt: new Date().toISOString(),
            ...(Object.keys(embed).length > 0 ? { embed } : {}),
            reply: {
                root: {
                    uri: rootUri,
                    cid: rootCid,
                },
                parent: {
                    uri: parentUri,
                    cid: parentCid,
                },
            },
        });
        return [
            {
                id: commentPost.id,
                postId: uri,
                status: 'completed',
                releaseURL: `https://bsky.app/profile/${id}/post/${uri
                    .split('/')
                    .pop()}`,
            },
        ];
    }
    async autoRepostPost(integration, id, fields) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: this.loginIdentifier(body),
            password: body.password,
        });
        const getThread = await agent.getPostThread({
            uri: id,
            depth: 0,
        });
        if (getThread.data.thread.post?.likeCount >= +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            await agent.repost(getThread.data.thread.post?.uri, getThread.data.thread.post?.cid);
            return true;
        }
        return true;
    }
    async autoPlugPost(integration, id, fields) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: this.loginIdentifier(body),
            password: body.password,
        });
        const getThread = await agent.getPostThread({
            uri: id,
            depth: 0,
        });
        if (getThread.data.thread.post?.likeCount >= +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            const rt = new api_1.RichText({
                text: (0, strip_html_validation_1.stripHtmlValidation)('normal', fields.post, true),
            });
            await agent.post({
                text: rt.text,
                facets: rt.facets,
                createdAt: new Date().toISOString(),
                reply: {
                    root: {
                        uri: getThread.data.thread.post?.uri,
                        cid: getThread.data.thread.post?.cid,
                    },
                    parent: {
                        uri: getThread.data.thread.post?.uri,
                        cid: getThread.data.thread.post?.cid,
                    },
                },
            });
            return true;
        }
        return true;
    }
    async mention(token, d, id, integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const agent = new api_1.BskyAgent({
            service: body.service,
        });
        await agent.login({
            identifier: this.loginIdentifier(body),
            password: body.password,
        });
        const list = await agent.searchActors({
            q: d.query,
        });
        return list.data.actors.map((p) => ({
            label: p.displayName,
            id: p.handle,
            image: p.avatar,
        }));
    }
    mentionFormat(idOrHandle, name) {
        return `@${idOrHandle}`;
    }
};
exports.BlueskyProvider = BlueskyProvider;
__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'bluesky-autoRepostPost',
        title: 'Auto Repost Posts',
        description: 'When a post reached a certain number of likes, repost it to increase engagement (1 week old posts)',
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: 'likesAmount',
                type: 'number',
                placeholder: 'Amount of likes',
                description: 'The amount of likes to trigger the repost',
                validation: /^\d+$/,
            },
        ],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BlueskyProvider.prototype, "autoRepostPost", null);
__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'bluesky-autoPlugPost',
        title: 'Auto plug post',
        description: 'When a post reached a certain number of likes, add another post to it so you followers get a notification about your promotion',
        runEveryMilliseconds: 21600000,
        totalRuns: 3,
        fields: [
            {
                name: 'likesAmount',
                type: 'number',
                placeholder: 'Amount of likes',
                description: 'The amount of likes to trigger the repost',
                validation: /^\d+$/,
            },
            {
                name: 'post',
                type: 'richtext',
                placeholder: 'Post to plug',
                description: 'Message content to plug',
                validation: /^[\s\S]{3,}$/g,
            },
        ],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], BlueskyProvider.prototype, "autoPlugPost", null);
exports.BlueskyProvider = BlueskyProvider = __decorate([
    (0, rules_description_decorator_1.Rules)('Bluesky can have maximum 1 video or 4 pictures in one post, it can also be without attachments')
], BlueskyProvider);
//# sourceMappingURL=bluesky.provider.js.map
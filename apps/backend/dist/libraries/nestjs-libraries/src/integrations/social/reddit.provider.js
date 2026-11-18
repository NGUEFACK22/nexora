"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditProvider = void 0;
const tslib_1 = require("tslib");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const reddit_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/reddit.dto");
const timer_1 = require("@gitroom/helpers/utils/timer");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const mime_types_1 = require("mime-types");
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
const has_extension_1 = require("@gitroom/helpers/utils/has.extension");
class RedditProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 1;
        this.identifier = 'reddit';
        this.name = 'Reddit';
        this.isBetweenSteps = false;
        this.scopes = ['read', 'identity', 'submit', 'flair'];
        this.editor = 'normal';
        this.dto = reddit_dto_1.RedditSettingsDto;
    }
    maxLength() {
        return 10000;
    }
    async checkValidity(posts, settings) {
        if (settings?.subreddit?.some((p) => p?.value?.type === 'media' && posts?.[0]?.length !== 1)) {
            return 'When posting a media post, you must attached exactly one media file.';
        }
        if (posts?.some((p) => p?.some((a) => !a?.thumbnail && (a?.path?.indexOf?.('mp4') ?? -1) > -1))) {
            return 'You must attach a thumbnail to your video post.';
        }
        return true;
    }
    async refreshToken(refreshToken) {
        const { access_token: accessToken, expires_in: expiresIn } = await (await this.fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        })).json();
        const { name, id, icon_img } = await (await this.fetch('https://oauth.reddit.com/api/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return {
            id,
            name,
            accessToken,
            refreshToken: refreshToken,
            expiresIn,
            picture: icon_img?.split?.('?')?.[0] || '',
            username: name,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        const codeVerifier = (0, make_secure_id_1.makeSecureId)(30);
        const url = `https://www.reddit.com/api/v1/authorize?client_id=${process.env.REDDIT_CLIENT_ID}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/reddit`)}&duration=permanent&scope=${encodeURIComponent(this.scopes.join(' '))}`;
        return {
            url,
            codeVerifier,
            state,
        };
    }
    async authenticate(params) {
        const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn, scope, } = await (await this.fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/reddit`,
            }),
        })).json();
        this.checkScopes(this.scopes, scope);
        const { name, id, icon_img } = await (await this.fetch('https://oauth.reddit.com/api/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return {
            id,
            name,
            accessToken,
            refreshToken,
            expiresIn,
            picture: icon_img?.split?.('?')?.[0] || '',
            username: name,
        };
    }
    async uploadFileToReddit(accessToken, path) {
        const mimeType = (0, mime_types_1.lookup)(path);
        const formData = new FormData();
        formData.append('filepath', path.split('/').pop());
        formData.append('mimetype', mimeType || 'application/octet-stream');
        const { args: { action, fields }, } = await (await this.fetch('https://oauth.reddit.com/api/media/asset', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        }, 'reddit', 0, true)).json();
        const fileSize = await this.mediaSize(path, this.identifier);
        const stream = await this.mediaStream(path, this.identifier);
        const upload = fields.reduce((acc, value) => {
            acc.append(value.name, value.value);
            return acc;
        }, new form_data_1.default());
        upload.append('file', stream, {
            filename: path.split('/').pop(),
            contentType: mimeType || 'application/octet-stream',
            knownLength: fileSize,
        });
        const d = await this.getSsrfSafeAxios().post('https:' + action, upload, {
            headers: upload.getHeaders(),
        });
        const location = [
            ...String(d.data || '').matchAll(/<Location>(.*?)<\/Location>/g),
        ][0]?.[1];
        if (!location) {
            throw new social_abstract_1.BadBody(this.identifier, String(d.data || '{}'), Buffer.from('{}'), 'Reddit media upload did not return a location');
        }
        return location;
    }
    async findSubmittedPost(accessToken, username, sr, title, armedAt) {
        const { data } = await (await this.fetch(`https://oauth.reddit.com/user/${username}/submitted?limit=25&sort=new`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }, 'reddit', 0, true)).json();
        const cutoff = armedAt ? armedAt - 60 * 1000 : Date.now() - 60 * 60 * 1000;
        const found = (data?.children || []).find((c) => (c?.data?.subreddit || '').toLowerCase() === sr &&
            (!title || (c?.data?.title || '') === title) &&
            (c?.data?.created_utc || 0) * 1000 > cutoff);
        if (!found?.data?.id) {
            return undefined;
        }
        return {
            id: found.data.id,
            url: found.data.permalink
                ? `https://www.reddit.com${found.data.permalink}`
                : `https://www.reddit.com/r/${sr}`,
        };
    }
    completedResponse(results) {
        return {
            status: 'completed',
            postId: results
                .map((p) => p.postId)
                .filter(Boolean)
                .join(','),
            releaseURL: results
                .map((p) => p.releaseURL)
                .filter(Boolean)
                .join(','),
        };
    }
    async postPending(id, accessToken, postDetails) {
        const [post] = postDetails;
        return [
            {
                id: post.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: {
                    subreddits: post.settings.subreddit,
                    message: post.message,
                    mediaPath: post.media?.[0]?.path,
                    mediaThumbnail: post.media?.[0]?.thumbnail,
                    cursor: 0,
                    results: [],
                },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        const data = { ...pendingData };
        if (data.armed) {
            let found;
            if (integration.profile) {
                try {
                    found = await this.findSubmittedPost(accessToken, integration.profile, data.armed.sr, data.armed.title, data.armed.armedAt);
                }
                catch (err) {
                    if (err instanceof social_abstract_1.RefreshToken) {
                        throw err;
                    }
                }
            }
            if (found) {
                data.results = [
                    ...data.results,
                    { postId: found.id, releaseURL: found.url },
                ];
                data.cursor += 1;
                data.armed = undefined;
            }
            else if (data.armed.submitted) {
                if (data.armed.lookups < 9) {
                    data.armed = { ...data.armed, lookups: data.armed.lookups + 1 };
                    return { status: 'pending', pendingData: data };
                }
                data.results = [
                    ...data.results,
                    {
                        postId: '',
                        releaseURL: `https://www.reddit.com/r/${data.armed.sr}`,
                    },
                ];
                data.cursor += 1;
                data.armed = undefined;
            }
            else if (data.armed.media &&
                (Date.now() - data.armed.armedAt < 10 * 60 * 1000 ||
                    data.armed.lookups < 9)) {
                data.armed = { ...data.armed, lookups: data.armed.lookups + 1 };
                return { status: 'pending', pendingData: data };
            }
            else if (!data.armed.media && data.armed.lookups < 1) {
                data.armed = { ...data.armed, lookups: data.armed.lookups + 1 };
                return { status: 'pending', pendingData: data };
            }
            else {
                data.armed = undefined;
            }
        }
        if (data.cursor >= (data.subreddits?.length || 0)) {
            return this.completedResponse(data.results);
        }
        const value = data.subreddits[data.cursor].value;
        data.armed = {
            sr: value.subreddit.replace(/^\/?r\//, '').replace(/^\/+|\/+$/g, '').toLowerCase(),
            title: value.title || '',
            armedAt: Date.now(),
            media: value.type === 'media',
            submitted: false,
            lookups: 0,
        };
        return { status: 'ready', pendingData: data };
    }
    async finalizePost(accessToken, pendingData, integration) {
        const data = { ...pendingData };
        const entry = data.subreddits?.[data.cursor];
        if (!entry || !data.armed) {
            return { status: 'pending', pendingData: data };
        }
        const value = entry.value;
        const kind = value.type === 'media'
            ? (0, has_extension_1.hasExtension)(data.mediaPath || '', 'mp4')
                ? 'video'
                : 'image'
            : value.type;
        const postData = {
            api_type: 'json',
            title: value.title || '',
            kind: ['link', 'self', 'image', 'video', 'videogif'].indexOf(kind) > -1
                ? kind
                : 'self',
            ...(value.flair ? { flair_id: value.flair.id } : {}),
            ...(value.type === 'link'
                ? {
                    url: value.url,
                }
                : {}),
            ...(value.type === 'media'
                ? {
                    url: await this.uploadFileToReddit(accessToken, data.mediaPath),
                    ...((0, has_extension_1.hasExtension)(data.mediaPath || '', 'mp4')
                        ? {
                            video_poster_url: await this.uploadFileToReddit(accessToken, data.mediaThumbnail),
                        }
                        : {}),
                }
                : {}),
            text: data.message,
            sr: value.subreddit.replace(/^\/?r\//, '').replace(/^\/+|\/+$/g, '').toLowerCase(),
        };
        const all = await (await this.fetch('https://oauth.reddit.com/api/submit', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(postData),
        })).json();
        if (all?.json?.errors?.length) {
            if (all.json.errors.every((e) => e?.[0] === 'RATELIMIT')) {
                data.armed = undefined;
                return { status: 'pending', pendingData: data };
            }
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(all), Buffer.from('{}'), `Reddit rejected the post to r/${postData.sr}: ${all.json.errors
                .map((e) => e?.[1] || e?.[0] || '')
                .join(', ')}`);
        }
        if (all?.json?.data?.id) {
            data.results = [
                ...data.results,
                {
                    postId: all.json.data.id,
                    releaseURL: all.json.data.url || `https://www.reddit.com/r/${postData.sr}`,
                },
            ];
            data.cursor += 1;
            data.armed = undefined;
            if (data.cursor >= data.subreddits.length) {
                return this.completedResponse(data.results);
            }
            return { status: 'pending', pendingData: data };
        }
        data.armed = { ...data.armed, submitted: true };
        return { status: 'pending', pendingData: data };
    }
    async post(id, accessToken, postDetails, integration) {
        const [response] = await this.postPending(id, accessToken, postDetails);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            const check = await this.checkPostStatus(accessToken, pendingData, integration);
            if (check.status === 'ready') {
                const finalize = await this.finalizePost(accessToken, check.pendingData, integration);
                if (finalize.status === 'completed') {
                    return [
                        {
                            id: response.id,
                            postId: finalize.postId,
                            releaseURL: finalize.releaseURL,
                            status: 'published',
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
                        status: 'published',
                    },
                ];
            }
            else {
                pendingData = check.pendingData;
            }
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody(this.identifier, '{}', Buffer.from('{}'), 'Reddit took too long to answer, please check your account before posting again');
            }
            await (0, timer_1.timer)(5000);
        }
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const thingId = postId.startsWith('t3_') ? postId : `t3_${postId}`;
        const { json: { data: { things: [{ data: { id: commentId, permalink }, },], }, }, } = await (await this.fetch('https://oauth.reddit.com/api/comment', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                text: commentPost.message,
                thing_id: thingId,
                api_type: 'json',
            }),
        })).json();
        return [
            {
                postId: commentId,
                releaseURL: 'https://www.reddit.com' + permalink,
                id: commentPost.id,
                status: 'published',
            },
        ];
    }
    async subreddits(accessToken, data) {
        const named = String(data.word || '').match(/(?:^|\/)r\/([A-Za-z0-9_]+)/);
        const word = named ? named[1] : data.word;
        const exact = named
            ? await this.subredditByName(accessToken, named[1])
            : [];
        const { data: { children }, } = await (await this.fetch(`https://oauth.reddit.com/subreddits/search?show=public&q=${word}&sort=activity&show_users=false&limit=10`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }, 'reddit', 0, false)).json();
        return [
            ...exact,
            ...children
                .filter(({ data }) => data.subreddit_type === 'public' &&
                data.submission_type !== 'image' &&
                !exact.some((e) => e.id === data.id))
                .map(({ data: { title, url, id } }) => ({
                title,
                name: url,
                id,
            })),
        ];
    }
    async subredditByName(accessToken, name) {
        let about;
        try {
            about = await (await this.fetch(`https://oauth.reddit.com/r/${name}/about`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }, 'reddit', 0, false)).json();
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            return [];
        }
        if (about?.kind !== 't5' ||
            about.data.subreddit_type !== 'public' ||
            about.data.submission_type === 'image') {
            return [];
        }
        return [
            { title: about.data.title, name: about.data.url, id: about.data.id },
        ];
    }
    getPermissions(submissionType, allow_images) {
        const permissions = [];
        if (['any', 'self'].indexOf(submissionType) > -1) {
            permissions.push('self');
        }
        if (['any', 'link'].indexOf(submissionType) > -1) {
            permissions.push('link');
        }
        if (allow_images) {
            permissions.push('media');
        }
        return permissions;
    }
    async restrictions(accessToken, data) {
        const { data: { submission_type, allow_images, ...all2 }, } = await (await this.fetch(`https://oauth.reddit.com/${data.subreddit}/about`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }, 'reddit', 0, false)).json();
        const { is_flair_required, ...all } = await (await this.fetch(`https://oauth.reddit.com/api/v1/${data.subreddit.split('/r/')[1]}/post_requirements`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }, 'reddit', 0, false)).json();
        const newData = await new Promise(async (res) => {
            try {
                const flair = await (await this.fetch(`https://oauth.reddit.com/${data.subreddit}/api/link_flair_v2`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }, 'reddit', 0, false)).json();
                res(flair);
            }
            catch (err) {
                return res([]);
            }
        });
        return {
            subreddit: data.subreddit,
            allow: this.getPermissions(submission_type, allow_images),
            is_flair_required: is_flair_required && newData.length > 0,
            flairs: newData?.map?.((p) => ({
                id: p.id,
                name: p.text,
            })) || [],
        };
    }
}
exports.RedditProvider = RedditProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of subreddits with information',
        dataSchema: [
            {
                key: 'word',
                type: 'string',
                description: 'Search subreddit by string',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedditProvider.prototype, "subreddits", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of flairs and restrictions for a subreddit',
        dataSchema: [
            {
                key: 'subreddit',
                type: 'string',
                description: 'Search flairs and restrictions by subreddit key should be "/r/[name]"',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], RedditProvider.prototype, "restrictions", null);
//# sourceMappingURL=reddit.provider.js.map
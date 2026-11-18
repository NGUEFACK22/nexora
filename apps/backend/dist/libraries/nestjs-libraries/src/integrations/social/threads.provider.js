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
exports.ThreadsProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const timer_1 = require("../../../../helpers/src/utils/timer");
const dayjs_1 = __importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const lodash_1 = require("lodash");
const plug_decorator_1 = require("../../../../helpers/src/decorators/plug.decorator");
const strip_html_validation_1 = require("../../../../helpers/src/utils/strip.html.validation");
const has_extension_1 = require("../../../../helpers/src/utils/has.extension");
const threads_dto_1 = require("../../dtos/posts/providers-settings/threads.dto");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
let ThreadsProvider = class ThreadsProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'threads';
        this.name = 'Threads';
        this.isBetweenSteps = false;
        this.scopes = [
            'threads_basic',
            'threads_content_publish',
            'threads_manage_replies',
            'threads_manage_insights',
        ];
        this.maxConcurrentJob = 20;
        this.refreshCron = true;
        this.editor = 'normal';
        this.dto = threads_dto_1.ThreadsDto;
    }
    maxLength() {
        return 500;
    }
    handleErrors(body) {
        console.log(body);
        if (body.includes('Error validating access token')) {
            return { type: 'refresh-token', value: 'Threads access token expired' };
        }
        if (body.includes('2207051')) {
            return {
                type: 'bad-body',
                value: 'Error from Meta: We restrict certain activity to protect our community',
            };
        }
        if (body.includes('4279013')) {
            return {
                type: 'bad-body',
                value: 'User restricted',
            };
        }
        if (body.includes('4279047')) {
            return {
                type: 'bad-body',
                value: 'Threads rejected the link in this post as an invalid link attachment, please check the link and try again',
            };
        }
        if (body.includes('The media could not be fetched from this URI')) {
            return {
                type: 'bad-body',
                value: "One of the media URLs is invalid or inaccessible, make sure it's being uploaded to Nexora first",
            };
        }
        if (body.includes('4279009')) {
            return {
                type: 'retry',
                value: 'Threads could not find the media container yet, please try again in a few seconds',
            };
        }
        if (body.includes('text must be at most 500 characters')) {
            return {
                type: 'bad-body',
                value: 'Post text exceeds 500 characters limit',
            };
        }
        return undefined;
    }
    async refreshToken(refresh_token) {
        const { access_token } = await (await this.fetch(`https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${refresh_token}`)).json();
        const { id, name, username, picture } = await this.fetchUserInfo(access_token);
        return {
            id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: picture || '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: 'https://www.threads.net/oauth/authorize' +
                `?client_id=${process.env.THREADS_APP_ID}` +
                `&redirect_uri=${encodeURIComponent(`${process?.env.FRONTEND_URL?.indexOf('https') == -1
                    ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
                    : `${process?.env.FRONTEND_URL}`}/integrations/social/threads`)}` +
                `&state=${state}` +
                `&scope=${encodeURIComponent(this.scopes.join(','))}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const getAccessToken = await (await this.fetch('https://graph.threads.net/oauth/access_token' +
            `?client_id=${process.env.THREADS_APP_ID}` +
            `&redirect_uri=${encodeURIComponent(`${process?.env.FRONTEND_URL?.indexOf('https') == -1
                ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
                : `${process?.env.FRONTEND_URL}`}/integrations/social/threads`)}` +
            `&grant_type=authorization_code` +
            `&client_secret=${process.env.THREADS_APP_SECRET}` +
            `&code=${params.code}`)).json();
        const { access_token } = await (await this.fetch('https://graph.threads.net/access_token' +
            '?grant_type=th_exchange_token' +
            `&client_secret=${process.env.THREADS_APP_SECRET}` +
            `&access_token=${getAccessToken.access_token}`)).json();
        const { id, name, username, picture } = await this.fetchUserInfo(access_token);
        return {
            id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: picture || '',
            username: username,
        };
    }
    async checkContainerStatus(mediaContainerId, accessToken) {
        const { status, error_message } = await (await this.fetch(`https://graph.threads.net/v1.0/${mediaContainerId}?fields=status,error_message&access_token=${accessToken}`)).json();
        if (status === 'ERROR' || status === 'EXPIRED') {
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify({ status, error_message }), '{}', error_message && error_message !== 'UNKNOWN'
                ? error_message
                : 'Threads could not process the media, please check the media format and try again');
        }
        if (status === 'FINISHED' || status === 'PUBLISHED') {
            return status;
        }
        return 'IN_PROGRESS';
    }
    async checkLoaded(mediaContainerId, accessToken) {
        for (let i = 0; i < 150; i++) {
            const status = await this.checkContainerStatus(mediaContainerId, accessToken);
            if (status === 'FINISHED' || status === 'PUBLISHED') {
                await (0, timer_1.timer)(2000);
                return true;
            }
            await (0, timer_1.timer)(2200);
        }
        throw new social_abstract_1.BadBody(this.identifier, '{}', '{}', 'Threads took too long to process the media, please try again');
    }
    async fetchUserInfo(accessToken) {
        const { id, username, threads_profile_picture_url } = await (await this.fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${accessToken}`)).json();
        return {
            id,
            name: username,
            picture: threads_profile_picture_url || '',
            username,
        };
    }
    async createSingleMediaContent(userId, accessToken, media, message, isCarouselItem = false, replyToId, madeWithAi = false) {
        const mediaType = (0, has_extension_1.hasExtension)(media.path, 'mp4')
            ? 'video_url'
            : 'image_url';
        const mediaParams = new URLSearchParams({
            ...(mediaType === 'video_url' ? { video_url: media.path } : {}),
            ...(mediaType === 'image_url' ? { image_url: media.path } : {}),
            ...(isCarouselItem ? { is_carousel_item: 'true' } : {}),
            ...(replyToId ? { reply_to_id: replyToId } : {}),
            ...(madeWithAi && !isCarouselItem ? { is_made_with_ai: 'true' } : {}),
            media_type: mediaType === 'video_url' ? 'VIDEO' : 'IMAGE',
            text: message,
            access_token: accessToken,
        });
        const { id: mediaId } = await (await this.fetch(`https://graph.threads.net/v1.0/${userId}/threads?${mediaParams.toString()}`, {
            method: 'POST',
        })).json();
        return mediaId;
    }
    async createCarouselContent(userId, accessToken, media, message, replyToId, madeWithAi = false) {
        const mediaIds = [];
        for (const mediaItem of media) {
            const mediaId = await this.createSingleMediaContent(userId, accessToken, mediaItem, message, true);
            mediaIds.push(mediaId);
        }
        await Promise.all(mediaIds.map((id) => this.checkLoaded(id, accessToken)));
        const params = new URLSearchParams({
            text: message,
            media_type: 'CAROUSEL',
            children: mediaIds.join(','),
            ...(replyToId ? { reply_to_id: replyToId } : {}),
            ...(madeWithAi ? { is_made_with_ai: 'true' } : {}),
            access_token: accessToken,
        });
        const { id: containerId } = await (await this.fetch(`https://graph.threads.net/v1.0/${userId}/threads?${params.toString()}`, {
            method: 'POST',
        })).json();
        return containerId;
    }
    async createTextContent(userId, accessToken, message, replyToId, quoteId, madeWithAi = false) {
        const form = new FormData();
        form.append('media_type', 'TEXT');
        form.append('text', message);
        form.append('access_token', accessToken);
        if (madeWithAi) {
            form.append('is_made_with_ai', 'true');
        }
        if (replyToId) {
            form.append('reply_to_id', replyToId);
        }
        if (quoteId) {
            form.append('quote_post_id', quoteId);
        }
        const { id: contentId, ...all } = await (await this.fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
            method: 'POST',
            body: form,
        })).json();
        return contentId;
    }
    async publishThread(userId, accessToken, creationId) {
        await this.checkLoaded(creationId, accessToken);
        const { id: threadId } = await (await this.fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish?creation_id=${creationId}&access_token=${accessToken}`, {
            method: 'POST',
        })).json();
        const { permalink } = await (await this.fetch(`https://graph.threads.net/v1.0/${threadId}?fields=id,permalink&access_token=${accessToken}`)).json();
        return { threadId, permalink };
    }
    async createThreadContent(userId, accessToken, postDetails, replyToId, quoteId) {
        const madeWithAi = this.assetBoolean(postDetails.settings?.made_with_ai);
        if (!postDetails.media || postDetails.media.length === 0) {
            return await this.createTextContent(userId, accessToken, postDetails.message, replyToId, quoteId, madeWithAi);
        }
        else if (postDetails.media.length === 1) {
            return await this.createSingleMediaContent(userId, accessToken, postDetails.media[0], postDetails.message, false, replyToId, madeWithAi);
        }
        else {
            return await this.createCarouselContent(userId, accessToken, postDetails.media, postDetails.message, replyToId, madeWithAi);
        }
    }
    async threadPermalink(threadId, accessToken, integration) {
        try {
            const { permalink } = await (await this.fetch(`https://graph.threads.net/v1.0/${threadId}?fields=id,permalink&access_token=${accessToken}`)).json();
            return permalink;
        }
        catch (err) {
            return `https://www.threads.net/@${integration.profile}`;
        }
    }
    async postPending(userId, accessToken, postDetails, integration) {
        if (!postDetails.length) {
            return [];
        }
        const [firstPost] = postDetails;
        const madeWithAi = this.assetBoolean(firstPost.settings?.made_with_ai);
        if ((firstPost.media?.length || 0) > 1) {
            const childIds = [];
            for (const mediaItem of firstPost.media) {
                childIds.push(await this.createSingleMediaContent(userId, accessToken, mediaItem, firstPost.message, true));
            }
            return [
                {
                    id: firstPost.id,
                    postId: '',
                    releaseURL: '',
                    status: 'pending',
                    pendingData: {
                        step: 'children',
                        childIds,
                        message: firstPost.message,
                        ...(madeWithAi ? { madeWithAi } : {}),
                    },
                },
            ];
        }
        const containerId = !firstPost.media || firstPost.media.length === 0
            ? await this.createTextContent(userId, accessToken, firstPost.message, undefined, undefined, madeWithAi)
            : await this.createSingleMediaContent(userId, accessToken, firstPost.media[0], firstPost.message, false, undefined, madeWithAi);
        return [
            {
                id: firstPost.id,
                postId: '',
                releaseURL: '',
                status: 'pending',
                pendingData: { step: 'container', containerId },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        if (pendingData.step === 'children') {
            for (const childId of pendingData.childIds || []) {
                const status = await this.checkContainerStatus(childId, accessToken);
                if (status === 'IN_PROGRESS') {
                    return { status: 'pending', pendingData };
                }
            }
            return { status: 'ready', pendingData };
        }
        const status = await this.checkContainerStatus(pendingData.containerId, accessToken);
        if (status === 'IN_PROGRESS') {
            return { status: 'pending', pendingData };
        }
        if (status === 'PUBLISHED') {
            return {
                status: 'completed',
                postId: pendingData.containerId,
                releaseURL: `https://www.threads.net/@${integration.profile}`,
            };
        }
        return { status: 'ready', pendingData };
    }
    async finalizePost(accessToken, pendingData, integration) {
        if (pendingData.step === 'children') {
            const params = new URLSearchParams({
                text: pendingData.message || '',
                media_type: 'CAROUSEL',
                children: (pendingData.childIds || []).join(','),
                ...(pendingData.madeWithAi ? { is_made_with_ai: 'true' } : {}),
                access_token: accessToken,
            });
            const { id: containerId } = await (await this.fetch(`https://graph.threads.net/v1.0/${integration.internalId}/threads?${params.toString()}`, {
                method: 'POST',
            })).json();
            return {
                status: 'pending',
                pendingData: { step: 'container', containerId },
            };
        }
        const { id: threadId } = await (await this.fetch(`https://graph.threads.net/v1.0/${integration.internalId}/threads_publish?creation_id=${pendingData.containerId}&access_token=${accessToken}`, {
            method: 'POST',
        })).json();
        return {
            status: 'completed',
            postId: threadId,
            releaseURL: await this.threadPermalink(threadId, accessToken, integration),
        };
    }
    async post(userId, accessToken, postDetails, integration) {
        if (!postDetails.length) {
            return [];
        }
        const [firstPost] = postDetails;
        const [response] = await this.postPending(userId, accessToken, postDetails, integration);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody(this.identifier, '{}', '{}', 'Threads took too long to process the media, please try again');
            }
            const check = await this.checkPostStatus(accessToken, pendingData, integration);
            if (check.status === 'pending') {
                pendingData = check.pendingData;
                await (0, timer_1.timer)(2200);
                continue;
            }
            const result = check.status === 'ready'
                ? await this.finalizePost(accessToken, check.pendingData, integration)
                : check;
            if (result.status === 'completed') {
                return [
                    {
                        id: firstPost.id,
                        postId: result.postId,
                        status: 'success',
                        releaseURL: result.releaseURL,
                    },
                ];
            }
            pendingData = result.pendingData;
            await (0, timer_1.timer)(2200);
        }
    }
    async comment(userId, postId, lastCommentId, accessToken, postDetails, integration) {
        if (!postDetails.length) {
            return [];
        }
        const [commentPost] = postDetails;
        const replyToId = lastCommentId || postId;
        const replyContentId = await this.createThreadContent(userId, accessToken, commentPost, replyToId);
        const { threadId: replyThreadId, permalink } = await this.publishThread(userId, accessToken, replyContentId);
        return [
            {
                id: commentPost.id,
                postId: replyThreadId,
                status: 'success',
                releaseURL: permalink,
            },
        ];
    }
    async analytics(id, accessToken, date) {
        const until = (0, dayjs_1.default)().endOf('day').unix();
        const since = (0, dayjs_1.default)().subtract(date, 'day').unix();
        const { data, ...all } = await (await fetch(`https://graph.threads.net/v1.0/${id}/threads_insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}&period=day&since=${since}&until=${until}`)).json();
        return (data?.map((d) => ({
            label: (0, lodash_1.capitalize)(d.name),
            percentageChange: 5,
            data: d.total_value
                ? [{ total: d.total_value.value, date: (0, dayjs_1.default)().format('YYYY-MM-DD') }]
                : d.values.map((v) => ({
                    total: v.value,
                    date: (0, dayjs_1.default)(v.end_time).format('YYYY-MM-DD'),
                })),
        })) || []);
    }
    async autoPlugPost(integration, id, fields) {
        const { data } = await (await fetch(`https://graph.threads.net/v1.0/${id}/insights?metric=likes&access_token=${integration.token}`)).json();
        const { values: [value], } = data.find((p) => p.name === 'likes');
        if (value.value >= fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            const form = new FormData();
            form.append('media_type', 'TEXT');
            form.append('text', (0, strip_html_validation_1.stripHtmlValidation)('normal', fields.post, true));
            form.append('reply_to_id', id);
            form.append('access_token', integration.token);
            const { id: replyId } = await (await this.fetch('https://graph.threads.net/v1.0/me/threads', {
                method: 'POST',
                body: form,
            })).json();
            await (await this.fetch(`https://graph.threads.net/v1.0/${integration.internalId}/threads_publish?creation_id=${replyId}&access_token=${integration.token}`, {
                method: 'POST',
            })).json();
            return true;
        }
        return false;
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const { data } = await (await fetch(`https://graph.threads.net/v1.0/${postId}/insights?metric=views,likes,replies,reposts,quotes&access_token=${accessToken}`)).json();
            if (!data || data.length === 0) {
                return [];
            }
            const result = [];
            for (const metric of data) {
                const value = metric.values?.[0]?.value ?? metric.total_value?.value;
                if (value === undefined)
                    continue;
                let label = '';
                switch (metric.name) {
                    case 'views':
                        label = 'Views';
                        break;
                    case 'likes':
                        label = 'Likes';
                        break;
                    case 'replies':
                        label = 'Replies';
                        break;
                    case 'reposts':
                        label = 'Reposts';
                        break;
                    case 'quotes':
                        label = 'Quotes';
                        break;
                }
                if (label) {
                    result.push({
                        label,
                        percentageChange: 0,
                        data: [{ total: String(value), date: today }],
                    });
                }
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching Threads post analytics:', err?.cause?.code || err?.message || err);
            return [];
        }
    }
};
exports.ThreadsProvider = ThreadsProvider;
__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'threads-autoPlugPost',
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
], ThreadsProvider.prototype, "autoPlugPost", null);
exports.ThreadsProvider = ThreadsProvider = __decorate([
    (0, rules_description_decorator_1.Rules)('If the content of the post (text, pictures or video) was made with AI, ask the user if they want to mark it as AI, and set made_with_ai to true only when they say yes.')
], ThreadsProvider);
//# sourceMappingURL=threads.provider.js.map
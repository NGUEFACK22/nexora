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
var XProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XProvider = void 0;
const twitter_api_v2_1 = require("twitter-api-v2");
const crypto_1 = require("crypto");
const parse5_1 = require("parse5");
const mime_types_1 = require("mime-types");
const sharp_1 = __importDefault(require("sharp"));
const temporal_heartbeat_1 = require("../../temporal/temporal.heartbeat");
const social_abstract_1 = require("../social.abstract");
const plug_decorator_1 = require("../../../../helpers/src/decorators/plug.decorator");
const timer_1 = require("../../../../helpers/src/utils/timer");
const post_plug_1 = require("../../../../helpers/src/decorators/post.plug");
const dayjs_1 = __importDefault(require("dayjs"));
const lodash_1 = require("lodash");
const strip_html_validation_1 = require("../../../../helpers/src/utils/strip.html.validation");
const strip_links_1 = require("../../../../helpers/src/utils/strip.links");
const x_dto_1 = require("../../dtos/posts/providers-settings/x.dto");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const has_extension_1 = require("../../../../helpers/src/utils/has.extension");
const valid_url_path_1 = require("../../../../helpers/src/utils/valid.url.path");
let XProvider = XProvider_1 = class XProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'x';
        this.name = 'X';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.stripLinks = () => !!process.env.STRIP_LINKS_FROM_X_POSTS;
        this.maxConcurrentJob = 10;
        this.toolTip = 'You will be logged in into your current account, if you would like a different account, change it first on X';
        this.editor = 'html';
        this.dto = x_dto_1.XDto;
        this.loadAllTweets = async (client, id, until, since, token = '') => {
            const tweets = await client.v2.userTimeline(id, {
                'tweet.fields': ['id'],
                'user.fields': [],
                'poll.fields': [],
                'place.fields': [],
                'media.fields': [],
                exclude: ['replies', 'retweets'],
                start_time: since,
                end_time: until,
                max_results: 100,
                ...(token ? { pagination_token: token } : {}),
            });
            const list = tweets.data.data || [];
            return [
                ...list,
                ...(list.length === 100 && tweets.meta.next_token
                    ? await this.loadAllTweets(client, id, until, since, tweets.meta.next_token)
                    : []),
            ];
        };
    }
    maxLength(additionalSettings, settings) {
        if (settings?.post_type === 'article') {
            return 100000;
        }
        const isTwitterPremium = Array.isArray(additionalSettings)
            ? !!additionalSettings.find((p) => p?.title === 'Verified')?.value
            : !!additionalSettings;
        return isTwitterPremium ? 4000 : 280;
    }
    inlineImages(settings) {
        return settings?.post_type === 'article';
    }
    toTweetText(message) {
        return (0, strip_html_validation_1.stripHtmlValidation)('normal', message, true, false, !/<\/?[a-z][\s\S]*>/i.test(message));
    }
    async checkValidity([firstPost, ...comments], settings) {
        if (settings?.post_type !== 'article') {
            return true;
        }
        if ([...(firstPost || []), ...comments.flat()].some((m) => (0, has_extension_1.hasExtension)(m.path, 'mp4'))) {
            return 'X articles only support images';
        }
        if (settings?.article_status !== 'published' && comments.length) {
            return 'A draft article cannot have thread replies, remove them or publish the article';
        }
        return true;
    }
    handleErrors(body) {
        if (body.includes('You are not permitted to perform this action')) {
            return {
                type: 'bad-body',
                value: 'There is a problem posting, please edit your post and check character count and media attachments',
            };
        }
        if (body.includes('Service Unavailable')) {
            return {
                type: 'retry',
                value: 'X is currently unavailable, please try again later',
            };
        }
        if (body.includes('Too Many Requests')) {
            return {
                type: 'retry',
                value: 'X rate limit reached, please try again later',
            };
        }
        if (body.includes('maximum of one cashtag')) {
            return {
                type: 'bad-body',
                value: 'There can be maximum of one cashtag ($SYMBOL) per post',
            };
        }
        if (body.includes('maximum of 4 items')) {
            return {
                type: 'bad-body',
                value: 'There must be a maximum of 4 items per post',
            };
        }
        if (body.includes('Unsupported Authentication')) {
            return {
                type: 'refresh-token',
                value: 'X authentication has expired, please reconnect your account',
            };
        }
        if (body.includes('You are not allowed to create a Tweet')) {
            return {
                type: 'bad-body',
                value: 'You are not allowed to create a post with duplicate content',
            };
        }
        if (body.includes('usage-capped')) {
            return {
                type: 'bad-body',
                value: 'Posting failed - capped reached. Please try again later',
            };
        }
        if (body.includes('user-suspended')) {
            return {
                type: 'bad-body',
                value: 'Your X account has been suspended, please reconnect with another account',
            };
        }
        if (body.includes('duplicate-rules')) {
            return {
                type: 'bad-body',
                value: 'You have already posted this post, please wait before posting again',
            };
        }
        if (body.includes('Your account is not permitted to access this feature')) {
            return {
                type: 'bad-body',
                value: 'X blocked your request',
            };
        }
        if (body.includes('The Tweet contains an invalid URL.')) {
            return {
                type: 'bad-body',
                value: 'The Tweet contains a URL that is not allowed on X',
            };
        }
        if (body.includes('This user is not allowed to post a video longer than 2 minutes')) {
            return {
                type: 'bad-body',
                value: 'The video you are trying to post is longer than 2 minutes, which is not allowed for this account',
            };
        }
        if (body.includes('This user is not allowed to post a video longer than 10 minutes')) {
            return {
                type: 'bad-body',
                value: 'The video you are trying to post is longer than 10 minutes, which is not allowed for this account',
            };
        }
        if (body.includes('Your account is temporarily locked')) {
            return {
                type: 'bad-body',
                value: 'Your X account is temporarily locked, log in to x.com to unlock it and then try again',
            };
        }
        if (body.includes('Crypto addresses are prohibited')) {
            return {
                type: 'bad-body',
                value: 'X does not allow crypto addresses in posts for the first 7 days after connecting the account',
            };
        }
        if (body.includes('Your media IDs are invalid')) {
            return {
                type: 'bad-body',
                value: 'X rejected the attached media, please re-upload the media and try again',
            };
        }
        if (body.includes('not authorized to create or publish articles')) {
            return {
                type: 'bad-body',
                value: 'Publishing articles on X requires an X Premium subscription',
            };
        }
        if (body.includes('Please include either text or media in your Tweet')) {
            return {
                type: 'bad-body',
                value: 'One of the posts in this thread has no text or media, please add some text or remove it',
            };
        }
        if (body.includes('"title":"Unauthorized"')) {
            return {
                type: 'refresh-token',
                value: 'X rejected the connected account, please reconnect your account',
            };
        }
        return undefined;
    }
    async autoRepostPost(integration, id, fields) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        if ((await client.v2.tweetLikedBy(id)).meta.result_count >=
            +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            await client.v2.retweet(integration.internalId, id);
            return true;
        }
        return false;
    }
    async repostPostUsers(integration, originalIntegration, postId, information) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        const { data: { id }, } = await client.v2.me();
        try {
            await client.v2.retweet(id, postId);
        }
        catch (err) {
        }
    }
    async autoPlugPost(integration, id, fields) {
        const [accessTokenSplit, accessSecretSplit] = integration.token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        if ((await client.v2.tweetLikedBy(id)).meta.result_count >=
            +fields.likesAmount) {
            await (0, timer_1.timer)(2000);
            const plugText = (0, strip_html_validation_1.stripHtmlValidation)('normal', fields.post, true);
            await client.v2.tweet({
                text: this.stripLinks() ? (0, strip_links_1.stripLinks)(plugText) : plugText,
                reply: { in_reply_to_tweet_id: id },
            });
            return true;
        }
        return false;
    }
    async refreshToken() {
        return {
            id: '',
            name: '',
            accessToken: '',
            refreshToken: '',
            expiresIn: 0,
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
        });
        const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink((process.env.X_URL || process.env.FRONTEND_URL) +
            `/integrations/social/x`, {
            authAccessType: 'write',
            linkMode: 'authenticate',
            forceLogin: false,
        });
        return {
            url,
            codeVerifier: oauth_token + ':' + oauth_token_secret,
            state: oauth_token,
        };
    }
    async authenticate(params) {
        const { code, codeVerifier } = params;
        const [oauth_token, oauth_token_secret] = codeVerifier.split(':');
        const startingClient = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: oauth_token,
            accessSecret: oauth_token_secret,
        });
        const { accessToken, client, accessSecret } = await startingClient.login(code);
        const { data: { username, verified, profile_image_url, name, id }, } = await client.v2.me({
            'user.fields': [
                'username',
                'verified',
                'verified_type',
                'profile_image_url',
                'name',
            ],
        });
        return {
            id: String(id),
            accessToken: accessToken + ':' + accessSecret,
            name,
            refreshToken: '',
            expiresIn: 999999999,
            picture: profile_image_url || '',
            username,
            additionalSettings: [
                {
                    title: 'Verified',
                    description: 'Is this a verified user? (Premium)',
                    type: 'checkbox',
                    value: verified,
                },
            ],
        };
    }
    async getClient(accessToken) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        return new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
    }
    signOAuth1(method, url, accessToken, accessSecret) {
        const pct = (s) => encodeURIComponent(s)
            .replace(/!/g, '%21')
            .replace(/\*/g, '%2A')
            .replace(/'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29');
        const params = {
            oauth_consumer_key: process.env.X_API_KEY,
            oauth_nonce: (0, crypto_1.randomBytes)(16).toString('hex'),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: String(Math.floor(Date.now() / 1000)),
            oauth_token: accessToken,
            oauth_version: '1.0',
        };
        const paramString = Object.keys(params)
            .sort()
            .map((k) => `${pct(k)}=${pct(params[k])}`)
            .join('&');
        const baseString = [
            method.toUpperCase(),
            pct(url.split('?')[0]),
            pct(paramString),
        ].join('&');
        const signingKey = `${pct(process.env.X_API_SECRET)}&${pct(accessSecret)}`;
        params.oauth_signature = (0, crypto_1.createHmac)('sha1', signingKey)
            .update(baseString)
            .digest('base64');
        return ('OAuth ' +
            Object.keys(params)
                .sort()
                .map((k) => `${pct(k)}="${pct(params[k])}"`)
                .join(', '));
    }
    async uploadVideoInChunks(client, path) {
        const totalBytes = await this.mediaSize(path, this.identifier);
        const mediaType = String((0, mime_types_1.lookup)(path) || 'video/mp4');
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`x: upload initialize (${totalBytes} bytes)`);
        const init = await client.v2.post('media/upload/initialize', {
            media_type: mediaType,
            total_bytes: totalBytes,
            media_category: 'tweet_video',
        });
        const mediaId = init.data.id;
        const chunkSize = XProvider_1.X_UPLOAD_CHUNK_SIZE;
        const totalChunkCount = Math.ceil(totalBytes / chunkSize);
        for (let i = 0; i < totalChunkCount; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, totalBytes) - 1;
            (0, temporal_heartbeat_1.setHeartbeatDetails)(`x: upload append ${i + 1}/${totalChunkCount} media=${mediaId}`);
            await client.v2.post(`media/upload/${mediaId}/append`, {
                segment_index: i,
                media: await this.mediaChunk(path, start, end, this.identifier),
            }, { forceBodyMode: 'form-data' });
        }
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`x: upload finalize media=${mediaId}`);
        const finalize = await client.v2.post(`media/upload/${mediaId}/finalize`);
        const processing = finalize.data.processing_info;
        if (processing?.state === 'failed') {
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(processing), Buffer.from('{}'), `X failed to process the uploaded video${processing?.error?.message
                ? `: ${processing.error.message}`
                : ''}`);
        }
        return {
            mediaId,
            processing: !!processing && processing.state !== 'succeeded',
        };
    }
    async mediaProcessingStatus(client, mediaId) {
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`x: media status media=${mediaId}`);
        const status = await client.v2.get('media/upload', { command: 'STATUS', media_id: mediaId });
        return status.data.processing_info;
    }
    async waitForMediaProcessing(client, mediaId) {
        let waitedMs = 0;
        const maxWaitMs = 7 * 60 * 1000;
        let processing = await this.mediaProcessingStatus(client, mediaId);
        while (processing && processing.state !== 'succeeded') {
            if (processing.state === 'failed' || waitedMs >= maxWaitMs) {
                throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(processing), Buffer.from('{}'), `X failed to process the uploaded video${processing?.error?.message ? `: ${processing.error.message}` : ''}`);
            }
            const waitMs = (processing.check_after_secs || 1) * 1000;
            await (0, timer_1.timer)(waitMs);
            waitedMs += waitMs;
            processing = await this.mediaProcessingStatus(client, mediaId);
        }
    }
    async uploadWithRateLimitRetry(func, totalRetries = 0) {
        try {
            return await func();
        }
        catch (err) {
            if (totalRetries <= 2 && (err?.code === 429 || err?.rateLimitError)) {
                await (0, timer_1.timer)(5000 * (totalRetries + 1));
                return this.uploadWithRateLimitRetry(func, totalRetries + 1);
            }
            throw err;
        }
    }
    async uploadMediaEntries(client, postDetails, asArticleImage = false) {
        const media = {};
        const processingIds = [];
        for (const p of postDetails) {
            for (const m of p?.media || []) {
                (0, temporal_heartbeat_1.setHeartbeatDetails)(`x: upload media ${(0, social_abstract_1.stripQuery)(m.path)}`);
                const uploaded = await this.runInConcurrent(async () => (0, has_extension_1.hasExtension)(m.path, 'mp4')
                    ? this.uploadWithRateLimitRetry(() => this.uploadVideoInChunks(client, m.path))
                    : {
                        mediaId: await this.uploadWithRateLimitRetry(async () => asArticleImage
                            ? client.v2.uploadMedia(await (0, sharp_1.default)(await this.readOrFetch(m.path))
                                .resize({
                                width: 1000,
                            })
                                .jpeg()
                                .toBuffer(), {
                                media_type: 'image/jpeg',
                                media_category: 'tweet_image',
                            })
                            : client.v2.uploadMedia(await (0, sharp_1.default)(await this.readOrFetch(m.path), {
                                animated: (0, mime_types_1.lookup)(m.path) === 'image/gif',
                            })
                                .resize({
                                width: 1000,
                            })
                                .gif()
                                .toBuffer(), {
                                media_type: ((0, mime_types_1.lookup)(m.path) || ''),
                            })),
                        processing: false,
                    }, true);
                if (!uploaded?.mediaId) {
                    continue;
                }
                media[p.id] = media[p.id] || [];
                media[p.id].push(uploaded.mediaId);
                if (uploaded.processing) {
                    processingIds.push(uploaded.mediaId);
                }
            }
        }
        return { media, processingIds };
    }
    async uploadMedia(client, postDetails) {
        const { media, processingIds } = await this.uploadMediaEntries(client, postDetails);
        for (const mediaId of processingIds) {
            await this.waitForMediaProcessing(client, mediaId);
        }
        return media;
    }
    async postPending(id, accessToken, postDetails, integration) {
        const client = await this.getClient(accessToken);
        const [firstPost] = postDetails;
        const isArticle = firstPost?.settings?.post_type === 'article';
        const { media, processingIds } = await this.uploadMediaEntries(client, [firstPost], isArticle);
        const coverPath = isArticle
            ? firstPost?.settings?.article_cover?.path
            : undefined;
        const coverMediaId = coverPath
            ? (await this.uploadMediaEntries(client, [{ id: 'article-cover', media: [{ path: coverPath }] }], true)).media['article-cover']?.[0]
            : undefined;
        const inlineImages = isArticle
            ? [...new Set(this.articleImages((0, parse5_1.parseFragment)(firstPost.message)))]
            : [];
        const { media: inlineMedia } = await this.uploadMediaEntries(client, inlineImages.map((path, index) => ({ id: String(index), media: [{ path }] })), true);
        return [
            {
                id: firstPost.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: {
                    message: isArticle
                        ? firstPost.message
                        : this.toTweetText(firstPost.message),
                    settings: {
                        who_can_reply_post: firstPost?.settings?.who_can_reply_post,
                        community: firstPost?.settings?.community,
                        made_with_ai: firstPost?.settings?.made_with_ai,
                        paid_partnership: firstPost?.settings?.paid_partnership,
                        post_type: firstPost?.settings?.post_type,
                        article_title: firstPost?.settings?.article_title,
                        article_status: firstPost?.settings?.article_status,
                    },
                    mediaIds: (media[firstPost.id] || []).filter((f) => f),
                    ...(coverMediaId ? { coverMediaId } : {}),
                    ...(inlineImages.length
                        ? {
                            inlineMediaIds: Object.fromEntries(inlineImages.map((path, index) => [
                                path,
                                inlineMedia[String(index)]?.[0],
                            ])),
                        }
                        : {}),
                    processingIds,
                },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        if (pendingData.attempting && pendingData.confirmed) {
            throw new social_abstract_1.BadBody(this.identifier, '{}', Buffer.from('{}'), 'X may have already published this post, please check your account before posting again to avoid duplicates');
        }
        const client = await this.getClient(accessToken);
        const stillProcessing = [];
        for (const mediaId of pendingData.processingIds || []) {
            let processing;
            try {
                processing = await this.mediaProcessingStatus(client, mediaId);
            }
            catch (err) {
                const body = JSON.stringify(err?.data || {});
                const handleError = this.handleErrors(body);
                if (err?.code === 401 || handleError?.type === 'refresh-token') {
                    throw new social_abstract_1.RefreshToken(this.identifier, body, Buffer.from('{}'));
                }
                if (handleError?.type === 'bad-body') {
                    throw new social_abstract_1.BadBody(this.identifier, body, Buffer.from('{}'), handleError.value);
                }
                return { status: 'pending', pendingData };
            }
            if (processing?.state === 'failed') {
                throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(processing), Buffer.from('{}'), `X failed to process the uploaded video${processing?.error?.message ? `: ${processing.error.message}` : ''}`);
            }
            if (processing && processing.state !== 'succeeded') {
                stillProcessing.push(mediaId);
            }
        }
        if (stillProcessing.length) {
            return {
                status: 'pending',
                pendingData: { ...pendingData, processingIds: stillProcessing },
            };
        }
        if (pendingData.attempting && !pendingData.confirmed) {
            return {
                status: 'ready',
                pendingData: { ...pendingData, processingIds: [], confirmed: true },
            };
        }
        return {
            status: 'ready',
            pendingData: { ...pendingData, processingIds: [] },
        };
    }
    articleImages(node) {
        if (node.nodeName === 'img') {
            const src = (node.attrs || []).find((a) => a.name === 'src')?.value || '';
            return /^https?:\/\//i.test(src) && (0, valid_url_path_1.isAllowedUploadPath)(src) ? [src] : [];
        }
        return (node.childNodes || []).flatMap((child) => this.articleImages(child));
    }
    articleContentState(html, embeddedMediaIds, inlineMediaIds = {}) {
        const blocks = [];
        const entities = [];
        const walkInline = (node, ctx) => {
            for (const child of node.childNodes || []) {
                if (child.nodeName === '#text') {
                    ctx.text += child.value || '';
                    continue;
                }
                const offset = ctx.text.length;
                walkInline(child, ctx);
                const length = ctx.text.length - offset;
                if (!length) {
                    continue;
                }
                if (child.nodeName === 'strong') {
                    ctx.styles.push({ offset, length, style: 'bold' });
                }
                if (child.nodeName === 'a') {
                    const url = (child.attrs || []).find((a) => a.name === 'href')?.value;
                    if (url) {
                        const key = entities.length;
                        entities.push({
                            key: String(key),
                            value: {
                                type: 'link',
                                mutability: 'mutable',
                                data: { url },
                            },
                        });
                        ctx.entityRanges.push({ offset, length, key });
                    }
                }
            }
        };
        const makeBlock = (text, type, styles = [], entityRanges = []) => ({
            key: `b${blocks.length}`,
            text,
            type,
            ...(styles.length ? { inline_style_ranges: styles } : {}),
            ...(entityRanges.length ? { entity_ranges: entityRanges } : {}),
        });
        const pushBlock = (node, type) => {
            const ctx = { text: '', styles: [], entityRanges: [] };
            walkInline(node, ctx);
            if (ctx.text.trim()) {
                blocks.push(makeBlock(ctx.text, type, ctx.styles, ctx.entityRanges));
            }
            for (const src of this.articleImages(node)) {
                if (inlineMediaIds[src]) {
                    pushImage(inlineMediaIds[src]);
                }
            }
        };
        const pushImage = (mediaId) => {
            const key = entities.length;
            entities.push({
                key: String(key),
                value: {
                    type: 'image',
                    mutability: 'immutable',
                    data: {
                        media_items: [
                            { media_category: 'tweet_image', media_id: mediaId },
                        ],
                    },
                },
            });
            blocks.push(makeBlock(' ', 'atomic', [], [{ offset: 0, length: 1, key }]));
        };
        const fragment = (0, parse5_1.parseFragment)(html);
        for (const node of fragment.childNodes || []) {
            switch (node.nodeName) {
                case 'h1':
                    pushBlock(node, 'header-one');
                    break;
                case 'h2':
                    pushBlock(node, 'header-two');
                    break;
                case 'h3':
                    pushBlock(node, 'header-two');
                    break;
                case 'ul':
                case 'ol':
                    for (const li of (node.childNodes || []).filter((n) => n.nodeName === 'li')) {
                        pushBlock(li, node.nodeName === 'ol'
                            ? 'ordered-list-item'
                            : 'unordered-list-item');
                    }
                    break;
                case '#text':
                    if ((node.value || '').trim()) {
                        blocks.push(makeBlock(node.value, 'unstyled'));
                    }
                    break;
                default:
                    pushBlock(node, 'unstyled');
                    break;
            }
        }
        if (!blocks.length) {
            blocks.push(makeBlock((0, strip_html_validation_1.stripHtmlValidation)('none', html), 'unstyled'));
        }
        for (const mediaId of embeddedMediaIds) {
            pushImage(mediaId);
        }
        return { blocks, entities };
    }
    async finalizeArticle(accessToken, pendingData, integration) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const settings = pendingData.settings || {};
        const coverMediaId = pendingData.coverMediaId;
        const embeddedMediaIds = (pendingData.mediaIds || []).filter((f) => f);
        const draftUrl = 'https://api.x.com/2/articles/draft';
        const draftResponse = await this.fetch(draftUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', draftUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: settings.article_title,
                content_state: this.articleContentState(pendingData.message, embeddedMediaIds, pendingData.inlineMediaIds),
                ...(coverMediaId
                    ? {
                        cover_media: {
                            media_category: 'tweet_image',
                            media_id: coverMediaId,
                        },
                    }
                    : {}),
            }),
        });
        const draftJson = (await draftResponse.json());
        if (draftJson?.errors?.length) {
            console.log('X article draft returned errors:', JSON.stringify(draftJson.errors));
        }
        if (!draftJson?.data?.id) {
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(draftJson), Buffer.from('{}'), 'X could not create the article draft');
        }
        if (settings.article_status !== 'published') {
            return {
                status: 'completed',
                postId: draftJson.data.id,
                releaseURL: `https://x.com/i/articles`,
            };
        }
        const publishUrl = `https://api.x.com/2/articles/${draftJson.data.id}/publish`;
        const publishResponse = await this.fetch(publishUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', publishUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
        });
        const publishJson = (await publishResponse.json());
        if (publishJson?.errors?.length) {
            console.log('X article publish returned errors:', JSON.stringify(publishJson.errors));
        }
        if (!publishJson?.data?.post_id) {
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify(publishJson), Buffer.from('{}'), 'X created the article draft but could not publish it, check your drafts on X');
        }
        return {
            status: 'completed',
            postId: publishJson.data.post_id,
            releaseURL: `https://twitter.com/${integration.profile}/status/${publishJson.data.post_id}`,
        };
    }
    async finalizePost(accessToken, pendingData, integration) {
        if (!pendingData.attempting || !pendingData.confirmed) {
            return {
                status: 'pending',
                pendingData: { ...pendingData, attempting: true, confirmed: false },
            };
        }
        if (pendingData.settings?.post_type === 'article') {
            return this.finalizeArticle(accessToken, pendingData, integration);
        }
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const settings = pendingData.settings || {};
        const mediaIds = (pendingData.mediaIds || []).filter((f) => f);
        const tweetUrl = 'https://api.x.com/2/tweets';
        const tweetBody = {
            ...(!settings.who_can_reply_post ||
                settings.who_can_reply_post === 'everyone'
                ? {}
                : {
                    reply_settings: settings.who_can_reply_post,
                }),
            ...(settings.community
                ? {
                    share_with_followers: true,
                    community_id: settings.community?.split('/').pop() || '',
                }
                : {}),
            text: this.stripLinks()
                ? (0, strip_links_1.stripLinks)(pendingData.message)
                : pendingData.message,
            ...(mediaIds.length ? { media: { media_ids: mediaIds } } : {}),
            made_with_ai: this.assetBoolean(settings.made_with_ai),
            paid_partnership: this.assetBoolean(settings.paid_partnership),
        };
        const tweetResponse = await this.fetch(tweetUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', tweetUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tweetBody),
        });
        const { data } = (await tweetResponse.json());
        return {
            status: 'completed',
            postId: data.id,
            releaseURL: `https://twitter.com/${integration.profile}/status/${data.id}`,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        const [response] = await this.postPending(id, accessToken, postDetails, integration);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody(this.identifier, '{}', Buffer.from('{}'), 'X took too long to process the media, please try again');
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
                        postId: result.postId,
                        id: response.id,
                        releaseURL: result.releaseURL,
                        status: 'posted',
                    },
                ];
            }
            pendingData = result.pendingData;
        }
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = await this.getClient(accessToken);
        const [commentPost] = postDetails;
        const uploadAll = await this.uploadMedia(client, [commentPost]);
        const media_ids = (uploadAll[commentPost.id] || []).filter((f) => f);
        const replyToId = lastCommentId || postId;
        const commentText = this.toTweetText(commentPost.message);
        const tweetUrl = 'https://api.x.com/2/tweets';
        const tweetBody = {
            text: this.stripLinks() ? (0, strip_links_1.stripLinks)(commentText) : commentText,
            ...(media_ids.length ? { media: { media_ids } } : {}),
            reply: { in_reply_to_tweet_id: replyToId },
            made_with_ai: this.assetBoolean(commentPost?.settings?.made_with_ai),
            paid_partnership: this.assetBoolean(commentPost?.settings?.paid_partnership),
        };
        const tweetResponse = await this.fetch(tweetUrl, {
            method: 'POST',
            headers: {
                Authorization: this.signOAuth1('POST', tweetUrl, accessTokenSplit, accessSecretSplit),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tweetBody),
        });
        const { data } = (await tweetResponse.json());
        return [
            {
                postId: data.id,
                id: commentPost.id,
                releaseURL: `https://twitter.com/${integration.profile}/status/${data.id}`,
                status: 'posted',
            },
        ];
    }
    async analytics(id, accessToken, date) {
        if (process.env.DISABLE_X_ANALYTICS) {
            return [];
        }
        const until = (0, dayjs_1.default)().endOf('day');
        const since = (0, dayjs_1.default)().subtract(date > 100 ? 100 : date, 'day');
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const tweets = (0, lodash_1.uniqBy)(await this.loadAllTweets(client, id, until.format('YYYY-MM-DDTHH:mm:ssZ'), since.format('YYYY-MM-DDTHH:mm:ssZ')), (p) => p.id);
            if (tweets.length === 0) {
                return [];
            }
            const data = await client.v2.tweets(tweets.map((p) => p.id), {
                'tweet.fields': ['public_metrics'],
            });
            const metrics = data.data.reduce((all, current) => {
                all.impression_count =
                    (all.impression_count || 0) +
                        +current.public_metrics.impression_count;
                all.bookmark_count =
                    (all.bookmark_count || 0) + +current.public_metrics.bookmark_count;
                all.like_count =
                    (all.like_count || 0) + +current.public_metrics.like_count;
                all.quote_count =
                    (all.quote_count || 0) + +current.public_metrics.quote_count;
                all.reply_count =
                    (all.reply_count || 0) + +current.public_metrics.reply_count;
                all.retweet_count =
                    (all.retweet_count || 0) + +current.public_metrics.retweet_count;
                return all;
            }, {
                impression_count: 0,
                bookmark_count: 0,
                like_count: 0,
                quote_count: 0,
                reply_count: 0,
                retweet_count: 0,
            });
            return Object.entries(metrics).map(([key, value]) => ({
                label: key.replace('_count', '').replace('_', ' ').toUpperCase(),
                percentageChange: 5,
                data: [
                    {
                        total: String(0),
                        date: since.format('YYYY-MM-DD'),
                    },
                    {
                        total: String(value),
                        date: until.format('YYYY-MM-DD'),
                    },
                ],
            }));
        }
        catch (err) {
            console.log(err);
        }
        return [];
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        if (process.env.DISABLE_X_ANALYTICS) {
            return [];
        }
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const [accessTokenSplit, accessSecretSplit] = accessToken.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const tweet = await client.v2.singleTweet(postId, {
                'tweet.fields': ['public_metrics', 'created_at'],
            });
            if (!tweet?.data?.public_metrics) {
                return [];
            }
            const metrics = tweet.data.public_metrics;
            const result = [];
            if (metrics.impression_count !== undefined) {
                result.push({
                    label: 'Impressions',
                    percentageChange: 0,
                    data: [{ total: String(metrics.impression_count), date: today }],
                });
            }
            if (metrics.like_count !== undefined) {
                result.push({
                    label: 'Likes',
                    percentageChange: 0,
                    data: [{ total: String(metrics.like_count), date: today }],
                });
            }
            if (metrics.retweet_count !== undefined) {
                result.push({
                    label: 'Retweets',
                    percentageChange: 0,
                    data: [{ total: String(metrics.retweet_count), date: today }],
                });
            }
            if (metrics.reply_count !== undefined) {
                result.push({
                    label: 'Replies',
                    percentageChange: 0,
                    data: [{ total: String(metrics.reply_count), date: today }],
                });
            }
            if (metrics.quote_count !== undefined) {
                result.push({
                    label: 'Quotes',
                    percentageChange: 0,
                    data: [{ total: String(metrics.quote_count), date: today }],
                });
            }
            if (metrics.bookmark_count !== undefined) {
                result.push({
                    label: 'Bookmarks',
                    percentageChange: 0,
                    data: [{ total: String(metrics.bookmark_count), date: today }],
                });
            }
            return result;
        }
        catch (err) {
            console.log('Error fetching X post analytics:', err);
        }
        return [];
    }
    async mention(token, d) {
        const [accessTokenSplit, accessSecretSplit] = token.split(':');
        const client = new twitter_api_v2_1.TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: accessTokenSplit,
            accessSecret: accessSecretSplit,
        });
        try {
            const data = await client.v2.userByUsername(d.query, {
                'user.fields': ['username', 'name', 'profile_image_url'],
            });
            if (!data?.data?.username) {
                return [];
            }
            return [
                {
                    id: data.data.username,
                    image: data.data.profile_image_url,
                    label: data.data.name,
                },
            ];
        }
        catch (err) {
            console.log(err);
        }
        return [];
    }
    mentionFormat(idOrHandle, name) {
        return `@${idOrHandle}`;
    }
};
exports.XProvider = XProvider;
XProvider.X_UPLOAD_CHUNK_SIZE = 1024 * 1024;
__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'x-autoRepostPost',
        title: 'Auto Repost Posts',
        disabled: !!process.env.DISABLE_X_ANALYTICS,
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
], XProvider.prototype, "autoRepostPost", null);
__decorate([
    (0, post_plug_1.PostPlug)({
        identifier: 'x-repost-post-users',
        title: 'Add Re-posters',
        description: 'Add accounts to repost your post',
        pickIntegration: ['x'],
        fields: [],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], XProvider.prototype, "repostPostUsers", null);
__decorate([
    (0, plug_decorator_1.Plug)({
        identifier: 'x-autoPlugPost',
        title: 'Auto plug post',
        disabled: !!process.env.DISABLE_X_ANALYTICS,
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
], XProvider.prototype, "autoPlugPost", null);
exports.XProvider = XProvider = XProvider_1 = __decorate([
    (0, rules_description_decorator_1.Rules)(`X can have maximum 4 pictures, or maximum one video, it can also be without attachments, it can also be published as a long-form article (draft or published) when post_type is set to article, in an article pictures go inside the content as <img src="..."> where they should appear (the src must be a picture from the media library, upload it with uploadFromUrlTool first) ${process.env.STRIP_LINKS_FROM_X_POSTS
        ? 'do not add links, they will be stripped from the post'
        : ''}`)
], XProvider);
//# sourceMappingURL=x.provider.js.map
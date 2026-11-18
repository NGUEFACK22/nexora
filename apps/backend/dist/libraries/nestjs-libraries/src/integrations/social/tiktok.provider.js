"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TiktokProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktokProvider = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const make_secure_id_1 = require("../../services/make.secure.id");
const social_abstract_1 = require("../social.abstract");
const tiktok_dto_1 = require("../../dtos/posts/providers-settings/tiktok.dto");
const timer_1 = require("../../../../helpers/src/utils/timer");
const temporal_heartbeat_1 = require("../../temporal/temporal.heartbeat");
const has_extension_1 = require("../../../../helpers/src/utils/has.extension");
const fs_1 = require("fs");
const ssrf_safe_dispatcher_1 = require("../../dtos/webhooks/ssrf.safe.dispatcher");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
let TiktokProvider = TiktokProvider_1 = class TiktokProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'tiktok';
        this.name = 'Tiktok';
        this.isBetweenSteps = false;
        this.convertToJPEG = true;
        this.scopes = [
            'video.list',
            'user.info.basic',
            'video.publish',
            'video.upload',
            'user.info.profile',
            'user.info.stats',
        ];
        this.maxConcurrentJob = 10000;
        this.dto = tiktok_dto_1.TikTokDto;
        this.editor = 'normal';
    }
    maxLength() {
        return 2000;
    }
    async checkValidity(items) {
        const [firstItems] = items ?? [];
        if ((firstItems?.length ?? 0) === 0) {
            return 'No video / images selected';
        }
        if ((firstItems?.length ?? 0) > 1 &&
            firstItems?.some((p) => (p?.path?.indexOf?.('mp4') ?? -1) > -1)) {
            return 'Only pictures are supported when selecting multiple items';
        }
        else if (firstItems?.length !== 1 &&
            (firstItems?.[0]?.path?.indexOf?.('mp4') ?? -1) > -1) {
            return 'You need one media';
        }
        if (firstItems?.every((p) => (p?.path?.indexOf?.('mp4') ?? -1) === -1)) {
            const dimensions = await Promise.all(firstItems?.map((p) => this.getImageDimensions(p?.path)) ?? []);
            const tooBig = dimensions.findIndex((p) => Math.min(p?.width ?? 0, p?.height ?? 0) > 1080);
            if (tooBig > -1) {
                return `Image ${tooBig + 1} is ${dimensions[tooBig]?.width}x${dimensions[tooBig]?.height}, TikTok allows a maximum of 1080px on the shorter side`;
            }
        }
        return true;
    }
    handleErrors(body) {
        if (body.indexOf('access_token_invalid') > -1) {
            return {
                type: 'refresh-token',
                value: 'Access token invalid, please re-authenticate your TikTok account',
            };
        }
        if (body.indexOf('scope_not_authorized') > -1) {
            return {
                type: 'bad-body',
                value: 'Missing required permissions, please re-authenticate with all scopes',
            };
        }
        if (body.indexOf('scope_permission_missed') > -1) {
            return {
                type: 'bad-body',
                value: 'Additional permissions required, please re-authenticate',
            };
        }
        if (body.indexOf('rate_limit_exceeded') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok API rate limit exceeded, please try again later',
            };
        }
        if (body.indexOf('file_format_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'File format is invalid, please check video specifications',
            };
        }
        if (body.indexOf('app_version_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'In order to use the TikTok upload feature, you have to update your app to the latest version',
            };
        }
        if (body.indexOf('duration_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Video duration is invalid, please check video specifications',
            };
        }
        if (body.indexOf('frame_rate_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Video frame rate is invalid, please check video specifications',
            };
        }
        if (body.indexOf('video_pull_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Failed to pull video from URL, please check the URL',
            };
        }
        if (body.indexOf('photo_pull_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Failed to pull photo from URL, please check the URL',
            };
        }
        if (body.indexOf('spam_risk_user_banned_from_posting') > -1) {
            return {
                type: 'bad-body',
                value: 'Account banned from posting, please check TikTok account status',
            };
        }
        if (body.indexOf('spam_risk_text') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok detected potential spam in the post text',
            };
        }
        if (body.indexOf('spam_risk_too_many_posts') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok says your daily post limit reached, please try again tomorrow',
            };
        }
        if (body.indexOf('spam_risk_too_many_pending_share') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok limits pending posts to 5 within any 24-hour period. Please check your TikTok inbox in the TikTok mobile app and try again after 24 hours.',
            };
        }
        if (body.indexOf('spam_risk_user_banned_from_posting') > -1) {
            return {
                type: 'bad-body',
                value: 'Account banned from posting, please check TikTok account status',
            };
        }
        if (body.indexOf('spam_risk') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok detected potential spam',
            };
        }
        if (body.indexOf('reached_active_user_cap') > -1) {
            return {
                type: 'disconnect',
                value: 'TikTok daily user limit reached, please re-connect your account',
            };
        }
        if (body.indexOf('unaudited_client_can_only_post_to_private_accounts') > -1) {
            return {
                type: 'bad-body',
                value: 'App not approved for public posting, contact support',
            };
        }
        if (body.indexOf('url_ownership_unverified') > -1) {
            return {
                type: 'bad-body',
                value: 'You have to upload the picture/video to Nexora when sending a URL',
            };
        }
        if (body.indexOf('privacy_level_option_mismatch') > -1) {
            return {
                type: 'bad-body',
                value: 'Privacy level mismatch, please check privacy settings',
            };
        }
        if (body.indexOf('invalid_file_upload') > -1) {
            return {
                type: 'bad-body',
                value: 'Invalid file format or specifications not met',
            };
        }
        if (body.indexOf('invalid_params') > -1) {
            return {
                type: 'bad-body',
                value: 'Invalid request parameters, please check content format',
            };
        }
        if (body.indexOf('internal') > -1) {
            return {
                type: 'bad-body',
                value: 'There is a problem with TikTok servers, please try again later',
            };
        }
        if (body.indexOf('picture_size_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Media size not supported by TikTok: images up to 1080px on the shorter side, videos at least 360px on both sides',
            };
        }
        if (body.indexOf('TikTok API error') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok API error, please try again',
            };
        }
        return undefined;
    }
    async refreshToken(refreshToken) {
        const value = {
            client_key: process.env.TIKTOK_CLIENT_ID,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        };
        const { access_token, refresh_token, ...all } = await (await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: new URLSearchParams(value).toString(),
        })).json();
        const { data: { user: { avatar_url, display_name, open_id, username }, }, } = await (await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,union_id,username', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            refreshToken: refresh_token,
            expiresIn: (0, dayjs_1.default)().add(23, 'hours').unix() - (0, dayjs_1.default)().unix(),
            accessToken: access_token,
            id: open_id.replace(/-/g, ''),
            name: display_name,
            picture: avatar_url || '',
            username: username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(16);
        return {
            url: 'https://www.tiktok.com/v2/auth/authorize/' +
                `?client_key=${process.env.TIKTOK_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(`${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                    ? 'https://redirectmeto.com/'
                    : ''}${process?.env?.FRONTEND_URL}/integrations/social/tiktok`)}` +
                `&state=${state}` +
                `&response_type=code` +
                `&scope=${encodeURIComponent(this.scopes.join(','))}`,
            codeVerifier: state,
            state,
        };
    }
    async authenticate(params) {
        const value = {
            client_key: process.env.TIKTOK_CLIENT_ID,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code: params.code,
            grant_type: 'authorization_code',
            code_verifier: params.codeVerifier,
            redirect_uri: `${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                ? 'https://redirectmeto.com/'
                : ''}${process?.env?.FRONTEND_URL}/integrations/social/tiktok`,
        };
        const { access_token, refresh_token, scope } = await (await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: new URLSearchParams(value).toString(),
        })).json();
        this.checkScopes(this.scopes, scope);
        const { data: { user: { avatar_url, display_name, open_id, username }, }, } = await (await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,union_id,username', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: open_id.replace(/-/g, ''),
            name: display_name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: (0, dayjs_1.default)().add(23, 'hours').unix() - (0, dayjs_1.default)().unix(),
            picture: avatar_url,
            username: username,
        };
    }
    async maxVideoLength(accessToken) {
        const { data: { max_video_post_duration_sec }, } = await (await fetch('https://open.tiktokapis.com/v2/post/publish/creator_info/query/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return {
            maxDurationSeconds: max_video_post_duration_sec,
        };
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        let post;
        let publicPostId;
        try {
            const raw = await (await this.fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    publish_id: pendingData.publishId,
                }),
            }, '', 0, true)).text();
            ({ post, publicPostId } = this.parsePublishStatus(raw));
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            return { status: 'pending', pendingData };
        }
        const { status } = post?.data || {};
        if (status === 'SEND_TO_USER_INBOX') {
            return {
                status: 'completed',
                releaseURL: `https://www.tiktok.com/messages?lang=en#${pendingData.publishId}`,
                postId: 'missing',
            };
        }
        if (status === 'PUBLISH_COMPLETE') {
            return {
                status: 'completed',
                releaseURL: !publicPostId
                    ? `https://www.tiktok.com/@${integration.profile}`
                    : this.postUrl(integration, pendingData.publishId, publicPostId),
                postId: !publicPostId ? pendingData.publishId : publicPostId,
            };
        }
        if (status === 'FAILED') {
            const handleError = this.handleErrors(JSON.stringify(post));
            throw new social_abstract_1.BadBody('titok-error-upload', JSON.stringify(post), Buffer.from(JSON.stringify(post)), handleError?.value || '');
        }
        return { status: 'pending', pendingData };
    }
    postUrl(integration, publishId, postId) {
        return `https://www.tiktok.com/@${integration.profile}/${publishId.indexOf('p_') === 0 ? 'photo' : 'video'}/${postId}`;
    }
    parsePublishStatus(raw) {
        const [, publicPostId] = raw.match(/"publicaly_available_post_id"\s*:\s*\[\s*"?(\d+)/) || [];
        return { post: JSON.parse(raw), publicPostId };
    }
    contentPostingMethod(firstPost) {
        return firstPost?.settings?.content_posting_method === 'UPLOAD'
            ? 'UPLOAD'
            : 'DIRECT_POST';
    }
    postingMethod(method, isPhoto) {
        switch (method) {
            case 'UPLOAD':
                return isPhoto ? '/content/init/' : '/inbox/video/init/';
            case 'DIRECT_POST':
            default:
                return isPhoto ? '/content/init/' : '/video/init/';
        }
    }
    buildTikokPostInfoBody(firstPost) {
        const isPhoto = !(0, has_extension_1.hasExtension)(firstPost?.media?.[0]?.path, 'mp4');
        const method = this.contentPostingMethod(firstPost);
        if (method === 'DIRECT_POST') {
            return {
                post_info: {
                    ...(isPhoto && firstPost.settings.title
                        ? { title: firstPost.settings.title.slice(0, 90) }
                        : {}),
                    ...(!isPhoto && firstPost.message
                        ? { title: firstPost.message }
                        : {}),
                    ...(isPhoto ? { description: firstPost.message } : {}),
                    privacy_level: firstPost.settings.privacy_level || 'PUBLIC_TO_EVERYONE',
                    ...(isPhoto
                        ? {}
                        : { disable_duet: !this.assetBoolean(firstPost.settings.duet) }),
                    disable_comment: !this.assetBoolean(firstPost.settings.comment),
                    ...(isPhoto
                        ? {}
                        : {
                            disable_stitch: !this.assetBoolean(firstPost.settings.stitch),
                        }),
                    ...(isPhoto
                        ? {}
                        : {
                            is_aigc: this.assetBoolean(firstPost.settings.video_made_with_ai),
                        }),
                    brand_content_toggle: this.assetBoolean(firstPost.settings.brand_content_toggle),
                    brand_organic_toggle: this.assetBoolean(firstPost.settings.brand_organic_toggle),
                    ...(isPhoto
                        ? {
                            auto_add_music: firstPost.settings.autoAddMusic === 'yes',
                        }
                        : {}),
                    ...(!isPhoto && firstPost?.media?.[0]?.thumbnailTimestamp != null
                        ? {
                            video_cover_timestamp_ms: firstPost?.media?.[0]?.thumbnailTimestamp,
                        }
                        : {}),
                },
            };
        }
        return {
            post_info: {
                ...(isPhoto && firstPost.settings.title
                    ? { title: firstPost.settings.title }
                    : {}),
                ...(!isPhoto && firstPost.message ? { title: firstPost.message } : {}),
                ...(isPhoto ? { description: firstPost.message } : {}),
            },
        };
    }
    tiktokChunkPlan(videoSize) {
        if (videoSize <= TiktokProvider_1.TIKTOK_MAX_SINGLE_CHUNK) {
            return { chunkSize: videoSize, totalChunkCount: 1 };
        }
        const chunkSize = TiktokProvider_1.TIKTOK_CHUNK_SIZE;
        return {
            chunkSize,
            totalChunkCount: Math.floor(videoSize / chunkSize),
        };
    }
    async tiktokChunkStream(path, start, end) {
        if (path.indexOf('http') === 0) {
            const controller = new AbortController();
            const response = await fetch(path, {
                headers: {
                    Range: `bytes=${start}-${end}`,
                    'accept-encoding': 'identity',
                },
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                signal: controller.signal,
            });
            if (response.status !== 206) {
                await response.body?.cancel().catch(() => { });
                throw new social_abstract_1.BadBody('tiktok-error-upload', (0, social_abstract_1.rangeReadFailure)(response), '{}', 'The media storage did not return the requested byte range, please try again');
            }
            return { body: response.body, release: () => controller.abort() };
        }
        const stream = (0, fs_1.createReadStream)(this.localMediaPath(path, 'tiktok-error-upload'), { start, end });
        return { body: stream, release: () => stream.destroy() };
    }
    async uploadTikTokVideoBytes(uploadUrl, path, videoSize, contentType) {
        const { chunkSize, totalChunkCount } = this.tiktokChunkPlan(videoSize);
        for (let i = 0; i < totalChunkCount; i++) {
            const start = i * chunkSize;
            const end = i === totalChunkCount - 1 ? videoSize - 1 : start + chunkSize - 1;
            await this.uploadTikTokChunk(uploadUrl, path, start, end, videoSize, contentType);
        }
    }
    async uploadTikTokChunk(uploadUrl, path, start, end, videoSize, contentType, totalRetries = 0) {
        const { body, release } = await this.tiktokChunkStream(path, start, end);
        (0, temporal_heartbeat_1.setHeartbeatDetails)(`tiktok: upload chunk ${start}-${end}`);
        const upload = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
                'Content-Length': String(end - start + 1),
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            },
            body,
            duplex: 'half',
        }).catch((err) => {
            release();
            throw err;
        });
        if (upload.status === 200 ||
            upload.status === 201 ||
            upload.status === 206) {
            return;
        }
        release();
        const text = await upload.text().catch(() => '{}');
        if ((upload.status >= 500 || upload.status === 429) &&
            totalRetries <= 2) {
            await (0, timer_1.timer)(5000);
            return this.uploadTikTokChunk(uploadUrl, path, start, end, videoSize, contentType, totalRetries + 1);
        }
        const handleError = this.handleErrors(text);
        throw new social_abstract_1.BadBody('tiktok-error-upload', text, Buffer.from(text), handleError?.value || 'Failed to upload the video to TikTok');
    }
    buildTikokSourceInfoBody(firstPost, videoSize) {
        const isPhoto = !(0, has_extension_1.hasExtension)(firstPost?.media?.[0]?.path, 'mp4');
        if (isPhoto) {
            return {
                post_mode: this.contentPostingMethod(firstPost) === 'DIRECT_POST'
                    ? 'DIRECT_POST'
                    : 'MEDIA_UPLOAD',
                media_type: 'PHOTO',
                source_info: {
                    source: 'PULL_FROM_URL',
                    photo_cover_index: 0,
                    photo_images: firstPost.media?.map((p) => p.path),
                },
            };
        }
        const { chunkSize, totalChunkCount } = this.tiktokChunkPlan(videoSize || 0);
        return {
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: videoSize,
                chunk_size: chunkSize,
                total_chunk_count: totalChunkCount,
            },
        };
    }
    async postPending(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const isPhoto = !(0, has_extension_1.hasExtension)(firstPost?.media?.[0]?.path, 'mp4');
        const videoPath = firstPost?.media?.[0]?.path;
        const videoSize = isPhoto
            ? undefined
            : await this.mediaSize(videoPath, 'tiktok-error-upload');
        const { data: { publish_id, upload_url }, } = await (await this.fetch(`https://open.tiktokapis.com/v2/post/publish${this.postingMethod(this.contentPostingMethod(firstPost), isPhoto)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                ...this.buildTikokPostInfoBody(firstPost),
                ...this.buildTikokSourceInfoBody(firstPost, videoSize),
            }),
        })).json();
        if (!isPhoto && upload_url && videoSize) {
            try {
                await this.uploadTikTokVideoBytes(upload_url, videoPath, videoSize, 'video/mp4');
            }
            catch (err) {
                if (err instanceof social_abstract_1.BadBody) {
                    throw err;
                }
            }
        }
        return [
            {
                id: firstPost.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: { publishId: publish_id },
            },
        ];
    }
    async post(id, accessToken, postDetails, integration) {
        const [response] = await this.postPending(id, accessToken, postDetails, integration);
        const started = Date.now();
        for (const _ of Array(27).keys()) {
            const check = await this.checkPostStatus(accessToken, response.pendingData, integration);
            if (check.status === 'completed') {
                return [
                    {
                        id: response.id,
                        releaseURL: check.releaseURL,
                        postId: String(check.postId),
                        status: 'success',
                    },
                ];
            }
            if (Date.now() - started > 8 * 60 * 1000) {
                break;
            }
            await (0, timer_1.timer)(20000);
        }
        throw new social_abstract_1.BadBody('titok-error-upload', JSON.stringify({}), Buffer.from(JSON.stringify({})), 'TikTok refused to publish your post');
    }
    async analytics(id, accessToken, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const userStatsResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const userStatsData = await userStatsResponse.json();
            const userStats = userStatsData?.data?.user;
            const result = [];
            if (userStats) {
                if (userStats.follower_count !== undefined) {
                    result.push({
                        label: 'Followers',
                        percentageChange: 0,
                        data: [{ total: String(userStats.follower_count), date: today }],
                    });
                }
                if (userStats.following_count !== undefined) {
                    result.push({
                        label: 'Following',
                        percentageChange: 0,
                        data: [{ total: String(userStats.following_count), date: today }],
                    });
                }
                if (userStats.likes_count !== undefined) {
                    result.push({
                        label: 'Total Likes',
                        percentageChange: 0,
                        data: [{ total: String(userStats.likes_count), date: today }],
                    });
                }
                if (userStats.video_count !== undefined) {
                    result.push({
                        label: 'Videos',
                        percentageChange: 0,
                        data: [{ total: String(userStats.video_count), date: today }],
                    });
                }
            }
            const videoListResponse = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ max_count: 20 }),
            });
            const videoListData = await videoListResponse.json();
            const videos = videoListData?.data?.videos;
            if (videos && videos.length > 0) {
                const videoIds = videos.map((v) => v.id);
                const videoQueryResponse = await fetch('https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        filters: { video_ids: videoIds },
                    }),
                });
                const videoQueryData = await videoQueryResponse.json();
                const videoDetails = videoQueryData?.data?.videos;
                if (videoDetails && videoDetails.length > 0) {
                    let totalViews = 0;
                    let totalLikes = 0;
                    let totalComments = 0;
                    let totalShares = 0;
                    for (const video of videoDetails) {
                        totalViews += video.view_count || 0;
                        totalLikes += video.like_count || 0;
                        totalComments += video.comment_count || 0;
                        totalShares += video.share_count || 0;
                    }
                    result.push({
                        label: 'Views',
                        percentageChange: 0,
                        data: [{ total: String(totalViews), date: today }],
                    });
                    result.push({
                        label: 'Recent Likes',
                        percentageChange: 0,
                        data: [{ total: String(totalLikes), date: today }],
                    });
                    result.push({
                        label: 'Recent Comments',
                        percentageChange: 0,
                        data: [{ total: String(totalComments), date: today }],
                    });
                    result.push({
                        label: 'Recent Shares',
                        percentageChange: 0,
                        data: [{ total: String(totalShares), date: today }],
                    });
                }
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching TikTok analytics:', err);
            return [];
        }
    }
    async missing(id, accessToken) {
        try {
            const videoListResponse = await this.fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,cover_image_url,title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ max_count: 20 }),
            });
            const videoListData = await videoListResponse.json();
            const videos = videoListData?.data?.videos;
            if (!videos || videos.length === 0) {
                return [];
            }
            return videos.map((v) => ({
                id: String(v.id),
                url: v.cover_image_url,
            }));
        }
        catch (err) {
            console.error('Error fetching TikTok missing content:', err);
            return [];
        }
    }
    async resolveReleaseId(accessToken, releaseId, integration, settings, releaseURL) {
        const draft = releaseId === 'missing';
        const publishId = draft ? releaseURL?.split('#')[1] || '' : releaseId;
        if (publishId.indexOf('_pub_') === -1 &&
            publishId.indexOf('_inbox_') === -1) {
            return undefined;
        }
        if (!draft &&
            ['SELF_ONLY', 'MUTUAL_FOLLOW_FRIENDS'].includes(settings?.privacy_level)) {
            return { unavailable: true };
        }
        const raw = await (await this.fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                publish_id: publishId,
            }),
        })).text();
        const { post, publicPostId } = this.parsePublishStatus(raw);
        if (draft && post?.data?.status === 'FAILED') {
            console.log(`TikTok inbox upload ${publishId} failed later: ${raw}`);
        }
        if (!publicPostId) {
            return draft ? undefined : { pending: true };
        }
        return {
            postId: publicPostId,
            releaseURL: this.postUrl(integration, publishId, publicPostId),
        };
    }
    async releaseUrl(accessToken, releaseId) {
        const data = await (await this.fetch('https://open.tiktokapis.com/v2/video/query/?fields=id,share_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                filters: {
                    video_ids: [releaseId],
                },
            }),
        })).json();
        return data?.data?.videos?.[0]?.share_url?.split('?')[0];
    }
    async postAnalytics(integrationId, accessToken, postId, fromDate) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const response = await fetch('https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    filters: {
                        video_ids: [postId],
                    },
                }),
            });
            const data = await response.json();
            const video = data?.data?.videos?.[0];
            if (!video) {
                return [];
            }
            const result = [];
            if (video.view_count !== undefined) {
                result.push({
                    label: 'Views',
                    percentageChange: 0,
                    data: [{ total: String(video.view_count), date: today }],
                });
            }
            if (video.like_count !== undefined) {
                result.push({
                    label: 'Likes',
                    percentageChange: 0,
                    data: [{ total: String(video.like_count), date: today }],
                });
            }
            if (video.comment_count !== undefined) {
                result.push({
                    label: 'Comments',
                    percentageChange: 0,
                    data: [{ total: String(video.comment_count), date: today }],
                });
            }
            if (video.share_count !== undefined) {
                result.push({
                    label: 'Shares',
                    percentageChange: 0,
                    data: [{ total: String(video.share_count), date: today }],
                });
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching TikTok post analytics:', err);
            return [];
        }
    }
};
exports.TiktokProvider = TiktokProvider;
TiktokProvider.TIKTOK_MAX_SINGLE_CHUNK = 64 * 1024 * 1024;
TiktokProvider.TIKTOK_CHUNK_SIZE = 10 * 1024 * 1024;
exports.TiktokProvider = TiktokProvider = TiktokProvider_1 = __decorate([
    (0, rules_description_decorator_1.Rules)([
        'TikTok can have one video or one picture or multiple pictures, it cannot be without an attachment.',
        'content_posting_method=DIRECT_POST publishes the post to the account. content_posting_method=UPLOAD does NOT publish: it only sends the media to the user inbox of the TikTok app, where the user must manually complete and publish it within 24 hours or it is discarded. Use DIRECT_POST unless the user explicitly asks to review or edit the post inside the TikTok app first.',
        'With content_posting_method=UPLOAD, TikTok ignores every setting except the title / post content, and keeps those for photo posts only - a video arrives in the inbox without its caption (the description is empty or just "#Nexora"), so the user has to type the caption in the TikTok app. Never tell the user that video_made_with_ai, privacy_level, duet, stitch, comment, autoAddMusic, brand_content_toggle or brand_organic_toggle will be applied in UPLOAD mode - they are silently discarded. If the user asks for any of those settings, tell them it requires DIRECT_POST.',
        'video_made_with_ai, duet and stitch apply to video posts only. TikTok has no equivalent field for photo posts, so those settings are discarded when the attachment is a picture.',
    ].join(' '))
], TiktokProvider);
//# sourceMappingURL=tiktok.provider.js.map
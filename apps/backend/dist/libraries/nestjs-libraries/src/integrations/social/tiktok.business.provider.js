"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiktokBusinessProvider = void 0;
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const tiktok_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto");
const timer_1 = require("@gitroom/helpers/utils/timer");
const has_extension_1 = require("@gitroom/helpers/utils/has.extension");
const rules_description_decorator_1 = require("@gitroom/nestjs-libraries/chat/rules.description.decorator");
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
let TiktokBusinessProvider = class TiktokBusinessProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'tiktok-business';
        this.name = 'TikTok';
        this.isBetweenSteps = false;
        this.convertToJPEG = true;
        this.scopes = [
            'user.info.basic',
            'user.info.username',
            'user.info.stats',
            'video.list',
            'video.upload',
            'video.publish',
        ];
        this.maxConcurrentJob = 10000;
        this.dto = tiktok_dto_1.TikTokDto;
        this.editor = 'normal';
        this.baseUrl = 'https://business-api.tiktok.com/open_api/v1.3';
    }
    maxLength() {
        return 2200;
    }
    redirectUri() {
        return `${process?.env?.FRONTEND_URL?.indexOf('https') === -1
            ? 'https://redirectmeto.com/'
            : ''}${process?.env?.FRONTEND_URL}/integrations/social/tiktok-business/`;
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
        if ((firstItems?.length ?? 0) > 35) {
            return 'You can select up to 35 pictures';
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
        if (body.indexOf('access_token_invalid') > -1 ||
            body.indexOf('Access token is incorrect') > -1 ||
            body.indexOf('Access token has expired') > -1 ||
            body.indexOf('The access token is invalid') > -1 ||
            body.indexOf('auth_removed') > -1) {
            return {
                type: 'refresh-token',
                value: 'Access token invalid, please re-authenticate your TikTok account',
            };
        }
        if (body.indexOf('rate_limit_exceeded') > -1 ||
            body.indexOf('Too many requests') > -1) {
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
        if (body.indexOf('spam_risk') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok detected potential spam',
            };
        }
        if (body.indexOf('reached_active_user_cap') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok daily user limit reached, please try again tomorrow',
            };
        }
        if (body.indexOf('url_ownership_unverified') > -1) {
            return {
                type: 'bad-body',
                value: 'The media domain is not a verified URL property of the TikTok app',
            };
        }
        if (body.indexOf('publish_cancelled') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok cancelled the upload, please try again',
            };
        }
        if (body.indexOf('picture_size_check_failed') > -1) {
            return {
                type: 'bad-body',
                value: 'Media size not supported by TikTok: images up to 1080px on the shorter side, videos at least 360px on both sides',
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
        if (body.indexOf('TikTok API error') > -1) {
            return {
                type: 'bad-body',
                value: 'TikTok API error, please try again',
            };
        }
        return undefined;
    }
    async fetchUserInformation(accessToken, businessId) {
        const information = await (await this.fetch(`${this.baseUrl}/business/get/?business_id=${encodeURIComponent(businessId)}&fields=${encodeURIComponent(JSON.stringify(['username', 'display_name', 'profile_image']))}`, {
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
        })).json();
        if (information?.code !== 0) {
            const asString = JSON.stringify(information);
            const handleError = this.handleErrors(asString);
            throw new social_abstract_1.BadBody('tiktok-business', asString, Buffer.from('{}'), handleError?.value ||
                information?.message ||
                'Could not load the TikTok business account');
        }
        return {
            display_name: information.data?.display_name,
            profile_image: information.data?.profile_image,
            username: information.data?.username,
        };
    }
    async refreshToken(refreshToken) {
        const response = await (await fetch(`${this.baseUrl}/tt_user/oauth2/refresh_token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.TIKTOK_BUSINESS_CLIENT_ID,
                client_secret: process.env.TIKTOK_BUSINESS_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        })).json();
        if (response?.code !== 0 || !response?.data?.access_token) {
            const asString = JSON.stringify(response);
            const handleError = this.handleErrors(asString);
            throw new social_abstract_1.BadBody('tiktok-business', asString, Buffer.from('{}'), handleError?.value ||
                response?.message ||
                'Could not refresh the TikTok access token');
        }
        const { access_token, refresh_token, open_id } = response.data;
        const { display_name, profile_image, username } = await this.fetchUserInformation(access_token, open_id);
        return {
            refreshToken: refresh_token,
            expiresIn: (0, dayjs_1.default)().add(23, 'hours').unix() - (0, dayjs_1.default)().unix(),
            accessToken: access_token,
            id: open_id,
            name: display_name,
            picture: profile_image || '',
            username: username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(16);
        return {
            url: 'https://www.tiktok.com/v2/auth/authorize/' +
                `?client_key=${process.env.TIKTOK_BUSINESS_CLIENT_ID}` +
                `&redirect_uri=${encodeURIComponent(this.redirectUri())}` +
                `&state=${state}` +
                `&response_type=code` +
                `&disable_auto_auth=1` +
                `&scope=${encodeURIComponent(this.scopes.join(','))}`,
            codeVerifier: state,
            state,
        };
    }
    async authenticate(params) {
        if (!params.code) {
            throw new social_abstract_1.BadBody('tiktok-business', JSON.stringify({ reason: 'no auth_code in the redirect' }), Buffer.from('{}'), 'TikTok did not return an authorization code, the authorization was not completed');
        }
        const response = await (await fetch(`${this.baseUrl}/tt_user/oauth2/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.TIKTOK_BUSINESS_CLIENT_ID,
                client_secret: process.env.TIKTOK_BUSINESS_CLIENT_SECRET,
                grant_type: 'authorization_code',
                auth_code: params.code,
                redirect_uri: this.redirectUri(),
            }),
        })).json();
        if (response?.code !== 0 || !response?.data?.access_token) {
            const asString = JSON.stringify(response);
            const handleError = this.handleErrors(asString);
            throw new social_abstract_1.BadBody('tiktok-business', asString, Buffer.from('{}'), handleError?.value ||
                response?.message ||
                'Could not authenticate the TikTok business account');
        }
        const { access_token, refresh_token, scope, open_id } = response.data;
        this.checkScopes(this.scopes, scope);
        const { display_name, profile_image, username } = await this.fetchUserInformation(access_token, open_id);
        return {
            id: open_id,
            name: display_name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: (0, dayjs_1.default)().add(23, 'hours').unix() - (0, dayjs_1.default)().unix(),
            picture: profile_image || '',
            username: username,
        };
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        let body;
        let post;
        try {
            body = await (await this.fetch(`${this.baseUrl}/business/publish/status/?business_id=${encodeURIComponent(integration.internalId)}&publish_id=${encodeURIComponent(pendingData.publishId)}`, {
                method: 'GET',
                headers: {
                    'Access-Token': accessToken,
                },
            }, '', 0, true)).text();
            post = JSON.parse(body);
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            return { status: 'pending', pendingData };
        }
        if (post?.code !== 0) {
            const asString = JSON.stringify(post);
            const handleError = this.handleErrors(asString);
            if (handleError?.type === 'refresh-token') {
                throw new social_abstract_1.RefreshToken('tiktok-business', asString, '{}', handleError.value);
            }
            if (handleError?.type === 'disconnect') {
                throw new social_abstract_1.Disconnect('tiktok-business', asString, '{}', handleError.value);
            }
            return { status: 'pending', pendingData };
        }
        const { status, reason } = post?.data || {};
        if (status === 'SEND_TO_USER_INBOX') {
            return {
                status: 'completed',
                releaseURL: `https://www.tiktok.com/messages?lang=en#${pendingData.publishId}`,
                postId: 'missing',
            };
        }
        if (status === 'PUBLISH_COMPLETE') {
            const publicPostId = this.publicPostId(body);
            return {
                status: 'completed',
                releaseURL: !publicPostId
                    ? `https://www.tiktok.com/@${integration.profile}`
                    : this.postUrl(integration, pendingData.publishId, publicPostId),
                postId: !publicPostId ? pendingData.publishId : publicPostId,
            };
        }
        if (status === 'FAILED') {
            const handleError = this.handleErrors(`${reason || ''} ${JSON.stringify(post)}`);
            throw new social_abstract_1.BadBody('tiktok-business-error-upload', JSON.stringify(post), Buffer.from(JSON.stringify(post)), handleError?.value || '');
        }
        return { status: 'pending', pendingData };
    }
    contentPostingMethod(firstPost) {
        return firstPost?.settings?.content_posting_method === 'UPLOAD'
            ? 'UPLOAD'
            : 'DIRECT_POST';
    }
    buildVideoBody(businessId, firstPost) {
        const isDraft = this.contentPostingMethod(firstPost) === 'UPLOAD';
        return {
            business_id: businessId,
            video_url: firstPost?.media?.[0]?.path,
            ...(firstPost?.media?.[0]?.thumbnail
                ? { custom_thumbnail_url: firstPost?.media?.[0]?.thumbnail }
                : firstPost?.media?.[0]?.thumbnailTimestamp
                    ? { thumbnail_offset: firstPost?.media?.[0]?.thumbnailTimestamp }
                    : {}),
            post_info: {
                ...(firstPost.message ? { caption: firstPost.message } : {}),
                is_brand_organic: this.assetBoolean(firstPost.settings.brand_organic_toggle),
                is_branded_content: this.assetBoolean(firstPost.settings.brand_content_toggle),
                ...(isDraft
                    ? { upload_to_draft: true }
                    : {
                        disable_comment: !this.assetBoolean(firstPost.settings.comment),
                        disable_duet: !this.assetBoolean(firstPost.settings.duet),
                        disable_stitch: !this.assetBoolean(firstPost.settings.stitch),
                        is_ai_generated: this.assetBoolean(firstPost.settings.video_made_with_ai),
                        ...(firstPost.settings.location?.id
                            ? {
                                location_id: firstPost.settings.location.id,
                                location_name: firstPost.settings.location.name,
                            }
                            : {}),
                        ...(firstPost.settings.music?.id
                            ? {
                                music_sound_info: {
                                    music_sound_id: firstPost.settings.music.id,
                                    music_sound_volume: typeof firstPost.settings.music.audio_volume !==
                                        'undefined'
                                        ? +firstPost.settings.music.audio_volume
                                        : 50,
                                    video_original_sound_volume: typeof firstPost.settings.music.video_volume !==
                                        'undefined'
                                        ? +firstPost.settings.music.video_volume
                                        : 50,
                                },
                            }
                            : {}),
                    }),
            },
        };
    }
    async pickRandomMusicId(accessToken, businessId) {
        const tracks = await this.musicSearch(accessToken, {}, businessId);
        if (!tracks.length) {
            return undefined;
        }
        return tracks[Math.floor(Math.random() * tracks.length)].id;
    }
    async buildPhotoBody(businessId, firstPost, accessToken) {
        const isDraft = this.contentPostingMethod(firstPost) === 'UPLOAD';
        const musicId = firstPost.settings.autoAddMusic === 'yes'
            ? !isDraft
                ? await this.pickRandomMusicId(accessToken, businessId)
                : undefined
            : firstPost.settings.music?.id;
        return {
            business_id: businessId,
            photo_images: firstPost.media?.map((p) => p.path),
            photo_cover_index: 0,
            post_info: {
                ...(firstPost.settings.title
                    ? { title: firstPost.settings.title.slice(0, 90) }
                    : {}),
                ...(firstPost.message ? { caption: firstPost.message } : {}),
                is_brand_organic: this.assetBoolean(firstPost.settings.brand_organic_toggle),
                is_branded_content: this.assetBoolean(firstPost.settings.brand_content_toggle),
                ...(isDraft
                    ? { is_draft: true }
                    : {
                        privacy_level: firstPost.settings.privacy_level || 'PUBLIC_TO_EVERYONE',
                        disable_comment: !this.assetBoolean(firstPost.settings.comment),
                        auto_add_music: !musicId && firstPost.settings.autoAddMusic === 'yes',
                        ...(firstPost.settings.location?.id
                            ? {
                                location_id: firstPost.settings.location.id,
                                location_name: firstPost.settings.location.name,
                            }
                            : {}),
                        ...(musicId
                            ? {
                                music_sound_info: {
                                    music_sound_id: musicId,
                                },
                            }
                            : {}),
                    }),
            },
        };
    }
    async postPending(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const isPhoto = !(0, has_extension_1.hasExtension)(firstPost?.media?.[0]?.path, 'mp4');
        const body = isPhoto
            ? await this.buildPhotoBody(id, firstPost, accessToken)
            : this.buildVideoBody(id, firstPost);
        const publish = await (await this.fetch(`${this.baseUrl}${isPhoto ? '/business/photo/publish/' : '/business/video/publish/'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': accessToken,
            },
            body: JSON.stringify(body),
        })).json();
        if (publish?.code !== 0 || !publish?.data?.share_id) {
            const asString = JSON.stringify(publish);
            const handleError = this.handleErrors(asString);
            if (handleError?.type === 'refresh-token') {
                throw new social_abstract_1.RefreshToken('tiktok-business', asString, JSON.stringify(body), handleError.value);
            }
            if (handleError?.type === 'disconnect') {
                throw new social_abstract_1.Disconnect('tiktok-business', asString, JSON.stringify(body), handleError.value);
            }
            throw new social_abstract_1.BadBody('tiktok-business-error-upload', asString, Buffer.from(JSON.stringify(body)), handleError?.value || publish?.message || 'TikTok refused the post');
        }
        return [
            {
                id: firstPost.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: { publishId: publish.data.share_id },
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
        throw new social_abstract_1.BadBody('tiktok-business-error-upload', JSON.stringify({}), Buffer.from(JSON.stringify({})), 'TikTok refused to publish your post');
    }
    async musicSearch(accessToken, data, id) {
        const music = await (await this.fetch(`${this.baseUrl}/discovery/cml/trending_list/?business_id=${encodeURIComponent(id)}${data?.genre ? `&genre=${encodeURIComponent(data.genre)}` : ''}`, {
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
        })).json();
        if (music?.code !== 0) {
            const asString = JSON.stringify(music);
            const handleError = this.handleErrors(asString);
            if (handleError?.type === 'refresh-token') {
                throw new social_abstract_1.RefreshToken('tiktok-business', asString, '{}', handleError.value);
            }
            return [];
        }
        return (music?.data?.list || [])
            .map((track) => ({
            id: track?.full_duration_song_clip?.song_clip_id ||
                track?.trending_song_clip?.song_clip_id,
            title: track?.commercial_music_name || '',
            artist: track?.artist || '',
            image: track?.thumbnail_url || '',
            duration: (track?.duration || track?.trending_song_clip?.duration || 0) * 1000,
            previewUrl: track?.preview_url || track?.trending_song_clip?.preview_url || '',
        }))
            .filter((track) => track.id);
    }
    async locationSearch(accessToken, data, id) {
        if (!data?.q) {
            return [];
        }
        const locations = await (await this.fetch(`${this.baseUrl}/business/publish/location/?business_id=${encodeURIComponent(id)}&search_query=${encodeURIComponent(data.q.slice(0, 100))}`, {
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
        })).json();
        if (locations?.code !== 0) {
            const asString = JSON.stringify(locations);
            const handleError = this.handleErrors(asString);
            if (handleError?.type === 'refresh-token') {
                throw new social_abstract_1.RefreshToken('tiktok-business', asString, '{}', handleError.value);
            }
            return [];
        }
        return (locations?.data?.locations || []).map((location) => ({
            id: location?.location_id,
            name: location?.location_name || '',
            address: location?.location_address || '',
        }));
    }
    async loadVideoList(accessToken, businessId, fields) {
        const videoListData = await (await this.fetch(`${this.baseUrl}/business/video/list/?business_id=${encodeURIComponent(businessId)}&fields=${encodeURIComponent(JSON.stringify(fields))}&max_count=20`, {
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
        })).json();
        this.throwIfTokenError(videoListData);
        return videoListData?.data?.videos;
    }
    postUrl(integration, publishId, postId) {
        return `https://www.tiktok.com/@${integration.profile}/${publishId.indexOf('p_') === 0 ? 'photo' : 'video'}/${postId}`;
    }
    publicPostId(body) {
        return body.match(/"post_ids"\s*:\s*\[\s*"?(\d+)"?/)?.[1];
    }
    throwIfTokenError(body) {
        if (body?.code === 0) {
            return;
        }
        const asString = JSON.stringify(body);
        const handleError = this.handleErrors(asString);
        if (handleError?.type === 'refresh-token') {
            throw new social_abstract_1.RefreshToken('tiktok-business', asString, '{}', handleError.value);
        }
        if (handleError?.type === 'disconnect') {
            throw new social_abstract_1.Disconnect('tiktok-business', asString, '{}', handleError.value);
        }
    }
    async analytics(id, accessToken, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const userStatsData = await (await this.fetch(`${this.baseUrl}/business/get/?business_id=${encodeURIComponent(id)}&fields=${encodeURIComponent(JSON.stringify([
                'followers_count',
                'following_count',
                'total_likes',
                'videos_count',
            ]))}`, {
                method: 'GET',
                headers: {
                    'Access-Token': accessToken,
                },
            })).json();
            this.throwIfTokenError(userStatsData);
            const userStats = userStatsData?.data;
            const result = [];
            if (userStats) {
                if (userStats.followers_count !== undefined) {
                    result.push({
                        label: 'Followers',
                        percentageChange: 0,
                        data: [{ total: String(userStats.followers_count), date: today }],
                    });
                }
                if (userStats.following_count !== undefined) {
                    result.push({
                        label: 'Following',
                        percentageChange: 0,
                        data: [{ total: String(userStats.following_count), date: today }],
                    });
                }
                if (userStats.total_likes !== undefined) {
                    result.push({
                        label: 'Total Likes',
                        percentageChange: 0,
                        data: [{ total: String(userStats.total_likes), date: today }],
                    });
                }
                if (userStats.videos_count !== undefined) {
                    result.push({
                        label: 'Videos',
                        percentageChange: 0,
                        data: [{ total: String(userStats.videos_count), date: today }],
                    });
                }
            }
            const videos = await this.loadVideoList(accessToken, id, [
                'item_id',
                'likes',
                'comments',
                'shares',
                'video_views',
            ]);
            if (videos && videos.length > 0) {
                let totalViews = 0;
                let totalLikes = 0;
                let totalComments = 0;
                let totalShares = 0;
                for (const video of videos) {
                    totalViews += video.video_views || 0;
                    totalLikes += video.likes || 0;
                    totalComments += video.comments || 0;
                    totalShares += video.shares || 0;
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
            return result;
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            console.error('Error fetching TikTok Business analytics:', err);
            return [];
        }
    }
    async missing(id, accessToken) {
        try {
            const videos = await this.loadVideoList(accessToken, id, [
                'item_id',
                'thumbnail_url',
            ]);
            if (!videos || videos.length === 0) {
                return [];
            }
            return videos.map((v) => ({
                id: String(v.item_id),
                url: v.thumbnail_url,
            }));
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            console.error('Error fetching TikTok Business missing content:', err);
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
            publishId.indexOf('p_pub_') === 0 &&
            ['SELF_ONLY', 'MUTUAL_FOLLOW_FRIENDS'].includes(settings?.privacy_level)) {
            return { unavailable: true };
        }
        const body = await (await this.fetch(`${this.baseUrl}/business/publish/status/?business_id=${encodeURIComponent(integration.internalId)}&publish_id=${encodeURIComponent(publishId)}`, {
            method: 'GET',
            headers: {
                'Access-Token': accessToken,
            },
        })).text();
        const post = JSON.parse(body);
        this.throwIfTokenError(post);
        if (draft && post?.data?.status === 'FAILED') {
            console.log(`TikTok inbox upload ${publishId} failed later: ${body}`);
        }
        const publicPostId = this.publicPostId(body);
        if (!publicPostId) {
            return draft ? undefined : { pending: true };
        }
        return {
            postId: publicPostId,
            releaseURL: this.postUrl(integration, publishId, publicPostId),
        };
    }
    async releaseUrl(accessToken, releaseId, integration) {
        return `https://www.tiktok.com/@${integration.profile}/video/${releaseId}`;
    }
    async postAnalytics(integrationId, accessToken, postId, fromDate) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const videoQueryData = await (await this.fetch(`${this.baseUrl}/business/video/list/?business_id=${encodeURIComponent(integrationId)}&fields=${encodeURIComponent(JSON.stringify(['item_id', 'likes', 'comments', 'shares', 'video_views']))}&filters=${encodeURIComponent(JSON.stringify({ video_ids: [postId] }))}`, {
                method: 'GET',
                headers: {
                    'Access-Token': accessToken,
                },
            })).json();
            this.throwIfTokenError(videoQueryData);
            const video = videoQueryData?.data?.videos?.[0];
            if (!video) {
                return [];
            }
            const result = [];
            if (video.video_views !== undefined) {
                result.push({
                    label: 'Views',
                    percentageChange: 0,
                    data: [{ total: String(video.video_views), date: today }],
                });
            }
            if (video.likes !== undefined) {
                result.push({
                    label: 'Likes',
                    percentageChange: 0,
                    data: [{ total: String(video.likes), date: today }],
                });
            }
            if (video.comments !== undefined) {
                result.push({
                    label: 'Comments',
                    percentageChange: 0,
                    data: [{ total: String(video.comments), date: today }],
                });
            }
            if (video.shares !== undefined) {
                result.push({
                    label: 'Shares',
                    percentageChange: 0,
                    data: [{ total: String(video.shares), date: today }],
                });
            }
            return result;
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken || err instanceof social_abstract_1.Disconnect) {
                throw err;
            }
            console.error('Error fetching TikTok Business post analytics:', err?.cause?.code || err?.message || err);
            return [];
        }
    }
};
exports.TiktokBusinessProvider = TiktokBusinessProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Load commercial music library tracks that can be attached to a post via the "music" setting',
        dataSchema: [
            {
                key: 'genre',
                type: 'string',
                description: 'Genre to filter the tracks by (for example POP, ROCK, ELECTRONIC), leave empty for all genres',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], TiktokBusinessProvider.prototype, "musicSearch", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search location tags that can be attached to a post via the "location" setting',
        dataSchema: [
            {
                key: 'q',
                type: 'string',
                description: 'Search query for the location',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], TiktokBusinessProvider.prototype, "locationSearch", null);
exports.TiktokBusinessProvider = TiktokBusinessProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)([
        'TikTok Business can have one video or one picture or multiple pictures (up to 35), it cannot be without an attachment.',
        'content_posting_method=DIRECT_POST publishes the post to the account. content_posting_method=UPLOAD does NOT publish: it only saves the media as a draft in the user inbox of the TikTok app, where the user must manually complete and publish it. Use DIRECT_POST unless the user explicitly asks to review or edit the post inside the TikTok app first.',
        'With content_posting_method=UPLOAD, TikTok ignores every setting except the title / post content, and keeps those for photo posts only - a video arrives in the inbox without its caption (the description is empty or just "#Nexora"), so the user has to type the caption in the TikTok app. Never tell the user that video_made_with_ai, privacy_level, duet, stitch, comment, autoAddMusic, brand_content_toggle or brand_organic_toggle will be applied in UPLOAD mode - they are silently discarded. If the user asks for any of those settings, tell them it requires DIRECT_POST.',
        'video_made_with_ai, duet and stitch apply to video posts only. privacy_level and autoAddMusic apply to photo posts only - the TikTok Business API has no privacy field for video posts, so those settings are discarded when the attachment is a video.',
        'The music setting attaches a commercial music library track (found via the musicSearch function) to a video or photo post, and the location setting tags the post with a location (found via the locationSearch function). Both apply only with content_posting_method=DIRECT_POST. music.audio_volume / music.video_volume (0-100, default 50) apply to video posts only. For photos, autoAddMusic=yes attaches a RANDOM commercial music library track and overrides any music selection - use autoAddMusic=no when the user wants a specific track.',
        'Media is pulled by TikTok from its URL, so the media must be uploaded to Nexora and the media domain must be a verified URL property of the TikTok Business app.',
    ].join(' '))
], TiktokBusinessProvider);
//# sourceMappingURL=tiktok.business.provider.js.map
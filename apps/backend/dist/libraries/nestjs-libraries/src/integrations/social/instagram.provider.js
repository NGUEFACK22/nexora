"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramProvider = void 0;
const tslib_1 = require("tslib");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const timer_1 = require("@gitroom/helpers/utils/timer");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const instagram_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/instagram.dto");
const rules_description_decorator_1 = require("@gitroom/nestjs-libraries/chat/rules.description.decorator");
const facebook_provider_1 = require("@gitroom/nestjs-libraries/integrations/social/facebook.provider");
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
const dashboard_function_decorator_1 = require("@gitroom/nestjs-libraries/integrations/dashboard.function.decorator");
const has_extension_1 = require("@gitroom/helpers/utils/has.extension");
let InstagramProvider = class InstagramProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'instagram';
        this.name = 'Instagram\n(Facebook Business)';
        this.isBetweenSteps = true;
        this.toolTip = 'Instagram must be business and connected to a Facebook page';
        this.scopes = [
            'instagram_basic',
            'pages_show_list',
            'pages_read_engagement',
            'business_management',
            'instagram_content_publish',
            'instagram_manage_comments',
            'instagram_manage_insights',
        ];
        this.maxConcurrentJob = 400;
        this.editor = 'normal';
        this.dto = instagram_dto_1.InstagramDto;
    }
    maxLength() {
        return 2200;
    }
    async checkValidity([firstPost], settings) {
        if (!firstPost?.length) {
            return 'Should have at least one media';
        }
        if (firstPost.length > 20) {
            return 'Instagram carousel only supports up to 20 media attachments';
        }
        if (this.assetBoolean(settings?.is_trial_reel)) {
            if ((firstPost?.length ?? 0) > 1) {
                return 'Trial Reels can only have one video';
            }
            const hasVideo = firstPost?.some((f) => (f?.path?.indexOf?.('mp4') ?? -1) > -1);
            if (!hasVideo) {
                return 'Trial Reels must be a video';
            }
        }
        if (firstPost?.some((f) => (f?.alt?.length ?? 0) > 1000)) {
            return 'Instagram alt text can be up to 1000 characters';
        }
        if (settings?.audio?.id) {
            if (settings?.post_type === 'story') {
                return 'Audio can only be added to Reels, not to Stories';
            }
            if ((firstPost?.length ?? 0) > 1) {
                return 'Audio can only be added to a single video Reel';
            }
            const hasVideo = firstPost?.some((f) => (f?.path?.indexOf?.('mp4') ?? -1) > -1);
            if (!hasVideo) {
                return 'Audio can only be added to a video Reel';
            }
        }
        return true;
    }
    async refreshToken(refresh_token) {
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
    handleErrors(body, status) {
        if (body.indexOf('An unknown error occurred') > -1) {
            return {
                type: 'retry',
                value: 'An unknown error occurred, please try again later',
            };
        }
        if (body.indexOf('2207081') > -1) {
            return {
                type: 'bad-body',
                value: "This account doesn't support Trial Reels",
            };
        }
        if (body.indexOf('2207078') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram Trial Reel publish limit reached for this account, please try again later or publish the post as a regular Reel',
            };
        }
        if (body.indexOf('REVOKED_ACCESS_TOKEN') > -1 ||
            body.indexOf('"error_subcode":33') > -1) {
            return {
                type: 'refresh-token',
                value: 'Something is wrong with your connected user, please re-authenticate',
            };
        }
        if (body.toLowerCase().indexOf('the user is not an instagram business') > -1) {
            return {
                type: 'refresh-token',
                value: 'Your Instagram account is not a business account, please convert it to a business account',
            };
        }
        if (body.toLowerCase().indexOf('session has been invalidated') > -1) {
            return {
                type: 'refresh-token',
                value: 'You session has been invalidated, this can usually happen from frequent posting, please re-authenticate, and wait 1-2 days before posting again',
            };
        }
        if (body.indexOf('2207050') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram user is restricted',
            };
        }
        if (body.indexOf('2207003') > -1) {
            return {
                type: 'bad-body',
                value: 'Timeout downloading media, please try again',
            };
        }
        if (body.indexOf('2207020') > -1) {
            return {
                type: 'bad-body',
                value: 'Media expired, please upload again',
            };
        }
        if (body.indexOf('2207032') > -1) {
            return {
                type: 'bad-body',
                value: 'Failed to create media, please try again',
            };
        }
        if (body.indexOf('2207053') > -1) {
            return {
                type: 'bad-body',
                value: "Instagram failed to upload the video. If it exceeds Instagram's limits (300MB, 1920px width, 25Mbps bitrate), export a smaller version and try again",
            };
        }
        if (body.indexOf('2207052') > -1) {
            return {
                type: 'retry',
                value: 'Media fetch failed, please try again',
            };
        }
        if (body.indexOf('2207057') > -1) {
            return {
                type: 'bad-body',
                value: 'Invalid thumbnail offset for video',
            };
        }
        if (body.indexOf('2207026') > -1) {
            return {
                type: 'bad-body',
                value: 'Unsupported video format',
            };
        }
        if (body.indexOf('2207023') > -1) {
            return {
                type: 'bad-body',
                value: 'Unknown media type',
            };
        }
        if (body.indexOf('2207006') > -1) {
            return {
                type: 'bad-body',
                value: 'Media not found, please upload again',
            };
        }
        if (body.indexOf('2207008') > -1) {
            return {
                type: 'bad-body',
                value: 'Media builder expired, please try again',
            };
        }
        if (body.indexOf('2207028') > -1) {
            return {
                type: 'bad-body',
                value: 'Carousel validation failed',
            };
        }
        if (body.indexOf('2207010') > -1) {
            return {
                type: 'bad-body',
                value: 'Caption is too long',
            };
        }
        if (body.indexOf('2207035') > -1) {
            return {
                type: 'bad-body',
                value: 'Product tag positions not supported for videos',
            };
        }
        if (body.indexOf('2207036') > -1) {
            return {
                type: 'bad-body',
                value: 'Product tag positions required for photos',
            };
        }
        if (body.indexOf('2207037') > -1) {
            return {
                type: 'bad-body',
                value: 'Product tag validation failed',
            };
        }
        if (body.indexOf('2207040') > -1) {
            return {
                type: 'bad-body',
                value: 'Too many product tags',
            };
        }
        if (body.indexOf('2207004') > -1) {
            return {
                type: 'bad-body',
                value: 'Image is too large',
            };
        }
        if (body.indexOf('2207005') > -1) {
            return {
                type: 'bad-body',
                value: 'Unsupported image format',
            };
        }
        if (body.indexOf('2207009') > -1) {
            return {
                type: 'bad-body',
                value: 'Aspect ratio not supported, must be between 4:5 to 1.91:1',
            };
        }
        if (body.indexOf('Page request limit reached') > -1) {
            return {
                type: 'bad-body',
                value: 'Page posting for today is limited, please try again tomorrow',
            };
        }
        if (body.indexOf('2207042') > -1) {
            return {
                type: 'bad-body',
                value: 'You have reached the maximum of 25 posts per day, allowed for your account',
            };
        }
        if (body.indexOf('(#200)') > -1) {
            return {
                type: 'bad-body',
                value: 'Facebook rejected the post due to missing permissions. Make sure your Facebook account has full content access to the Page linked to this Instagram account, then reconnect the channel.',
            };
        }
        if (body.indexOf('Not enough permissions to post') > -1) {
            return {
                type: 'bad-body',
                value: 'Not enough permissions to post',
            };
        }
        if (body.indexOf('36003') > -1) {
            return {
                type: 'bad-body',
                value: 'Aspect ratio not supported, must be between 4:5 to 1.91:1',
            };
        }
        if (body.indexOf('You cannot access the app till you log in to') > -1 ||
            body.indexOf('Session key is malformed') > -1) {
            return {
                type: 'disconnect',
                value: 'Instagram requires you to log in at instagram.com and follow its instructions before posting can resume. After that, please reconnect this channel.',
            };
        }
        if (body.indexOf('190,') > -1) {
            return {
                type: 'bad-body',
                value: 'The account is missing some permissions to perform this action, please re-add the account and allow all permissions',
            };
        }
        if (body.indexOf('36001') > -1) {
            return {
                type: 'bad-body',
                value: 'Invalid Instagram image resolution max: 1920x1080px',
            };
        }
        if (body.indexOf('2207051') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram blocked your request',
            };
        }
        if (body.indexOf('2207001') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram detected that your post is spam, please try again with different content',
            };
        }
        if (body.indexOf('1772107') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram did not add the comment, the post itself was published. Please try again with different comment text',
            };
        }
        if (body.indexOf('2207082') > -1) {
            return {
                type: 'retry',
                value: 'Instagram could not process this video. If you attached audio to a video that has no sound track, set the original video volume to 0 and try again',
            };
        }
        if (body.indexOf('2207085') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram could not process the video, please check the video format, duration and resolution and try again',
            };
        }
        if (body.indexOf('2207077') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram Video download failed',
            };
        }
        if (body.indexOf('too little or too many attachments') > -1) {
            return {
                type: 'bad-body',
                value: 'Instagram carousel should have between 2 and 20 media attachments',
            };
        }
        if (body.indexOf('2207027') > -1) {
            return {
                type: 'retry',
                value: 'Instagram media was not ready for publishing, please try again',
            };
        }
        if (body.indexOf('2207018') > -1) {
            return {
                type: 'bad-body',
                value: "One of the collaborators could not be tagged, please check the username is correct, the account is public, and that it allows collaborator invites",
            };
        }
        if (body.indexOf('param collaborators is not allowed') > -1) {
            return {
                type: 'bad-body',
                value: 'Collaborators are not allowed for carousel',
            };
        }
        return undefined;
    }
    async reConnect(id, requiredId, token) {
        const [accessToken, userToken] = token.split('___');
        const findPage = (await this.pages(accessToken)).find((p) => p.id === requiredId);
        const information = await this.fetchPageInformation(accessToken, {
            id: requiredId,
            pageId: findPage?.pageId,
        });
        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: `https://www.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/dialog/oauth` +
                `?client_id=${process.env.FACEBOOK_APP_ID}` +
                `&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/instagram`)}` +
                `&state=${state}` +
                `&scope=${encodeURIComponent(this.scopes.join(','))}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const getAccessToken = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/oauth/access_token` +
            `?client_id=${process.env.FACEBOOK_APP_ID}` +
            `&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/instagram${params.refresh ? `?refresh=${params.refresh}` : ''}`)}` +
            `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
            `&code=${params.code}`)).json();
        const { access_token, expires_in, ...all } = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/oauth/access_token` +
            '?grant_type=fb_exchange_token' +
            `&client_id=${process.env.FACEBOOK_APP_ID}` +
            `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
            `&fb_exchange_token=${getAccessToken.access_token}`)).json();
        const { data } = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me/permissions?access_token=${access_token}`)).json();
        const permissions = data
            .filter((d) => d.status === 'granted')
            .map((p) => p.permission);
        this.checkScopes(this.scopes, permissions);
        const { id, name, picture } = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me?fields=id,name,picture&access_token=${access_token}`)).json();
        return {
            id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(59, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: picture?.data?.url || '',
            username: '',
        };
    }
    async pages(token) {
        const [accessToken, userToken] = token.split('___');
        const seenPageIds = new Set();
        const allFacebookPages = [];
        const fetchPaginated = async (startUrl) => {
            let nextUrl = startUrl;
            while (nextUrl) {
                const response = await (await fetch(nextUrl)).json();
                if (response.data) {
                    for (const page of response.data) {
                        if (!seenPageIds.has(page.id)) {
                            seenPageIds.add(page.id);
                            allFacebookPages.push(page);
                        }
                    }
                }
                nextUrl = response.paging?.next;
            }
        };
        await fetchPaginated(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me/accounts?fields=id,instagram_business_account,username,name,picture.type(large)&limit=100&access_token=${accessToken}`);
        try {
            let bizUrl = `https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me/businesses?access_token=${accessToken}`;
            while (bizUrl) {
                const bizResponse = await (await fetch(bizUrl)).json();
                if (bizResponse.data) {
                    for (const business of bizResponse.data) {
                        try {
                            await fetchPaginated(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${business.id}/owned_pages?fields=id,instagram_business_account,username,name,picture.type(large)&limit=100&access_token=${accessToken}`);
                        }
                        catch {
                        }
                        try {
                            await fetchPaginated(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${business.id}/client_pages?fields=id,instagram_business_account,username,name,picture.type(large)&limit=100&access_token=${accessToken}`);
                        }
                        catch {
                        }
                    }
                }
                bizUrl = bizResponse.paging?.next;
            }
        }
        catch {
        }
        const onlyConnectedAccounts = await Promise.all(allFacebookPages
            .filter((f) => f.instagram_business_account)
            .map(async (p) => {
            return {
                pageId: p.id,
                ...(await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${p.instagram_business_account.id}?fields=name,profile_picture_url&access_token=${accessToken}`)).json()),
                id: p.instagram_business_account.id,
            };
        }));
        return onlyConnectedAccounts.map((p) => ({
            pageId: p.pageId,
            id: p.id,
            name: p.name,
            picture: { data: { url: p.profile_picture_url } },
        }));
    }
    async fetchPageInformation(token, data) {
        const [accessToken, userToken] = token.split('___');
        const { access_token, ...all } = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${data.pageId}?fields=access_token,name,picture.type(large)&access_token=${accessToken}`)).json();
        const { id, name, profile_picture_url, username } = await (await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${data.id}?fields=username,name,profile_picture_url&access_token=${accessToken}`)).json();
        return {
            id,
            name,
            picture: profile_picture_url,
            access_token: access_token + '___' + accessToken,
            username,
        };
    }
    stripHandle(handle) {
        return handle.replace(/^@+/, '');
    }
    async igContainerStatus(containerId, checkToken, type) {
        const { status_code, status } = await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${containerId}?access_token=${checkToken}&fields=status_code,status`, undefined, '', 0, true)).json();
        if (status_code === 'ERROR' || status_code === 'EXPIRED') {
            const handleError = this.handleErrors(status || '', 200);
            if (handleError?.type === 'disconnect') {
                throw new social_abstract_1.Disconnect(this.identifier, JSON.stringify({ status_code, status }), '{}', handleError?.value);
            }
            throw new social_abstract_1.BadBody(this.identifier, JSON.stringify({ status_code, status }), '{}', handleError?.value ||
                (status !== status_code && status) ||
                'Instagram could not process the media');
        }
        return status_code;
    }
    async igPublishedMediaId(containerId, igId, checkToken, type) {
        try {
            const status = await this.igContainerStatus(containerId, checkToken, type);
            const { data } = status === 'PUBLISHED'
                ? await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${igId}/media?fields=id&limit=1&access_token=${checkToken}`, undefined, '', 0, true)).json()
                : { data: [] };
            const mediaId = data?.[0]?.id || '';
            console.log(`Instagram blocked media_publish for container ${containerId}: status ${status}, media ${mediaId || 'none'}`);
            return mediaId;
        }
        catch (e) {
            console.error(`Instagram blocked media_publish for container ${containerId}: status probe failed`, e);
            return '';
        }
    }
    async igPermalink(mediaId, checkToken, type, integration) {
        try {
            const { permalink } = await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${mediaId}?fields=permalink&access_token=${checkToken}`)).json();
            return permalink;
        }
        catch (err) {
            return `https://www.instagram.com/${integration.profile}`;
        }
    }
    async postPending(id, token, postDetails, integration, type = 'graph.facebook.com') {
        const [accessToken] = token.split('___');
        const [firstPost] = postDetails;
        const isStory = firstPost.settings.post_type === 'story';
        const collaborators = firstPost?.settings?.collaborators?.length && !isStory
            ? `&collaborators=${encodeURIComponent(JSON.stringify(firstPost?.settings?.collaborators.map((p) => this.stripHandle(p.label))))}`
            : ``;
        const isTrialReel = this.assetBoolean(firstPost.settings.is_trial_reel);
        const madeWithAi = this.assetBoolean(firstPost.settings.made_with_ai);
        const medias = await Promise.all(firstPost?.media?.map(async (m) => {
            const caption = firstPost.media?.length === 1
                ? `&caption=${encodeURIComponent(firstPost.message)}`
                : ``;
            const isCarousel = (firstPost?.media?.length || 0) > 1 && !isStory
                ? `&is_carousel_item=true`
                : ``;
            const mediaType = (0, has_extension_1.hasExtension)(m.path, 'mp4')
                ? firstPost?.media?.length === 1
                    ? isStory
                        ? `video_url=${m.path}&media_type=STORIES`
                        : m?.thumbnail
                            ? `video_url=${m.path}&media_type=REELS&cover_url=${encodeURIComponent(m.thumbnail)}`
                            : `video_url=${m.path}&media_type=REELS&thumb_offset=${m?.thumbnailTimestamp || 0}`
                    : isStory
                        ? `video_url=${m.path}&media_type=STORIES`
                        : `video_url=${m.path}&media_type=VIDEO&thumb_offset=${m?.thumbnailTimestamp || 0}`
                : isStory
                    ? `image_url=${m.path}&media_type=STORIES`
                    : `image_url=${m.path}`;
            const altText = m.alt && !isStory && !(0, has_extension_1.hasExtension)(m.path, 'mp4')
                ? `&alt_text=${encodeURIComponent(m.alt)}`
                : ``;
            const trialParams = isTrialReel
                ? `&trial_params=${encodeURIComponent(JSON.stringify({
                    graduation_strategy: firstPost.settings.graduation_strategy || 'MANUAL',
                }))}`
                : ``;
            const itemCollaborators = firstPost?.media?.length === 1 ? collaborators : ``;
            const itemAiGenerated = madeWithAi && !isCarousel ? `&is_ai_generated=true` : ``;
            const audioConfiguration = firstPost?.settings?.audio?.id &&
                type === 'graph.facebook.com' &&
                !isStory &&
                firstPost?.media?.length === 1 &&
                (0, has_extension_1.hasExtension)(m.path, 'mp4')
                ? `&audio_configuration=${encodeURIComponent(JSON.stringify({
                    audio_id: firstPost.settings.audio.id,
                    ...(typeof firstPost.settings.audio.audio_volume !==
                        'undefined'
                        ? { audio_volume: +firstPost.settings.audio.audio_volume }
                        : {}),
                    ...(typeof firstPost.settings.audio.video_volume !==
                        'undefined'
                        ? { video_volume: +firstPost.settings.audio.video_volume }
                        : {}),
                }))}`
                : ``;
            const { id: photoId } = await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${id}/media?${mediaType}${altText}${isCarousel}${itemCollaborators}${itemAiGenerated}${trialParams}${audioConfiguration}&access_token=${accessToken}${caption}`, {
                method: 'POST',
            })).json();
            return photoId;
        }) || []);
        return [
            {
                id: firstPost.id,
                postId: '',
                releaseURL: '',
                status: 'pending',
                pendingData: {
                    type,
                    postType: isStory && medias.length > 1
                        ? 'stories'
                        : medias.length === 1
                            ? 'single'
                            : 'carousel',
                    containers: medias,
                    message: firstPost?.message || '',
                    ...(collaborators
                        ? {
                            collaborators: firstPost.settings.collaborators.map((p) => this.stripHandle(p.label)),
                        }
                        : {}),
                    ...(madeWithAi ? { madeWithAi } : {}),
                },
            },
        ];
    }
    async checkPostStatus(token, pendingData, integration) {
        const [accessToken, userToken] = token.split('___');
        const checkToken = userToken || accessToken;
        if (pendingData.carouselId) {
            const status = await this.igContainerStatus(pendingData.carouselId, checkToken, pendingData.type);
            if (status === 'IN_PROGRESS') {
                return { status: 'pending', pendingData };
            }
            if (status === 'PUBLISHED') {
                return {
                    status: 'completed',
                    postId: pendingData.carouselId,
                    releaseURL: `https://www.instagram.com/${integration.profile}`,
                };
            }
            return { status: 'ready', pendingData };
        }
        for (const containerId of pendingData.containers) {
            const status = await this.igContainerStatus(containerId, checkToken, pendingData.type);
            if (status === 'IN_PROGRESS') {
                return { status: 'pending', pendingData };
            }
            if (status === 'PUBLISHED') {
                if (pendingData.postType === 'single') {
                    return {
                        status: 'completed',
                        postId: containerId,
                        releaseURL: `https://www.instagram.com/${integration.profile}`,
                    };
                }
            }
        }
        return { status: 'ready', pendingData };
    }
    async finalizePost(token, pendingData, integration) {
        const [accessToken, userToken] = token.split('___');
        const checkToken = userToken || accessToken;
        const igId = integration.internalId;
        if (pendingData.postType === 'stories') {
            let lastMediaId = '';
            for (const mediaCreationId of pendingData.containers) {
                const status = await this.igContainerStatus(mediaCreationId, checkToken, pendingData.type);
                if (status === 'PUBLISHED') {
                    continue;
                }
                const { id: mediaId } = await (await this.fetch(`https://${pendingData.type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${igId}/media_publish?creation_id=${mediaCreationId}&access_token=${accessToken}&field=id`, {
                    method: 'POST',
                })).json();
                lastMediaId = mediaId;
            }
            return {
                status: 'completed',
                postId: lastMediaId || pendingData.containers.at(-1),
                releaseURL: !lastMediaId
                    ? `https://www.instagram.com/${integration.profile}`
                    : await this.igPermalink(lastMediaId, checkToken, pendingData.type, integration),
            };
        }
        if (pendingData.postType === 'carousel' && !pendingData.carouselId) {
            const { id: containerId } = await (await this.fetch(`https://${pendingData.type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${igId}/media?caption=${encodeURIComponent(pendingData.message || '')}&media_type=CAROUSEL&children=${encodeURIComponent(pendingData.containers.join(','))}${pendingData.collaborators?.length
                ? `&collaborators=${encodeURIComponent(JSON.stringify(pendingData.collaborators))}`
                : ``}${pendingData.madeWithAi ? `&is_ai_generated=true` : ``}&access_token=${accessToken}`, {
                method: 'POST',
            })).json();
            return {
                status: 'pending',
                pendingData: { ...pendingData, carouselId: containerId },
            };
        }
        const creationId = pendingData.postType === 'carousel'
            ? pendingData.carouselId
            : pendingData.containers[0];
        let mediaId;
        try {
            ({ id: mediaId } = await (await this.fetch(`https://${pendingData.type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${igId}/media_publish?creation_id=${creationId}&access_token=${accessToken}&field=id`, {
                method: 'POST',
            })).json());
        }
        catch (err) {
            if (!(err instanceof social_abstract_1.BadBody) || !err.message.includes('blocked')) {
                throw err;
            }
            mediaId = await this.igPublishedMediaId(creationId, igId, checkToken, pendingData.type);
            if (!mediaId) {
                throw err;
            }
        }
        return {
            status: 'completed',
            postId: mediaId,
            releaseURL: await this.igPermalink(mediaId, checkToken, pendingData.type, integration),
        };
    }
    async post(id, token, postDetails, integration, type = 'graph.facebook.com') {
        const [firstPost] = postDetails;
        const [response] = await this.postPending(id, token, postDetails, integration, type);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody(this.identifier, '{}', '{}', 'Media processing timed out');
            }
            const check = await this.checkPostStatus(token, pendingData, integration);
            if (check.status === 'pending') {
                pendingData = check.pendingData;
                await (0, timer_1.timer)(30000);
                continue;
            }
            const result = check.status === 'ready'
                ? await this.finalizePost(token, check.pendingData, integration)
                : check;
            if (result.status === 'completed') {
                return [
                    {
                        id: firstPost.id,
                        postId: result.postId,
                        releaseURL: result.releaseURL,
                        status: 'success',
                    },
                ];
            }
            pendingData = result.pendingData;
            await (0, timer_1.timer)(30000);
        }
    }
    async comment(id, postId, lastCommentId, token, postDetails, integration, type = 'graph.facebook.com') {
        const [accessToken, userToken] = token.split('___');
        const [commentPost] = postDetails;
        const { id: commentId } = await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${postId}/comments?message=${encodeURIComponent(commentPost.message)}&access_token=${accessToken}`, {
            method: 'POST',
        })).json();
        const { permalink } = await (await this.fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${postId}?fields=permalink&access_token=${userToken || accessToken}`)).json();
        return [
            {
                id: commentPost.id,
                postId: commentId,
                releaseURL: permalink,
                status: 'success',
            },
        ];
    }
    setTitle(name) {
        switch (name) {
            case 'likes': {
                return 'Likes';
            }
            case 'followers': {
                return 'Followers';
            }
            case 'reach': {
                return 'Reach';
            }
            case 'follower_count': {
                return 'Follower Count';
            }
            case 'views': {
                return 'Views';
            }
            case 'comments': {
                return 'Comments';
            }
            case 'shares': {
                return 'Shares';
            }
            case 'saves': {
                return 'Saves';
            }
            case 'replies': {
                return 'Replies';
            }
        }
        return '';
    }
    async analytics(id, token, date, type = 'graph.facebook.com') {
        const [accessToken, userToken] = token.split('___');
        const until = (0, dayjs_1.default)().startOf('day').unix();
        const since = (0, dayjs_1.default)().subtract(date, 'day').unix();
        const { data, ...all } = await (await fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${id}/insights?metric=follower_count,reach&access_token=${accessToken}&period=day&since=${since}&until=${until}`)).json();
        const { data: data2, ...all2 } = await (await fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${id}/insights?metric_type=total_value&metric=likes,views,comments,shares,saves,replies&access_token=${accessToken}&period=day&since=${since}&until=${until}`)).json();
        const analytics = [];
        analytics.push(...(data?.map((d) => ({
            label: this.setTitle(d.name),
            percentageChange: 5,
            data: d.values.map((v) => ({
                total: v.value,
                date: (0, dayjs_1.default)(v.end_time).format('YYYY-MM-DD'),
            })),
        })) || []));
        analytics.push(...data2.map((d) => ({
            label: this.setTitle(d.name),
            percentageChange: 5,
            data: [
                {
                    total: d.total_value.value,
                    date: (0, dayjs_1.default)().format('YYYY-MM-DD'),
                },
            ],
        })));
        return analytics;
    }
    music(accessToken, data) {
        return this.fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/music/search?q=${encodeURIComponent(data.q)}&access_token=${accessToken}`);
    }
    async audioSearch(token, data, internalId) {
        const [accessToken, userToken] = token.split('___');
        const audioType = data?.type === 'original_sound' ? 'original_sound' : 'music';
        const { audio } = await (await this.fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/ig_audio?audio_type=${audioType}&user_id=${internalId}${data?.q ? `&search_query=${encodeURIComponent(data.q)}` : ''}&access_token=${userToken || accessToken}`)).json();
        return (audio || []).map((audio) => ({
            id: audio.audio_id,
            title: audio.title || '',
            artist: audio.display_artist || audio.ig_username || '',
            image: audio.cover_artwork_thumbnail_uri ||
                audio.cover_artwork_thumbnail_url ||
                audio.profile_picture_url ||
                '',
            duration: audio.duration_in_ms || 0,
            previewUrl: audio.download_url || '',
        }));
    }
    async postAnalytics(integrationId, token, postId, date, type = 'graph.facebook.com') {
        const [accessToken, userToken] = token.split('___');
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        try {
            const { data } = await (await fetch(`https://${type}/${facebook_provider_1.META_GRAPH_API_VERSION}/${postId}/insights?metric=views,reach,saved,likes,comments,shares&access_token=${accessToken}`)).json();
            if (!data || data.length === 0) {
                return [];
            }
            const result = [];
            for (const metric of data) {
                const value = metric.values?.[0]?.value;
                if (value === undefined)
                    continue;
                let label = '';
                switch (metric.name) {
                    case 'views':
                        label = 'Views';
                        break;
                    case 'reach':
                        label = 'Reach';
                        break;
                    case 'engagement':
                        label = 'Engagement';
                        break;
                    case 'saved':
                        label = 'Saves';
                        break;
                    case 'likes':
                        label = 'Likes';
                        break;
                    case 'comments':
                        label = 'Comments';
                        break;
                    case 'shares':
                        label = 'Shares';
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
            console.error('Error fetching Instagram post analytics:', err);
            return [];
        }
    }
};
exports.InstagramProvider = InstagramProvider;
tslib_1.__decorate([
    (0, dashboard_function_decorator_1.DashboardFunction)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], InstagramProvider.prototype, "pages", null);
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search audio (music or original sounds) to attach to a Reel via the "audio" setting, an empty query returns trending audio',
        dataSchema: [
            {
                key: 'q',
                type: 'string',
                description: 'Search query, leave empty for trending audio',
            },
            {
                key: 'type',
                type: 'string',
                description: 'Either "music" or "original_sound", defaults to "music"',
            },
        ],
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], InstagramProvider.prototype, "audioSearch", null);
exports.InstagramProvider = InstagramProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)([
        "Instagram should have at least one attachment, if it's a story, it can have only one picture.",
        'If the content of the post (text, pictures or video) was made with AI, ask the user if they want to mark it as AI, and set made_with_ai to true only when they say yes.',
    ].join(' '))
], InstagramProvider);
//# sourceMappingURL=instagram.provider.js.map
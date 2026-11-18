"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinterestProvider = void 0;
const tslib_1 = require("tslib");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
const pinterest_dto_1 = require("@gitroom/nestjs-libraries/dtos/posts/providers-settings/pinterest.dto");
const form_data_1 = tslib_1.__importDefault(require("form-data"));
const timer_1 = require("@gitroom/helpers/utils/timer");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const tool_decorator_1 = require("@gitroom/nestjs-libraries/integrations/tool.decorator");
const rules_description_decorator_1 = require("@gitroom/nestjs-libraries/chat/rules.description.decorator");
const has_extension_1 = require("@gitroom/helpers/utils/has.extension");
let PinterestProvider = class PinterestProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'pinterest';
        this.name = 'Pinterest';
        this.isBetweenSteps = false;
        this.scopes = [
            'boards:read',
            'boards:write',
            'pins:read',
            'pins:write',
            'user_accounts:read',
        ];
        this.maxConcurrentJob = 10;
        this.dto = pinterest_dto_1.PinterestSettingsDto;
        this.editor = 'normal';
    }
    maxLength() {
        return 500;
    }
    async checkValidity([firstItem]) {
        const isMp4 = firstItem?.find((item) => (item?.path?.indexOf?.('mp4') ?? -1) > -1);
        const isPicture = firstItem?.find((item) => (item?.path?.indexOf?.('mp4') ?? -1) === -1);
        if ((firstItem?.length ?? 0) === 0) {
            return 'Requires at least one media';
        }
        if ((firstItem?.length ?? 0) > 5) {
            return 'You can only have up to 5 media items';
        }
        if (isMp4 && firstItem?.length !== 2 && !isPicture) {
            return 'If posting a video you have to also include a cover image as second media';
        }
        if (isMp4 && (firstItem?.length ?? 0) > 2) {
            return 'If posting a video you can only have two media items';
        }
        if ((firstItem?.length ?? 0) > 1 &&
            firstItem?.every((p) => (p?.path?.indexOf?.('mp4') ?? -1) === -1)) {
            const loadAll = await Promise.all(firstItem?.map((p) => this.getImageDimensions(p?.path)) ?? []);
            const checkAllTheSameWidthHeight = loadAll?.every((p, i, arr) => {
                return p?.width === arr?.[0]?.width && p?.height === arr?.[0]?.height;
            });
            if (!checkAllTheSameWidthHeight) {
                return 'Requires all images to have the same width and height';
            }
        }
        return true;
    }
    handleErrors(body) {
        if (body.indexOf('constraint: maxItems=5') > -1) {
            return {
                type: 'bad-body',
                value: 'You can upload a maximum of 5 images per post on Pinterest.',
            };
        }
        if (body.indexOf('Something went wrong on our end') > -1) {
            return {
                type: 'retry',
                value: 'Pinterest reported a temporary error on their side. Please try posting again.',
            };
        }
        if (body.indexOf('Unable to reach the URL') > -1) {
            return {
                type: 'retry',
                value: 'Pinterest was unable to reach the URL provided. Please check the link and try again.',
            };
        }
        if (body.indexOf("does not match '^") > -1 &&
            body.indexOf("d+$'") > -1) {
            return {
                type: 'bad-body',
                value: 'The board ID must be a numeric string. Please check the board ID format.',
            };
        }
        if (body.indexOf('Board not found') > -1) {
            return {
                type: 'bad-body',
                value: 'The specified board was not found. Please check the board ID.',
            };
        }
        if (body.indexOf('You are not permitted to access that resource') > -1) {
            return {
                type: 'bad-body',
                value: 'The connected Pinterest account is not permitted to post to this board. Please check the board ID and that the account owns or can write to the board.',
            };
        }
        if (body.indexOf('We blocked this link because it may lead to spam') > -1) {
            return {
                type: 'bad-body',
                value: 'Pinterest blocked the link of this pin because it may lead to spam. Please check the link, or contact Pinterest about your website.',
            };
        }
        if (body.indexOf('cover_image_url or cover_image_content_type') > -1) {
            return {
                type: 'bad-body',
                value: 'When uploading a video, you must add also an image to be used as a cover image.',
            };
        }
        return undefined;
    }
    async refreshToken(refreshToken) {
        const { access_token, expires_in } = await (await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                scope: this.scopes.join(','),
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/pinterest`,
            }),
        })).json();
        const { id, profile_image, username } = await (await fetch('https://api.pinterest.com/v5/user_account', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: id,
            name: username,
            accessToken: access_token,
            refreshToken: refreshToken,
            expiresIn: expires_in,
            picture: profile_image || '',
            username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: `https://www.pinterest.com/oauth/?client_id=${process.env.PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/pinterest`)}&response_type=code&scope=${encodeURIComponent('boards:read,boards:write,pins:read,pins:write,user_accounts:read')}&state=${state}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const { access_token, refresh_token, expires_in, scope } = await (await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: params.code,
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/pinterest`,
            }),
        })).json();
        this.checkScopes(this.scopes, scope);
        const { id, profile_image, username } = await (await fetch('https://api.pinterest.com/v5/user_account', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: id,
            name: username,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            picture: profile_image,
            username,
        };
    }
    async boards(accessToken) {
        const { items } = await (await fetch('https://api.pinterest.com/v5/boards?page_size=250', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return (items?.map((item) => ({
            name: item.name,
            id: item.id,
        })) || []);
    }
    async postPending(id, accessToken, postDetails) {
        let mediaId = '';
        const findMp4 = postDetails?.[0]?.media?.find((p) => (0, has_extension_1.hasExtension)(p.path, 'mp4'));
        const picture = postDetails?.[0]?.media?.find((p) => !(0, has_extension_1.hasExtension)(p.path, 'mp4'));
        if (findMp4) {
            const { upload_url, media_id, upload_parameters } = await (await this.fetch('https://api.pinterest.com/v5/media', {
                method: 'POST',
                body: JSON.stringify({
                    media_type: 'video',
                }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            })).json();
            const { data } = await this.getSsrfSafeAxios().get(findMp4.path, {
                responseType: 'stream',
            });
            const formData = Object.keys(upload_parameters)
                .filter((f) => f)
                .reduce((acc, key) => {
                acc.append(key, upload_parameters[key]);
                return acc;
            }, new form_data_1.default());
            formData.append('file', data);
            await this.getSsrfSafeAxios().post(upload_url, formData);
            mediaId = media_id;
        }
        return [
            {
                id: postDetails?.[0]?.id,
                releaseURL: '',
                postId: '',
                status: 'pending',
                pendingData: {
                    mediaId,
                    message: postDetails?.[0]?.message,
                    settings: {
                        link: postDetails?.[0]?.settings.link,
                        title: postDetails?.[0]?.settings.title,
                        dominant_color: postDetails?.[0]?.settings.dominant_color,
                        board: postDetails?.[0]?.settings.board,
                    },
                    imagePaths: (postDetails?.[0]?.media || []).map((m) => m.path),
                    coverPath: picture?.path,
                },
            },
        ];
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        if (pendingData.attempting && pendingData.confirmed) {
            throw new social_abstract_1.BadBody('pinterest', JSON.stringify({}), {}, 'Pinterest may have already published this pin, please check your account before posting again to avoid duplicates');
        }
        const witness = () => pendingData.attempting && !pendingData.confirmed
            ? {
                status: 'ready',
                pendingData: { ...pendingData, confirmed: true },
            }
            : { status: 'ready', pendingData };
        if (!pendingData.mediaId) {
            return witness();
        }
        let mediafile;
        try {
            mediafile = await (await this.fetch('https://api.pinterest.com/v5/media/' + pendingData.mediaId, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }, '', 0, true)).json();
        }
        catch (err) {
            if (err instanceof social_abstract_1.RefreshToken) {
                throw err;
            }
            return { status: 'pending', pendingData };
        }
        if (mediafile.status === 'failed') {
            throw new social_abstract_1.BadBody('pinterest', JSON.stringify({}), {}, 'The file is corrupted and cannot be uploaded');
        }
        if (mediafile.status !== 'succeeded') {
            return { status: 'pending', pendingData };
        }
        return witness();
    }
    async finalizePost(accessToken, pendingData, integration) {
        if (!pendingData.attempting || !pendingData.confirmed) {
            await this.fetch('https://api.pinterest.com/v5/user_account', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            return {
                status: 'pending',
                pendingData: { ...pendingData, attempting: true, confirmed: false },
            };
        }
        const mapImages = (pendingData.imagePaths || []).map((path) => ({ path }));
        const { id: pId } = await (await this.fetch('https://api.pinterest.com/v5/pins', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...(pendingData.settings.link
                    ? { link: pendingData.settings.link }
                    : {}),
                ...(pendingData.settings.title
                    ? { title: pendingData.settings.title }
                    : {}),
                description: pendingData.message,
                ...(pendingData.settings.dominant_color
                    ? { dominant_color: pendingData.settings.dominant_color }
                    : {}),
                board_id: pendingData.settings.board,
                media_source: pendingData.mediaId
                    ? {
                        source_type: 'video_id',
                        media_id: pendingData.mediaId,
                        cover_image_url: pendingData.coverPath,
                    }
                    : mapImages?.length === 1
                        ? {
                            source_type: 'image_url',
                            url: mapImages?.[0]?.path,
                        }
                        : {
                            source_type: 'multiple_image_urls',
                            items: mapImages.map((m) => ({
                                url: m.path,
                            })),
                        },
            }),
        })).json();
        return {
            status: 'completed',
            postId: pId,
            releaseURL: `https://www.pinterest.com/pin/${pId}`,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        const [response] = await this.postPending(id, accessToken, postDetails);
        let pendingData = response.pendingData;
        const started = Date.now();
        while (true) {
            if (Date.now() - started > 8 * 60 * 1000) {
                throw new social_abstract_1.BadBody('pinterest', JSON.stringify({}), {}, 'The file took too long to process, please try again');
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
                        releaseURL: result.releaseURL,
                        status: 'success',
                    },
                ];
            }
            pendingData = result.pendingData;
        }
    }
    async analytics(id, accessToken, date) {
        const until = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const since = (0, dayjs_1.default)()
            .subtract(Math.min(date, 89), 'day')
            .format('YYYY-MM-DD');
        const { all: { daily_metrics }, } = await (await fetch(`https://api.pinterest.com/v5/user_account/analytics?start_date=${since}&end_date=${until}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        })).json();
        return daily_metrics.reduce((acc, item) => {
            if (typeof item.metrics.PIN_CLICK_RATE !== 'undefined') {
                acc[0].data.push({
                    date: item.date,
                    total: item.metrics.PIN_CLICK_RATE,
                });
                acc[1].data.push({
                    date: item.date,
                    total: item.metrics.IMPRESSION,
                });
                acc[2].data.push({
                    date: item.date,
                    total: item.metrics.PIN_CLICK,
                });
                acc[3].data.push({
                    date: item.date,
                    total: item.metrics.ENGAGEMENT,
                });
                acc[4].data.push({
                    date: item.date,
                    total: item.metrics.SAVE,
                });
            }
            return acc;
        }, [
            { label: 'Pin click rate', data: [] },
            { label: 'Impressions', data: [] },
            { label: 'Pin Clicks', data: [] },
            { label: 'Engagement', data: [] },
            { label: 'Saves', data: [] },
        ]);
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        const today = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const since = (0, dayjs_1.default)().subtract(89, 'day').format('YYYY-MM-DD');
        try {
            const response = await fetch(`https://api.pinterest.com/v5/pins/${postId}/analytics?start_date=${since}&end_date=${today}&metric_types=IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!data || !data.all) {
                return [];
            }
            const result = [];
            const metrics = data.all;
            if (metrics.summary_metrics) {
                const summaryMetrics = metrics.summary_metrics;
                if (summaryMetrics.IMPRESSION !== undefined) {
                    result.push({
                        label: 'Impressions',
                        percentageChange: 0,
                        data: [{ total: String(summaryMetrics.IMPRESSION), date: today }],
                    });
                }
                if (summaryMetrics.PIN_CLICK !== undefined) {
                    result.push({
                        label: 'Pin Clicks',
                        percentageChange: 0,
                        data: [{ total: String(summaryMetrics.PIN_CLICK), date: today }],
                    });
                }
                if (summaryMetrics.OUTBOUND_CLICK !== undefined) {
                    result.push({
                        label: 'Outbound Clicks',
                        percentageChange: 0,
                        data: [
                            { total: String(summaryMetrics.OUTBOUND_CLICK), date: today },
                        ],
                    });
                }
                if (summaryMetrics.SAVE !== undefined) {
                    result.push({
                        label: 'Saves',
                        percentageChange: 0,
                        data: [{ total: String(summaryMetrics.SAVE), date: today }],
                    });
                }
            }
            return result;
        }
        catch (err) {
            console.error('Error fetching Pinterest post analytics:', err);
            return [];
        }
    }
};
exports.PinterestProvider = PinterestProvider;
tslib_1.__decorate([
    (0, tool_decorator_1.Tool)({ description: 'List of boards', dataSchema: [] }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], PinterestProvider.prototype, "boards", null);
exports.PinterestProvider = PinterestProvider = tslib_1.__decorate([
    (0, rules_description_decorator_1.Rules)('Pinterest requires at least one media, if posting a video, you must have two attachment, one for video, one for the cover picture, When posting a video, there can be only one, if posting images, there can be maximum 5')
], PinterestProvider);
//# sourceMappingURL=pinterest.provider.js.map
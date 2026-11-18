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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramStandaloneProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const dayjs_1 = __importDefault(require("dayjs"));
const social_abstract_1 = require("../social.abstract");
const instagram_dto_1 = require("../../dtos/posts/providers-settings/instagram.dto");
const instagram_provider_1 = require("./instagram.provider");
const facebook_provider_1 = require("./facebook.provider");
const rules_description_decorator_1 = require("../../chat/rules.description.decorator");
const instagramProvider = new instagram_provider_1.InstagramProvider();
let InstagramStandaloneProvider = class InstagramStandaloneProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.identifier = 'instagram-standalone';
        this.name = 'Instagram\n(Standalone)';
        this.isBetweenSteps = false;
        this.refreshCron = true;
        this.scopes = [
            'instagram_business_basic',
            'instagram_business_content_publish',
            'instagram_business_manage_comments',
            'instagram_business_manage_insights',
        ];
        this.maxConcurrentJob = 200;
        this.dto = instagram_dto_1.InstagramDto;
        this.editor = 'normal';
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
        return true;
    }
    handleErrors(body, status) {
        return instagramProvider.handleErrors(body, status);
    }
    async refreshToken(refresh_token) {
        const { access_token } = await (await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${refresh_token}`)).json();
        const { user_id, name, username, profile_picture_url = '', } = await (await fetch(`https://graph.instagram.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me?fields=user_id,username,name,profile_picture_url&access_token=${access_token}`)).json();
        return {
            id: user_id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: profile_picture_url || '',
            username,
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: `https://www.instagram.com/oauth/authorize?enable_fb_login=0&client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(`${process?.env.FRONTEND_URL?.indexOf('https') == -1
                ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
                : `${process?.env.FRONTEND_URL}`}/integrations/social/instagram-standalone`)}&response_type=code&scope=${encodeURIComponent(this.scopes.join(','))}` + `&state=${state}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const formData = new FormData();
        formData.append('client_id', process.env.INSTAGRAM_APP_ID);
        formData.append('client_secret', process.env.INSTAGRAM_APP_SECRET);
        formData.append('grant_type', 'authorization_code');
        formData.append('redirect_uri', `${process?.env.FRONTEND_URL?.indexOf('https') == -1
            ? `https://redirectmeto.com/${process?.env.FRONTEND_URL}`
            : `${process?.env.FRONTEND_URL}`}/integrations/social/instagram-standalone`);
        formData.append('code', params.code);
        const getAccessToken = await (await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            body: formData,
        })).json();
        if (!getAccessToken.access_token) {
            console.error('Instagram standalone token exchange failed:', JSON.stringify(getAccessToken));
            throw new Error(getAccessToken.error_message || 'Instagram token exchange failed');
        }
        const { access_token, expires_in, ...all } = await (await fetch('https://graph.instagram.com/access_token' +
            '?grant_type=ig_exchange_token' +
            `&client_id=${process.env.INSTAGRAM_APP_ID}` +
            `&client_secret=${process.env.INSTAGRAM_APP_SECRET}` +
            `&access_token=${getAccessToken.access_token}`)).json();
        try {
            this.checkScopes(this.scopes, getAccessToken.permissions);
        }
        catch (err) {
            const { access_token: shortLivedToken, ...exchange } = getAccessToken;
            console.error('Instagram standalone scope check failed:', JSON.stringify({
                ...exchange,
                longLived: { hasToken: !!access_token, expires_in, ...all },
            }));
            throw err;
        }
        const { user_id, name, username, profile_picture_url } = await (await fetch(`https://graph.instagram.com/${facebook_provider_1.META_GRAPH_API_VERSION}/me?fields=user_id,username,name,profile_picture_url&access_token=${access_token}`)).json();
        return {
            id: user_id,
            name,
            accessToken: access_token,
            refreshToken: access_token,
            expiresIn: (0, dayjs_1.default)().add(58, 'days').unix() - (0, dayjs_1.default)().unix(),
            picture: profile_picture_url,
            username,
        };
    }
    async post(id, accessToken, postDetails, integration) {
        return instagramProvider.post(id, accessToken, postDetails, integration, 'graph.instagram.com');
    }
    async postPending(id, accessToken, postDetails, integration) {
        return instagramProvider.postPending(id, accessToken, postDetails, integration, 'graph.instagram.com');
    }
    async checkPostStatus(accessToken, pendingData, integration) {
        return instagramProvider.checkPostStatus(accessToken, pendingData, integration);
    }
    async finalizePost(accessToken, pendingData, integration) {
        return instagramProvider.finalizePost(accessToken, pendingData, integration);
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        return instagramProvider.comment(id, postId, lastCommentId, accessToken, postDetails, integration, 'graph.instagram.com');
    }
    async analytics(id, accessToken, date) {
        return instagramProvider.analytics(id, accessToken, date, 'graph.instagram.com');
    }
    async postAnalytics(integrationId, accessToken, postId, date) {
        return instagramProvider.postAnalytics(integrationId, accessToken, postId, date, 'graph.instagram.com');
    }
};
exports.InstagramStandaloneProvider = InstagramStandaloneProvider;
exports.InstagramStandaloneProvider = InstagramStandaloneProvider = __decorate([
    (0, rules_description_decorator_1.Rules)([
        "Instagram should have at least one attachment, if it's a story, it can have only one picture.",
        'If the content of the post (text, pictures or video) was made with AI, ask the user if they want to mark it as AI, and set made_with_ai to true only when they say yes.',
    ].join(' '))
], InstagramStandaloneProvider);
//# sourceMappingURL=instagram.standalone.provider.js.map
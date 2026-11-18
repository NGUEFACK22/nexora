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
exports.LemmyProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = __importDefault(require("dayjs"));
const auth_service_1 = require("../../../../helpers/src/auth/auth.service");
const lemmy_dto_1 = require("../../dtos/posts/providers-settings/lemmy.dto");
const ssrf_safe_dispatcher_1 = require("../../dtos/webhooks/ssrf.safe.dispatcher");
const tool_decorator_1 = require("../tool.decorator");
class LemmyProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 3;
        this.identifier = 'lemmy';
        this.name = 'Lemmy';
        this.isBetweenSteps = false;
        this.scopes = [];
        this.editor = 'normal';
        this.dto = lemmy_dto_1.LemmySettingsDto;
    }
    maxLength() {
        return 10000;
    }
    handleErrors(body, status) {
        if (body.includes('rate_limit_error')) {
            return {
                type: 'retry',
                value: 'Lemmy rate limit reached, please try again later',
            };
        }
        if (body.includes('not_logged_in') || body.includes('incorrect_login')) {
            return {
                type: 'refresh-token',
                value: 'Lemmy session is no longer valid, please reconnect the channel',
            };
        }
        if (body.includes('site_ban') || body.includes('"error":"banned"')) {
            return {
                type: 'bad-body',
                value: 'This account is banned on the Lemmy instance',
            };
        }
        if (body.includes('couldnt_find_community')) {
            return {
                type: 'bad-body',
                value: 'The selected Lemmy community no longer exists, please pick another one',
            };
        }
        if (body.includes('blocked_url')) {
            return {
                type: 'bad-body',
                value: 'The Lemmy instance blocks the URL in this post',
            };
        }
        if (body.includes('"error":"deleted"')) {
            return {
                type: 'bad-body',
                value: 'The selected Lemmy community or post was deleted',
            };
        }
        if (body.includes('"error":"locked"')) {
            return {
                type: 'bad-body',
                value: 'This Lemmy post is locked, comments cannot be added',
            };
        }
        return undefined;
    }
    async checkValidity(items) {
        const [firstItems] = items ?? [];
        if (firstItems?.length &&
            (firstItems?.[0]?.path?.indexOf?.('png') ?? -1) === -1 &&
            (firstItems?.[0]?.path?.indexOf?.('jpg') ?? -1) === -1 &&
            (firstItems?.[0]?.path?.indexOf?.('jpef') ?? -1) === -1 &&
            (firstItems?.[0]?.path?.indexOf?.('gif') ?? -1) === -1) {
            return 'You can set only one picture for a cover';
        }
        return true;
    }
    async customFields() {
        return [
            {
                key: 'service',
                label: 'Service',
                defaultValue: 'https://lemmy.world',
                validation: `/^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/`,
                type: 'text',
            },
            {
                key: 'identifier',
                label: 'Identifier',
                validation: `/^.{3,}$/`,
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
        const load = await fetch(body.service + '/api/v3/user/login', {
            dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            body: JSON.stringify({
                username_or_email: body.identifier,
                password: body.password,
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (load.status === 401) {
            return 'Invalid credentials';
        }
        const { jwt } = await load.json();
        try {
            const user = await (await fetch(body.service + `/api/v3/user?username=${body.identifier}`, {
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            })).json();
            return {
                refreshToken: jwt,
                expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
                accessToken: jwt,
                id: String(user.person_view.person.id),
                name: user.person_view.person.display_name ||
                    user.person_view.person.name ||
                    '',
                picture: user?.person_view?.person?.avatar || '',
                username: body.identifier || '',
            };
        }
        catch (e) {
            console.log(e);
            return 'Invalid credentials';
        }
    }
    async getJwtAndService(integration) {
        const body = JSON.parse(auth_service_1.AuthService.fixedDecryption(integration.customInstanceDetails));
        const options = {
            dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            body: JSON.stringify({
                username_or_email: body.identifier,
                password: body.password,
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        let login;
        try {
            login = await this.fetch(body.service + '/api/v3/user/login', options);
        }
        catch (err) {
            const json = err.details?.[0]?.json || '{}';
            if (err instanceof social_abstract_1.BadBody) {
                throw new social_abstract_1.BadBody(this.identifier, json, {}, err.message || 'Unknown Error');
            }
            if (err instanceof social_abstract_1.RefreshToken) {
                throw new social_abstract_1.RefreshToken(this.identifier, json, {}, err.message || 'Unknown Error');
            }
            throw err;
        }
        const { jwt } = await login.json();
        return { jwt, service: body.service };
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const { jwt, service } = await this.getJwtAndService(integration);
        const valueArray = [];
        for (const lemmy of firstPost.settings.subreddit) {
            const { post_view } = await (await this.fetch(service + '/api/v3/post', {
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                body: JSON.stringify({
                    community_id: +lemmy.value.id,
                    name: lemmy.value.title,
                    body: firstPost.message,
                    ...(lemmy.value.url
                        ? {
                            url: lemmy.value.url.indexOf('http') === -1
                                ? `https://${lemmy.value.url}`
                                : lemmy.value.url,
                        }
                        : {}),
                    ...(firstPost.media?.length
                        ? { custom_thumbnail: firstPost.media[0].path }
                        : {}),
                    nsfw: false,
                }),
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            })).json();
            valueArray.push({
                postId: post_view.post.id,
                releaseURL: service + '/post/' + post_view.post.id,
                id: firstPost.id,
                status: 'published',
            });
        }
        return [
            {
                id: firstPost.id,
                postId: valueArray.map((p) => String(p.postId)).join(','),
                releaseURL: valueArray.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const { jwt, service } = await this.getJwtAndService(integration);
        const postIds = postId.split(',');
        const valueArray = [];
        for (const singlePostId of postIds) {
            const { comment_view } = await (await this.fetch(service + '/api/v3/comment', {
                dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
                body: JSON.stringify({
                    post_id: +singlePostId,
                    content: commentPost.message,
                }),
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
            })).json();
            valueArray.push({
                postId: String(comment_view.comment.id),
                releaseURL: service + '/comment/' + comment_view.comment.id,
                id: commentPost.id,
                status: 'published',
            });
        }
        return [
            {
                id: commentPost.id,
                postId: valueArray.map((p) => p.postId).join(','),
                releaseURL: valueArray.map((p) => p.releaseURL).join(','),
                status: 'published',
            },
        ];
    }
    async subreddits(accessToken, data, id, integration) {
        const { jwt, service } = await this.getJwtAndService(integration);
        const { communities } = await (await this.fetch(service + `/api/v3/search?type_=Communities&sort=Active&q=${data.word}`, {
            dispatcher: (0, ssrf_safe_dispatcher_1.getSsrfSafeDispatcher)(),
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        })).json();
        return communities.map((p) => ({
            title: p.community.title,
            name: p.community.title,
            id: p.community.id,
        }));
    }
}
exports.LemmyProvider = LemmyProvider;
__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Search for Lemmy communities by keyword',
        dataSchema: [
            {
                key: 'word',
                type: 'string',
                description: 'Keyword to search for',
            },
        ],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object]),
    __metadata("design:returntype", Promise)
], LemmyProvider.prototype, "subreddits", null);
//# sourceMappingURL=lemmy.provider.js.map
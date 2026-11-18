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
exports.SlackProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const social_abstract_1 = require("../social.abstract");
const dayjs_1 = __importDefault(require("dayjs"));
const slack_dto_1 = require("../../dtos/posts/providers-settings/slack.dto");
const tool_decorator_1 = require("../tool.decorator");
class SlackProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 10;
        this.identifier = 'slack';
        this.name = 'Slack';
        this.isBetweenSteps = false;
        this.editor = 'normal';
        this.scopes = [
            'channels:read',
            'chat:write',
            'users:read',
            'channels:join',
            'chat:write.customize',
        ];
        this.dto = slack_dto_1.SlackDto;
    }
    async checkValidity(posts) {
        const hasVideo = posts?.some((post) => post?.some((item) => (item?.path?.indexOf?.('mp4') ?? -1) > -1));
        if (hasVideo) {
            return 'No video support for Slack, only images';
        }
        return true;
    }
    maxLength() {
        return 400000;
    }
    async refreshToken(refreshToken) {
        return {
            refreshToken: '',
            expiresIn: 1000000,
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
            url: `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_ID}&redirect_uri=${encodeURIComponent(`${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                ? 'https://redirectmeto.com/'
                : ''}${process?.env?.FRONTEND_URL}/integrations/social/slack`)}&scope=channels:read,chat:write,users:read,channels:join,chat:write.customize&state=${state}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const { access_token, team, bot_user_id, scope } = await (await this.fetch(`https://slack.com/api/oauth.v2.access`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.SLACK_ID,
                client_secret: process.env.SLACK_SECRET,
                code: params.code,
                redirect_uri: `${process?.env?.FRONTEND_URL?.indexOf('https') === -1
                    ? 'https://redirectmeto.com/'
                    : ''}${process?.env?.FRONTEND_URL}/integrations/social/slack${params.refresh ? `?refresh=${params.refresh}` : ''}`,
            }),
        })).json();
        this.checkScopes(this.scopes, scope.split(','));
        const { user } = await (await fetch(`https://slack.com/api/users.info?user=${bot_user_id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: team.id,
            name: user.real_name,
            accessToken: access_token,
            refreshToken: 'null',
            expiresIn: (0, dayjs_1.default)().add(100, 'years').unix() - (0, dayjs_1.default)().unix(),
            picture: user?.profile?.image_original || '',
            username: user.name,
        };
    }
    async channels(accessToken, params, id) {
        const list = await (await fetch(`https://slack.com/api/conversations.list?types=public_channel`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return list.channels.map((p) => ({
            id: p.id,
            name: p.name,
        }));
    }
    checkApiError(all) {
        if (all?.ok !== false) {
            return;
        }
        const json = JSON.stringify(all);
        const message = [all.error, ...(all.errors || [])].filter(Boolean).join(': ') ||
            'Slack rejected the request';
        if ([
            'invalid_auth',
            'token_revoked',
            'token_expired',
            'account_inactive',
        ].includes(all.error)) {
            throw new social_abstract_1.RefreshToken(this.identifier, json, Buffer.from('{}'), message);
        }
        if (all.error === 'ratelimited') {
            throw new Error(message);
        }
        throw new social_abstract_1.BadBody(this.identifier, json, Buffer.from('{}'), message);
    }
    async post(id, accessToken, postDetails, integration) {
        const [firstPost] = postDetails;
        const channel = firstPost.settings.channel;
        await fetch(`https://slack.com/api/conversations.join`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
            }),
        });
        const posted = await (await fetch(`https://slack.com/api/chat.postMessage`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
                username: integration.name,
                icon_url: integration.picture,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: firstPost.message,
                        },
                    },
                    ...(firstPost.media?.length
                        ? firstPost.media.map((m) => ({
                            type: 'image',
                            image_url: m.path,
                            alt_text: '',
                        }))
                        : []),
                ],
            }),
        })).json();
        this.checkApiError(posted);
        const { ts, channel: responseChannel } = posted;
        const { permalink } = await (await fetch(`https://slack.com/api/chat.getPermalink?channel=${responseChannel}&message_ts=${ts}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return [
            {
                id: firstPost.id,
                postId: ts,
                releaseURL: permalink || '',
                status: 'posted',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const channel = commentPost.settings.channel;
        const threadTs = lastCommentId || postId;
        const posted = await (await fetch(`https://slack.com/api/chat.postMessage`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel,
                username: integration.name,
                icon_url: integration.picture,
                thread_ts: threadTs,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: commentPost.message,
                        },
                    },
                    ...(commentPost.media?.length
                        ? commentPost.media.map((m) => ({
                            type: 'image',
                            image_url: m.path,
                            alt_text: '',
                        }))
                        : []),
                ],
            }),
        })).json();
        this.checkApiError(posted);
        const { ts, channel: responseChannel } = posted;
        const { permalink } = await (await fetch(`https://slack.com/api/chat.getPermalink?channel=${responseChannel}&message_ts=${ts}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })).json();
        return [
            {
                id: commentPost.id,
                postId: ts,
                releaseURL: permalink || '',
                status: 'posted',
            },
        ];
    }
    async changeProfilePicture(id, accessToken, url) {
        return {
            url,
        };
    }
    async changeNickname(id, accessToken, name) {
        return {
            name,
        };
    }
}
exports.SlackProvider = SlackProvider;
__decorate([
    (0, tool_decorator_1.Tool)({
        description: 'Get list of channels',
        dataSchema: [],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SlackProvider.prototype, "channels", null);
//# sourceMappingURL=slack.provider.js.map
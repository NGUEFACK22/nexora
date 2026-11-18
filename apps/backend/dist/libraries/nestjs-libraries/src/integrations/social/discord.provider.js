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
exports.DiscordProvider = void 0;
const make_secure_id_1 = require("../../services/make.secure.id");
const social_abstract_1 = require("../social.abstract");
const discord_dto_1 = require("../../dtos/posts/providers-settings/discord.dto");
const tool_decorator_1 = require("../tool.decorator");
const form_data_1 = __importDefault(require("form-data"));
class DiscordProvider extends social_abstract_1.SocialAbstract {
    constructor() {
        super(...arguments);
        this.maxConcurrentJob = 5;
        this.identifier = 'discord';
        this.name = 'Discord';
        this.isBetweenSteps = false;
        this.editor = 'markdown';
        this.scopes = ['identify', 'guilds'];
        this.dto = discord_dto_1.DiscordDto;
    }
    maxLength() {
        return 1980;
    }
    async refreshToken(refreshToken) {
        const { access_token, expires_in, refresh_token } = await (await this.fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(process.env.DISCORD_CLIENT_ID +
                    ':' +
                    process.env.DISCORD_CLIENT_SECRET).toString('base64')}`,
            },
        })).json();
        const { application } = await (await this.fetch('https://discord.com/api/oauth2/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            refreshToken: refresh_token,
            expiresIn: expires_in,
            accessToken: access_token,
            id: '',
            name: application.name,
            picture: '',
            username: '',
        };
    }
    async generateAuthUrl() {
        const state = (0, make_secure_id_1.makeSecureId)(6);
        return {
            url: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=377957124096&response_type=code&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/integrations/social/discord`)}&integration_type=0&scope=bot+identify+guilds&state=${state}`,
            codeVerifier: (0, make_secure_id_1.makeSecureId)(10),
            state,
        };
    }
    async authenticate(params) {
        const { access_token, expires_in, refresh_token, scope, guild } = await (await this.fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                code: params.code,
                grant_type: 'authorization_code',
                redirect_uri: `${process.env.FRONTEND_URL}/integrations/social/discord`,
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(process.env.DISCORD_CLIENT_ID +
                    ':' +
                    process.env.DISCORD_CLIENT_SECRET).toString('base64')}`,
            },
        })).json();
        this.checkScopes(this.scopes, scope.split(' '));
        const { application } = await (await this.fetch('https://discord.com/api/oauth2/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        })).json();
        return {
            id: guild.id,
            name: application.name,
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            picture: `https://cdn.discordapp.com/avatars/${application.bot.id}/${application.bot.avatar}.png`,
            username: application.bot.username,
        };
    }
    async channels(accessToken, params, id) {
        const list = await (await this.fetch(`https://discord.com/api/guilds/${id}/channels`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
            },
        })).json();
        return list
            .filter((p) => p.type === 0 || p.type === 5 || p.type === 15)
            .map((p) => ({
            id: String(p.id),
            name: p.name,
        }));
    }
    async sendMessageWithMedia(channel, message, media) {
        return this.runStreamedUpload(async () => {
            const form = new form_data_1.default();
            form.append('payload_json', JSON.stringify({
                content: message.replace(/\[\[\[(@.*?)]]]/g, (match, p1) => {
                    return `<${p1}>`;
                }),
                attachments: media?.map((p, index) => ({
                    id: index,
                    description: `Picture ${index}`,
                    filename: p.path.split('/').pop(),
                })),
            }));
            let index = 0;
            for (const item of media || []) {
                const fileSize = await this.mediaSize(item.path, this.identifier);
                const stream = await this.mediaStream(item.path, this.identifier);
                form.append(`files[${index}]`, stream, {
                    filename: item.path.split('/').pop(),
                    knownLength: fileSize,
                });
                index++;
            }
            const { data } = await this.getSsrfSafeAxios().post(`https://discord.com/api/channels/${channel}/messages`, form, {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
                },
            });
            return data;
        }, this.identifier);
    }
    async post(id, accessToken, postDetails) {
        const [firstPost] = postDetails;
        const channel = firstPost.settings.channel;
        const data = await this.sendMessageWithMedia(channel, firstPost.message, firstPost.media);
        return [
            {
                id: firstPost.id,
                releaseURL: `https://discord.com/channels/${id}/${channel}/${data.id}`,
                postId: data.id,
                status: 'success',
            },
        ];
    }
    async comment(id, postId, lastCommentId, accessToken, postDetails, integration) {
        const [commentPost] = postDetails;
        const channel = commentPost.settings.channel;
        let threadChannel = channel;
        if (!lastCommentId) {
            const { id: threadId } = await (await this.fetch(`https://discord.com/api/channels/${channel}/messages/${postId}/threads`, {
                method: 'POST',
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Thread',
                    auto_archive_duration: 1440,
                }),
            })).json();
            threadChannel = threadId;
        }
        const data = await this.sendMessageWithMedia(threadChannel, commentPost.message, commentPost.media);
        return [
            {
                id: commentPost.id,
                releaseURL: `https://discord.com/channels/${id}/${threadChannel}/${data.id}`,
                postId: data.id,
                status: 'success',
            },
        ];
    }
    async changeNickname(id, accessToken, name) {
        await (await this.fetch(`https://discord.com/api/guilds/${id}/members/@me`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nick: name,
            }),
        })).json();
        return {
            name,
        };
    }
    async mention(token, data, id, integration) {
        const allRoles = await (await this.fetch(`https://discord.com/api/guilds/${id}/roles`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
                'Content-Type': 'application/json',
            },
        })).json();
        const matching = allRoles
            .filter((role) => role.name.toLowerCase().includes(data.query.toLowerCase()))
            .filter((f) => f.name !== '@everyone' && f.name !== '@here');
        const list = await (await this.fetch(`https://discord.com/api/guilds/${id}/members/search?query=${data.query}`, {
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN_ID}`,
                'Content-Type': 'application/json',
            },
        })).json();
        return [
            ...[
                {
                    id: String('here'),
                    label: 'here',
                    image: '',
                    doNotCache: true,
                },
                {
                    id: String('everyone'),
                    label: 'everyone',
                    image: '',
                    doNotCache: true,
                },
            ].filter((role) => {
                return role.label.toLowerCase().includes(data.query.toLowerCase());
            }),
            ...matching.map((p) => ({
                id: String('&' + p.id),
                label: p.name.split('@')[1],
                image: '',
                doNotCache: true,
            })),
            ...list.map((p) => ({
                id: String(p.user.id),
                label: p.user.global_name || p.user.username,
                image: `https://cdn.discordapp.com/avatars/${p.user.id}/${p.user.avatar}.png`,
            })),
        ];
    }
    mentionFormat(idOrHandle, name) {
        if (name === '@here' || name === '@everyone') {
            return name;
        }
        return `[[[@${idOrHandle.replace('@', '')}]]]`;
    }
    handleErrors(body) {
        if (body.includes('50001')) {
            return {
                type: 'bad-body',
                value: "Bot doesn't have access to this channel",
            };
        }
        if (body.includes('50013')) {
            return {
                type: 'bad-body',
                value: 'Bot lacks permission to send messages in this channel',
            };
        }
        if (body.includes('10003')) {
            return {
                type: 'bad-body',
                value: 'Channel no longer exists',
            };
        }
        if (body.includes('40005')) {
            return {
                type: 'bad-body',
                value: "Attachment exceeds Discord's size limit",
            };
        }
        if (body.includes('20028')) {
            return {
                type: 'retry',
                value: 'Rate limited by Discord',
            };
        }
        if (body.includes('401: Unauthorized')) {
            return {
                type: 'bad-body',
                value: 'Discord rejected the Nexora bot token, reconnecting will not help',
            };
        }
        return undefined;
    }
}
exports.DiscordProvider = DiscordProvider;
__decorate([
    (0, tool_decorator_1.Tool)({ description: 'Channels', dataSchema: [] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DiscordProvider.prototype, "channels", null);
//# sourceMappingURL=discord.provider.js.map
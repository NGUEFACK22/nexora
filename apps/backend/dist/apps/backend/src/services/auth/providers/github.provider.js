"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubProvider = void 0;
const tslib_1 = require("tslib");
const providers_interface_1 = require("@gitroom/backend/services/auth/providers.interface");
let GithubProvider = class GithubProvider extends providers_interface_1.AuthProviderAbstract {
    generateLink(query) {
        return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email&state=${query?.state || 'login'}&redirect_uri=${encodeURIComponent(`${process.env.FRONTEND_URL}/settings`)}`;
    }
    async getToken(code, _redirectUri) {
        const { access_token } = await (await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: `${process.env.FRONTEND_URL}/settings`,
            }),
        })).json();
        return access_token;
    }
    async getUser(access_token) {
        const data = await (await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        const [{ email }] = await (await fetch('https://api.github.com/user/emails', {
            headers: {
                Authorization: `token ${access_token}`,
            },
        })).json();
        return {
            email: email,
            id: String(data.id),
        };
    }
};
exports.GithubProvider = GithubProvider;
exports.GithubProvider = GithubProvider = tslib_1.__decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'GITHUB' })
], GithubProvider);
//# sourceMappingURL=github.provider.js.map
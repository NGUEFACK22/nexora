"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubProvider = void 0;
const providers_interface_1 = require("../providers.interface");
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
exports.GithubProvider = GithubProvider = __decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'GITHUB' })
], GithubProvider);
//# sourceMappingURL=github.provider.js.map
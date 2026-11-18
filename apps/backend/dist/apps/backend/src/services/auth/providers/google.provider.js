"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleProvider = void 0;
const googleapis_1 = require("googleapis");
const common_1 = require("@nestjs/common");
const providers_interface_1 = require("../providers.interface");
const defaultRedirect = () => `${process.env.FRONTEND_URL}/integrations/social/youtube`;
const makeClient = (redirectUri) => new googleapis_1.google.auth.OAuth2({
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri,
});
let GoogleProvider = class GoogleProvider extends providers_interface_1.AuthProviderAbstract {
    generateLink(query) {
        const redirectUri = query?.redirect_uri || defaultRedirect();
        return makeClient(redirectUri).generateAuthUrl({
            access_type: 'online',
            prompt: 'consent',
            state: query?.state || 'login',
            redirect_uri: redirectUri,
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
        });
    }
    async getToken(code, redirectUri) {
        const client = makeClient(redirectUri || defaultRedirect());
        try {
            const { tokens } = await client.getToken(code);
            return tokens.access_token;
        }
        catch (err) {
            if (err?.response?.data?.error === 'invalid_grant') {
                throw new common_1.HttpException('Google sign-in expired, please sign in again', 400);
            }
            throw err;
        }
    }
    async getUser(providerToken) {
        const client = makeClient(defaultRedirect());
        client.setCredentials({ access_token: providerToken });
        const { data } = await googleapis_1.google
            .oauth2({ version: 'v2', auth: client })
            .userinfo.get();
        return {
            id: data.id,
            email: data.email,
        };
    }
};
exports.GoogleProvider = GoogleProvider;
exports.GoogleProvider = GoogleProvider = __decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'GOOGLE' })
], GoogleProvider);
//# sourceMappingURL=google.provider.js.map
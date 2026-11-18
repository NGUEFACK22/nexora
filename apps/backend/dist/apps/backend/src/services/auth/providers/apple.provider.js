"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleProvider = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_1 = require("crypto");
const providers_interface_1 = require("../providers.interface");
const getConfig = () => {
    const { APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } = process.env;
    if (!APPLE_CLIENT_ID ||
        !APPLE_TEAM_ID ||
        !APPLE_KEY_ID ||
        !APPLE_PRIVATE_KEY) {
        throw new Error('APPLE environment variables are not set');
    }
    return {
        clientId: APPLE_CLIENT_ID,
        teamId: APPLE_TEAM_ID,
        keyId: APPLE_KEY_ID,
        privateKey: APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
};
const defaultRedirect = () => `${process?.env?.NEXT_PUBLIC_BACKEND_URL?.indexOf('https') === -1
    ? 'https://redirectmeto.com/'
    : ''}${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/oauth/apple/redirect`;
const clientSecret = () => {
    const { clientId, teamId, keyId, privateKey } = getConfig();
    return (0, jsonwebtoken_1.sign)({}, privateKey, {
        algorithm: 'ES256',
        expiresIn: '5m',
        audience: 'https://appleid.apple.com',
        issuer: teamId,
        subject: clientId,
        keyid: keyId,
    });
};
let AppleProvider = class AppleProvider extends providers_interface_1.AuthProviderAbstract {
    generateLink(query) {
        const { clientId } = getConfig();
        const url = new URL('https://appleid.apple.com/auth/authorize');
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('redirect_uri', query?.redirect_uri || defaultRedirect());
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('response_mode', 'form_post');
        url.searchParams.set('scope', 'name email');
        url.searchParams.set('state', query?.state || 'login');
        return url.toString();
    }
    async getToken(code, redirectUri) {
        const decoded = (0, jsonwebtoken_1.decode)(code);
        if (decoded &&
            typeof decoded === 'object' &&
            decoded.iss === 'https://appleid.apple.com') {
            return code;
        }
        const { clientId } = getConfig();
        const response = await fetch('https://appleid.apple.com/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri || defaultRedirect(),
                client_id: clientId,
                client_secret: clientSecret(),
            }).toString(),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Token request failed: ${error}`);
        }
        const { id_token } = await response.json();
        if (!id_token) {
            throw new Error('Invalid provider token');
        }
        return id_token;
    }
    async getUser(providerToken) {
        const { clientId } = getConfig();
        const decoded = (0, jsonwebtoken_1.decode)(providerToken, { complete: true });
        const { keys } = await (await fetch('https://appleid.apple.com/auth/keys')).json();
        const key = keys.find((k) => k.kid === decoded?.header?.kid);
        if (!key) {
            throw new Error('Invalid provider token');
        }
        const audience = process.env.APPLE_APP_BUNDLE_ID
            ? [clientId, process.env.APPLE_APP_BUNDLE_ID]
            : [clientId];
        const payload = (0, jsonwebtoken_1.verify)(providerToken, (0, crypto_1.createPublicKey)({ key, format: 'jwk' }), {
            algorithms: ['RS256'],
            audience,
            issuer: 'https://appleid.apple.com',
        });
        return {
            id: payload.sub,
            email: payload.email,
        };
    }
};
exports.AppleProvider = AppleProvider;
exports.AppleProvider = AppleProvider = __decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'APPLE' })
], AppleProvider);
//# sourceMappingURL=apple.provider.js.map
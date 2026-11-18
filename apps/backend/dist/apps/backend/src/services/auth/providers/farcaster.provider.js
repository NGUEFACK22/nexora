"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarcasterProvider = void 0;
const tslib_1 = require("tslib");
const providers_interface_1 = require("@gitroom/backend/services/auth/providers.interface");
const nodejs_sdk_1 = require("@neynar/nodejs-sdk");
const client = new nodejs_sdk_1.NeynarAPIClient({
    apiKey: process.env.NEYNAR_SECRET_KEY || '00000000-000-0000-000-000000000000',
});
let FarcasterProvider = class FarcasterProvider extends providers_interface_1.AuthProviderAbstract {
    generateLink(query) {
        return query?.state || '';
    }
    async getToken(code, _redirectUri) {
        const data = JSON.parse(Buffer.from(code, 'base64').toString());
        const status = await client.lookupSigner({ signerUuid: data.signer_uuid });
        if (status.status === 'approved') {
            return data.signer_uuid;
        }
        return '';
    }
    async getUser(providerToken) {
        const status = await client.lookupSigner({ signerUuid: providerToken });
        if (status.status !== 'approved') {
            return {
                id: '',
                email: '',
            };
        }
        return {
            id: String('farcaster_' + status.fid),
            email: String('farcaster_' + status.fid),
        };
    }
};
exports.FarcasterProvider = FarcasterProvider;
exports.FarcasterProvider = FarcasterProvider = tslib_1.__decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'FARCASTER' })
], FarcasterProvider);
//# sourceMappingURL=farcaster.provider.js.map
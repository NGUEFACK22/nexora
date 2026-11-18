"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarcasterProvider = void 0;
const providers_interface_1 = require("../providers.interface");
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
exports.FarcasterProvider = FarcasterProvider = __decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'FARCASTER' })
], FarcasterProvider);
//# sourceMappingURL=farcaster.provider.js.map
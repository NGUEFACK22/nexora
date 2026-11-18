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
exports.WalletProvider = void 0;
const providers_interface_1 = require("../providers.interface");
const crypto_1 = require("crypto");
const redis_service_1 = require("../../../../../../libraries/nestjs-libraries/src/redis/redis.service");
const bs58_1 = __importDefault(require("bs58"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
function hexToUint8Array(hex) {
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string. It must have an even length.');
    }
    const byteLength = hex.length / 2;
    const uint8Array = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        const byteHex = hex.substr(i * 2, 2);
        uint8Array[i] = parseInt(byteHex, 16);
    }
    return uint8Array;
}
let WalletProvider = class WalletProvider extends providers_interface_1.AuthProviderAbstract {
    async generateLink(params) {
        if (!params.publicKey) {
            return;
        }
        const challenge = (0, crypto_1.randomBytes)(32).toString('hex');
        await redis_service_1.ioRedis.set(`wallet:${params.publicKey}`, challenge, 'EX', 60);
        return challenge;
    }
    async getToken(code, _redirectUri) {
        const { publicKey, challenge, signature } = JSON.parse(Buffer.from(code, 'base64').toString());
        if (!publicKey || !challenge || !signature) {
            return '';
        }
        const redisGet = await redis_service_1.ioRedis.get(`wallet:${publicKey}`);
        if (redisGet !== challenge) {
            return '';
        }
        const publicKeyUint8 = bs58_1.default.decode(publicKey);
        const messageUint8 = new TextEncoder().encode(challenge);
        const signatureUint8 = hexToUint8Array(signature);
        const isValid = tweetnacl_1.default.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
        if (!isValid) {
            return '';
        }
        return code;
    }
    async getUser(providerToken) {
        if ((await this.getToken(providerToken)) === '') {
            return {
                id: '',
                email: '',
            };
        }
        const { publicKey } = JSON.parse(Buffer.from(providerToken, 'base64').toString());
        return {
            id: String(`wallet_${publicKey}`),
            email: String(`wallet_${publicKey}`),
        };
    }
};
exports.WalletProvider = WalletProvider;
exports.WalletProvider = WalletProvider = __decorate([
    (0, providers_interface_1.AuthProvider)({ provider: 'WALLET' })
], WalletProvider);
//# sourceMappingURL=wallet.provider.js.map
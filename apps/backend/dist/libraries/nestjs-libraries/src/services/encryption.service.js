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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = exports.integrationEncryptedFields = exports.ENCRYPTED_PREFIX = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const empty_provider_1 = require("../encryption/empty.provider");
const local_provider_1 = require("../encryption/local.provider");
const aws_kms_provider_1 = require("../encryption/aws.kms.provider");
exports.ENCRYPTED_PREFIX = 'enc:v1:';
exports.integrationEncryptedFields = ['token', 'refreshToken'];
const algorithm = 'aes-256-gcm';
const ivLength = 12;
const tagLength = 16;
let EncryptionService = class EncryptionService {
    constructor() {
        this.encryptionProvider = this.selectProvider(process.env.ENCRYPTION_PROVIDER);
        console.log('Encryption provider:', this.encryptionProvider.name);
        for (const key of this.encryptionProvider.validateEnvKeys) {
            if (!process.env[key]) {
                console.error(`Missing environment variable: ${key}`);
            }
        }
    }
    async onModuleInit() {
        if (this.hasProvider()) {
            await this.loadKey();
        }
    }
    hasProvider() {
        return !(this.encryptionProvider instanceof empty_provider_1.EmptyProvider);
    }
    canEncrypt() {
        return this.hasProvider() && process.env.ENCRYPTION_READ_ONLY !== 'true';
    }
    selectProvider(provider) {
        switch (provider) {
            case 'local':
                return new local_provider_1.LocalProvider();
            case 'aws-kms':
                return new aws_kms_provider_1.AwsKmsProvider();
            default:
                if (provider) {
                    throw new Error(`Unknown encryption provider: ${provider}`);
                }
                return new empty_provider_1.EmptyProvider();
        }
    }
    isEncrypted(value) {
        return value.startsWith(exports.ENCRYPTED_PREFIX);
    }
    async encrypt(value) {
        if (!value) {
            return value;
        }
        if (this.isEncrypted(value)) {
            throw new Error('The value cannot start with the encryption prefix');
        }
        if (!this.canEncrypt()) {
            return value;
        }
        const key = await this.loadKey();
        const iv = (0, crypto_1.randomBytes)(ivLength);
        const cipher = (0, crypto_1.createCipheriv)(algorithm, key.value, iv);
        const data = Buffer.concat([
            iv,
            cipher.update(value, 'utf8'),
            cipher.final(),
            cipher.getAuthTag(),
        ]);
        return `${exports.ENCRYPTED_PREFIX}${key.id}:${data.toString('base64')}`;
    }
    async decrypt(value) {
        if (!value || !this.isEncrypted(value)) {
            return value;
        }
        const [id, data] = value.slice(exports.ENCRYPTED_PREFIX.length).split(':');
        const key = await this.loadKey();
        if (id !== key.id) {
            throw new Error(`The value was encrypted with the key ${id}, but the key of the encryption provider is ${key.id}`);
        }
        const buffer = Buffer.from(data || '', 'base64');
        const decipher = (0, crypto_1.createDecipheriv)(algorithm, key.value, buffer.subarray(0, ivLength));
        decipher.setAuthTag(buffer.subarray(buffer.length - tagLength));
        return Buffer.concat([
            decipher.update(buffer.subarray(ivLength, buffer.length - tagLength)),
            decipher.final(),
        ]).toString('utf8');
    }
    async encryptFields(row, fields) {
        return this.changeFields(row, fields, (value) => this.encrypt(value));
    }
    async decryptFields(row, fields) {
        return this.changeFields(row, fields, (value) => this.decrypt(value));
    }
    async changeFields(row, fields, change) {
        const changed = { ...row };
        for (const field of fields) {
            const value = changed[field];
            if (typeof value === 'string') {
                changed[field] = (await change(value));
            }
        }
        return changed;
    }
    loadKey() {
        if (!this._key) {
            this._key = this.encryptionProvider.getKey().then((value) => {
                if (value.length !== 32) {
                    throw new Error(`The key of the ${this.encryptionProvider.name} encryption provider has to be 32 bytes, got ${value.length}`);
                }
                return {
                    id: (0, crypto_1.createHash)('sha256').update(value).digest('hex').slice(0, 8),
                    value,
                };
            });
            this._key.catch(() => {
                this._key = undefined;
            });
        }
        return this._key;
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map
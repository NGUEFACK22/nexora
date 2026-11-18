"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsKmsProvider = void 0;
const client_kms_1 = require("@aws-sdk/client-kms");
const kms = new client_kms_1.KMSClient({
    region: process.env.ENCRYPTION_KMS_REGION,
    ...(process.env.ENCRYPTION_KMS_ACCESS_KEY
        ? {
            credentials: {
                accessKeyId: process.env.ENCRYPTION_KMS_ACCESS_KEY,
                secretAccessKey: process.env.ENCRYPTION_KMS_SECRET_ACCESS_KEY,
            },
        }
        : {}),
});
class AwsKmsProvider {
    constructor() {
        this.name = 'aws-kms';
        this.validateEnvKeys = [
            'ENCRYPTION_KMS_REGION',
            'ENCRYPTION_KMS_DATA_KEY',
            ...(process.env.ENCRYPTION_KMS_ACCESS_KEY
                ? ['ENCRYPTION_KMS_SECRET_ACCESS_KEY']
                : []),
        ];
    }
    async getKey() {
        const { Plaintext } = await kms.send(new client_kms_1.DecryptCommand({
            CiphertextBlob: Buffer.from(process.env.ENCRYPTION_KMS_DATA_KEY || '', 'base64'),
        }));
        return Buffer.from(Plaintext);
    }
}
exports.AwsKmsProvider = AwsKmsProvider;
//# sourceMappingURL=aws.kms.provider.js.map
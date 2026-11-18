import { EncryptionInterface } from '@gitroom/nestjs-libraries/encryption/encryption.interface';
export declare class AwsKmsProvider implements EncryptionInterface {
    name: string;
    validateEnvKeys: string[];
    getKey(): Promise<Buffer>;
}

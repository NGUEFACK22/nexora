import { OnModuleInit } from '@nestjs/common';
import { EncryptionInterface } from '@gitroom/nestjs-libraries/encryption/encryption.interface';
import { EmptyProvider } from '@gitroom/nestjs-libraries/encryption/empty.provider';
import { LocalProvider } from '@gitroom/nestjs-libraries/encryption/local.provider';
import { AwsKmsProvider } from '@gitroom/nestjs-libraries/encryption/aws.kms.provider';
export declare const ENCRYPTED_PREFIX = "enc:v1:";
export declare const integrationEncryptedFields: readonly ["token", "refreshToken"];
export declare class EncryptionService implements OnModuleInit {
    encryptionProvider: EncryptionInterface;
    private _key?;
    constructor();
    onModuleInit(): Promise<void>;
    hasProvider(): boolean;
    canEncrypt(): boolean;
    selectProvider(provider: string): EmptyProvider | LocalProvider | AwsKmsProvider;
    isEncrypted(value: string): boolean;
    encrypt(value: string): Promise<string>;
    decrypt(value: string): Promise<string>;
    encryptFields<T extends object>(row: T, fields: readonly (keyof T)[]): Promise<T>;
    decryptFields<T extends object>(row: T, fields: readonly (keyof T)[]): Promise<T>;
    private changeFields;
    private loadKey;
}

import { EncryptionInterface } from './encryption.interface';
export declare class EmptyProvider implements EncryptionInterface {
    name: string;
    validateEnvKeys: string[];
    getKey(): Promise<Buffer>;
}

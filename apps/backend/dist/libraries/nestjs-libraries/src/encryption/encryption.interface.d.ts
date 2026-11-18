export interface EncryptionInterface {
    name: string;
    validateEnvKeys: string[];
    getKey(): Promise<Buffer>;
}

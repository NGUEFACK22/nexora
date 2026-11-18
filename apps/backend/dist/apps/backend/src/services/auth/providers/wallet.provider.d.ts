import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class WalletProvider extends AuthProviderAbstract {
    generateLink(params: {
        publicKey: string;
    }): Promise<string>;
    getToken(code: string, _redirectUri?: string): Promise<string>;
    getUser(providerToken: string): Promise<{
        id: string;
        email: string;
    }>;
}

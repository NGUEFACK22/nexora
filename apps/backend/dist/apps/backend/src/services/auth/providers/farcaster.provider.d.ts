import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class FarcasterProvider extends AuthProviderAbstract {
    generateLink(query?: {
        state?: string;
    }): string;
    getToken(code: string, _redirectUri?: string): Promise<any>;
    getUser(providerToken: string): Promise<{
        id: string;
        email: string;
    }>;
}

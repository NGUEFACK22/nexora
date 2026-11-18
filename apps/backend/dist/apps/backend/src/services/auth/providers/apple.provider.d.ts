import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class AppleProvider extends AuthProviderAbstract {
    generateLink(query?: {
        redirect_uri?: string;
        state?: string;
    }): string;
    getToken(code: string, redirectUri?: string): Promise<string>;
    getUser(providerToken: string): Promise<{
        id: string;
        email: string;
    }>;
}

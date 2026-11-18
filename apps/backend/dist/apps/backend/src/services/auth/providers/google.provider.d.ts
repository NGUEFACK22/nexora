import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class GoogleProvider extends AuthProviderAbstract {
    generateLink(query?: {
        redirect_uri?: string;
        state?: string;
    }): any;
    getToken(code: string, redirectUri?: string): Promise<any>;
    getUser(providerToken: string): Promise<{
        id: any;
        email: any;
    }>;
}

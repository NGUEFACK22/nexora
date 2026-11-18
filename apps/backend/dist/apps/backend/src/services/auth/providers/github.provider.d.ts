import { AuthProviderAbstract } from '@gitroom/backend/services/auth/providers.interface';
export declare class GithubProvider extends AuthProviderAbstract {
    generateLink(query?: {
        state?: string;
    }): string;
    getToken(code: string, _redirectUri?: string): Promise<string>;
    getUser(access_token: string): Promise<{
        email: string;
        id: string;
    }>;
}

export declare abstract class AuthProviderAbstract {
    abstract generateLink(query?: any): Promise<string> | string;
    abstract getToken(code: string, redirectUri?: string): Promise<string>;
    abstract getUser(providerToken: string): Promise<{
        email: string;
        id: string;
    }> | false;
    postRegistration(providerToken: string, orgId: string): Promise<void>;
}
export interface AuthProviderParams {
    provider: string;
}
export declare function AuthProvider(params: AuthProviderParams): (target: any) => void;

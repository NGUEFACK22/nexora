import { OAuthRepository } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.repository';
import { CreateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/create-oauth-app.dto';
import { UpdateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/update-oauth-app.dto';
import { RegisterClientDto } from '@gitroom/nestjs-libraries/dtos/oauth/register-client.dto';
import { OAuthApp } from '@prisma/client';
import type { SelfHostedInstance } from '@gitroom/nestjs-libraries/chat/mcp.relay.service';
export declare const hubspotInstallUrl: () => string;
export declare const selfHostedRelayEnabled: () => boolean;
export declare class OAuthService {
    private _oauthRepository;
    constructor(_oauthRepository: OAuthRepository);
    getApp(orgId: string): Promise<false | {
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
            status: string;
            processingError: string | null;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string | null;
        pictureId: string | null;
        redirectUrl: string;
        redirectUris: string | null;
        clientId: string;
        dynamic: boolean;
        tokenEndpointAuthMethod: string | null;
    }>;
    createApp(orgId: string, dto: CreateOAuthAppDto): Promise<{
        clientSecret: string;
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
            status: string;
            processingError: string | null;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string | null;
        pictureId: string | null;
        redirectUrl: string;
        redirectUris: string | null;
        clientId: string;
        dynamic: boolean;
        tokenEndpointAuthMethod: string | null;
    }>;
    updateApp(orgId: string, dto: UpdateOAuthAppDto): Promise<{
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
            status: string;
            processingError: string | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string | null;
        pictureId: string | null;
        redirectUrl: string;
        clientSecret: string | null;
        redirectUris: string | null;
        clientId: string;
        dynamic: boolean;
        tokenEndpointAuthMethod: string | null;
    }>;
    deleteApp(orgId: string): Promise<{
        success: boolean;
    }>;
    rotateSecret(orgId: string): Promise<{
        clientSecret: string;
    }>;
    private verifiedDomainList;
    registerDynamicClient(dto: RegisterClientDto): Promise<{
        client_id_issued_at: number;
        client_name: string;
        redirect_uris: string[];
        token_endpoint_auth_method: string;
        grant_types: string[];
        response_types: string[];
        scope: string;
        client_secret?: string;
        client_secret_expires_at?: number;
        client_id: string;
    }>;
    private allowsEmailClaims;
    private grantedScope;
    allowsSelfHosted(app: Pick<OAuthApp, 'clientId' | 'dynamic'>, resource?: string): boolean;
    selfHostedRequiresEmail(app: Pick<OAuthApp, 'clientId'>): boolean;
    validateSelfHostedRequest(app: Pick<OAuthApp, 'clientId' | 'dynamic'>, options: {
        resource?: string;
        email?: string;
    }): void;
    validateAuthorizationRequest(clientId: string, options?: {
        redirectUri?: string;
        codeChallenge?: string;
        codeChallengeMethod?: string;
    }): Promise<{
        picture: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            originalName: string | null;
            path: string;
            fileSize: number;
            type: string;
            thumbnail: string | null;
            alt: string | null;
            thumbnailTimestamp: number | null;
            status: string;
            processingError: string | null;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string | null;
        pictureId: string | null;
        redirectUrl: string;
        clientSecret: string | null;
        redirectUris: string | null;
        clientId: string;
        dynamic: boolean;
        tokenEndpointAuthMethod: string | null;
    }>;
    private isPublicClient;
    pkceBinding(app: Pick<OAuthApp, 'clientId' | 'dynamic' | 'tokenEndpointAuthMethod'>, request: {
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    }): {
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    };
    createAuthorizationCode(oauthAppId: string, userId: string, organizationId: string, pkce?: {
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    }): Promise<string>;
    createSelfHostedAuthorizationCode(oauthAppId: string, instance: SelfHostedInstance & {
        email?: string;
    }, pkce?: {
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    }): Promise<string>;
    exchangeCodeForToken(code: string, clientId: string, clientSecret?: string, codeVerifier?: string, redirectUri?: string): Promise<{
        refresh_token?: undefined;
        expires_in?: undefined;
        access_token: string;
        token_type: string;
        scope: string;
    } | {
        refresh_token: string;
        expires_in: number;
        access_token: string;
        token_type: string;
        scope: string;
    } | {
        refresh_token?: undefined;
        expires_in?: undefined;
        id: string;
        cus: string;
        access_token: string;
        token_type: string;
        scope: string;
    } | {
        refresh_token: string;
        expires_in: number;
        id: string;
        cus: string;
        access_token: string;
        token_type: string;
        scope: string;
    }>;
    private verifyCodeGrant;
    private exchangeSelfHostedCodeForToken;
    private refreshFields;
    refreshAccessToken(clientId?: string, refreshToken?: string): Promise<{
        refresh_token?: undefined;
        expires_in?: undefined;
        access_token: string;
        token_type: string;
        scope: string;
    } | {
        refresh_token: string;
        expires_in: number;
        access_token: string;
        token_type: string;
        scope: string;
    }>;
    completeHubspotInstall(code: string): Promise<void>;
    getSelfHostedByAccessToken(token: string): Promise<{
        id: string;
        mcpUrl: string;
        apiKey: string;
    }>;
    deleteSelfHostedAuthorization(id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    getOrgByOAuthToken(token: string): Promise<{
        organization: {
            subscription: {
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                totalChannels: number;
                isLifetime: boolean;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            apiKey: string | null;
            paymentId: string | null;
            streakSince: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            allowTrial: boolean;
            isTrailing: boolean;
            shortlink: import(".prisma/client").$Enums.ShortLinkPreference;
        };
        user: {
            email: string;
            id: string;
            activated: boolean;
        };
        oauthApp: {
            redirectUris: string;
            clientId: string;
            dynamic: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        userId: string;
        accessToken: string | null;
        codeChallenge: string | null;
        oauthAppId: string;
        authorizationCode: string | null;
        codeExpiresAt: Date | null;
        codeChallengeMethod: string | null;
        redirectUri: string | null;
        revokedAt: Date | null;
    }>;
    getUserInfo(authorization?: string): Promise<{
        email?: string;
        email_verified?: boolean;
        sub: string;
    }>;
    private getSelfHostedUserInfo;
    getApprovedApps(userId: string): Promise<({
        oauthApp: {
            picture: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                organizationId: string;
                originalName: string | null;
                path: string;
                fileSize: number;
                type: string;
                thumbnail: string | null;
                alt: string | null;
                thumbnailTimestamp: number | null;
                status: string;
                processingError: string | null;
            };
        } & {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string | null;
            pictureId: string | null;
            redirectUrl: string;
            clientSecret: string | null;
            redirectUris: string | null;
            clientId: string;
            dynamic: boolean;
            tokenEndpointAuthMethod: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        userId: string;
        accessToken: string | null;
        codeChallenge: string | null;
        oauthAppId: string;
        authorizationCode: string | null;
        codeExpiresAt: Date | null;
        codeChallengeMethod: string | null;
        redirectUri: string | null;
        revokedAt: Date | null;
    })[]>;
    revokeApp(userId: string, authId: string): Promise<{
        success: boolean;
    }>;
}

import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
export declare class OAuthRepository {
    private _oauthApp;
    private _oauthAuth;
    private _oauthSelfHosted;
    constructor(_oauthApp: PrismaRepository<'oAuthApp'>, _oauthAuth: PrismaRepository<'oAuthAuthorization'>, _oauthSelfHosted: PrismaRepository<'oAuthSelfHostedAuthorization'>);
    getAppByOrgId(orgId: string): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getAppByClientId(clientId: string): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createApp(orgId: string, data: {
        name: string;
        description?: string;
        pictureId?: string;
        redirectUrl: string;
        clientId: string;
        clientSecret: string;
    }): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createDynamicApp(data: {
        name: string;
        redirectUrl: string;
        redirectUris: string;
        clientId: string;
        clientSecret?: string;
        tokenEndpointAuthMethod: string;
    }): import(".prisma/client").Prisma.Prisma__OAuthAppClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteStaleDynamicApps(olderThan: Date): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    updateApp(orgId: string, data: {
        name?: string;
        description?: string;
        pictureId?: string;
        redirectUrl?: string;
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
    deleteApp(orgId: string): Promise<{
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
    updateClientSecret(orgId: string, newSecret: string): Promise<{
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
    createAuthorization(data: {
        oauthAppId: string;
        userId: string;
        organizationId: string;
        authorizationCode: string;
        codeExpiresAt: Date;
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    }): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByCode(encryptedCode: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    exchangeCodeForToken(id: string, encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
        organization: {
            paymentId: string;
        };
        organizationId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findByAccessToken(encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getApprovedApps(userId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    revokeAuthorization(userId: string, authId: string): import(".prisma/client").Prisma.Prisma__OAuthAuthorizationClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    revokeAllForApp(oauthAppId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createSelfHostedAuthorization(data: {
        oauthAppId: string;
        mcpUrl: string;
        apiKey: string;
        email?: string;
        authorizationCode: string;
        codeExpiresAt: Date;
        codeChallenge?: string;
        codeChallengeMethod?: string;
        redirectUri?: string;
    }): import(".prisma/client").Prisma.Prisma__OAuthSelfHostedAuthorizationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteAbandonedSelfHostedAuthorizations(olderThan: Date): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    findSelfHostedByCode(encryptedCode: string): import(".prisma/client").Prisma.Prisma__OAuthSelfHostedAuthorizationClient<{
        id: string;
        codeChallenge: string;
        oauthAppId: string;
        codeExpiresAt: Date;
        redirectUri: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    exchangeSelfHostedCodeForToken(id: string, encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthSelfHostedAuthorizationClient<{
        id: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findSelfHostedByAccessToken(encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthSelfHostedAuthorizationClient<{
        id: string;
        apiKey: string;
        oauthAppId: string;
        mcpUrl: string;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findSelfHostedUserInfo(encryptedToken: string): import(".prisma/client").Prisma.Prisma__OAuthSelfHostedAuthorizationClient<{
        email: string;
        id: string;
        oauthApp: {
            redirectUris: string;
            clientId: string;
            dynamic: boolean;
        };
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteSelfHostedAuthorization(id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}

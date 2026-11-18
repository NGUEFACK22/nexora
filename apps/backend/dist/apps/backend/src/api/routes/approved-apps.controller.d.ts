import { User } from '@prisma/client';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
export declare class ApprovedAppsController {
    private _oauthService;
    constructor(_oauthService: OAuthService);
    list(user: User): Promise<({
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
    revoke(user: User, id: string): Promise<{
        success: boolean;
    }>;
}

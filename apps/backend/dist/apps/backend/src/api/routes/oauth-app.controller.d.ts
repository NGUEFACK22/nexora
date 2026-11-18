import { Organization } from '@prisma/client';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { CreateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/create-oauth-app.dto';
import { UpdateOAuthAppDto } from '@gitroom/nestjs-libraries/dtos/oauth/update-oauth-app.dto';
export declare class OAuthAppController {
    private _oauthService;
    constructor(_oauthService: OAuthService);
    getApp(org: Organization): Promise<false | {
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
    createApp(org: Organization, body: CreateOAuthAppDto): Promise<{
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
    updateApp(org: Organization, body: UpdateOAuthAppDto): Promise<{
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
    deleteApp(org: Organization): Promise<{
        success: boolean;
    }>;
    rotateSecret(org: Organization): Promise<{
        clientSecret: string;
    }>;
}

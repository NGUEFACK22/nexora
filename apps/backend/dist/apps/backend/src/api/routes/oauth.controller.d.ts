import { Response } from 'express';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { User, Organization } from '@prisma/client';
import { AuthorizeOAuthQueryDto, ApproveOAuthDto, AuthorizeSelfHostedDto } from '@gitroom/nestjs-libraries/dtos/oauth/authorize-oauth.dto';
import { TokenExchangeDto } from '@gitroom/nestjs-libraries/dtos/oauth/token-exchange.dto';
import { RegisterClientDto } from '@gitroom/nestjs-libraries/dtos/oauth/register-client.dto';
import { HubspotInstallQueryDto } from '@gitroom/nestjs-libraries/dtos/oauth/hubspot-install.dto';
import { McpRelayService } from '@gitroom/nestjs-libraries/chat/mcp.relay.service';
export declare class OAuthController {
    private _oauthService;
    private _mcpRelayService;
    constructor(_oauthService: OAuthService, _mcpRelayService: McpRelayService);
    register(body: RegisterClientDto): Promise<{
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
    authorize(query: AuthorizeOAuthQueryDto): Promise<{
        app: {
            name: string;
            description: string;
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
            clientId: string;
            redirectUrl: string;
        };
        state: string;
        selfHosted: boolean;
        selfHostedEmail: boolean;
    }>;
    authorizeSelfHosted(body: AuthorizeSelfHostedDto): Promise<{
        redirect: string;
    }>;
    token(body: TokenExchangeDto, authorization?: string): Promise<{
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
    userinfo(authorization?: string): Promise<{
        email?: string;
        email_verified?: boolean;
        sub: string;
    }>;
    userinfoPost(authorization?: string): Promise<{
        email?: string;
        email_verified?: boolean;
        sub: string;
    }>;
    hubspotCallback(query: HubspotInstallQueryDto, response: Response): Promise<void>;
}
export declare class OAuthAuthorizedController {
    private _oauthService;
    constructor(_oauthService: OAuthService);
    approveOrDeny(body: ApproveOAuthDto, user: User, org: Organization): Promise<{
        redirect: string;
    }>;
}

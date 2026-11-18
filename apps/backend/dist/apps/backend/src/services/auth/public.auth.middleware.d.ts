import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
export declare class PublicAuthMiddleware implements NestMiddleware {
    private _organizationService;
    private _oauthService;
    private readonly _logger;
    constructor(_organizationService: OrganizationService, _oauthService: OAuthService);
    private setOrg;
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}

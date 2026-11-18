import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
export declare class EnterpriseController {
    private _integrationManager;
    private _organizationService;
    private _integrationService;
    private _postsService;
    constructor(_integrationManager: IntegrationManager, _organizationService: OrganizationService, _integrationService: IntegrationService, _postsService: PostsService);
    private verifyEnterpriseToken;
    createUser(params: string): Promise<{
        id: string;
        apiKey: string;
    } | {
        success: boolean;
        create?: undefined;
    } | {
        create: boolean;
        success?: undefined;
    }>;
    redirectParams(params: string): Promise<string>;
    deleteChannel(params: string): Promise<{
        success: boolean;
    }>;
}

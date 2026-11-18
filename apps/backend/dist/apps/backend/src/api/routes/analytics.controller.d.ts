import { Organization } from '@prisma/client';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
export declare class AnalyticsController {
    private _integrationService;
    private _postsService;
    constructor(_integrationService: IntegrationService, _postsService: PostsService);
    getIntegration(org: Organization, integration: string, date: string): Promise<import("@gitroom/nestjs-libraries/integrations/social/social.integrations.interface").AnalyticsData[]>;
    getPostAnalytics(org: Organization, postId: string, date: string): Promise<import("@gitroom/nestjs-libraries/integrations/social/social.integrations.interface").AnalyticsData[] | {
        missing: true;
    }>;
}

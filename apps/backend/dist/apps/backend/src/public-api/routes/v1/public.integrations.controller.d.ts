import { Organization } from '@prisma/client';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { GetPostsDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.dto';
import { ChangePostStatusDto } from '@gitroom/nestjs-libraries/dtos/posts/change.post.status.dto';
import { UpdatePostSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/update.post.settings.dto';
import { VideoDto } from '@gitroom/nestjs-libraries/dtos/videos/video.dto';
import { VideoFunctionDto } from '@gitroom/nestjs-libraries/dtos/videos/video.function.dto';
import { UploadDto } from '@gitroom/nestjs-libraries/dtos/media/upload.dto';
import { GetMediaDto } from '@gitroom/nestjs-libraries/dtos/media/get.media.dto';
import { ClippingDto } from '@gitroom/nestjs-libraries/dtos/clipping/clipping.dto';
import { ConnectLinkDto } from '@gitroom/nestjs-libraries/dtos/integrations/connect.link.dto';
import { ClippingService } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { GetNotificationsDto } from '@gitroom/nestjs-libraries/dtos/notifications/get.notifications.dto';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { AdminStatsService } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { GetOrgActivityDto } from '@gitroom/nestjs-libraries/dtos/analytics/get.org.activity.dto';
import { ResetCreditsDto } from '@gitroom/nestjs-libraries/dtos/billing/reset.credits.dto';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
export declare class PublicIntegrationsController {
    private _integrationService;
    private _postsService;
    private _mediaService;
    private _notificationService;
    private _integrationManager;
    private _refreshIntegrationService;
    private _usersService;
    private _adminStatsService;
    private _organizationService;
    private _clippingService;
    private _subscriptionService;
    constructor(_integrationService: IntegrationService, _postsService: PostsService, _mediaService: MediaService, _notificationService: NotificationService, _integrationManager: IntegrationManager, _refreshIntegrationService: RefreshIntegrationService, _usersService: UsersService, _adminStatsService: AdminStatsService, _organizationService: OrganizationService, _clippingService: ClippingService, _subscriptionService: SubscriptionService);
    uploadSimple(org: Organization, file: Express.Multer.File, adjust?: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    uploadsFromUrl(org: Organization, body: UploadDto): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    findSlotIntegration(org: Organization, id?: string): Promise<{
        date: string;
    }>;
    getPosts(org: Organization, query: GetPostsDto): Promise<{
        posts: any[];
    }>;
    createPost(org: Organization, rawBody: any): Promise<any[]>;
    deletePost(org: Organization, id: string): Promise<{
        id: string;
        error?: undefined;
    } | {
        error: boolean;
        id?: undefined;
    }>;
    deletePostByGroup(org: Organization, group: string): Promise<{
        id: string;
        error?: undefined;
    } | {
        error: boolean;
        id?: undefined;
    }>;
    getActiveIntegrations(org: Organization): Promise<{
        connected: boolean;
    }>;
    getMedia(org: Organization, query: GetMediaDto): Promise<{
        pages: number;
        results: {
            id: string;
            name: string;
            originalName: string;
            path: string;
            createdAt: Date;
        }[];
    }>;
    getMediaStatus(org: Organization, id: string): Promise<{
        id: string;
        path: string;
        status: string;
        warning?: undefined;
        error?: undefined;
    } | {
        id: string;
        path: string;
        status: string;
        warning: string;
        error?: undefined;
    } | {
        id: string;
        path: string;
        status: string;
        error: string;
        warning?: undefined;
    }>;
    getMe(org: Organization, userId?: string): Promise<{
        organization: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            picture: string;
        };
    }>;
    listGroups(org: Organization): Promise<{
        id: string;
        name: string;
    }[]>;
    listIntegration(org: Organization, group?: string): Promise<{
        id: string;
        name: string;
        identifier: string;
        picture: string;
        disabled: boolean;
        profile: string;
        customer: {
            id: string;
            name: string;
        };
    }[]>;
    getIntegrationUrl(integration: string, refresh: string, org: Organization): Promise<{
        url: string;
    }>;
    createConnectLink(org: Organization, body: ConnectLinkDto): Promise<{
        url: string;
    }>;
    listUsers(org: Organization, name: string): Promise<{
        organization: {
            subscription: {
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                identifier: string;
                cancelAt: Date;
                period: import(".prisma/client").$Enums.Period;
                isLifetime: boolean;
            };
            id: string;
            name: string;
            paymentId: string;
            deletedAt: Date;
        };
        user: {
            email: string;
            id: string;
            name: string;
            deletedAt: Date;
            providerName: import(".prisma/client").$Enums.Provider;
            activated: boolean;
        };
        id: string;
        disabled: boolean;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getPostTimeline(org: Organization, id: string): Promise<{
        error: string;
        integration: {
            id: string;
            name: string;
            deletedAt: Date;
            disabled: boolean;
            providerIdentifier: string;
            refreshNeeded: boolean;
        };
        errors: {
            id: string;
            createdAt: Date;
            message: string;
            platform: string;
            body: string;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        publishDate: Date;
        state: import(".prisma/client").$Enums.State;
        group: string;
        parentPostId: string;
        releaseId: string;
        releaseURL: string;
        creationMethod: import(".prisma/client").$Enums.CreationMethod;
        childrenPost: {
            error: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            publishDate: Date;
            state: import(".prisma/client").$Enums.State;
            group: string;
            parentPostId: string;
            releaseId: string;
            releaseURL: string;
            creationMethod: import(".prisma/client").$Enums.CreationMethod;
        }[];
    }>;
    getAccountOverview(org: Organization): Promise<{
        organization: {
            id: string;
            name: string;
            createdAt: Date;
            deletedAt: Date;
            allowTrial: boolean;
            isTrailing: boolean;
        };
        subscription: {
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            identifier: string;
            cancelAt: Date;
            period: import(".prisma/client").$Enums.Period;
            totalChannels: number;
            isLifetime: boolean;
        };
        owner: {
            role: import(".prisma/client").$Enums.Role;
            memberSince: Date;
            email: string;
            id: string;
            createdAt: Date;
            providerName: import(".prisma/client").$Enums.Provider;
            activated: boolean;
            lastOnline: Date;
        };
        users: {
            total: number;
            activated: number;
            disabled: number;
            lastOnlineMax: Date;
        };
    }>;
    getChannelHealth(org: Organization, includeDeleted: boolean): Promise<{
        lastPublishedAt: Date;
        lastPublishedPostId: string;
        lastPublishedUrl: string;
        lastErrorAt: Date;
        lastErrorPostId: string;
        lastError: string;
        customer: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date;
        disabled: boolean;
        type: string;
        internalId: string;
        providerIdentifier: string;
        tokenExpiration: Date;
        inBetweenSteps: boolean;
        refreshNeeded: boolean;
    }[]>;
    getOrgActivity(org: Organization, includeDeleted: boolean, query: GetOrgActivityDto): Promise<import("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository").OrgActivityResponse>;
    resetCredits(org: Organization, body: ResetCreditsDto): Promise<{
        deleted: number;
    }>;
    getNotifications(org: Organization, query: GetNotificationsDto): Promise<{
        notifications: {
            link: string;
            id: string;
            createdAt: Date;
            content: string;
        }[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    generateVideo(org: Organization, body: VideoDto): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    videoFunction(body: VideoFunctionDto): Promise<any>;
    startClipping(org: Organization, body: ClippingDto): Promise<{
        id: string;
    }>;
    getClippings(org: Organization, page: number): Promise<{
        pages: number;
        results: {
            error: string;
            id: string;
            createdAt: Date;
            thumbnail: string;
            status: string;
            title: string;
            url: string;
            duration: number;
        }[];
    }>;
    getClipping(org: Organization, id: string): Promise<{
        error: string;
        id: string;
        createdAt: Date;
        thumbnail: string;
        status: string;
        title: string;
        url: string;
        clips: {
            error: string;
            id: string;
            path: string;
            thumbnail: string;
            status: string;
            content: string;
            title: string;
            start: number;
            end: number;
            mediaId: string;
        }[];
        duration: number;
    }>;
    deleteChannel(org: Organization, id: string): Promise<{
        id: string;
    }>;
    getIntegrationSettings(org: Organization, id: string): Promise<{
        output: {
            rules: string;
            maxLength: number;
            settings: {};
            tools: any[];
        };
    } | {
        output: {
            rules: string;
            maxLength: number;
            settings: string | import("openapi3-ts").SchemaObject;
            tools: {
                description: string;
                dataSchema: any;
                methodName: string;
            }[];
        };
    }>;
    getMissingContent(org: Organization, id: string): Promise<{
        id: string;
        url: string;
    }[]>;
    updatePostSettings(org: Organization, id: string, body: UpdatePostSettingsDto): Promise<{
        postId: string;
        publishDate: string;
    }>;
    changePostStatus(org: Organization, id: string, body: ChangePostStatusDto): Promise<{
        id: string;
        state: "QUEUE" | "DRAFT";
    }>;
    updateReleaseId(org: Organization, id: string, releaseId: string): Promise<{
        error: string | null;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        publishDate: Date;
        state: import(".prisma/client").$Enums.State;
        integrationId: string;
        content: string;
        delay: number;
        group: string;
        title: string | null;
        parentPostId: string | null;
        releaseId: string | null;
        releaseURL: string | null;
        settings: string | null;
        image: string | null;
        submittedForOrderId: string | null;
        submittedForOrganizationId: string | null;
        approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
        creationMethod: import(".prisma/client").$Enums.CreationMethod;
        lastMessageId: string | null;
        intervalInDays: number | null;
    }>;
    getAnalytics(org: Organization, integration: string, date: string): Promise<import("@gitroom/nestjs-libraries/integrations/social/social.integrations.interface").AnalyticsData[]>;
    getPostAnalytics(org: Organization, postId: string, date: string): Promise<import("@gitroom/nestjs-libraries/integrations/social/social.integrations.interface").AnalyticsData[] | {
        missing: true;
    }>;
    triggerIntegrationTool(org: Organization, id: string, body: {
        methodName: string;
        data: Record<string, string>;
    }): Promise<{
        output: any;
    }>;
}

import { PostsRepository } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.repository';
import { CreatePostDto } from '@gitroom/nestjs-libraries/dtos/posts/create.post.dto';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { Integration, Post, CreationMethod, State } from '@prisma/client';
import { GetPostsDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.dto';
import { GetPostsListDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.list.dto';
import { CreateGeneratedPostsDto } from '@gitroom/nestjs-libraries/dtos/generator/create.generated.posts.dto';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { ShortLinkService } from '@gitroom/nestjs-libraries/short-linking/short.link.service';
import { CreateTagDto } from '@gitroom/nestjs-libraries/dtos/posts/create.tag.dto';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { TemporalService } from 'nestjs-temporal-core';
import { AnalyticsData } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { RefreshIntegrationService } from '@gitroom/nestjs-libraries/integrations/refresh.integration.service';
import { CreatePublicCommentDto } from '@gitroom/nestjs-libraries/dtos/comments/add.comment.dto';
type PostWithConditionals = Post & {
    integration?: Integration;
    childrenPost: Post[];
};
export declare class PostsService {
    private _postRepository;
    private _integrationManager;
    private _integrationService;
    private _mediaService;
    private _shortLinkService;
    private _openaiService;
    private _temporalService;
    private _refreshIntegrationService;
    private storage;
    constructor(_postRepository: PostsRepository, _integrationManager: IntegrationManager, _integrationService: IntegrationService, _mediaService: MediaService, _shortLinkService: ShortLinkService, _openaiService: OpenaiService, _temporalService: TemporalService, _refreshIntegrationService: RefreshIntegrationService);
    searchForMissingThreeHoursPosts(): import(".prisma/client").Prisma.PrismaPromise<{
        integration: {
            providerIdentifier: string;
        };
        id: string;
        organizationId: string;
        publishDate: Date;
    }[]>;
    getPostState(id: string): import(".prisma/client").Prisma.Prisma__PostClient<{
        state: import(".prisma/client").$Enums.State;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updatePost(id: string, postId: string, releaseURL: string): import(".prisma/client").Prisma.Prisma__PostClient<{
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
        batchId: string | null;
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateResolvedRelease(id: string, orgId: string, releaseId: string, releaseURL: string): import(".prisma/client").Prisma.Prisma__PostClient<{
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
        batchId: string | null;
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getMissingContent(orgId: string, postId: string, forceRefresh?: boolean): Promise<{
        id: string;
        url: string;
    }[]>;
    getPostById(postId: string, orgId: string): Promise<{
        integration: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date | null;
            deletedAt: Date | null;
            organizationId: string;
            disabled: boolean;
            picture: string | null;
            type: string;
            profile: string | null;
            token: string;
            refreshToken: string | null;
            internalId: string;
            customName: string | null;
            providerIdentifier: string;
            tokenExpiration: Date | null;
            inBetweenSteps: boolean;
            refreshNeeded: boolean;
            postingTimes: string;
            customInstanceDetails: string | null;
            customerId: string | null;
            rootInternalId: string | null;
            additionalSettings: string | null;
        };
        submittedForOrder: {
            posts: {
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
                batchId: string | null;
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
            }[];
            ordersItems: {
                id: string;
                integrationId: string;
                orderId: string;
                quantity: number;
                price: number;
            }[];
            seller: {
                id: string;
                account: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.OrderStatus;
            buyerId: string;
            sellerId: string;
            messageGroupId: string;
            captureId: string | null;
        };
    } & {
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
        batchId: string | null;
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
    getPostTimeline(postId: string, orgId: string): Promise<{
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
    updateReleaseId(orgId: string, postId: string, releaseId: string): Promise<{
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
        batchId: string | null;
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
    resolveRelease(orgId: string, post: {
        id: string;
        releaseId: string;
        releaseURL: string;
        settings: string;
        integration: Integration;
    }): Promise<{
        releaseId: string;
        releaseURL: string;
        pending: boolean;
        unavailable: boolean;
    }>;
    getReleaseURL(orgId: string, postId: string, forceRefresh?: boolean): Promise<{
        releaseURL: string;
        pending?: boolean;
        unavailable?: boolean;
        reconnect?: boolean;
    }>;
    checkPostAnalytics(orgId: string, postId: string, date: number, forceRefresh?: boolean): Promise<AnalyticsData[] | {
        missing: true;
    }>;
    getStatistics(orgId: string, id: string): Promise<{
        clicks: {
            short: string;
            original: string;
            clicks: string;
        }[];
    }>;
    mapTypeToPost(body: CreatePostDto, organization: string, replaceDraft?: boolean): Promise<CreatePostDto>;
    getPostsRecursively(id: string, includeIntegration?: boolean, orgId?: string, isFirst?: boolean): Promise<PostWithConditionals[]>;
    getPosts(orgId: string, query: GetPostsDto): Promise<any[]>;
    getPostsMinified(orgId: string, query: GetPostsDto): Promise<Record<string, any>>;
    getPostsList(orgId: string, query: GetPostsListDto): Promise<Record<string, any>>;
    updateMedia(id: string, imagesList: any[], convertToJPEG?: boolean): Promise<any[]>;
    private isAllowedMediaPath;
    getPostGroupDebugExport(orgId: string, group: string): Promise<{
        type: "draft";
        shortLink: boolean;
        date: any;
        tags: any;
        posts: {
            integration: {
                id: string;
            };
            group: any;
            settings: any;
            value: {
                content: string;
                image: any;
                delay: number;
            }[];
        }[];
        _debug: {
            providerIdentifier: any;
            providerName: any;
            state: any;
            error: any;
            errors: {
                message: string;
                platform: string;
                body: string;
                createdAt: Date;
            }[];
            originalGroup: string;
            originalPublishDate: any;
            exportedAt: `${string}-${string}-${string}T${string}:${string}:${string}Z`;
        };
    }>;
    getPostsByGroup(orgId: string, group: string): Promise<{
        siblings: {
            group: string;
            posts: {
                image: any[];
                integration?: {
                    id: string;
                    name: string;
                    picture: string;
                    providerIdentifier: string;
                    profile: string;
                };
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
                batchId: string | null;
                title: string | null;
                parentPostId: string | null;
                releaseId: string | null;
                releaseURL: string | null;
                settings: string | null;
                submittedForOrderId: string | null;
                submittedForOrganizationId: string | null;
                approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
                creationMethod: import(".prisma/client").$Enums.CreationMethod;
                lastMessageId: string | null;
                intervalInDays: number | null;
                childrenPost: Post[];
            }[];
            integrationPicture: string;
            integration: string;
            settings: any;
        }[];
        group: string;
        posts: {
            image: any[];
            integration?: {
                id: string;
                name: string;
                picture: string;
                providerIdentifier: string;
                profile: string;
            };
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
            batchId: string | null;
            title: string | null;
            parentPostId: string | null;
            releaseId: string | null;
            releaseURL: string | null;
            settings: string | null;
            submittedForOrderId: string | null;
            submittedForOrganizationId: string | null;
            approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
            creationMethod: import(".prisma/client").$Enums.CreationMethod;
            lastMessageId: string | null;
            intervalInDays: number | null;
            childrenPost: Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    private groupForEditor;
    arrangePostsByGroup(all: any, parent?: string): PostWithConditionals[];
    getPost(orgId: string, id: string, convertToJPEG?: boolean): Promise<{
        group: string;
        posts: {
            image: any[];
            integration?: {
                id: string;
                name: string;
                picture: string;
                providerIdentifier: string;
                profile: string;
            };
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
            batchId: string | null;
            title: string | null;
            parentPostId: string | null;
            releaseId: string | null;
            releaseURL: string | null;
            settings: string | null;
            submittedForOrderId: string | null;
            submittedForOrganizationId: string | null;
            approvedSubmitForOrder: import(".prisma/client").$Enums.APPROVED_SUBMIT_FOR_ORDER;
            creationMethod: import(".prisma/client").$Enums.CreationMethod;
            lastMessageId: string | null;
            intervalInDays: number | null;
            childrenPost: Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    getOldPosts(orgId: string, date: string): Promise<{
        integration: {
            id: string;
            name: string;
            picture: string;
            type: string;
            providerIdentifier: string;
        };
        id: string;
        publishDate: Date;
        state: import(".prisma/client").$Enums.State;
        content: string;
        releaseURL: string;
    }[]>;
    updateTags(orgId: string, post: Post[]): Promise<Post[]>;
    checkInternalPlug(integration: Integration, orgId: string, id: string, settings: any): Promise<{
        type: string;
        post: string;
        originalIntegration: string;
        integration: string;
        plugName: string;
        orgId: string;
        delay: number;
        information: {
            name: string;
            integrations: {
                id: string;
            }[];
            delay: string;
            active: boolean;
        };
    }[]>;
    checkPlugs(orgId: string, providerName: string, integrationId: string): Promise<{
        type: string;
        plugId: string;
        delay: any;
        totalRuns: any;
    }[]>;
    deletePost(orgId: string, group: string): Promise<{
        id: string;
        error?: undefined;
    } | {
        error: boolean;
        id?: undefined;
    }>;
    countPostsFromDay(orgId: string, date: Date): Promise<number>;
    getPostByForWebhookId(id: string, integrationId: string): Promise<{
        integration: {
            id: string;
            name: string;
            picture: string;
            type: string;
            providerIdentifier: string;
        };
        id: string;
        publishDate: Date;
        state: import(".prisma/client").$Enums.State;
        content: string;
        releaseURL: string;
    }[]>;
    startWorkflow(taskQueue: string, postId: string, orgId: string, state: State): Promise<void>;
    validatePosts(orgId: string, posts: Array<{
        integration: {
            id: string;
        };
        value: Array<{
            content?: string;
            image?: Array<{
                path: string;
                thumbnail?: string;
            }>;
        }>;
        settings?: any;
    }>): Promise<{
        id: string;
        identifier: string;
        name: string;
        valid: boolean;
        settingsError: string;
        errors: string | true;
        emptyContent: boolean;
        tooLong: boolean;
        maximumCharacters: number;
    }[]>;
    private firstValidationError;
    createPost(orgId: string, body: CreatePostDto, creationMethod: CreationMethod, keepGroup?: boolean): Promise<any[]>;
    updatePostSettings(orgId: string, postId: string, settings: Record<string, any>, creationMethod: CreationMethod): Promise<{
        postId: string;
        publishDate: string;
    }>;
    separatePosts(content: string, len: number): Promise<{
        posts: any[];
    }>;
    changeState(id: string, state: State, err?: any, body?: any): Promise<{
        integration: {
            providerIdentifier: string;
        };
    } & {
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
        batchId: string | null;
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
    changePostStatus(orgId: string, id: string, status: 'draft' | 'schedule'): Promise<{
        id: string;
        state: "QUEUE" | "DRAFT";
    }>;
    changeDate(orgId: string, id: string, date: string, action?: 'schedule' | 'update'): Promise<{
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
        batchId: string | null;
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
    generatePostsDraft(orgId: string, body: CreateGeneratedPostsDto): Promise<void>;
    findAllExistingCategories(): import(".prisma/client").Prisma.PrismaPromise<{
        category: string;
    }[]>;
    findAllExistingTopicsOfCategory(category: string): import(".prisma/client").Prisma.PrismaPromise<{
        topic: string;
    }[]>;
    findPopularPosts(category: string, topic?: string): import(".prisma/client").Prisma.PrismaPromise<{
        content: string;
        hook: string;
    }[]>;
    findFreeDateTime(orgId: string, integrationId?: string): Promise<string>;
    createPopularPosts(post: {
        category: string;
        topic: string;
        content: string;
        hook: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        category: string;
        topic: string;
        hook: string;
    }>;
    private findFreeDateTimeRecursive;
    getComments(previewId: string): Promise<{
        id: string;
        postId: string;
        parentId: string;
        content: string;
        anchorStart: number;
        anchorEnd: number;
        anchorQuote: string;
        resolvedAt: Date;
        createdAt: Date;
        name: string;
    }[]>;
    createPublicComment(previewId: string, body: CreatePublicCommentDto, userId: string | null, ip: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        userId: string | null;
        content: string;
        postId: string;
        displayName: string | null;
        parentId: string | null;
        anchorStart: number | null;
        anchorEnd: number | null;
        anchorQuote: string | null;
        resolvedAt: Date | null;
    }>;
    private verifyRecaptcha;
    resolveComment(orgId: string, commentId: string, resolved: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        userId: string | null;
        content: string;
        postId: string;
        displayName: string | null;
        parentId: string | null;
        anchorStart: number | null;
        anchorEnd: number | null;
        anchorQuote: string | null;
        resolvedAt: Date | null;
    }>;
    detachStaleAnchors(posts: {
        id: string;
        content: string;
    }[]): Promise<void>;
    getTags(orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }[]>;
    createTag(orgId: string, body: CreateTagDto): import(".prisma/client").Prisma.Prisma__TagsClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    editTag(id: string, orgId: string, body: CreateTagDto): import(".prisma/client").Prisma.Prisma__TagsClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    deleteTag(id: string, orgId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }>;
}
export {};

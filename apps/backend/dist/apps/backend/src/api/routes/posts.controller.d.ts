import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { Organization, User } from '@prisma/client';
import { GetPostsDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.dto';
import { GetPostsListDto } from '@gitroom/nestjs-libraries/dtos/posts/get.posts.list.dto';
import { GeneratorDto } from '@gitroom/nestjs-libraries/dtos/generator/generator.dto';
import { CreateGeneratedPostsDto } from '@gitroom/nestjs-libraries/dtos/generator/create.generated.posts.dto';
import { AgentGraphService } from '@gitroom/nestjs-libraries/agent/agent.graph.service';
import { Response } from 'express';
import { ShortLinkService } from '@gitroom/nestjs-libraries/short-linking/short.link.service';
import { CreateTagDto } from '@gitroom/nestjs-libraries/dtos/posts/create.tag.dto';
import { CreatePublicCommentDto, ResolveCommentDto } from '@gitroom/nestjs-libraries/dtos/comments/add.comment.dto';
export declare class PostsController {
    private _postsService;
    private _agentGraphService;
    private _shortLinkService;
    constructor(_postsService: PostsService, _agentGraphService: AgentGraphService, _shortLinkService: ShortLinkService);
    getStatistics(org: Organization, id: string): Promise<{
        clicks: {
            short: string;
            original: string;
            clicks: string;
        }[];
    }>;
    getMissingContent(org: Organization, id: string): Promise<{
        id: string;
        url: string;
    }[]>;
    getReleaseURL(org: Organization, id: string): Promise<{
        releaseURL: string;
        pending?: boolean;
        unavailable?: boolean;
        reconnect?: boolean;
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
    shouldShortlink(body: {
        messages: string[];
    }): Promise<{
        ask: boolean;
    }>;
    createComment(user: User, id: string, body: CreatePublicCommentDto, ip: string): Promise<{
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
    resolveComment(org: Organization, commentId: string, body: ResolveCommentDto): Promise<{
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
    getTags(org: Organization): Promise<{
        tags: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            color: string;
            orgId: string;
        }[];
    }>;
    createTag(org: Organization, body: CreateTagDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }>;
    editTag(org: Organization, body: CreateTagDto, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }>;
    deleteTag(org: Organization, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        color: string;
        orgId: string;
    }>;
    getPosts(org: Organization, query: GetPostsDto): Promise<Record<string, any>>;
    findSlot(org: Organization): Promise<{
        date: string;
    }>;
    findSlotIntegration(org: Organization, id?: string): Promise<{
        date: string;
    }>;
    getPostsList(org: Organization, query: GetPostsListDto): Promise<Record<string, any>>;
    oldPosts(org: Organization, date: string): Promise<{
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
    getPostGroupDebugExport(org: Organization, user: User, group: string): Promise<{
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
    getPostsByGroup(org: Organization, group: string): Promise<{
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
                childrenPost: import(".prisma/client").Post[];
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
            childrenPost: import(".prisma/client").Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    getPost(org: Organization, id: string): Promise<{
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
            childrenPost: import(".prisma/client").Post[];
        }[];
        integrationPicture: string;
        integration: string;
        settings: any;
    }>;
    validatePosts(org: Organization, rawBody: any): Promise<{
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
    createPost(org: Organization, rawBody: any): Promise<any[]>;
    generatePostsDraft(org: Organization, body: CreateGeneratedPostsDto): Promise<void>;
    generatePosts(org: Organization, body: GeneratorDto, res: Response): Promise<void>;
    deletePost(org: Organization, group: string): Promise<{
        id: string;
        error?: undefined;
    } | {
        error: boolean;
        id?: undefined;
    }>;
    changeDate(org: Organization, id: string, date: string, action?: 'schedule' | 'update'): Promise<{
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
    separatePosts(org: Organization, body: {
        content: string;
        len: number;
    }): Promise<{
        posts: any[];
    }>;
}

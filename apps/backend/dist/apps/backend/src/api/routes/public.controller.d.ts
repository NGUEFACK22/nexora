import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
import { TrackEnum } from '@gitroom/nestjs-libraries/user/track.enum';
import { Request, Response } from 'express';
import { AgentGraphInsertService } from '@gitroom/nestjs-libraries/agent/agent.graph.insert.service';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OnlyURL } from '@gitroom/nestjs-libraries/dtos/webhooks/webhooks.dto';
import { CreatePublicCommentDto } from '@gitroom/nestjs-libraries/dtos/comments/add.comment.dto';
export declare class PublicController {
    private _trackService;
    private _agentGraphInsertService;
    private _postsService;
    private _subscriptionService;
    constructor(_trackService: TrackService, _agentGraphInsertService: AgentGraphInsertService, _postsService: PostsService, _subscriptionService: SubscriptionService);
    createAgent(body: {
        text: string;
        apiKey: string;
    }): Promise<import("@langchain/langgraph").StateType<import("@langchain/langgraph").StateDefinition>>;
    getPreview(id: string): Promise<{
        integration?: {
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
        } | {
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
    }[]>;
    getComments(postId: string): Promise<{
        comments: {
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
        }[];
    }>;
    createComment(postId: string, body: CreatePublicCommentDto, ip: string): Promise<{
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
    trackEvent(res: Response, req: Request, ip: string, userAgent: string, body: {
        fbclid?: string;
        tt: TrackEnum;
        additional: Record<string, any>;
    }): Promise<void>;
    modifySubscription(params: string): Promise<{
        success: boolean;
    }>;
    streamFile(query: OnlyURL, res: Response, req: Request): Promise<Response<any, Record<string, any>>>;
}

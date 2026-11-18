import { Organization } from '@prisma/client';
import { ApplicationFailure } from '@temporalio/common';
import { TemporalService } from 'nestjs-temporal-core';
import { ClippingRepository } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.repository';
import { ClippingDto } from '@gitroom/nestjs-libraries/dtos/clipping/clipping.dto';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { DeepgramService } from '@gitroom/nestjs-libraries/deepgram/deepgram.service';
export declare class ClippingStop extends ApplicationFailure {
    constructor(message: string);
}
export type ClippingJobState = 'pending' | 'retry' | 'done' | 'failed';
export declare class ClippingService {
    private _clippingRepository;
    private _subscriptionService;
    private _organizationService;
    private _integrationService;
    private _postsService;
    private _mediaService;
    private _openAi;
    private _deepgram;
    private _temporalService;
    private storage;
    private ingest;
    private clipper;
    constructor(_clippingRepository: ClippingRepository, _subscriptionService: SubscriptionService, _organizationService: OrganizationService, _integrationService: IntegrationService, _postsService: PostsService, _mediaService: MediaService, _openAi: OpenaiService, _deepgram: DeepgramService, _temporalService: TemporalService);
    private keys;
    private clipKeys;
    private putJson;
    private getJson;
    private removeFiles;
    private failureMessage;
    private isYoutubeUrl;
    private balance;
    private isStale;
    startClipping(org: Organization, body: ClippingDto): Promise<{
        id: string;
    }>;
    private createClipping;
    getClipping(org: string, id: string): Promise<{
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
            start: number;
            end: number;
            content: string;
            title: string;
            mediaId: string;
        }[];
        duration: number;
    }>;
    waitForClipping(org: string, id: string, seconds: number): Promise<{
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
            start: number;
            end: number;
            content: string;
            title: string;
            mediaId: string;
        }[];
        duration: number;
    }>;
    createWidgetTicket(org: string, id: string): Promise<string>;
    getWidgetProgress(org: string, id: string, sawRunning: boolean): Promise<{
        report: boolean;
        error: string;
        id: string;
        status: string;
        title: string;
        clips: {
            error: string;
            id: string;
            path: string;
            thumbnail: string;
            status: string;
            title: string;
            mediaId: string;
        }[];
    }>;
    getWidgetTicket(ticket: string): Promise<{
        org: string;
        id: string;
    }>;
    getClippings(org: string, page: number): Promise<{
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
    submitAnalyse(clippingId: string): Promise<string>;
    checkAnalyse(clippingId: string, jobId: string): Promise<{
        state: ClippingJobState;
        transcribe?: boolean;
    }>;
    transcribe(clippingId: string): Promise<void>;
    pickClips(clippingId: string): Promise<string[]>;
    submitClipFetch(clipId: string): Promise<string>;
    checkClipFetch(clipId: string, jobId: string): Promise<{
        state: ClippingJobState;
    }>;
    captionClip(clipId: string): Promise<void>;
    submitClipRender(clipId: string): Promise<string>;
    checkClipRender(clipId: string, jobId: string): Promise<{
        state: ClippingJobState;
    }>;
    failClip(clipId: string, error: string, customer?: boolean): Promise<{
        id: string;
        status: string;
    }>;
    private removeUnfinishedClipFiles;
    createDrafts(clippingId: string): Promise<void>;
    finishClipping(clippingId: string): Promise<{
        id: string;
        status: string;
    }>;
    failClipping(clippingId: string, error: string, customer?: boolean): Promise<{
        id: string;
        status: string;
    }>;
}

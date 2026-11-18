import { MediaRepository } from '@gitroom/nestjs-libraries/database/prisma/media/media.repository';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { Organization } from '@prisma/client';
import { SaveMediaInformationDto } from '@gitroom/nestjs-libraries/dtos/media/save.media.information.dto';
import { VideoManager } from '@gitroom/nestjs-libraries/videos/video.manager';
import { VideoDto } from '@gitroom/nestjs-libraries/dtos/videos/video.dto';
import { TemporalService } from 'nestjs-temporal-core';
export declare class MediaService {
    private _mediaRepository;
    private _openAi;
    private _subscriptionService;
    private _videoManager;
    private _temporalService;
    private storage;
    private processor;
    constructor(_mediaRepository: MediaRepository, _openAi: OpenaiService, _subscriptionService: SubscriptionService, _videoManager: VideoManager, _temporalService: TemporalService);
    deleteMedia(org: string, id: string): Promise<{
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
    }>;
    getMediaById(id: string): import(".prisma/client").Prisma.Prisma__MediaClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    generateImage(prompt: string, org: Organization, generatePromptFirst?: boolean): Promise<string>;
    uploadFromUrl(org: string, url: string, adjust?: boolean): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    saveFile(org: string, fileName: string, filePath: string, originalName?: string): import(".prisma/client").Prisma.Prisma__MediaClient<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    saveUploadedFile(org: string, fileName: string, filePath: string, originalName?: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    private releaseUnprocessed;
    createUploadSession(org: string): Promise<string>;
    private checkUploadSession;
    createUploadTicket(org: string, sessionId: string): Promise<string>;
    getUploadTicket(ticket: string): Promise<{
        org: string;
        sessionId: string;
    }>;
    saveUploadSessionFile(org: string, sessionId: string, fileName: string, filePath: string, originalName?: string, adjust?: boolean): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    getUploadSession(org: string, sessionId: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
        processingError: string;
    }[]>;
    getMediaStatus(org: string, id: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
        processingError: string;
    }>;
    toUploadStatus(media: {
        id: string;
        name: string;
        path: string;
        status: string;
    }): {
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
    };
    getMediaUploadStatus(org: string, id: string): Promise<{
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
    private normalizedName;
    submitProcessing(mediaId: string): Promise<string>;
    checkProcessing(mediaId: string, jobId: string): Promise<boolean>;
    failProcessing(mediaId: string, error: string): Promise<{
        id: string;
        status: string;
    }>;
    getMedia(org: string, page: number, search?: string): Promise<{
        pages: number;
        results: {
            id: string;
            name: string;
            createdAt: Date;
            originalName: string;
            path: string;
            thumbnail: string;
            alt: string;
            thumbnailTimestamp: number;
        }[];
    }>;
    saveMediaInformation(org: string, data: SaveMediaInformationDto): import(".prisma/client").Prisma.Prisma__MediaClient<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        thumbnailTimestamp: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getVideoOptions(): {
        identifier: string;
        title: string;
        dto: any;
        description: string;
        target: import("../../../videos/video.interface").VideoAbstract<any>;
        tools: {
            functionName: string;
            output: string;
        }[];
        placement: string;
        trial: boolean;
    }[];
    generateVideoAllowed(org: Organization, type: string): Promise<boolean>;
    private validateVideoRequest;
    generateVideo(org: Organization, body: VideoDto): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    startGenerateVideo(org: Organization, body: VideoDto): Promise<{
        jobId: string;
    }>;
    getGenerateVideoStatus(org: Organization, jobId: string): Promise<{
        status: 'pending' | 'completed' | 'failed';
        id?: string;
        path?: string;
        error?: string;
    }>;
    videoFunction(identifier: string, functionName: string, body: any): Promise<any>;
}

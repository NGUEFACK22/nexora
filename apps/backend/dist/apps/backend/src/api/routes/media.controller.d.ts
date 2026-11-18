import { Request, Response } from 'express';
import { Organization } from '@prisma/client';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { SaveMediaInformationDto } from '@gitroom/nestjs-libraries/dtos/media/save.media.information.dto';
import { VideoDto } from '@gitroom/nestjs-libraries/dtos/videos/video.dto';
import { VideoFunctionDto } from '@gitroom/nestjs-libraries/dtos/videos/video.function.dto';
export declare class MediaController {
    private _mediaService;
    private _subscriptionService;
    private storage;
    constructor(_mediaService: MediaService, _subscriptionService: SubscriptionService);
    deleteMedia(org: Organization, id: string): Promise<{
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
    generateVideo(org: Organization, body: VideoDto): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    generateImage(org: Organization, req: Request, prompt: string, isPicturePrompt?: boolean): Promise<false | {
        output: string;
    }>;
    generateImageFromText(org: Organization, req: Request, prompt: string): Promise<false | {
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    uploadServer(org: Organization, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    saveMedia(org: Organization, req: Request, name: string, originalName: string): Promise<false | {
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    saveMediaInformation(org: Organization, body: SaveMediaInformationDto): import(".prisma/client").Prisma.Prisma__MediaClient<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        thumbnailTimestamp: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    uploadSimple(org: Organization, file: Express.Multer.File, preventSave?: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    } | {
        path: string;
    }>;
    uploadFile(org: Organization, req: Request, res: Response, endpoint: string): Promise<import("@aws-sdk/client-s3").CompleteMultipartUploadCommandOutput | Response<any, Record<string, any>>>;
    getMediaStatus(org: Organization, id: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
        processingError: string;
    }>;
    getMedia(org: Organization, page: number, search?: string): Promise<{
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
    getVideos(): {
        identifier: string;
        title: string;
        dto: any;
        description: string;
        target: import("@gitroom/nestjs-libraries/videos/video.interface").VideoAbstract<any>;
        tools: {
            functionName: string;
            output: string;
        }[];
        placement: string;
        trial: boolean;
    }[];
    videoFunction(body: VideoFunctionDto): Promise<any>;
    generateVideoAllowed(org: Organization, type: string): Promise<boolean>;
}

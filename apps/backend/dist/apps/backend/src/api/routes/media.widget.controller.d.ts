import { Request } from 'express';
import { Organization } from '@prisma/client';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
export declare class MediaWidgetController {
    private _mediaService;
    constructor(_mediaService: MediaService);
    upload(org: Organization, req: Request, file: Express.Multer.File, adjust?: string): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
    }>;
    status(org: Organization, req: Request): Promise<{
        id: string;
        name: string;
        originalName: string;
        path: string;
        thumbnail: string;
        alt: string;
        status: string;
        processingError: string;
    }[]>;
}

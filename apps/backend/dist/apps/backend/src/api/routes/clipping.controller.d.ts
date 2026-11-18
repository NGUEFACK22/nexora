import { Organization } from '@prisma/client';
import { ClippingService } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service';
import { ClippingDto } from '@gitroom/nestjs-libraries/dtos/clipping/clipping.dto';
export declare class ClippingController {
    private _clippingService;
    constructor(_clippingService: ClippingService);
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
            start: number;
            end: number;
            content: string;
            title: string;
            mediaId: string;
        }[];
        duration: number;
    }>;
}

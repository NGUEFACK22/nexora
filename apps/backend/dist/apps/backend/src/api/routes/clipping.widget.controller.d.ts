import { Request } from 'express';
import { Organization } from '@prisma/client';
import { ClippingService } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service';
export declare class ClippingWidgetController {
    private _clippingService;
    constructor(_clippingService: ClippingService);
    status(org: Organization, req: Request, seen?: string): Promise<{
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
}

import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
export declare class UploadWidgetAuthMiddleware implements NestMiddleware {
    private _mediaService;
    constructor(_mediaService: MediaService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}

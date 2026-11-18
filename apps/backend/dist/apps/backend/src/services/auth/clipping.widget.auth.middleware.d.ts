import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClippingService } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service';
export declare class ClippingWidgetAuthMiddleware implements NestMiddleware {
    private _clippingService;
    constructor(_clippingService: ClippingService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}

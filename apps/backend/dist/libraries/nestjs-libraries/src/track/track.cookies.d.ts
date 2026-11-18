import { Request, Response } from 'express';
export declare const applyTrackCookies: (req: Request, res: Response, fbclid?: string) => {
    uniqueId: any;
    fbc: any;
    fbp: any;
};

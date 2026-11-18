import { Request } from 'express';
import { StorageEngine } from 'multer';
import { IUploadProvider } from './upload.interface';
export declare class MulterStreamEngine implements StorageEngine {
    private storage;
    constructor(storage: IUploadProvider);
    _handleFile(req: Request, file: Express.Multer.File, cb: (error?: any, info?: Partial<Express.Multer.File>) => void): void;
    _removeFile(req: Request, file: Express.Multer.File, cb: (error: Error | null) => void): void;
}
export declare function streamUploadOptions(): {
    storage: MulterStreamEngine;
    limits: {
        fileSize: number;
    };
};

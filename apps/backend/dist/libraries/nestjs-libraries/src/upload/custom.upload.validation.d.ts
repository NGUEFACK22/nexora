import { Transform } from 'stream';
import { IUploadProvider } from './upload.interface';
export declare const UPLOAD_ALLOWED_MIME: Set<string>;
export declare function getMaxSize(mimeType: string): number;
export declare function maxSizeStream(maxSize: number): Transform;
export declare function uploadStreamToStorage(storage: IUploadProvider, webStream: ReadableStream, declaredSize?: number): Promise<{
    ext: string;
    filename: string;
    originalname: string;
    path: string;
    mimetype: string;
}>;

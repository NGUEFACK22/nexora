import { IUploadProvider, UploadedStream } from './upload.interface';
import { Readable } from 'stream';
export declare class LocalStorage implements IUploadProvider {
    private uploadDirectory;
    constructor(uploadDirectory: string);
    private newFilePath;
    uploadSimple(path: string): Promise<string>;
    uploadFile(file: Express.Multer.File): Promise<any>;
    uploadStream(stream: Readable, mimetype: string, ext: string): Promise<UploadedStream>;
    removeFile(filePath: string): Promise<void>;
}

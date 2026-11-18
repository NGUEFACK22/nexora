import { Readable } from 'stream';
export interface UploadedStream {
    filename: string;
    originalname: string;
    path: string;
    mimetype: string;
}
export interface IUploadProvider {
    uploadSimple(path: string): Promise<string>;
    uploadFile(file: Express.Multer.File): Promise<any>;
    uploadStream(stream: Readable, mimetype: string, ext: string): Promise<UploadedStream>;
    removeFile(filePath: string): Promise<void>;
    signDownloadUrl?(fileName: string): Promise<string>;
    signUploadUrl?(fileName: string, contentType: string): Promise<string>;
    publicUrl?(fileName: string): string;
    readFile?(fileName: string): Promise<string>;
    writeFile?(fileName: string, body: string, contentType: string): Promise<void>;
}

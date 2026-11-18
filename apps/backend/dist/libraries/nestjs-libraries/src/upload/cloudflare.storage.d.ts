import { Readable } from 'stream';
import 'multer';
import { IUploadProvider, UploadedStream } from './upload.interface';
declare class CloudflareStorage implements IUploadProvider {
    private region;
    private _bucketName;
    private _uploadUrl;
    private _client;
    constructor(accountID: string, accessKey: string, secretKey: string, region: string, _bucketName: string, _uploadUrl: string);
    uploadSimple(path: string): Promise<string>;
    uploadFile(file: Express.Multer.File): Promise<any>;
    uploadStream(stream: Readable, mimetype: string, ext: string): Promise<UploadedStream>;
    signDownloadUrl(fileName: string): Promise<string>;
    signUploadUrl(fileName: string, contentType: string): Promise<string>;
    publicUrl(fileName: string): string;
    readFile(fileName: string): Promise<string>;
    writeFile(fileName: string, body: string, contentType: string): Promise<void>;
    removeFile(filePath: string): Promise<void>;
}
export { CloudflareStorage };
export default CloudflareStorage;

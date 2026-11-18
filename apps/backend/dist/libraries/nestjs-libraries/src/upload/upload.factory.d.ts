import { IUploadProvider } from './upload.interface';
import { IMediaProcessor } from './media.processor.interface';
import { ClipJob, ClipResult, IngestJob, IngestResult } from './clipping.processor.interface';
export declare class UploadFactory {
    static createStorage(): IUploadProvider;
    static processorEnabled(): boolean;
    static createProcessor(): IMediaProcessor | null;
    static clippingEnabled(): boolean;
    static createIngestProcessor(): IMediaProcessor<IngestJob, IngestResult> | null;
    static createClipProcessor(): IMediaProcessor<ClipJob, ClipResult> | null;
}

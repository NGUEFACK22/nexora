import { ClippingTranscript } from '@gitroom/nestjs-libraries/upload/clipping.processor.interface';
export declare class DeepgramService {
    transcribeUrl(url: string): Promise<ClippingTranscript>;
}

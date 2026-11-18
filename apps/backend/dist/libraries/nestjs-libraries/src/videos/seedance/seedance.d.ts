import { URL, VideoAbstract } from '@gitroom/nestjs-libraries/videos/video.interface';
declare class Image {
    id: string;
    path: string;
}
declare class SeedanceParams {
    prompt: string;
    images: Image[];
}
export declare class Seedance extends VideoAbstract<SeedanceParams> {
    dto: typeof SeedanceParams;
    process(output: 'vertical' | 'horizontal', customParams: SeedanceParams): Promise<URL>;
}
export {};

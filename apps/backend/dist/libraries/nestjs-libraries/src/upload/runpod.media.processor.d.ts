import { IMediaProcessor, MediaProcessorJob, MediaProcessorResult, MediaProcessorStatus } from './media.processor.interface';
export declare class RunPodMediaProcessor<Job = MediaProcessorJob, Result = MediaProcessorResult> implements IMediaProcessor<Job, Result> {
    private _apiKey;
    private _baseUrl;
    constructor(_apiKey: string, endpointId: string);
    private request;
    submit(job: Job): Promise<string>;
    status(jobId: string): Promise<MediaProcessorStatus<Result>>;
}

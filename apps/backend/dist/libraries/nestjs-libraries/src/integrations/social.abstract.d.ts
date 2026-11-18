import { Integration } from '@prisma/client';
import { AuthTokenDetails, PendingCheckResponse } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { ApplicationFailure } from '@temporalio/activity';
import { Readable } from 'stream';
export declare const stripQuery: (url: string) => string;
export type ValidityMedia = {
    path: string;
    thumbnail?: string;
    alt?: string;
};
export declare function truncateForTemporal(value: any, max: number): string;
export declare class RefreshToken extends ApplicationFailure {
    constructor(identifier: string, json: string, body: BodyInit, message?: string);
}
export declare class Disconnect extends ApplicationFailure {
    constructor(identifier: string, json: string, body: BodyInit, message?: string);
}
export declare class PublishedWithError extends ApplicationFailure {
    readonly postDbId: string;
    readonly releaseId: string;
    readonly releaseURL: string;
    constructor(identifier: string, postDbId: string, releaseId: string, releaseURL: string, message?: string);
}
export declare function rangeReadFailure(response: {
    status: number;
    statusText: string;
    ok: boolean;
}): string;
export declare class BadBody extends ApplicationFailure {
    constructor(identifier: string, json: string, body: BodyInit, message?: string);
}
export declare class NotEnoughScopes {
    message: string;
    constructor(message?: string);
}
export declare abstract class SocialAbstract {
    abstract identifier: string;
    maxConcurrentJob: number;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body' | 'retry' | 'disconnect';
        value: string;
    } | undefined;
    migrationMatch(auth: Pick<AuthTokenDetails, 'id' | 'username'>, integration: Omit<Integration, 'token' | 'refreshToken'>): boolean;
    checkValidity(posts: Array<ValidityMedia[]>, settings: any, additionalSettings: any[]): Promise<string | true>;
    checkPostStatus(accessToken: string, pendingData: any, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: any, integration: Integration): Promise<PendingCheckResponse>;
    protected getSsrfSafeAxios(): import("axios").AxiosInstance;
    protected assetBoolean(value: boolean | string): boolean;
    protected getImageDimensions(path: string): Promise<{
        width: number;
        height: number;
    }>;
    protected readOrFetch(path: string, retried?: boolean): Promise<Buffer>;
    protected mediaSize(path: string, identifier?: string): Promise<number>;
    protected localMediaPath(path: string, identifier?: string): string;
    protected mediaChunk(path: string, start: number, end: number, identifier?: string, retried?: boolean): Promise<Buffer>;
    protected mediaStream(path: string, identifier?: string): Promise<Readable>;
    protected runStreamedUpload<T>(func: () => Promise<T>, identifier?: string, totalRetries?: number): Promise<T>;
    mention(token: string, d: {
        query: string;
    }, id: string, integration: Integration): Promise<{
        id: string;
        label: string;
        image: string;
        doNotCache?: boolean;
    }[] | {
        none: true;
    }>;
    runInConcurrent<T>(func: (...args: any[]) => Promise<T>, ignoreConcurrency?: boolean): Promise<any>;
    fetch(url: string, options?: RequestInit, identifier?: string, totalRetries?: number, ignoreConcurrency?: boolean, message?: string): Promise<Response>;
    checkScopes(required: string[], got: string | string[]): boolean;
}

import type { SelfHostedInstance } from '@gitroom/nestjs-libraries/chat/mcp.relay.service';
type Ctx = {
    requestId: string;
    auth: any;
    relay?: SelfHostedInstance & {
        id: string;
    };
};
export declare function runWithContext<T>(ctx: Ctx, fn: () => Promise<T> | T): T | Promise<T>;
export declare function getContext(): Ctx | undefined;
export declare function getAuth<T = any>(): T | undefined;
export declare function getRequestId(): string | undefined;
export declare function getRelay(): Ctx['relay'];
export {};

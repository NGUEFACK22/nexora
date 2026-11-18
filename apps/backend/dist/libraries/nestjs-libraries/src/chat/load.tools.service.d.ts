import { ModuleRef } from '@nestjs/core';
export declare const AgentState: import("zod").ZodObject<{
    proverbs: import("zod").ZodDefault<import("zod").ZodArray<import("zod").ZodString, "many">>;
}, "strip", import("zod").ZodTypeAny, {
    proverbs?: string[];
}, {
    proverbs?: string[];
}>;
export declare class LoadToolsService {
    private _moduleRef;
    constructor(_moduleRef: ModuleRef);
    loadTools(mcpOnly?: boolean): Promise<Record<string, any>>;
    coreToolNames(): string[];
    agent(): Promise<any>;
}

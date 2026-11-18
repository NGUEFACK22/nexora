import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { LoadToolsService } from '@gitroom/nestjs-libraries/chat/load.tools.service';
export interface SelfHostedInstance {
    mcpUrl: string;
    apiKey: string;
}
export declare class McpRelayService {
    private _oauthService;
    private _loadToolsService;
    constructor(_oauthService: OAuthService, _loadToolsService: LoadToolsService);
    connect(instanceUrl: string, apiKey?: string): Promise<SelfHostedInstance>;
    tools(source: Record<string, any>): {
        [k: string]: import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, any, unknown>;
    };
    callTool(instance: SelfHostedInstance & {
        id?: string;
    }, name: string, args: Record<string, unknown>, signal?: AbortSignal): Promise<{
        [x: string]: unknown;
        content: ({
            type: "text";
            text: string;
            annotations?: {
                audience?: ("user" | "assistant")[];
                priority?: number;
                lastModified?: string;
            };
            _meta?: {
                [x: string]: unknown;
            };
        } | {
            type: "image";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("user" | "assistant")[];
                priority?: number;
                lastModified?: string;
            };
            _meta?: {
                [x: string]: unknown;
            };
        } | {
            type: "audio";
            data: string;
            mimeType: string;
            annotations?: {
                audience?: ("user" | "assistant")[];
                priority?: number;
                lastModified?: string;
            };
            _meta?: {
                [x: string]: unknown;
            };
        } | {
            uri: string;
            name: string;
            type: "resource_link";
            description?: string;
            mimeType?: string;
            size?: number;
            annotations?: {
                audience?: ("user" | "assistant")[];
                priority?: number;
                lastModified?: string;
            };
            _meta?: {
                [x: string]: unknown;
            };
            icons?: {
                src: string;
                mimeType?: string;
                sizes?: string[];
                theme?: "light" | "dark";
            }[];
            title?: string;
        } | {
            type: "resource";
            resource?: {
                uri: string;
                text: string;
                mimeType?: string;
                _meta?: {
                    [x: string]: unknown;
                };
            } | {
                uri: string;
                blob: string;
                mimeType?: string;
                _meta?: {
                    [x: string]: unknown;
                };
            };
            annotations?: {
                audience?: ("user" | "assistant")[];
                priority?: number;
                lastModified?: string;
            };
            _meta?: {
                [x: string]: unknown;
            };
        })[];
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number;
            "io.modelcontextprotocol/related-task"?: {
                taskId: string;
            };
        };
        structuredContent?: {
            [x: string]: unknown;
        };
        isError?: boolean;
    }>;
    private withClient;
    private failure;
    private text;
    private describeError;
}

import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { ClippingService } from '@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service';
export declare class ClippingWidgetTicketTool implements AgentToolInterface {
    private _clippingService;
    constructor(_clippingService: ClippingService);
    name: string;
    mcpOnly: boolean;
    available(): boolean;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "clippingWidgetTicketTool", unknown>;
}

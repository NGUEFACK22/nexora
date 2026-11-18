import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
export declare class UploadWidgetTicketTool implements AgentToolInterface {
    private _mediaService;
    constructor(_mediaService: MediaService);
    name: string;
    mcpOnly: boolean;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "uploadWidgetTicketTool", unknown>;
}

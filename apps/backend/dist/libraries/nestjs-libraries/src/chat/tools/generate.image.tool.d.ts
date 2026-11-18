import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
export declare class GenerateImageTool implements AgentToolInterface {
    private _mediaService;
    private _subscriptionService;
    private storage;
    constructor(_mediaService: MediaService, _subscriptionService: SubscriptionService);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "generateImageTool", unknown>;
}

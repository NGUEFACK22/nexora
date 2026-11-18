import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
export declare class PostSettingsTool implements AgentToolInterface {
    private _postsService;
    constructor(_postsService: PostsService);
    name: string;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "postSettingsTool", unknown>;
}

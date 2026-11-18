import { AgentToolInterface } from '@gitroom/nestjs-libraries/chat/agent.tool.interface';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
export declare class IntegrationConnectTool implements AgentToolInterface {
    private _integrationService;
    private _integrationManager;
    constructor(_integrationService: IntegrationService, _integrationManager: IntegrationManager);
    name: string;
    optionalOnSelfHosted: boolean;
    run(): import("@mastra/core/tools").Tool<InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, InferPublicSchema<T>, import("@mastra/core/tools").ToolExecutionContext<InferPublicSchema<T>, InferPublicSchema<T>, unknown>, "integrationConnectTool", unknown>;
}

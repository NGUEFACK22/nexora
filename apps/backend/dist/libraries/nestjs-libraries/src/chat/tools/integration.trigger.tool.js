"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationTriggerTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const integration_manager_1 = require("@gitroom/nestjs-libraries/integrations/integration.manager");
const integration_service_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.service");
const social_abstract_1 = require("@gitroom/nestjs-libraries/integrations/social.abstract");
const timer_1 = require("@gitroom/helpers/utils/timer");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const refresh_integration_service_1 = require("@gitroom/nestjs-libraries/integrations/refresh.integration.service");
let IntegrationTriggerTool = class IntegrationTriggerTool {
    constructor(_integrationManager, _integrationService, _refreshIntegrationService) {
        this._integrationManager = _integrationManager;
        this._integrationService = _integrationService;
        this._refreshIntegrationService = _refreshIntegrationService;
        this.name = 'triggerTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'triggerTool',
            description: `Use this to call a provider helper function (a methodName from the integrationSchema callable tools) that fetches provider-specific data needed for settings, like ids or search results.
      Some helper functions require values provided by the user, like a word to search for. methodName is required [input:callable-tools].
      If provider auth is expired, this tool may refresh the stored integration token; if refresh fails, it marks the channel as needing reconnect and notifies the organization.`,
            mcp: {
                annotations: {
                    title: 'Trigger Integration Tool',
                    readOnlyHint: false,
                    destructiveHint: true,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            inputSchema: zod_1.z.object({
                integrationId: zod_1.z.string().describe('The id of the integration'),
                methodName: zod_1.z
                    .string()
                    .describe('The methodName from the `integrationSchema` functions in the tools array, required'),
                dataSchema: zod_1.z.array(zod_1.z.object({
                    key: zod_1.z.string().describe('Name of the settings key to pass'),
                    value: zod_1.z.string().describe('Value of the key'),
                })),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z.union([
                    zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.any())),
                    zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
                    zod_1.z.string(),
                ]),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const getIntegration = await this._integrationService.getIntegrationById(organizationId, inputData.integrationId);
                if (!getIntegration) {
                    throw new Error('Integration not found, use integrationList to get a valid integration id');
                }
                const integrationProvider = integration_manager_1.socialIntegrationList.find((p) => p.identifier === getIntegration.providerIdentifier);
                if (!integrationProvider) {
                    throw new Error('Integration provider not found, use integrationList to get a valid integration id');
                }
                const tools = this._integrationManager.getAllTools();
                if (!tools[integrationProvider.identifier].some((p) => p.methodName === inputData.methodName) ||
                    !integrationProvider[inputData.methodName]) {
                    throw new Error(`Method "${inputData.methodName}" not found for this integration, use integrationSchema to get the callable tools`);
                }
                let refreshed = false;
                while (true) {
                    try {
                        const load = await integrationProvider[inputData.methodName](getIntegration.token, inputData.dataSchema.reduce((all, current) => ({
                            ...all,
                            [current.key]: current.value,
                        }), {}), getIntegration.internalId, getIntegration);
                        return { output: load };
                    }
                    catch (err) {
                        if (err instanceof social_abstract_1.RefreshToken && !refreshed) {
                            refreshed = true;
                            const data = await this._refreshIntegrationService.refresh(getIntegration);
                            if (!data) {
                                await this._integrationService.disconnectChannel(organizationId, getIntegration);
                                throw new Error('The channel was disconnected because its token expired, the user needs to reconnect it in Nexora');
                            }
                            const { accessToken } = data;
                            if (accessToken) {
                                getIntegration.token = accessToken;
                                if (integrationProvider.refreshWait) {
                                    await (0, timer_1.timer)(10000);
                                }
                                continue;
                            }
                        }
                        if (err instanceof social_abstract_1.RefreshToken) {
                            throw new Error('The provider rejected the credentials even after refreshing the token, the user needs to reconnect the channel in Nexora');
                        }
                        throw new Error(`Provider call failed: ${err instanceof Error && err.message
                            ? err.message
                            : 'unexpected error'}`);
                    }
                }
            },
        });
    }
};
exports.IntegrationTriggerTool = IntegrationTriggerTool;
exports.IntegrationTriggerTool = IntegrationTriggerTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_manager_1.IntegrationManager,
        integration_service_1.IntegrationService,
        refresh_integration_service_1.RefreshIntegrationService])
], IntegrationTriggerTool);
//# sourceMappingURL=integration.trigger.tool.js.map
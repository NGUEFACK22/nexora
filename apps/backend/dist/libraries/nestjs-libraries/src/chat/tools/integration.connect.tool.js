"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationConnectTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.service");
const integration_manager_1 = require("@gitroom/nestjs-libraries/integrations/integration.manager");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
let IntegrationConnectTool = class IntegrationConnectTool {
    constructor(_integrationService, _integrationManager) {
        this._integrationService = _integrationService;
        this._integrationManager = _integrationManager;
        this.name = 'integrationConnectTool';
        this.optionalOnSelfHosted = true;
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'integrationConnectTool',
            mcp: {
                annotations: {
                    title: 'Connect Channel',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: false,
                },
            },
            description: `
Use this when the user wants to add (connect) a new social media channel to Nexora: an account, a profile, a page or a business page, for example a Facebook Page, a LinkedIn Page or Google My Business.
It returns the URL of a Nexora page. The user opens it in a browser, reads what connecting the channel means, and continues to the platform to sign in and approve the access.
The channel is added only after the user completes that page, and is listed with the other integrations afterwards. The URL works for one hour.
With a redirectUrl the browser is sent to that address once the channel is connected, and the Nexora page names that website before the user continues. Without it a user who is signed in to Nexora lands on their calendar, and anyone else sees a confirmation that the channel is connected.
It cannot reconnect or refresh an existing channel. Platforms that need an API key, an instance URL, a wallet or the browser extension are added from the Nexora dashboard instead.
If the URL cannot be created, the result contains output.errors explaining why.
`,
            inputSchema: zod_1.z.object({
                platform: zod_1.z
                    .string()
                    .describe(`platform identifier (${this._integrationManager
                    .getLinkableSocialsIntegrations()
                    .join(', ')})`),
                redirectUrl: zod_1.z
                    .string()
                    .optional()
                    .describe('An http(s) URL, without a #fragment, the browser is sent to once the channel is connected, with "added" (the platform identifier) and "msg" (a short status text) added to its query string. Use it only when the user or the application they are in gave an address to return to.'),
            }),
            outputSchema: zod_1.z.object({
                output: zod_1.z
                    .object({
                    url: zod_1.z.string(),
                })
                    .or(zod_1.z.object({ errors: zod_1.z.string() })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                try {
                    return {
                        output: await this._integrationService.createConnectLink(organizationId, inputData.platform, inputData.redirectUrl),
                    };
                }
                catch (err) {
                    if (err instanceof common_1.HttpException) {
                        return { output: { errors: err.message } };
                    }
                    throw err;
                }
            },
        });
    }
};
exports.IntegrationConnectTool = IntegrationConnectTool;
exports.IntegrationConnectTool = IntegrationConnectTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_service_1.IntegrationService,
        integration_manager_1.IntegrationManager])
], IntegrationConnectTool);
//# sourceMappingURL=integration.connect.tool.js.map
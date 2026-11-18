"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const runtime_1 = require("@copilotkit/runtime");
const runtime_2 = require("@copilotkit/runtime");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
const mastra_1 = require("@ag-ui/mastra");
const mastra_service_1 = require("@gitroom/nestjs-libraries/chat/mastra.service");
const ai_model_1 = require("@gitroom/nestjs-libraries/chat/ai.model");
const di_1 = require("@mastra/core/di");
const permissions_ability_1 = require("@gitroom/backend/services/auth/permissions/permissions.ability");
const permission_exception_class_1 = require("@gitroom/backend/services/auth/permissions/permission.exception.class");
const copilotCors = () => ({
    origin: [
        process.env.FRONTEND_URL,
        'http://localhost:6274',
        ...(process.env.MAIN_URL ? [process.env.MAIN_URL] : []),
    ],
    credentials: !process.env.NOT_SECURED,
});
let CopilotController = class CopilotController {
    constructor(_subscriptionService, _mastraService) {
        this._subscriptionService = _subscriptionService;
        this._mastraService = _mastraService;
    }
    serviceAdapter() {
        const model = (0, ai_model_1.aiModelName)('gpt-4.1');
        switch ((0, ai_model_1.aiProvider)()) {
            case 'anthropic':
                return new runtime_2.AnthropicAdapter({ model });
            case 'google':
                return new runtime_2.GoogleGenerativeAIAdapter({
                    model,
                    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
                });
            default:
                return new runtime_1.OpenAIAdapter({ model });
        }
    }
    chatAgent(req, res) {
        if (!(0, ai_model_1.aiModelConfigured)()) {
            common_1.Logger.warn(`${(0, ai_model_1.aiApiKeyEnv)()} not set for AI provider "${(0, ai_model_1.aiProvider)()}", chat functionality will not work`);
            return;
        }
        const copilotRuntimeHandler = (0, runtime_1.copilotRuntimeNodeHttpEndpoint)({
            endpoint: '/copilot/chat',
            cors: copilotCors(),
            runtime: new runtime_1.CopilotRuntime(),
            serviceAdapter: this.serviceAdapter(),
        });
        return copilotRuntimeHandler(req, res);
    }
    async agent(req, res, organization) {
        if (!(0, ai_model_1.aiModelConfigured)()) {
            common_1.Logger.warn(`${(0, ai_model_1.aiApiKeyEnv)()} not set for AI provider "${(0, ai_model_1.aiProvider)()}", chat functionality will not work`);
            return;
        }
        const mastra = await this._mastraService.mastra();
        const requestContext = new di_1.RequestContext();
        requestContext.set('integrations', req?.body?.body?.forwardedProps?.integrations || []);
        requestContext.set('organization', JSON.stringify(organization));
        requestContext.set('ui', 'true');
        const agents = mastra_1.MastraAgent.getLocalAgents({
            resourceId: organization.id,
            mastra,
            requestContext: requestContext,
        });
        const runtime = new runtime_1.CopilotRuntime({
            agents,
        });
        const copilotRuntimeHandler = (0, runtime_1.copilotRuntimeNodeHttpEndpoint)({
            endpoint: '/copilot/agent',
            cors: copilotCors(),
            runtime,
            serviceAdapter: this.serviceAdapter(),
        });
        return copilotRuntimeHandler(req, res);
    }
    calculateCredits(organization, type) {
        return this._subscriptionService.checkCredits(organization, type || 'ai_images');
    }
    async getMessagesList(organization, threadId) {
        const mastra = await this._mastraService.mastra();
        const memory = await mastra.getAgent('postiz').getMemory();
        try {
            return await memory.recall({
                resourceId: organization.id,
                threadId,
            });
        }
        catch (err) {
            common_1.Logger.warn(`Could not recall messages for thread ${threadId}: ${err}`);
            return { messages: [] };
        }
    }
    async getList(organization) {
        const mastra = await this._mastraService.mastra();
        const memory = await mastra.getAgent('postiz').getMemory();
        const list = await memory.listThreads({
            filter: { resourceId: organization.id },
            perPage: 100000,
            page: 0,
            orderBy: { field: 'createdAt', direction: 'DESC' },
        });
        return {
            threads: list.threads.map((p) => ({
                id: p.id,
                title: p.title,
            })),
        };
    }
};
exports.CopilotController = CopilotController;
tslib_1.__decorate([
    (0, common_1.Post)('/chat'),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], CopilotController.prototype, "chatAgent", null);
tslib_1.__decorate([
    (0, common_1.Post)('/agent'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    tslib_1.__param(0, (0, common_1.Req)()),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__param(2, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CopilotController.prototype, "agent", null);
tslib_1.__decorate([
    (0, common_1.Get)('/credits'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Query)('type')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", void 0)
], CopilotController.prototype, "calculateCredits", null);
tslib_1.__decorate([
    (0, common_1.Get)('/:thread/list'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('thread')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], CopilotController.prototype, "getMessagesList", null);
tslib_1.__decorate([
    (0, common_1.Get)('/list'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], CopilotController.prototype, "getList", null);
exports.CopilotController = CopilotController = tslib_1.__decorate([
    (0, common_1.Controller)('/copilot'),
    tslib_1.__metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        mastra_service_1.MastraService])
], CopilotController);
//# sourceMappingURL=copilot.controller.js.map
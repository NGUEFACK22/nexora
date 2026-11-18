"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotController = void 0;
const common_1 = require("@nestjs/common");
const runtime_1 = require("@copilotkit/runtime");
const runtime_2 = require("@copilotkit/runtime");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const subscription_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/subscriptions/subscription.service");
const mastra_1 = require("@ag-ui/mastra");
const mastra_service_1 = require("../../../../../libraries/nestjs-libraries/src/chat/mastra.service");
const ai_model_1 = require("../../../../../libraries/nestjs-libraries/src/chat/ai.model");
const di_1 = require("@mastra/core/di");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
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
__decorate([
    (0, common_1.Post)('/chat'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CopilotController.prototype, "chatAgent", null);
__decorate([
    (0, common_1.Post)('/agent'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "agent", null);
__decorate([
    (0, common_1.Get)('/credits'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CopilotController.prototype, "calculateCredits", null);
__decorate([
    (0, common_1.Get)('/:thread/list'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('thread')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "getMessagesList", null);
__decorate([
    (0, common_1.Get)('/list'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.AI]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CopilotController.prototype, "getList", null);
exports.CopilotController = CopilotController = __decorate([
    (0, common_1.Controller)('/copilot'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        mastra_service_1.MastraService])
], CopilotController);
//# sourceMappingURL=copilot.controller.js.map
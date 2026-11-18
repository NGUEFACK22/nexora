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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationListTool = void 0;
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("../../database/prisma/integrations/integration.service");
const zod_1 = __importDefault(require("zod"));
const auth_context_1 = require("../auth.context");
let IntegrationListTool = class IntegrationListTool {
    constructor(_integrationService) {
        this._integrationService = _integrationService;
        this.name = 'integrationList';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'integrationList',
            description: `This tool list available integrations to schedule posts to. Optionally pass a group id (from the groupList tool) to only list integrations belonging to that group`,
            inputSchema: zod_1.default.object({
                group: zod_1.default
                    .string()
                    .optional()
                    .describe('Optional group (customer) id from the groupList tool to filter the integrations'),
            }),
            mcp: {
                annotations: {
                    title: 'List Integrations',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            outputSchema: zod_1.default.object({
                output: zod_1.default.array(zod_1.default.object({
                    id: zod_1.default.string(),
                    name: zod_1.default.string(),
                    picture: zod_1.default.string(),
                    platform: zod_1.default.string(),
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                return {
                    output: (await this._integrationService.getIntegrationsList(organizationId))
                        .filter((p) => !inputData.group || p.customer?.id === inputData.group)
                        .map((p) => ({
                        name: p.customName || p.name,
                        id: p.id,
                        disabled: p.disabled,
                        picture: p.picture || '/no-picture.jpg',
                        platform: p.providerIdentifier,
                        display: p.profile,
                        type: p.type,
                        customer: p.customer
                            ? {
                                id: p.customer.id,
                                name: p.customer.name,
                            }
                            : undefined,
                    })),
                };
            },
        });
    }
};
exports.IntegrationListTool = IntegrationListTool;
exports.IntegrationListTool = IntegrationListTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], IntegrationListTool);
//# sourceMappingURL=integration.list.tool.js.map
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
exports.GroupListTool = void 0;
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("../../database/prisma/integrations/integration.service");
const zod_1 = __importDefault(require("zod"));
const auth_context_1 = require("../auth.context");
let GroupListTool = class GroupListTool {
    constructor(_integrationService) {
        this._integrationService = _integrationService;
        this.name = 'groupList';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'groupList',
            description: `This tool lists the available groups (customers). Use a group id with the integrationList tool to filter the integrations belonging to that group`,
            inputSchema: zod_1.default.object({}),
            mcp: {
                annotations: {
                    title: 'List Groups',
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
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                return {
                    output: (await this._integrationService.customers(organizationId)).map((p) => ({
                        id: p.id,
                        name: p.name,
                    })),
                };
            },
        });
    }
};
exports.GroupListTool = GroupListTool;
exports.GroupListTool = GroupListTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_service_1.IntegrationService])
], GroupListTool);
//# sourceMappingURL=group.list.tool.js.map
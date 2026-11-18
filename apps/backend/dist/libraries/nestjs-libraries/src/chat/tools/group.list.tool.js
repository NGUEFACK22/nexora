"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupListTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const integration_service_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.service");
const zod_1 = tslib_1.__importDefault(require("zod"));
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
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
exports.GroupListTool = GroupListTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [integration_service_1.IntegrationService])
], GroupListTool);
//# sourceMappingURL=group.list.tool.js.map
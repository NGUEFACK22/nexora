"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingWidgetTicketTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const clipping_service_1 = require("@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
let ClippingWidgetTicketTool = class ClippingWidgetTicketTool {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
        this.name = 'clippingWidgetTicketTool';
        this.mcpOnly = true;
    }
    available() {
        return upload_factory_1.UploadFactory.clippingEnabled();
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'clippingWidgetTicketTool',
            description: `Used by the clipping widget to get a short-lived ticket to read the status of the clippingId returned by clippingTool.`,
            mcp: {
                annotations: {
                    title: 'Clipping Widget Ticket',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: false,
                },
                _meta: {
                    ui: {
                        visibility: ['app'],
                    },
                },
            },
            inputSchema: zod_1.z.object({
                clippingId: zod_1.z
                    .string()
                    .describe('The clippingId returned by clippingTool'),
            }),
            outputSchema: zod_1.z.object({
                ticket: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                try {
                    const org = JSON.parse(context?.requestContext?.get('organization'));
                    return {
                        ticket: await this._clippingService.createWidgetTicket(org.id, inputData.clippingId),
                    };
                }
                catch (err) {
                    const message = err instanceof common_1.HttpException ? err.message : 'Something went wrong';
                    return { error: `Failed to create a clipping ticket: ${message}` };
                }
            },
        });
    }
};
exports.ClippingWidgetTicketTool = ClippingWidgetTicketTool;
exports.ClippingWidgetTicketTool = ClippingWidgetTicketTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingWidgetTicketTool);
//# sourceMappingURL=clipping.widget.ticket.tool.js.map
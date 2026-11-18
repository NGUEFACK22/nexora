"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadWidgetStatusTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
let UploadWidgetStatusTool = class UploadWidgetStatusTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'uploadWidgetStatusTool';
        this.mcpOnly = true;
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'uploadWidgetStatusTool',
            description: `List the media the user uploaded with the upload widget, using the sessionId returned by uploadWidgetTool.
Only for files uploaded through the upload widget (uploadWidgetTool, shown in apps that display MCP Apps). For a media id returned by uploadFromUrlTool, the public API or the Nexora CLI, use mediaStatusTool instead.
It lists only the files uploaded in that widget session, not the whole media library.
An empty list means the user did not upload anything yet. A media with the status "processing" is still being prepared: wait about 10 seconds and call again.
A media with the status "ready" can be used as a post attachment with its { id, path }. "ready" with a warning means the adjustment failed and the original file was kept and will be used for publishing.`,
            mcp: {
                annotations: {
                    title: 'Upload Widget Status',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            inputSchema: zod_1.z.object({
                sessionId: zod_1.z
                    .string()
                    .describe('The sessionId returned by uploadWidgetTool'),
            }),
            outputSchema: zod_1.z.object({
                media: zod_1.z
                    .array(zod_1.z.object({
                    id: zod_1.z.string(),
                    path: zod_1.z.string(),
                    status: zod_1.z.string(),
                    warning: zod_1.z.string().optional(),
                    error: zod_1.z.string().optional(),
                }))
                    .optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                try {
                    const org = JSON.parse(context?.requestContext?.get('organization'));
                    const media = await this._mediaService.getUploadSession(org.id, inputData.sessionId);
                    return {
                        media: media.map((p) => this._mediaService.toUploadStatus(p)),
                    };
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return { error: `Upload session lookup failed: ${message}` };
                }
            },
        });
    }
};
exports.UploadWidgetStatusTool = UploadWidgetStatusTool;
exports.UploadWidgetStatusTool = UploadWidgetStatusTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], UploadWidgetStatusTool);
//# sourceMappingURL=upload.widget.status.tool.js.map
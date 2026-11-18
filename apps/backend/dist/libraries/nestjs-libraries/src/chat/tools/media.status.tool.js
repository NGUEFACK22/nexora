"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaStatusTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
let MediaStatusTool = class MediaStatusTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'mediaStatusTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'mediaStatusTool',
            description: `Check whether a media uploaded with adjust set to true finished adjusting to the platforms' limits, using the media id returned by uploadFromUrlTool, the public API (POST /public/v1/upload or /public/v1/upload-from-url) or the Nexora CLI (postiz upload).
Files the user uploaded through the upload widget (uploadWidgetTool) have no id until they are listed, so check those with uploadWidgetStatusTool and its sessionId instead.
Only a media with the status "processing" needs checking: wait about 10 seconds and call again. Don't publish a post with its path until it is "ready": a post published while it is processing uses the original, unadjusted file.
"ready" means the adjusted file is in place at the same path. "ready" with a warning means the adjustment failed and the original file was kept and will be used for publishing.`,
            mcp: {
                annotations: {
                    title: 'Media Status',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            inputSchema: zod_1.z.object({
                id: zod_1.z.string().describe('The media id returned by the upload'),
            }),
            outputSchema: zod_1.z.object({
                id: zod_1.z.string().optional(),
                path: zod_1.z.string().optional(),
                status: zod_1.z.string().optional(),
                warning: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                try {
                    const org = JSON.parse(context?.requestContext?.get('organization'));
                    return await this._mediaService.getMediaUploadStatus(org.id, inputData.id);
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return { error: `Media status lookup failed: ${message}` };
                }
            },
        });
    }
};
exports.MediaStatusTool = MediaStatusTool;
exports.MediaStatusTool = MediaStatusTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], MediaStatusTool);
//# sourceMappingURL=media.status.tool.js.map
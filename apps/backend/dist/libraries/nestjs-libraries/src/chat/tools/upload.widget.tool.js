"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadWidgetTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const upload_widget_1 = require("@gitroom/nestjs-libraries/chat/ui/upload.widget");
let UploadWidgetTool = class UploadWidgetTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'uploadWidgetTool';
        this.mcpOnly = true;
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'uploadWidgetTool',
            description: `Show the user an upload widget to add images or videos from their own device to the media library.
Use this when the user wants to attach a local file to a post. When the media is already available on a public URL, use uploadFromUrlTool instead.
The widget is only displayed by apps that support MCP Apps (interactive UI); in any other app no widget appears, and local files go through the Nexora CLI (postiz upload, https://docs.postiz.com/cli/introduction) or the public API (POST /public/v1/upload with an API key, https://docs.postiz.com/public-api/introduction). uploadFromUrlTool is only for public URLs.
Returns a sessionId: the files the user uploads are reported in the conversation, and can also be read with uploadWidgetStatusTool.`,
            mcp: {
                annotations: {
                    title: 'Upload Media From Device',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: false,
                },
                _meta: {
                    ui: {
                        resourceUri: upload_widget_1.UPLOAD_WIDGET_URI,
                    },
                },
            },
            inputSchema: zod_1.z.object({}),
            outputSchema: zod_1.z.object({
                sessionId: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                try {
                    const org = JSON.parse(context?.requestContext?.get('organization'));
                    return {
                        sessionId: await this._mediaService.createUploadSession(org.id),
                    };
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return { error: `Failed to open the upload widget: ${message}` };
                }
            },
        });
    }
};
exports.UploadWidgetTool = UploadWidgetTool;
exports.UploadWidgetTool = UploadWidgetTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], UploadWidgetTool);
//# sourceMappingURL=upload.widget.tool.js.map
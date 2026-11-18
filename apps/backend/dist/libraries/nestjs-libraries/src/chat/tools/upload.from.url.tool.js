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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFromUrlTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("../../database/prisma/media/media.service");
const auth_context_1 = require("../auth.context");
let UploadFromUrlTool = class UploadFromUrlTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'uploadFromUrlTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'uploadFromUrlTool',
            description: `Upload a remote image or video into the media library from a public http(s) URL.
Local or private files cannot be fetched by this tool: upload them with the Nexora CLI (postiz upload, https://docs.postiz.com/cli/introduction) or the public API (POST /public/v1/upload with an API key, https://docs.postiz.com/public-api/introduction).
Use this before scheduling a post when the user provides an external media URL (not already hosted on our domain),
so the attachment passes the upload-domain validation. Returns the hosted media { id, path, status } to use as an attachment (or as the src of an <img> in the content, when the channel rules say pictures go inside the content), or { error } on failure.
Set adjust to true (off by default) to adjust the media to the platforms' limits after the upload, for media a platform may reject as too large, too small or in an unsupported encoding: videos get their short side scaled to 1080 px (up or down, long side at most 1920 px) and are re-encoded to H.264 MP4 with AAC audio at up to 60 fps; images are only scaled down (short side at most 1080 px, long side at most 1920 px) and keep their format. GIF, AVIF, BMP and TIFF files are stored as uploaded.
Without adjust the status is "ready" and the path can be used immediately. With adjust the status is "processing" until the adjusted file replaces the original at the same path, usually within seconds. Wait until it is "ready" before publishing a post with this path: a post published while it is processing uses the original, unadjusted file. To know when the adjusted file is in place, call mediaStatusTool with the returned id (not uploadWidgetStatusTool, which only covers the upload widget).`,
            mcp: {
                annotations: {
                    title: 'Upload Media From URL',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            inputSchema: zod_1.z.object({
                url: zod_1.z
                    .string()
                    .url()
                    .describe('The public http(s) URL of the image or video to upload. Local files and private hosts are not supported, use the Nexora CLI (postiz upload) or POST /public/v1/upload instead'),
                adjust: zod_1.z
                    .boolean()
                    .optional()
                    .describe('Adjust the media to the platforms\' limits (resize and re-encode) after the upload. Defaults to false'),
            }),
            outputSchema: zod_1.z.object({
                id: zod_1.z.string().optional(),
                path: zod_1.z.string().optional(),
                status: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                try {
                    const org = JSON.parse(context?.requestContext?.get('organization'));
                    return await this._mediaService.uploadFromUrl(org.id, inputData.url, inputData.adjust);
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : 'Unexpected error';
                    const causes = [];
                    let cause = err?.cause;
                    while (cause instanceof Error) {
                        if (cause.message) {
                            causes.push(cause.message);
                        }
                        cause = cause.cause;
                    }
                    const causeText = causes.length ? ` (${causes.join(': ')})` : '';
                    return {
                        error: `Failed to upload media from URL: ${message}${causeText}. Only public http(s) URLs work: upload local or private files with the Nexora CLI (postiz upload, https://docs.postiz.com/cli/introduction) or the public API (POST /public/v1/upload with an API key, https://docs.postiz.com/public-api/introduction)`,
                    };
                }
            },
        });
    }
};
exports.UploadFromUrlTool = UploadFromUrlTool;
exports.UploadFromUrlTool = UploadFromUrlTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], UploadFromUrlTool);
//# sourceMappingURL=upload.from.url.tool.js.map
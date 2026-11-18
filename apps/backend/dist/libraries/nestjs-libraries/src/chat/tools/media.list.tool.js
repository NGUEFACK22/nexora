"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaListTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const zod_1 = tslib_1.__importDefault(require("zod"));
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
let MediaListTool = class MediaListTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'mediaListTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'mediaListTool',
            description: `List the media (images and videos) already uploaded to the media library, newest first, 18 per page, optionally searched by original filename.
Use the returned path as an attachment URL in integrationSchedulePostTool instead of uploading the file again.`,
            inputSchema: zod_1.default.object({
                search: zod_1.default
                    .string()
                    .optional()
                    .describe('Filter by original filename (case-insensitive contains)'),
                page: zod_1.default
                    .number()
                    .int()
                    .min(1)
                    .optional()
                    .describe('Page number, starting at 1'),
            }),
            mcp: {
                annotations: {
                    title: 'List Media',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            outputSchema: zod_1.default.object({
                pages: zod_1.default.number(),
                output: zod_1.default.array(zod_1.default.object({
                    id: zod_1.default.string(),
                    name: zod_1.default.string(),
                    originalName: zod_1.default.string().nullable(),
                    path: zod_1.default.string(),
                    createdAt: zod_1.default.string(),
                })),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const organizationId = JSON.parse(context?.requestContext?.get('organization')).id;
                const { pages, results } = await this._mediaService.getMedia(organizationId, inputData.page || 1, inputData.search);
                return {
                    pages,
                    output: results.map((p) => ({
                        id: p.id,
                        name: p.name,
                        originalName: p.originalName,
                        path: p.path,
                        createdAt: p.createdAt.toISOString(),
                    })),
                };
            },
        });
    }
};
exports.MediaListTool = MediaListTool;
exports.MediaListTool = MediaListTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], MediaListTool);
//# sourceMappingURL=media.list.tool.js.map
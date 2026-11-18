"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoStatusTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const zod_1 = require("zod");
let VideoStatusTool = class VideoStatusTool {
    constructor(_mediaService) {
        this._mediaService = _mediaService;
        this.name = 'videoStatusTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'videoStatusTool',
            mcp: {
                annotations: {
                    title: 'Video Generation Status',
                    readOnlyHint: true,
                    destructiveHint: false,
                    idempotentHint: true,
                    openWorldHint: false,
                },
            },
            description: `Check the status of a video generation started with 'generateVideoTool', using the jobId it returned.
                    Generating a video takes a few minutes: while the status is "pending", wait about 30 seconds and call again.
                    When the status is "completed" the result contains the hosted video url, which can be used as a post attachment.
                    When the status is "failed" the result contains the error message.
      `,
            inputSchema: zod_1.z.object({
                jobId: zod_1.z.string().describe('The jobId returned by generateVideoTool'),
            }),
            outputSchema: zod_1.z.object({
                status: zod_1.z.enum(['pending', 'completed', 'failed']).optional(),
                id: zod_1.z.string().optional(),
                url: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const org = JSON.parse(context?.requestContext?.get('organization'));
                try {
                    const job = await this._mediaService.getGenerateVideoStatus(org, inputData.jobId);
                    return {
                        status: job.status,
                        id: job.id,
                        url: job.path,
                        error: job.error,
                    };
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return {
                        error: `Video job lookup failed: ${message}`,
                    };
                }
            },
        });
    }
};
exports.VideoStatusTool = VideoStatusTool;
exports.VideoStatusTool = VideoStatusTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService])
], VideoStatusTool);
//# sourceMappingURL=video.status.tool.js.map
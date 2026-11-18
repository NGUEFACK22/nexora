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
exports.GenerateVideoTool = void 0;
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("../../database/prisma/media/media.service");
const video_manager_1 = require("../../videos/video.manager");
const auth_context_1 = require("../auth.context");
let GenerateVideoTool = class GenerateVideoTool {
    constructor(_mediaService, _videoManager) {
        this._mediaService = _mediaService;
        this._videoManager = _videoManager;
        this.name = 'generateVideoTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'generateVideoTool',
            mcp: {
                annotations: {
                    title: 'Generate Video',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            description: `Generate video to use in a post,
                    in case the user specified a platform that requires attachment and attachment was not provided,
                    ask if they want to generate a picture of a video.
                    In many cases 'videoFunctionTool' will need to be called first, to get things like voice id
                    Generating takes a few minutes, so this only starts the generation and returns a jobId:
                    poll 'videoStatusTool' with it until the status is "completed" to get the video url.
                    Here are the type of video that can be generated:
                    ${this._videoManager
                .getAllVideos()
                .map((p) => "-" + p.title)
                .join('\n')}
      `,
            inputSchema: zod_1.z.object({
                identifier: zod_1.z.string(),
                output: zod_1.z.enum(['vertical', 'horizontal']),
                customParams: zod_1.z.array(zod_1.z.object({
                    key: zod_1.z.string().describe('Name of the settings key to pass'),
                    value: zod_1.z.any().describe('Value of the key'),
                })),
            }),
            outputSchema: zod_1.z.object({
                jobId: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const org = JSON.parse(context?.requestContext?.get('organization'));
                try {
                    const value = await this._mediaService.startGenerateVideo(org, {
                        type: inputData.identifier,
                        output: inputData.output,
                        customParams: inputData.customParams.reduce((all, current) => ({
                            ...all,
                            [current.key]: current.value,
                        }), {}),
                    });
                    return {
                        jobId: value.jobId,
                    };
                }
                catch (err) {
                    const message = err instanceof common_1.HttpException && err.getStatus() === 402
                        ? 'No AI video credits are available on this account.'
                        : err instanceof Error
                            ? err.message
                            : String(err);
                    return {
                        error: `Video generation failed: ${message}. The user's video credit was not used.`,
                    };
                }
            },
        });
    }
};
exports.GenerateVideoTool = GenerateVideoTool;
exports.GenerateVideoTool = GenerateVideoTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        video_manager_1.VideoManager])
], GenerateVideoTool);
//# sourceMappingURL=generate.video.tool.js.map
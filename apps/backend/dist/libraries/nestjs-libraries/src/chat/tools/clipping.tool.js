"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const clipping_service_1 = require("@gitroom/nestjs-libraries/database/prisma/clipping/clipping.service");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const clipping_widget_1 = require("@gitroom/nestjs-libraries/chat/ui/clipping.widget");
let ClippingTool = class ClippingTool {
    constructor(_clippingService) {
        this._clippingService = _clippingService;
        this.name = 'clippingTool';
    }
    available() {
        return upload_factory_1.UploadFactory.clippingEnabled();
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'clippingTool',
            mcp: {
                annotations: {
                    title: 'Clip a Video',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
                _meta: {
                    ui: {
                        resourceUri: clipping_widget_1.CLIPPING_WIDGET_URI,
                    },
                },
            },
            description: `Turn a long YouTube video into short vertical clips with burned-in captions.
                    The best parts of the video are picked automatically, every clip is saved to the media library,
                    and when channels are passed a draft post is created for every clip on every channel (nothing is scheduled or published).
                    Before calling this tool, always ask the user how the horizontal video should fill the vertical clip, and wait for the answer:
                    "blur" keeps the whole picture over a blurred copy of itself, "crop" fills the clip with the middle of the picture and cuts the sides away.
                    Never pick one for the user, unless they already said which one they want in this conversation.
                    It uses the clipping minutes of the subscription: one minute for every minute of the source video.
                    Clipping takes several minutes, so this only starts it and returns a clippingId: tell the user it is running.
                    Some apps show a widget with the progress and report the finished clips in the conversation by themselves.
                    Whenever the user asks how it is going, or when no such report arrived, call 'clippingStatusTool' with the clippingId to get the clips.
      `,
            inputSchema: zod_1.z.object({
                url: zod_1.z.string().url().describe('URL of the YouTube video'),
                integrations: zod_1.z
                    .array(zod_1.z.string())
                    .max(20)
                    .optional()
                    .describe('Ids of the channels to create draft posts for, from integrationListTool'),
                clips: zod_1.z
                    .number()
                    .int()
                    .min(1)
                    .max(10)
                    .optional()
                    .describe('Maximum number of clips, 5 by default'),
                fit: zod_1.z
                    .enum(['crop', 'blur'])
                    .describe('How the horizontal video fills the vertical clip, as answered by the user: ask them before calling this tool and never guess it. "blur" keeps the whole picture over a blurred copy of itself and is always safe. "crop" fills the clip with the middle of the picture and cuts the sides away: there is no face tracking, so a speaker who is not in the centre is cut out of the clip. When asking, tell the user that with "crop" anything outside the centre of the picture will be lost.'),
            }),
            outputSchema: zod_1.z.object({
                clippingId: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const org = JSON.parse(context?.requestContext?.get('organization'));
                try {
                    const value = await this._clippingService.startClipping(org, {
                        url: inputData.url,
                        integrations: inputData.integrations,
                        clips: inputData.clips,
                        fit: inputData.fit,
                    });
                    return {
                        clippingId: value.id,
                    };
                }
                catch (err) {
                    const message = err instanceof common_1.HttpException && err.getStatus() === 402
                        ? 'No clipping minutes are left on this account for this month'
                        : err instanceof common_1.HttpException
                            ? err.message
                            : 'Something went wrong';
                    if (!(err instanceof common_1.HttpException)) {
                        console.error('clippingTool failed:', err);
                    }
                    return {
                        error: `Clipping could not start: ${message}. No clipping minutes were used.`,
                    };
                }
            },
        });
    }
};
exports.ClippingTool = ClippingTool;
exports.ClippingTool = ClippingTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [clipping_service_1.ClippingService])
], ClippingTool);
//# sourceMappingURL=clipping.tool.js.map
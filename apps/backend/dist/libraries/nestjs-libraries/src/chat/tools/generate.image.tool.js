"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateImageTool = void 0;
const tslib_1 = require("tslib");
const tools_1 = require("@mastra/core/tools");
const zod_1 = require("zod");
const common_1 = require("@nestjs/common");
const media_service_1 = require("@gitroom/nestjs-libraries/database/prisma/media/media.service");
const upload_factory_1 = require("@gitroom/nestjs-libraries/upload/upload.factory");
const auth_context_1 = require("@gitroom/nestjs-libraries/chat/auth.context");
const subscription_service_1 = require("@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service");
let GenerateImageTool = class GenerateImageTool {
    constructor(_mediaService, _subscriptionService) {
        this._mediaService = _mediaService;
        this._subscriptionService = _subscriptionService;
        this.storage = upload_factory_1.UploadFactory.createStorage();
        this.name = 'generateImageTool';
    }
    run() {
        return (0, tools_1.createTool)({
            id: 'generateImageTool',
            description: `Generate image to use in a post,
                    in case the user specified a platform that requires attachment and attachment was not provided,
                    ask if they want to generate a picture of a video.
      `,
            mcp: {
                annotations: {
                    title: 'Generate Image',
                    readOnlyHint: false,
                    destructiveHint: false,
                    idempotentHint: false,
                    openWorldHint: true,
                },
            },
            inputSchema: zod_1.z.object({
                prompt: zod_1.z.string(),
            }),
            outputSchema: zod_1.z.object({
                id: zod_1.z.string().optional(),
                path: zod_1.z.string().optional(),
                error: zod_1.z.string().optional(),
            }),
            execute: async (inputData, context) => {
                (0, auth_context_1.checkAuth)(inputData, context);
                const org = JSON.parse(context?.requestContext?.get('organization'));
                try {
                    const total = await this._subscriptionService.checkCredits(org);
                    if (process.env.STRIPE_PUBLISHABLE_KEY && total.credits <= 0) {
                        return {
                            error: 'No AI image credits are available on this account.',
                        };
                    }
                    const image = await this._mediaService.generateImage(inputData.prompt, org);
                    const file = await this.storage.uploadSimple('data:image/png;base64,' + image);
                    return await this._mediaService.saveFile(org.id, file.split('/').pop(), file);
                }
                catch (err) {
                    return {
                        error: `Image generation failed: ${err instanceof Error ? err.message : String(err)}. The user's image credit was not used.`,
                    };
                }
            },
        });
    }
};
exports.GenerateImageTool = GenerateImageTool;
exports.GenerateImageTool = GenerateImageTool = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [media_service_1.MediaService,
        subscription_service_1.SubscriptionService])
], GenerateImageTool);
//# sourceMappingURL=generate.image.tool.js.map
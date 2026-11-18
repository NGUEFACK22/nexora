"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Seedance = void 0;
const tslib_1 = require("tslib");
const video_interface_1 = require("@gitroom/nestjs-libraries/videos/video.interface");
const timer_1 = require("@gitroom/helpers/utils/timer");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class Image {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], Image.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], Image.prototype, "path", void 0);
class SeedanceParams {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], SeedanceParams.prototype, "prompt", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Type)(() => Image),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(3),
    tslib_1.__metadata("design:type", Array)
], SeedanceParams.prototype, "images", void 0);
let Seedance = class Seedance extends video_interface_1.VideoAbstract {
    constructor() {
        super(...arguments);
        this.dto = SeedanceParams;
    }
    async process(output, customParams) {
        const imageUrls = customParams?.images?.map((p) => p.path) || [];
        const value = await (await fetch('https://api.evolink.ai/v1/videos/generations', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.EVOLINK_API_KEY}`,
            },
            method: 'POST',
            signal: AbortSignal.timeout(30000),
            body: JSON.stringify({
                model: imageUrls.length
                    ? 'seedance-2.0-fast-reference-to-video'
                    : 'seedance-2.0-fast-text-to-video',
                prompt: customParams.prompt,
                ...(imageUrls.length ? { image_urls: imageUrls } : {}),
                aspect_ratio: output === 'horizontal' ? '16:9' : '9:16',
                duration: 8,
                quality: '720p',
                generate_audio: true,
            }),
        })).json();
        const taskId = value?.id;
        if (!taskId) {
            throw new Error(value?.error
                ? `${value.error.code}: ${value.error.message}`
                : `Failed to generate video`);
        }
        console.log('seedance taskId', taskId);
        let attempts = 0;
        const maxAttempts = 180;
        while (true) {
            if (attempts++ >= maxAttempts) {
                throw new Error('Video generation timed out');
            }
            console.log('waiting for video to be ready');
            const data = await (await fetch('https://api.evolink.ai/v1/tasks/' + taskId, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.EVOLINK_API_KEY}`,
                },
                signal: AbortSignal.timeout(30000),
            })).json();
            if (data?.status === 'completed') {
                const videoUrl = data?.results || [];
                if (videoUrl.length > 0) {
                    return videoUrl[0];
                }
                throw new Error('Video generation succeeded but no video URL returned');
            }
            if (data?.status !== 'pending' && data?.status !== 'processing') {
                throw new Error(data?.error
                    ? `${data.error.code}: ${data.error.message}`
                    : `Video generation failed (status ${data?.status})`);
            }
            await (0, timer_1.timer)(10000);
        }
    }
};
exports.Seedance = Seedance;
exports.Seedance = Seedance = tslib_1.__decorate([
    (0, video_interface_1.Video)({
        identifier: 'seedance',
        title: 'Seedance 2.0 (Audio + Video)',
        description: 'Generate videos with the most advanced video model.',
        placement: 'text-to-image',
        dto: SeedanceParams,
        tools: [],
        trial: false,
        available: !!process.env.EVOLINK_API_KEY,
    })
], Seedance);
//# sourceMappingURL=seedance.js.map
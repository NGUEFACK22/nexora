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
exports.Seedance = void 0;
const video_interface_1 = require("../video.interface");
const timer_1 = require("../../../../helpers/src/utils/timer");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class Image {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Image.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Image.prototype, "path", void 0);
class SeedanceParams {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SeedanceParams.prototype, "prompt", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Image),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(3),
    __metadata("design:type", Array)
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
exports.Seedance = Seedance = __decorate([
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
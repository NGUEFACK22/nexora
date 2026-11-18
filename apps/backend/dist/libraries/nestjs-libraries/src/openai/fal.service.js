"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FalService = void 0;
const common_1 = require("@nestjs/common");
const p_limit_1 = __importDefault(require("p-limit"));
const limit = (0, p_limit_1.default)(10);
let FalService = class FalService {
    async generateImageFromText(model, text, isVertical = false) {
        const response = await limit(() => fetch(`https://fal.run/fal-ai/${model}`, {
            method: 'POST',
            headers: {
                Authorization: `Key ${process.env.FAL_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: text,
                aspect_ratio: isVertical ? '9:16' : '16:9',
                resolution: '720p',
                num_images: 1,
                output_format: 'jpeg',
                expand_prompt: true,
            }),
            signal: AbortSignal.timeout(300000),
        }));
        if (!response.ok) {
            throw new Error(`fal ${response.status}: ${(await response.text()).slice(0, 500)}`);
        }
        const { images, video, ...all } = await response.json();
        console.log(all, video, images);
        if (video) {
            return video.url;
        }
        return images[0].url;
    }
};
exports.FalService = FalService;
exports.FalService = FalService = __decorate([
    (0, common_1.Injectable)()
], FalService);
//# sourceMappingURL=fal.service.js.map
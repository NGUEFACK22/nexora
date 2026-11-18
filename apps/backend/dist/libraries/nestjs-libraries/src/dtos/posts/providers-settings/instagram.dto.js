"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramDto = exports.InstagramAudio = exports.Collaborators = void 0;
const tslib_1 = require("tslib");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class Collaborators {
}
exports.Collaborators = Collaborators;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], Collaborators.prototype, "label", void 0);
class InstagramAudio {
}
exports.InstagramAudio = InstagramAudio;
tslib_1.__decorate([
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InstagramAudio.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InstagramAudio.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InstagramAudio.prototype, "artist", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], InstagramAudio.prototype, "image", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], InstagramAudio.prototype, "audio_volume", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    tslib_1.__metadata("design:type", Number)
], InstagramAudio.prototype, "video_volume", void 0);
class InstagramDto {
}
exports.InstagramDto = InstagramDto;
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['post', 'story']),
    (0, class_validator_1.IsDefined)(),
    tslib_1.__metadata("design:type", String)
], InstagramDto.prototype, "post_type", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Boolean)
], InstagramDto.prototype, "is_trial_reel", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsIn)(['MANUAL', 'SS_PERFORMANCE']),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", String)
], InstagramDto.prototype, "graduation_strategy", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Type)(() => Collaborators),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", Array)
], InstagramDto.prototype, "collaborators", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Type)(() => InstagramAudio),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    tslib_1.__metadata("design:type", InstagramAudio)
], InstagramDto.prototype, "audio", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Labels the post as AI generated (Instagram shows the "AI info" label). Works for posts, reels, carousels and stories.',
    }),
    tslib_1.__metadata("design:type", Boolean)
], InstagramDto.prototype, "made_with_ai", void 0);
//# sourceMappingURL=instagram.dto.js.map
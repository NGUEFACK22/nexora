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
exports.HashnodeSettingsDto = exports.HashnodeTagsSettings = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const media_dto_1 = require("../../media/media.dto");
class HashnodeTagsSettings {
}
exports.HashnodeTagsSettings = HashnodeTagsSettings;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HashnodeTagsSettings.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HashnodeTagsSettings.prototype, "label", void 0);
class HashnodeSettingsDto {
}
exports.HashnodeSettingsDto = HashnodeSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], HashnodeSettingsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], HashnodeSettingsDto.prototype, "subtitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    __metadata("design:type", media_dto_1.MediaDto)
], HashnodeSettingsDto.prototype, "main_image", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.canonical && o.canonical.indexOf('(post:') === -1),
    (0, class_validator_1.Matches)(/^(|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/, {
        message: 'Invalid URL',
    }),
    __metadata("design:type", String)
], HashnodeSettingsDto.prototype, "canonical", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], HashnodeSettingsDto.prototype, "publication", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_transformer_1.Type)(() => HashnodeTagsSettings),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], HashnodeSettingsDto.prototype, "tags", void 0);
//# sourceMappingURL=hashnode.settings.dto.js.map
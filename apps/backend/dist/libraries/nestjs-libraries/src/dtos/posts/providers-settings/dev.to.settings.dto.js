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
exports.DevToSettingsDto = void 0;
const class_validator_1 = require("class-validator");
const media_dto_1 = require("../../media/media.dto");
const class_transformer_1 = require("class-transformer");
const dev_to_tags_settings_dto_1 = require("./dev.to.tags.settings.dto");
class DevToSettingsDto {
    constructor() {
        this.tags = [];
    }
}
exports.DevToSettingsDto = DevToSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], DevToSettingsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => media_dto_1.MediaDto),
    __metadata("design:type", media_dto_1.MediaDto)
], DevToSettingsDto.prototype, "main_image", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => o.canonical && o.canonical.indexOf('(post:') === -1),
    (0, class_validator_1.Matches)(/^(|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/, {
        message: 'Invalid URL',
    }),
    __metadata("design:type", String)
], DevToSettingsDto.prototype, "canonical", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DevToSettingsDto.prototype, "organization", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(4),
    (0, class_transformer_1.Type)(() => dev_to_tags_settings_dto_1.DevToTagsSettingsDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], DevToSettingsDto.prototype, "tags", void 0);
//# sourceMappingURL=dev.to.settings.dto.js.map
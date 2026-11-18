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
exports.RedditSettingsDto = exports.RedditSettingsValueDto = exports.RedditSettingsDtoInner = exports.RedditFlairDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
class RedditFlairDto {
}
exports.RedditFlairDto = RedditFlairDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], RedditFlairDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], RedditFlairDto.prototype, "name", void 0);
class RedditSettingsDtoInner {
}
exports.RedditSettingsDtoInner = RedditSettingsDtoInner;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: 'Subreddit must start with /r',
    }),
    __metadata("design:type", String)
], RedditSettingsDtoInner.prototype, "subreddit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], RedditSettingsDtoInner.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['self', 'link', 'media']),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_jsonschema_1.JSONSchema)({
        description: "Must be one of self (text post), link (requires url), media (uploads the post's first attached image or mp4 video)",
    }),
    __metadata("design:type", String)
], RedditSettingsDtoInner.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateIf)((o) => o.type === 'link' && o?.url?.indexOf('(post:') === -1),
    (0, class_validator_1.Matches)(/^(|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/, {
        message: 'Invalid URL',
    }),
    __metadata("design:type", String)
], RedditSettingsDtoInner.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], RedditSettingsDtoInner.prototype, "is_flair_required", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((e) => e.is_flair_required),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RedditFlairDto),
    __metadata("design:type", RedditFlairDto)
], RedditSettingsDtoInner.prototype, "flair", void 0);
class RedditSettingsValueDto {
}
exports.RedditSettingsValueDto = RedditSettingsValueDto;
__decorate([
    (0, class_transformer_1.Type)(() => RedditSettingsDtoInner),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", RedditSettingsDtoInner)
], RedditSettingsValueDto.prototype, "value", void 0);
class RedditSettingsDto {
}
exports.RedditSettingsDto = RedditSettingsDto;
__decorate([
    (0, class_transformer_1.Type)(() => RedditSettingsValueDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], RedditSettingsDto.prototype, "subreddit", void 0);
//# sourceMappingURL=reddit.dto.js.map
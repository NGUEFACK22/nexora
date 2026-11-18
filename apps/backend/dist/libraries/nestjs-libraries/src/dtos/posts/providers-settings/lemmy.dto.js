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
exports.LemmySettingsDto = exports.LemmySettingsValueDto = exports.LemmySettingsDtoInner = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LemmySettingsDtoInner {
}
exports.LemmySettingsDtoInner = LemmySettingsDtoInner;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], LemmySettingsDtoInner.prototype, "subreddit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], LemmySettingsDtoInner.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], LemmySettingsDtoInner.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.url),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], LemmySettingsDtoInner.prototype, "url", void 0);
class LemmySettingsValueDto {
}
exports.LemmySettingsValueDto = LemmySettingsValueDto;
__decorate([
    (0, class_transformer_1.Type)(() => LemmySettingsDtoInner),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", LemmySettingsDtoInner)
], LemmySettingsValueDto.prototype, "value", void 0);
class LemmySettingsDto {
}
exports.LemmySettingsDto = LemmySettingsDto;
__decorate([
    (0, class_transformer_1.Type)(() => LemmySettingsValueDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.ArrayMinSize)(1),
    __metadata("design:type", Array)
], LemmySettingsDto.prototype, "subreddit", void 0);
//# sourceMappingURL=lemmy.dto.js.map
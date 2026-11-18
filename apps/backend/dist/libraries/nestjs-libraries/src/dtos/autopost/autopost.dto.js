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
exports.AutopostDto = exports.Integrations = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const webhook_url_validator_1 = require("../webhooks/webhook.url.validator");
class Integrations {
}
exports.Integrations = Integrations;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], Integrations.prototype, "id", void 0);
class AutopostDto {
}
exports.AutopostDto = AutopostDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], AutopostDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AutopostDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AutopostDto.prototype, "lastUrl", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], AutopostDto.prototype, "onSlot", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], AutopostDto.prototype, "syncLast", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'Autopost URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    __metadata("design:type", String)
], AutopostDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], AutopostDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], AutopostDto.prototype, "addPicture", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Boolean)
], AutopostDto.prototype, "generateContent", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Integrations),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], AutopostDto.prototype, "integrations", void 0);
//# sourceMappingURL=autopost.dto.js.map
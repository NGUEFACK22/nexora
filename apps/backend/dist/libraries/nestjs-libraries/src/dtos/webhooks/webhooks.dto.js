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
exports.UpdateDto = exports.OnlyURL = exports.WebhooksDto = exports.WebhooksIntegrationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const webhook_url_validator_1 = require("./webhook.url.validator");
class WebhooksIntegrationDto {
}
exports.WebhooksIntegrationDto = WebhooksIntegrationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], WebhooksIntegrationDto.prototype, "id", void 0);
class WebhooksDto {
}
exports.WebhooksDto = WebhooksDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], WebhooksDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'Webhook URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    __metadata("design:type", String)
], WebhooksDto.prototype, "url", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => WebhooksIntegrationDto),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Array)
], WebhooksDto.prototype, "integrations", void 0);
class OnlyURL {
}
exports.OnlyURL = OnlyURL;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    __metadata("design:type", String)
], OnlyURL.prototype, "url", void 0);
class UpdateDto {
}
exports.UpdateDto = UpdateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], UpdateDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", String)
], UpdateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsDefined)(),
    (0, webhook_url_validator_1.IsSafeWebhookUrl)({
        message: 'Webhook URL must be a public HTTPS URL and cannot point to internal network addresses',
    }),
    __metadata("design:type", String)
], UpdateDto.prototype, "url", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => WebhooksIntegrationDto),
    (0, class_validator_1.IsDefined)(),
    __metadata("design:type", Array)
], UpdateDto.prototype, "integrations", void 0);
//# sourceMappingURL=webhooks.dto.js.map
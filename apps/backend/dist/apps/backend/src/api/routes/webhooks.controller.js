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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const webhooks_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/webhooks/webhooks.service");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const webhooks_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/webhooks/webhooks.dto");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
let WebhookController = class WebhookController {
    constructor(_webhooksService) {
        this._webhooksService = _webhooksService;
    }
    async getStatistics(org) {
        return this._webhooksService.getWebhooks(org.id);
    }
    async createAWebhook(org, body) {
        return this._webhooksService.createWebhook(org.id, body);
    }
    async updateWebhook(org, body) {
        return this._webhooksService.createWebhook(org.id, body);
    }
    async deleteWebhook(org, id) {
        return this._webhooksService.deleteWebhook(org.id, id);
    }
    async sendWebhook(body, query) {
        try {
            await fetch(query.url, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' },
            });
        }
        catch (err) {
        }
        return { send: true };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.WEBHOOKS]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, webhooks_dto_1.WebhooksDto]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "createAWebhook", null);
__decorate([
    (0, common_1.Put)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, webhooks_dto_1.UpdateDto]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "updateWebhook", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteWebhook", null);
__decorate([
    (0, common_1.Post)('/send'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, webhooks_dto_1.OnlyURL]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "sendWebhook", null);
exports.WebhookController = WebhookController = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('/webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhookController);
//# sourceMappingURL=webhooks.controller.js.map
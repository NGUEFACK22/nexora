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
exports.AutopostController = void 0;
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const permissions_ability_1 = require("../../services/auth/permissions/permissions.ability");
const autopost_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/autopost/autopost.service");
const autopost_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/autopost/autopost.dto");
const permission_exception_class_1 = require("../../services/auth/permissions/permission.exception.class");
const webhooks_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/webhooks/webhooks.dto");
let AutopostController = class AutopostController {
    constructor(_autopostsService) {
        this._autopostsService = _autopostsService;
    }
    async getAutoposts(org) {
        return this._autopostsService.getAutoposts(org.id);
    }
    async createAutopost(org, body) {
        return this._autopostsService.createAutopost(org.id, body);
    }
    async updateAutopost(org, body, id) {
        return this._autopostsService.createAutopost(org.id, body, id);
    }
    async deleteAutopost(org, id) {
        return this._autopostsService.deleteAutopost(org.id, id);
    }
    async changeActive(org, id, active) {
        return this._autopostsService.changeActive(org.id, id, active);
    }
    async sendWebhook(query) {
        return this._autopostsService.loadXML(query.url);
    }
};
exports.AutopostController = AutopostController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "getAutoposts", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, permissions_ability_1.CheckPolicies)([permission_exception_class_1.AuthorizationActions.Create, permission_exception_class_1.Sections.WEBHOOKS]),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, autopost_dto_1.AutopostDto]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "createAutopost", null);
__decorate([
    (0, common_1.Put)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, autopost_dto_1.AutopostDto, String]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "updateAutopost", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "deleteAutopost", null);
__decorate([
    (0, common_1.Post)('/:id/active'),
    __param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "changeActive", null);
__decorate([
    (0, common_1.Post)('/send'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [webhooks_dto_1.OnlyURL]),
    __metadata("design:returntype", Promise)
], AutopostController.prototype, "sendWebhook", null);
exports.AutopostController = AutopostController = __decorate([
    (0, swagger_1.ApiTags)('Autopost'),
    (0, common_1.Controller)('/autopost'),
    __metadata("design:paramtypes", [autopost_service_1.AutopostService])
], AutopostController);
//# sourceMappingURL=autopost.controller.js.map
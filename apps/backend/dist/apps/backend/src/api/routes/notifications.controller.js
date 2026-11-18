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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const org_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/org.from.request");
const notification_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/notifications/notification.service");
const swagger_1 = require("@nestjs/swagger");
let NotificationsController = class NotificationsController {
    constructor(_notificationsService) {
        this._notificationsService = _notificationsService;
    }
    async mainPageList(user, organization) {
        return this._notificationsService.getMainPageCount(organization.id, user.id);
    }
    async notifications(user, organization) {
        return this._notificationsService.getNotifications(organization.id, user.id);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "mainPageList", null);
__decorate([
    (0, common_1.Get)('/list'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, org_from_request_1.GetOrgFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "notifications", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('/notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map
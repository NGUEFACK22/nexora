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
exports.AnnouncementsController = void 0;
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const announcements_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/announcements/announcements.service");
const announcements_dto_1 = require("../../../../../libraries/nestjs-libraries/src/dtos/announcements/announcements.dto");
let AnnouncementsController = class AnnouncementsController {
    constructor(_announcementsService) {
        this._announcementsService = _announcementsService;
    }
    async getAnnouncements() {
        return this._announcementsService.getAnnouncements();
    }
    async createAnnouncement(user, body) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return this._announcementsService.createAnnouncement(body);
    }
    async deleteAnnouncement(user, id) {
        if (!user.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
        return this._announcementsService.deleteAnnouncement(id);
    }
};
exports.AnnouncementsController = AnnouncementsController;
__decorate([
    (0, common_1.Get)('/'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('/'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, announcements_dto_1.AnnouncementDto]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "deleteAnnouncement", null);
exports.AnnouncementsController = AnnouncementsController = __decorate([
    (0, swagger_1.ApiTags)('Announcements'),
    (0, common_1.Controller)('/announcements'),
    __metadata("design:paramtypes", [announcements_service_1.AnnouncementsService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map
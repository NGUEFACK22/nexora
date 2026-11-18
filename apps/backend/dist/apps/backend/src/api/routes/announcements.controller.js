"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("@gitroom/nestjs-libraries/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const announcements_service_1 = require("@gitroom/nestjs-libraries/database/prisma/announcements/announcements.service");
const announcements_dto_1 = require("@gitroom/nestjs-libraries/dtos/announcements/announcements.dto");
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
tslib_1.__decorate([
    (0, common_1.Get)('/'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "getAnnouncements", null);
tslib_1.__decorate([
    (0, common_1.Post)('/'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, announcements_dto_1.AnnouncementDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "createAnnouncement", null);
tslib_1.__decorate([
    (0, common_1.Delete)('/:id'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AnnouncementsController.prototype, "deleteAnnouncement", null);
exports.AnnouncementsController = AnnouncementsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Announcements'),
    (0, common_1.Controller)('/announcements'),
    tslib_1.__metadata("design:paramtypes", [announcements_service_1.AnnouncementsService])
], AnnouncementsController);
//# sourceMappingURL=announcements.controller.js.map
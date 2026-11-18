"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("@gitroom/nestjs-libraries/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const errors_service_1 = require("@gitroom/nestjs-libraries/database/prisma/errors/errors.service");
const admin_stats_service_1 = require("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.service");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
let AdminController = class AdminController {
    constructor(_errorsService, _adminStatsService) {
        this._errorsService = _errorsService;
        this._adminStatsService = _adminStatsService;
    }
    assertSuperAdmin(user) {
        if (!user?.isSuperAdmin) {
            throw new common_1.HttpException('Unauthorized', 400);
        }
    }
    async listErrors(user, page, limit, platform, email, unknownFirst) {
        this.assertSuperAdmin(user);
        return this._errorsService.listErrors({
            page: page ? parseInt(page, 10) : 0,
            limit: limit ? parseInt(limit, 10) : 20,
            platform: platform || undefined,
            email: email || undefined,
            unknownFirst: unknownFirst === 'true' || unknownFirst === '1',
        });
    }
    async listPlatforms(user) {
        this.assertSuperAdmin(user);
        return this._errorsService.listPlatforms();
    }
    async getStats(user, from, to, unknownOnly) {
        this.assertSuperAdmin(user);
        const fromDate = from ? (0, dayjs_1.default)(from) : (0, dayjs_1.default)().subtract(30, 'day');
        const toDate = to ? (0, dayjs_1.default)(to) : (0, dayjs_1.default)();
        return this._adminStatsService.getStats({
            from: fromDate.startOf('day').toDate(),
            to: toDate.endOf('day').toDate(),
            unknownOnly: unknownOnly === 'true' || unknownOnly === '1',
        });
    }
};
exports.AdminController = AdminController;
tslib_1.__decorate([
    (0, common_1.Get)('/errors'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, common_1.Query)('page')),
    tslib_1.__param(2, (0, common_1.Query)('limit')),
    tslib_1.__param(3, (0, common_1.Query)('platform')),
    tslib_1.__param(4, (0, common_1.Query)('email')),
    tslib_1.__param(5, (0, common_1.Query)('unknownFirst')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "listErrors", null);
tslib_1.__decorate([
    (0, common_1.Get)('/errors/platforms'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "listPlatforms", null);
tslib_1.__decorate([
    (0, common_1.Get)('/stats'),
    tslib_1.__param(0, (0, user_from_request_1.GetUserFromRequest)()),
    tslib_1.__param(1, (0, common_1.Query)('from')),
    tslib_1.__param(2, (0, common_1.Query)('to')),
    tslib_1.__param(3, (0, common_1.Query)('unknownOnly')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('/admin'),
    tslib_1.__metadata("design:paramtypes", [errors_service_1.ErrorsService,
        admin_stats_service_1.AdminStatsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const user_from_request_1 = require("../../../../../libraries/nestjs-libraries/src/user/user.from.request");
const swagger_1 = require("@nestjs/swagger");
const errors_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/errors/errors.service");
const admin_stats_service_1 = require("../../../../../libraries/nestjs-libraries/src/database/prisma/admin-stats/admin-stats.service");
const dayjs_1 = __importDefault(require("dayjs"));
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
__decorate([
    (0, common_1.Get)('/errors'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('platform')),
    __param(4, (0, common_1.Query)('email')),
    __param(5, (0, common_1.Query)('unknownFirst')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listErrors", null);
__decorate([
    (0, common_1.Get)('/errors/platforms'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listPlatforms", null);
__decorate([
    (0, common_1.Get)('/stats'),
    __param(0, (0, user_from_request_1.GetUserFromRequest)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('unknownOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin'),
    (0, common_1.Controller)('/admin'),
    __metadata("design:paramtypes", [errors_service_1.ErrorsService,
        admin_stats_service_1.AdminStatsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map
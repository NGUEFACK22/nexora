"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStatsService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const admin_stats_repository_1 = require("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository");
let AdminStatsService = class AdminStatsService {
    constructor(_adminStatsRepository) {
        this._adminStatsRepository = _adminStatsRepository;
    }
    getStats(params) {
        return this._adminStatsRepository.getStats(params);
    }
    getOrgActivity(params) {
        return this._adminStatsRepository.getOrgActivity(params);
    }
};
exports.AdminStatsService = AdminStatsService;
exports.AdminStatsService = AdminStatsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [admin_stats_repository_1.AdminStatsRepository])
], AdminStatsService);
//# sourceMappingURL=admin-stats.service.js.map
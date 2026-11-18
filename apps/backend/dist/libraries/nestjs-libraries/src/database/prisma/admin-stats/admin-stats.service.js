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
exports.AdminStatsService = void 0;
const common_1 = require("@nestjs/common");
const admin_stats_repository_1 = require("./admin-stats.repository");
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
exports.AdminStatsService = AdminStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_stats_repository_1.AdminStatsRepository])
], AdminStatsService);
//# sourceMappingURL=admin-stats.service.js.map
import { AdminStatsRepository, OrgActivityParams, StatsParams } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository';
export declare class AdminStatsService {
    private _adminStatsRepository;
    constructor(_adminStatsRepository: AdminStatsRepository);
    getStats(params: StatsParams): Promise<import("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository").StatsResponse>;
    getOrgActivity(params: OrgActivityParams): Promise<import("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository").OrgActivityResponse>;
}

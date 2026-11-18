import { User } from '@prisma/client';
import { ErrorsService } from '@gitroom/nestjs-libraries/database/prisma/errors/errors.service';
import { AdminStatsService } from '@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';
export declare class AdminController {
    private _errorsService;
    private _adminStatsService;
    constructor(_errorsService: ErrorsService, _adminStatsService: AdminStatsService);
    private assertSuperAdmin;
    listErrors(user: User, page?: string, limit?: string, platform?: string, email?: string, unknownFirst?: string): Promise<{
        items: any[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    listPlatforms(user: User): Promise<string[]>;
    getStats(user: User, from?: string, to?: string, unknownOnly?: string): Promise<import("@gitroom/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository").StatsResponse>;
}

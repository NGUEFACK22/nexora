import { Organization, User } from '@prisma/client';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { AddTeamMemberDto } from '@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto';
import { AdminAddTeamMemberDto } from '@gitroom/nestjs-libraries/dtos/settings/admin.add.team.member.dto';
import { ShortlinkPreferenceDto } from '@gitroom/nestjs-libraries/dtos/settings/shortlink-preference.dto';
export declare class SettingsController {
    private _organizationService;
    constructor(_organizationService: OrganizationService);
    getTeam(org: Organization): Promise<{
        users: {
            user: {
                email: string;
                id: string;
                sendSuccessEmails: boolean;
                sendFailureEmails: boolean;
                sendStreakEmails: boolean;
            };
            role: import(".prisma/client").$Enums.Role;
        }[];
    }>;
    inviteTeamMember(org: Organization, user: User, body: AddTeamMemberDto): Promise<{
        url: string;
    }>;
    addTeamMember(user: User, org: Organization, body: AdminAddTeamMemberDto): Promise<{
        added: boolean;
    }>;
    deleteTeamMember(org: Organization, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        disabled: boolean;
        role: import(".prisma/client").$Enums.Role;
        userId: string;
    }>;
    getShortlinkPreference(org: Organization): Promise<{
        shortlink: import(".prisma/client").$Enums.ShortLinkPreference;
    }>;
    updateShortlinkPreference(org: Organization, body: ShortlinkPreferenceDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        apiKey: string | null;
        paymentId: string | null;
        streakSince: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        allowTrial: boolean;
        isTrailing: boolean;
        shortlink: import(".prisma/client").$Enums.ShortLinkPreference;
    }>;
}

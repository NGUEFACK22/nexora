import { UsersRepository } from '@gitroom/nestjs-libraries/database/prisma/users/users.repository';
import { Provider } from '@prisma/client';
import { UserDetailDto } from '@gitroom/nestjs-libraries/dtos/users/user.details.dto';
import { EmailNotificationsDto } from '@gitroom/nestjs-libraries/dtos/users/email-notifications.dto';
import { TimezoneDto } from '@gitroom/nestjs-libraries/dtos/users/timezone.dto';
import { OrganizationRepository } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.repository';
import { IntegrationRepository } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.repository';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
export declare class UsersService {
    private _usersRepository;
    private _organizationRepository;
    private _integrationRepository;
    private _notificationService;
    constructor(_usersRepository: UsersRepository, _organizationRepository: OrganizationRepository, _integrationRepository: IntegrationRepository, _notificationService: NotificationService);
    private readonly _logger;
    getUserByEmail(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        picture: {
            id: string;
            path: string;
        };
    } & {
        password: string | null;
        email: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        providerName: import(".prisma/client").$Enums.Provider;
        lastName: string | null;
        isSuperAdmin: boolean;
        bio: string | null;
        audience: number;
        providerId: string | null;
        timezone: number;
        timezoneName: string | null;
        lastReadNotifications: Date;
        inviteId: string | null;
        activated: boolean;
        account: string | null;
        connectedAccount: boolean;
        lastOnline: Date;
        ip: string | null;
        agent: string | null;
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
        pictureId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getUserById(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        password: string | null;
        email: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        providerName: import(".prisma/client").$Enums.Provider;
        lastName: string | null;
        isSuperAdmin: boolean;
        bio: string | null;
        audience: number;
        providerId: string | null;
        timezone: number;
        timezoneName: string | null;
        lastReadNotifications: Date;
        inviteId: string | null;
        activated: boolean;
        account: string | null;
        connectedAccount: boolean;
        lastOnline: Date;
        ip: string | null;
        agent: string | null;
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
        pictureId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getUserWithActiveSubscriptionByEmail(email: string, excludeUserId: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        email: string;
        id: string;
        providerName: import(".prisma/client").$Enums.Provider;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getImpersonateUser(name: string): import(".prisma/client").Prisma.PrismaPromise<{
        organization: {
            subscription: {
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                identifier: string;
                cancelAt: Date;
                period: import(".prisma/client").$Enums.Period;
                isLifetime: boolean;
            };
            id: string;
            name: string;
            paymentId: string;
            deletedAt: Date;
        };
        user: {
            email: string;
            id: string;
            name: string;
            deletedAt: Date;
            providerName: import(".prisma/client").$Enums.Provider;
            activated: boolean;
        };
        id: string;
        disabled: boolean;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getUserByProvider(providerId: string, provider: Provider): import(".prisma/client").Prisma.Prisma__UserClient<{
        password: string | null;
        email: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        providerName: import(".prisma/client").$Enums.Provider;
        lastName: string | null;
        isSuperAdmin: boolean;
        bio: string | null;
        audience: number;
        providerId: string | null;
        timezone: number;
        timezoneName: string | null;
        lastReadNotifications: Date;
        inviteId: string | null;
        activated: boolean;
        account: string | null;
        connectedAccount: boolean;
        lastOnline: Date;
        ip: string | null;
        agent: string | null;
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
        pictureId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    switchUser(currentUserId: string, targetUserId: string, adminId: string): Promise<{
        kept: {
            id: string;
            email: string;
        };
        switched: {
            id: string;
            email: string;
        };
    }>;
    getOrgsToDeleteForAccount(userId: string): Promise<({
        subscription: {
            createdAt: Date;
            subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            totalChannels: number;
            isLifetime: boolean;
        };
        users: {
            disabled: boolean;
            role: import(".prisma/client").$Enums.Role;
        }[];
    } & {
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
    })[]>;
    getDeleteAccountInfo(userId: string): Promise<{
        hasSubscription: boolean;
        hasAdditionalMembers: boolean;
    }>;
    deleteAccount(userId: string): Promise<{
        deletedOrgs: ({
            subscription: {
                createdAt: Date;
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
                totalChannels: number;
                isLifetime: boolean;
            };
            users: {
                disabled: boolean;
                role: import(".prisma/client").$Enums.Role;
            }[];
        } & {
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
        })[];
    }>;
    activateUser(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        password: string | null;
        email: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        providerName: import(".prisma/client").$Enums.Provider;
        lastName: string | null;
        isSuperAdmin: boolean;
        bio: string | null;
        audience: number;
        providerId: string | null;
        timezone: number;
        timezoneName: string | null;
        lastReadNotifications: Date;
        inviteId: string | null;
        activated: boolean;
        account: string | null;
        connectedAccount: boolean;
        lastOnline: Date;
        ip: string | null;
        agent: string | null;
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
        pictureId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updatePassword(id: string, password: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        password: string | null;
        email: string;
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        providerName: import(".prisma/client").$Enums.Provider;
        lastName: string | null;
        isSuperAdmin: boolean;
        bio: string | null;
        audience: number;
        providerId: string | null;
        timezone: number;
        timezoneName: string | null;
        lastReadNotifications: Date;
        inviteId: string | null;
        activated: boolean;
        account: string | null;
        connectedAccount: boolean;
        lastOnline: Date;
        ip: string | null;
        agent: string | null;
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
        pictureId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getPersonal(userId: string): Promise<{
        id: string;
        name: string;
        bio: string;
        picture: {
            id: string;
            path: string;
        };
    }>;
    changePersonal(userId: string, body: UserDetailDto): Promise<void>;
    getEmailNotifications(userId: string): Promise<{
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
    }>;
    updateEmailNotifications(userId: string, body: EmailNotificationsDto): Promise<void>;
    updateTimezone(userId: string, body: TimezoneDto): Promise<void>;
}

import { Organization, User } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { PaymentService } from '@gitroom/nestjs-libraries/services/payment/payment.service';
import { Response, Request } from 'express';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { UserDetailDto } from '@gitroom/nestjs-libraries/dtos/users/user.details.dto';
import { EmailNotificationsDto } from '@gitroom/nestjs-libraries/dtos/users/email-notifications.dto';
import { TimezoneDto } from '@gitroom/nestjs-libraries/dtos/users/timezone.dto';
import { TrackEnum } from '@gitroom/nestjs-libraries/user/track.enum';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
export declare class UsersController {
    private _subscriptionService;
    private _paymentService;
    private _authService;
    private _orgService;
    private _userService;
    private _trackService;
    constructor(_subscriptionService: SubscriptionService, _paymentService: PaymentService, _authService: AuthService, _orgService: OrganizationService, _userService: UsersService, _trackService: TrackService);
    getChatbaseToken(user: User, organization: Organization): Promise<{
        token: string;
    }>;
    getSelf(user: User, organization: Organization, req: Request): Promise<{
        orgId: string;
        totalChannels: any;
        tier: any;
        role: any;
        isLifetime: boolean;
        admin: boolean;
        impersonate: boolean;
        isTrailing: boolean;
        allowTrial: boolean;
        streakSince: Date;
        publicApi: string;
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
    }>;
    getPersonalInformation(user: User): Promise<{
        id: string;
        name: string;
        bio: string;
        picture: {
            id: string;
            path: string;
        };
    }>;
    getImpersonate(user: User, name: string): Promise<{
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
    setImpersonate(user: User, id: string, response: Response): Promise<void>;
    switchUser(user: User, id: string, req: Request): Promise<{
        success: boolean;
    }>;
    private getRequestUserId;
    changePersonal(user: User, body: UserDetailDto): Promise<void>;
    getEmailNotifications(user: User): Promise<{
        sendSuccessEmails: boolean;
        sendFailureEmails: boolean;
        sendStreakEmails: boolean;
    }>;
    updateEmailNotifications(user: User, body: EmailNotificationsDto): Promise<void>;
    updateTimezone(user: User, body: TimezoneDto): Promise<void>;
    rotateApiKey(organization: Organization): Promise<{
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
    getSubscription(organization: Organization): Promise<{
        subscription: {
            platform: import("@gitroom/nestjs-libraries/services/payment/payment.provider.interface").PaymentPlatform;
            provider: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            identifier: string | null;
            cancelAt: Date | null;
            period: import(".prisma/client").$Enums.Period;
            totalChannels: number;
            isLifetime: boolean;
            organizationId: string;
        };
    }>;
    tiers(): Promise<any>;
    joinOrg(user: User, org: string, response: Response): Promise<Response<any, Record<string, any>>>;
    getOrgs(user: User): Promise<{
        id: string;
        name: string;
        users: {
            disabled: boolean;
            role: import(".prisma/client").$Enums.Role;
        }[];
        subscription: {
            createdAt: Date;
            subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            totalChannels: number;
            isLifetime: boolean;
        };
    }[]>;
    changeOrg(id: string, response: Response): void;
    getDeleteAccountInfo(user: User): Promise<{
        hasSubscription: boolean;
        hasAdditionalMembers: boolean;
    }>;
    deleteAccount(user: User, req: Request, response: Response): Promise<void>;
    logout(response: Response): void;
    trackEvent(res: Response, req: Request, user: User, ip: string, userAgent: string, body: {
        tt: TrackEnum;
        fbclid: string;
        additional: Record<string, any>;
    }): Promise<void>;
}

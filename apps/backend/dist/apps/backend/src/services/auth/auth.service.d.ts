import { Provider } from '@prisma/client';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { LoginUserDto } from '@gitroom/nestjs-libraries/dtos/auth/login.user.dto';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { AuthProviderManager } from '@gitroom/backend/services/auth/providers/providers.manager';
import { ForgotReturnPasswordDto } from '@gitroom/nestjs-libraries/dtos/auth/forgot-return.password.dto';
import { EmailService } from '@gitroom/nestjs-libraries/services/email.service';
import { AttributionService } from '@gitroom/nestjs-libraries/services/attribution/attribution.service';
export declare class AuthService {
    private _userService;
    private _organizationService;
    private _emailService;
    private _providerManager;
    private _attributionService;
    constructor(_userService: UsersService, _organizationService: OrganizationService, _emailService: EmailService, _providerManager: AuthProviderManager, _attributionService: AttributionService);
    canRegister(provider: string): Promise<boolean>;
    routeAuth(provider: Provider, body: CreateOrgUserDto | LoginUserDto, ip: string, userAgent: string, addToOrg?: boolean | {
        orgId: string;
        role: 'USER' | 'ADMIN';
        id: string;
    }): Promise<{
        addedOrg: boolean | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            disabled: boolean;
            role: import(".prisma/client").$Enums.Role;
            userId: string;
        };
        jwt: string;
    }>;
    getOrgFromCookie(cookie?: string): false | {
        email: string;
        role: "USER" | "ADMIN";
        orgId: string;
        id: string;
    };
    private loginOrRegisterProvider;
    private _track;
    forgot(email: string): Promise<boolean>;
    forgotReturn(body: ForgotReturnPasswordDto): false | import(".prisma/client").Prisma.Prisma__UserClient<{
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
    activate(code: string, tracking: string): Promise<string | false>;
    resendActivationEmail(email: string): Promise<boolean>;
    oauthLink(provider: string, query?: any): string | Promise<string>;
    checkExists(provider: string, code: string, redirectUri?: string, state?: string, stateCookie?: string, addToOrg?: boolean | {
        orgId: string;
        role: 'USER' | 'ADMIN';
        id: string;
    }): Promise<{
        jwt: string;
        addedOrg: boolean | {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            organizationId: string;
            disabled: boolean;
            role: import(".prisma/client").$Enums.Role;
            userId: string;
        };
        token?: undefined;
    } | {
        token: string;
        jwt?: undefined;
        addedOrg?: undefined;
    }>;
    private jwt;
}

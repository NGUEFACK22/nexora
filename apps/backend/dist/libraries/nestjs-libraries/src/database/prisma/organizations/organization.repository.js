"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const tslib_1 = require("tslib");
const prisma_service_1 = require("@gitroom/nestjs-libraries/database/prisma/prisma.service");
const client_1 = require("@prisma/client");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
const make_secure_id_1 = require("@gitroom/nestjs-libraries/services/make.secure.id");
let OrganizationRepository = class OrganizationRepository {
    constructor(_organization, _userOrg, _user) {
        this._organization = _organization;
        this._userOrg = _userOrg;
        this._user = _user;
    }
    createMaxUser(id, name, saasName, email) {
        return this._organization.model.organization.create({
            select: {
                id: true,
                apiKey: true,
            },
            data: {
                name: name ? `${name}###${id}` : `Unnamed User###${id}`,
                apiKey: auth_service_1.AuthService.fixedEncryption((0, make_secure_id_1.makeSecureId)(20)),
                isTrailing: false,
                subscription: {
                    create: {
                        totalChannels: 1000000,
                        subscriptionTier: 'ULTIMATE',
                        isLifetime: true,
                        period: 'YEARLY',
                    },
                },
                users: {
                    create: {
                        role: client_1.Role.SUPERADMIN,
                        user: {
                            create: {
                                activated: true,
                                email: email
                                    ? email.split('@').join(`+${saasName}@`)
                                    : `${saasName}+` + (0, make_is_1.makeId)(10) + '@postiz.com',
                                name: name ? `${name}###${id}` : `Unnamed User###${id}`,
                                providerName: 'LOCAL',
                                password: auth_service_1.AuthService.hashPassword((0, make_secure_id_1.makeSecureId)(500)),
                                timezone: 0,
                            },
                        },
                    },
                },
            },
        });
    }
    getOrgByApiKey(api) {
        return this._organization.model.organization.findFirst({
            where: {
                apiKey: api,
                deletedAt: null,
            },
            include: {
                subscription: {
                    select: {
                        subscriptionTier: true,
                        totalChannels: true,
                        isLifetime: true,
                    },
                },
            },
        });
    }
    getCount() {
        return this._organization.model.organization.count();
    }
    getSuperAdminUser(orgId) {
        return this._userOrg.model.userOrganization.findFirst({
            where: {
                organizationId: orgId,
                disabled: false,
                user: {
                    isSuperAdmin: true,
                    deletedAt: null,
                },
            },
        });
    }
    getPrivilegedNonSuperAdminUser(orgId) {
        return this._userOrg.model.userOrganization.findFirst({
            where: {
                organizationId: orgId,
                disabled: false,
                role: {
                    in: [client_1.Role.SUPERADMIN, client_1.Role.ADMIN],
                },
                user: {
                    isSuperAdmin: false,
                    deletedAt: null,
                },
            },
        });
    }
    getUserOrg(id) {
        return this._userOrg.model.userOrganization.findFirst({
            where: {
                id,
            },
            select: {
                user: true,
                organization: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                disabled: true,
                                role: true,
                                userId: true,
                            },
                        },
                        subscription: {
                            select: {
                                subscriptionTier: true,
                                totalChannels: true,
                                isLifetime: true,
                            },
                        },
                    },
                },
            },
        });
    }
    getImpersonateUser(name) {
        return this._userOrg.model.userOrganization.findMany({
            where: {
                OR: [
                    {
                        organizationId: {
                            contains: name,
                        },
                    },
                    {
                        organization: {
                            OR: [
                                {
                                    paymentId: {
                                        equals: name,
                                    },
                                },
                                {
                                    subscription: {
                                        identifier: {
                                            equals: name,
                                        },
                                    },
                                },
                                {
                                    Integration: {
                                        some: {
                                            id: name,
                                        },
                                    },
                                },
                                {
                                    post: {
                                        some: {
                                            id: name,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        user: {
                            OR: [
                                {
                                    name: {
                                        contains: name,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    email: {
                                        contains: name,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    id: {
                                        contains: name,
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            select: {
                id: true,
                role: true,
                disabled: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        paymentId: true,
                        deletedAt: true,
                        subscription: {
                            select: {
                                subscriptionTier: true,
                                identifier: true,
                                isLifetime: true,
                                period: true,
                                cancelAt: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        activated: true,
                        providerName: true,
                        deletedAt: true,
                    },
                },
            },
        });
    }
    updateApiKey(orgId) {
        return this._organization.model.organization.update({
            where: {
                id: orgId,
            },
            data: {
                apiKey: auth_service_1.AuthService.fixedEncryption((0, make_secure_id_1.makeSecureId)(20)),
            },
        });
    }
    async getOrgsByUserId(userId) {
        return this._organization.model.organization.findMany({
            where: {
                deletedAt: null,
                users: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                users: {
                    where: {
                        userId,
                    },
                    select: {
                        disabled: true,
                        role: true,
                    },
                },
                subscription: {
                    select: {
                        subscriptionTier: true,
                        totalChannels: true,
                        isLifetime: true,
                        createdAt: true,
                    },
                },
            },
        });
    }
    async getOrgById(id) {
        return this._organization.model.organization.findUnique({
            where: {
                id,
            },
        });
    }
    getOrgByIdWithSubscription(id) {
        return this._organization.model.organization.findUnique({
            where: {
                id,
            },
            include: {
                subscription: {
                    select: {
                        subscriptionTier: true,
                        totalChannels: true,
                        isLifetime: true,
                        createdAt: true,
                    },
                },
            },
        });
    }
    async getAccountOverview(orgId) {
        const [organization, members] = await Promise.all([
            this._organization.model.organization.findUnique({
                where: {
                    id: orgId,
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    deletedAt: true,
                    allowTrial: true,
                    isTrailing: true,
                    subscription: {
                        select: {
                            subscriptionTier: true,
                            period: true,
                            identifier: true,
                            totalChannels: true,
                            isLifetime: true,
                            cancelAt: true,
                            createdAt: true,
                            updatedAt: true,
                            deletedAt: true,
                        },
                    },
                },
            }),
            this._userOrg.model.userOrganization.findMany({
                where: {
                    organizationId: orgId,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                select: {
                    role: true,
                    disabled: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            email: true,
                            activated: true,
                            providerName: true,
                            lastOnline: true,
                            createdAt: true,
                        },
                    },
                },
            }),
        ]);
        if (!organization) {
            return null;
        }
        const owner = members.find((member) => member.role === client_1.Role.SUPERADMIN);
        const lastOnlineMax = members.reduce((latest, member) => !latest || member.user.lastOnline > latest
            ? member.user.lastOnline
            : latest, null);
        return {
            organization: {
                id: organization.id,
                name: organization.name,
                createdAt: organization.createdAt,
                deletedAt: organization.deletedAt,
                allowTrial: organization.allowTrial,
                isTrailing: organization.isTrailing,
            },
            subscription: organization.subscription || null,
            owner: owner
                ? {
                    ...owner.user,
                    role: owner.role,
                    memberSince: owner.createdAt,
                }
                : null,
            users: {
                total: members.length,
                activated: members.filter((member) => member.user.activated).length,
                disabled: members.filter((member) => member.disabled).length,
                lastOnlineMax,
            },
        };
    }
    getUsersByEmail(email) {
        return this._user.model.user.findMany({
            where: {
                email,
            },
        });
    }
    async addUserToOrg(userId, id, orgId, role) {
        const checkIfInviteExists = await this._user.model.user.findFirst({
            where: {
                inviteId: id,
            },
        });
        if (checkIfInviteExists) {
            return false;
        }
        const checkIfMemberExists = await this._userOrg.model.userOrganization.findFirst({
            where: {
                userId,
                organizationId: orgId,
            },
        });
        if (checkIfMemberExists) {
            return false;
        }
        const checkForSubscription = await this._organization.model.organization.findFirst({
            where: {
                id: orgId,
            },
            select: {
                subscription: true,
            },
        });
        if (process.env.STRIPE_PUBLISHABLE_KEY &&
            checkForSubscription?.subscription?.subscriptionTier ===
                client_1.SubscriptionTier.STANDARD) {
            return false;
        }
        const create = await this._userOrg.model.userOrganization.create({
            data: {
                role,
                userId,
                organizationId: orgId,
            },
        });
        await this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                inviteId: id,
            },
        });
        return create;
    }
    async createOrgAndUser(body, hasEmail, ip, userAgent) {
        return this._organization.model.organization.create({
            data: {
                name: body.company,
                apiKey: auth_service_1.AuthService.fixedEncryption((0, make_secure_id_1.makeSecureId)(20)),
                allowTrial: true,
                isTrailing: true,
                users: {
                    create: {
                        role: client_1.Role.SUPERADMIN,
                        user: {
                            create: {
                                activated: body.provider !== 'LOCAL' || !hasEmail,
                                email: body.email,
                                password: body.password
                                    ? auth_service_1.AuthService.hashPassword(body.password)
                                    : '',
                                providerName: body.provider,
                                providerId: body.providerId || '',
                                timezone: 0,
                                ip,
                                agent: userAgent,
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                users: {
                    select: {
                        user: true,
                    },
                },
            },
        });
    }
    getOrgByCustomerId(customerId) {
        return this._organization.model.organization.findFirst({
            where: {
                paymentId: customerId,
            },
        });
    }
    async setStreak(organizationId, type) {
        try {
            await this._organization.model.organization.update({
                where: {
                    id: organizationId,
                    ...(type === 'start'
                        ? {
                            streakSince: null,
                        }
                        : {}),
                },
                data: {
                    ...(type === 'end' ? { streakSince: null } : {}),
                    ...(type === 'start' ? { streakSince: new Date() } : {}),
                },
            });
        }
        catch (err) { }
    }
    async getLastPublishDate(organizationId) {
        const lookahead = Date.now() + 5 * 60 * 1000;
        const [org, recurring] = await Promise.all([
            this._organization.model.organization.findUnique({
                where: {
                    id: organizationId,
                },
                select: {
                    post: {
                        where: {
                            deletedAt: null,
                            parentPostId: null,
                            intervalInDays: null,
                            OR: [
                                { state: 'PUBLISHED' },
                                { state: 'QUEUE', publishDate: { lte: new Date(lookahead) } },
                            ],
                        },
                        orderBy: {
                            publishDate: 'desc',
                        },
                        take: 1,
                        select: {
                            publishDate: true,
                        },
                    },
                },
            }),
            this._organization.model.organization.findUnique({
                where: {
                    id: organizationId,
                },
                select: {
                    post: {
                        where: {
                            deletedAt: null,
                            parentPostId: null,
                            intervalInDays: { not: null },
                            state: { in: ['PUBLISHED', 'QUEUE'] },
                            publishDate: { lte: new Date(lookahead) },
                        },
                        select: {
                            publishDate: true,
                            intervalInDays: true,
                        },
                    },
                },
            }),
        ]);
        const dates = [
            ...(org?.post || []).map((p) => p.publishDate.getTime()),
            ...(recurring?.post || []).map((p) => {
                const first = p.publishDate.getTime();
                const interval = p.intervalInDays * 24 * 60 * 60 * 1000;
                return first + Math.floor((lookahead - first) / interval) * interval;
            }),
        ];
        return dates.length ? Math.min(Math.max(...dates), Date.now()) : null;
    }
    async getTeam(orgId) {
        return this._organization.model.organization.findUnique({
            where: {
                id: orgId,
            },
            select: {
                users: {
                    select: {
                        role: true,
                        user: {
                            select: {
                                email: true,
                                id: true,
                                sendSuccessEmails: true,
                                sendFailureEmails: true,
                                sendStreakEmails: true,
                            },
                        },
                    },
                },
            },
        });
    }
    getAllUsersOrgs(orgId) {
        return this._organization.model.organization.findUnique({
            where: {
                id: orgId,
            },
            select: {
                users: {
                    select: {
                        user: {
                            select: {
                                email: true,
                                id: true,
                                sendSuccessEmails: true,
                                sendFailureEmails: true,
                            },
                        },
                    },
                },
            },
        });
    }
    deleteOrganization(orgId) {
        return this._organization.model.organization.update({
            where: {
                id: orgId,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async deleteTeamMember(orgId, userId) {
        return this._userOrg.model.userOrganization.delete({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: orgId,
                },
            },
        });
    }
    disableOrEnableNonSuperAdminUsers(orgId, disable) {
        return this._userOrg.model.userOrganization.updateMany({
            where: {
                organizationId: orgId,
                role: {
                    not: client_1.Role.SUPERADMIN,
                },
            },
            data: {
                disabled: disable,
            },
        });
    }
    getShortlinkPreference(orgId) {
        return this._organization.model.organization.findUnique({
            where: {
                id: orgId,
            },
            select: {
                shortlink: true,
            },
        });
    }
    updateShortlinkPreference(orgId, shortlink) {
        return this._organization.model.organization.update({
            where: {
                id: orgId,
            },
            data: {
                shortlink,
            },
        });
    }
};
exports.OrganizationRepository = OrganizationRepository;
exports.OrganizationRepository = OrganizationRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository])
], OrganizationRepository);
//# sourceMappingURL=organization.repository.js.map
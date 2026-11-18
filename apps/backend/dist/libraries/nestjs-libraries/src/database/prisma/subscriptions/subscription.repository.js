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
exports.SubscriptionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let SubscriptionRepository = class SubscriptionRepository {
    constructor(_subscription, _organization, _user, _credits, _usedCodes) {
        this._subscription = _subscription;
        this._organization = _organization;
        this._user = _user;
        this._credits = _credits;
        this._usedCodes = _usedCodes;
    }
    getUserAccount(userId) {
        return this._user.model.user.findFirst({
            where: {
                id: userId,
            },
            select: {
                account: true,
                connectedAccount: true,
            },
        });
    }
    getCode(code) {
        return this._usedCodes.model.usedCodes.findFirst({
            where: {
                code,
            },
        });
    }
    updateAccount(userId, account) {
        return this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                account,
            },
        });
    }
    getSubscriptionByOrganizationId(organizationId) {
        return this._subscription.model.subscription.findFirst({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    updateConnectedStatus(account, accountCharges) {
        return this._user.model.user.updateMany({
            where: {
                account,
            },
            data: {
                connectedAccount: accountCharges,
            },
        });
    }
    getCustomerIdByOrgId(organizationId) {
        return this._organization.model.organization.findFirst({
            where: {
                id: organizationId,
            },
            select: {
                paymentId: true,
            },
        });
    }
    checkSubscription(organizationId, subscriptionId) {
        return this._subscription.model.subscription.findFirst({
            where: {
                organizationId,
                identifier: subscriptionId,
                deletedAt: null,
            },
        });
    }
    deleteSubscriptionByCustomerId(customerId, provider) {
        return this._subscription.model.subscription.deleteMany({
            where: {
                provider,
                organization: {
                    paymentId: customerId,
                },
            },
        });
    }
    deleteSubscriptionByOrgId(organizationId, provider) {
        return this._subscription.model.subscription.deleteMany({
            where: {
                organizationId,
                provider,
            },
        });
    }
    updateCustomerId(organizationId, customerId) {
        return this._organization.model.organization.update({
            where: {
                id: organizationId,
            },
            data: {
                paymentId: customerId,
            },
        });
    }
    updateCancelAt(organizationId, cancelAt) {
        return this._subscription.model.subscription.updateMany({
            where: {
                organizationId,
                deletedAt: null,
            },
            data: {
                cancelAt: cancelAt ? new Date(cancelAt * 1000) : null,
            },
        });
    }
    async getSubscriptionByOrgId(orgId) {
        return this._subscription.model.subscription.findFirst({
            where: {
                organizationId: orgId,
            },
        });
    }
    async getSubscriptionByCustomerId(customerId) {
        return this._subscription.model.subscription.findFirst({
            where: {
                organization: {
                    paymentId: customerId,
                },
            },
        });
    }
    async getOrganizationByCustomerId(customerId) {
        return this._organization.model.organization.findFirst({
            where: {
                paymentId: customerId,
            },
        });
    }
    async createOrUpdateSubscription(provider, isTrailing, identifier, customerId, totalChannels, billing, period, cancelAt, code, org) {
        const findOrg = org || (await this.getOrganizationByCustomerId(customerId));
        if (!findOrg) {
            return;
        }
        await this._subscription.model.subscription.upsert({
            where: {
                organizationId: findOrg.id,
                ...(!code && customerId
                    ? {
                        organization: {
                            paymentId: customerId,
                        },
                    }
                    : {}),
            },
            update: {
                subscriptionTier: billing,
                provider,
                totalChannels,
                period,
                identifier,
                isLifetime: !!code,
                cancelAt: cancelAt ? new Date(cancelAt * 1000) : null,
                deletedAt: null,
            },
            create: {
                organizationId: findOrg.id,
                subscriptionTier: billing,
                provider,
                isLifetime: !!code,
                totalChannels,
                period,
                cancelAt: cancelAt ? new Date(cancelAt * 1000) : null,
                identifier,
                deletedAt: null,
            },
        });
        await this._organization.model.organization.update({
            where: {
                id: findOrg.id,
            },
            data: {
                isTrailing,
                allowTrial: false,
            },
        });
        if (code) {
            await this._usedCodes.model.usedCodes.create({
                data: {
                    code,
                    orgId: findOrg.id,
                },
            });
        }
    }
    getSubscriptionByIdentifier(identifier) {
        return this._subscription.model.subscription.findFirst({
            where: {
                identifier,
                deletedAt: null,
            },
            include: {
                organization: true,
            },
        });
    }
    getSubscription(organizationId) {
        return this._subscription.model.subscription.findFirst({
            where: {
                organizationId,
                deletedAt: null,
            },
        });
    }
    async getCreditsFrom(organizationId, from, type = 'ai_images') {
        const load = await this._credits.model.credits.groupBy({
            by: ['organizationId'],
            where: {
                organizationId,
                type,
                createdAt: {
                    gte: from.toDate(),
                },
            },
            _sum: {
                credits: true,
            },
        });
        return load?.[0]?._sum?.credits || 0;
    }
    async useCredit(org, type = 'ai_images', func) {
        const data = await this._credits.model.credits.create({
            data: {
                organizationId: org.id,
                credits: 1,
                type,
            },
        });
        try {
            return await func();
        }
        catch (err) {
            await this._credits.model.credits.delete({
                where: {
                    id: data.id,
                },
            });
            throw err;
        }
    }
    chargeCredits(id, organizationId, type, credits) {
        return this._credits.model.credits.upsert({
            where: {
                id,
            },
            create: {
                id,
                organizationId,
                credits,
                type,
            },
            update: {},
            select: {
                id: true,
            },
        });
    }
    refundCredits(organizationId, id) {
        return this._credits.model.credits.deleteMany({
            where: {
                id,
                organizationId,
            },
        });
    }
    deleteCreditsFrom(organizationId, from, type) {
        return this._credits.model.credits.deleteMany({
            where: {
                organizationId,
                type,
                createdAt: {
                    gte: from.toDate(),
                },
            },
        });
    }
    setCustomerId(orgId, customerId) {
        return this._organization.model.organization.update({
            where: {
                id: orgId,
            },
            data: {
                paymentId: customerId,
            },
        });
    }
};
exports.SubscriptionRepository = SubscriptionRepository;
exports.SubscriptionRepository = SubscriptionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository])
], SubscriptionRepository);
//# sourceMappingURL=subscription.repository.js.map
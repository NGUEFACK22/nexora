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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const pricing_1 = require("./pricing");
const subscription_repository_1 = require("./subscription.repository");
const integration_service_1 = require("../integrations/integration.service");
const organization_service_1 = require("../organizations/organization.service");
const dayjs_1 = __importDefault(require("dayjs"));
const make_is_1 = require("../../../services/make.is");
let SubscriptionService = class SubscriptionService {
    constructor(_subscriptionRepository, _integrationService, _organizationService) {
        this._subscriptionRepository = _subscriptionRepository;
        this._integrationService = _integrationService;
        this._organizationService = _organizationService;
    }
    getSubscriptionByOrganizationId(organizationId) {
        return this._subscriptionRepository.getSubscriptionByOrganizationId(organizationId);
    }
    useCredit(organization, type = 'ai_images', func) {
        return this._subscriptionRepository.useCredit(organization, type, func);
    }
    getCode(code) {
        return this._subscriptionRepository.getCode(code);
    }
    async isManagedBy(customerId, provider) {
        const current = await this._subscriptionRepository.getSubscriptionByCustomerId(customerId);
        return !current || current.provider === provider;
    }
    async deleteSubscription(customerId, provider) {
        if (!(await this.isManagedBy(customerId, provider))) {
            return { count: 0 };
        }
        await this.modifySubscription(customerId, pricing_1.pricing.FREE.channel || 0, 'FREE');
        return this._subscriptionRepository.deleteSubscriptionByCustomerId(customerId, provider);
    }
    async deleteSubscriptionByOrgId(organizationId, provider) {
        const current = await this._subscriptionRepository.getSubscriptionByOrgId(organizationId);
        if (!current || current.provider !== provider || current.isLifetime) {
            return false;
        }
        await this.modifySubscriptionByOrg(organizationId, pricing_1.pricing.FREE.channel || 0, 'FREE');
        return this._subscriptionRepository.deleteSubscriptionByOrgId(organizationId, provider);
    }
    updateCustomerId(organizationId, customerId) {
        return this._subscriptionRepository.updateCustomerId(organizationId, customerId);
    }
    updateCancelAt(organizationId, cancelAt) {
        return this._subscriptionRepository.updateCancelAt(organizationId, cancelAt);
    }
    async checkSubscription(organizationId, subscriptionId) {
        return await this._subscriptionRepository.checkSubscription(organizationId, subscriptionId);
    }
    async modifySubscriptionByOrg(organizationId, totalChannels, billing) {
        if (!organizationId) {
            return false;
        }
        const getCurrentSubscription = (await this._subscriptionRepository.getSubscriptionByOrgId(organizationId));
        const from = pricing_1.pricing[getCurrentSubscription?.subscriptionTier || 'FREE'];
        const to = pricing_1.pricing[billing];
        const allChannels = await this._integrationService.getIntegrationsList(organizationId);
        const currentTotalChannels = allChannels.filter((f) => !f.disabled);
        if (currentTotalChannels.length > totalChannels) {
            await this._integrationService.disableIntegrations(organizationId, currentTotalChannels.length - totalChannels);
        }
        if (billing !== 'FREE' &&
            currentTotalChannels.length < allChannels.length &&
            allChannels.length <= totalChannels &&
            totalChannels > (getCurrentSubscription?.totalChannels || 0)) {
            try {
                await this._integrationService.enableAllIntegrations(organizationId);
            }
            catch (err) {
                console.error('Error enabling channels after subscription change:', err);
            }
        }
        if (from.team_members && !to.team_members) {
            await this._organizationService.disableOrEnableNonSuperAdminUsers(organizationId, true);
        }
        if (!from.team_members && to.team_members) {
            await this._organizationService.disableOrEnableNonSuperAdminUsers(organizationId, false);
        }
        if (billing === 'FREE') {
            await this._integrationService.changeActiveCron(organizationId);
        }
        return true;
    }
    async modifySubscription(customerId, totalChannels, billing) {
        if (!customerId) {
            return false;
        }
        const getOrgByCustomerId = await this._subscriptionRepository.getOrganizationByCustomerId(customerId);
        const getCurrentSubscription = (await this._subscriptionRepository.getSubscriptionByCustomerId(customerId));
        if (!getOrgByCustomerId ||
            (getCurrentSubscription && getCurrentSubscription?.isLifetime)) {
            return false;
        }
        const from = pricing_1.pricing[getCurrentSubscription?.subscriptionTier || 'FREE'];
        const to = pricing_1.pricing[billing];
        const allChannels = await this._integrationService.getIntegrationsList(getOrgByCustomerId?.id);
        const currentTotalChannels = allChannels.filter((f) => !f.disabled);
        if (currentTotalChannels.length > totalChannels) {
            await this._integrationService.disableIntegrations(getOrgByCustomerId?.id, currentTotalChannels.length - totalChannels);
        }
        if (billing !== 'FREE' &&
            currentTotalChannels.length < allChannels.length &&
            allChannels.length <= totalChannels &&
            totalChannels > (getCurrentSubscription?.totalChannels || 0)) {
            try {
                await this._integrationService.enableAllIntegrations(getOrgByCustomerId?.id);
            }
            catch (err) {
                console.error('Error enabling channels after subscription change:', err);
            }
        }
        if (from.team_members && !to.team_members) {
            await this._organizationService.disableOrEnableNonSuperAdminUsers(getOrgByCustomerId?.id, true);
        }
        if (!from.team_members && to.team_members) {
            await this._organizationService.disableOrEnableNonSuperAdminUsers(getOrgByCustomerId?.id, false);
        }
        if (billing === 'FREE') {
            await this._integrationService.changeActiveCron(getOrgByCustomerId?.id);
        }
        return true;
    }
    async createOrUpdateSubscription(provider, isTrailing, identifier, customerId, totalChannels, billing, period, cancelAt, code, org) {
        if (!code) {
            if (!(await this.isManagedBy(customerId, provider))) {
                return {};
            }
            try {
                const load = await this.modifySubscription(customerId, totalChannels, billing);
                if (!load) {
                    return {};
                }
            }
            catch (e) {
                console.error('Error modifying subscription:', e);
                return {};
            }
        }
        return this._subscriptionRepository.createOrUpdateSubscription(provider, isTrailing, identifier, customerId, totalChannels, billing, period, cancelAt, code, org ? { id: org } : undefined);
    }
    async createOrUpdateSubscriptionByOrg(isTrailing, organizationId, provider, identifier, totalChannels, billing, period, cancelAt) {
        const current = await this._subscriptionRepository.getSubscriptionByOrgId(organizationId);
        if (current && (current.isLifetime || current.provider !== provider)) {
            return {};
        }
        try {
            const load = await this.modifySubscriptionByOrg(organizationId, totalChannels, billing);
            if (!load) {
                return {};
            }
        }
        catch (e) {
            console.error('Error modifying subscription:', e);
            return {};
        }
        return this._subscriptionRepository.createOrUpdateSubscription(provider, isTrailing, identifier, '', totalChannels, billing, period, cancelAt, undefined, { id: organizationId });
    }
    getSubscriptionByIdentifier(identifier) {
        return this._subscriptionRepository.getSubscriptionByIdentifier(identifier);
    }
    chargeCredits(id, organizationId, type, credits) {
        return this._subscriptionRepository.chargeCredits(id, organizationId, type, credits);
    }
    refundCredits(organizationId, id) {
        return this._subscriptionRepository.refundCredits(organizationId, id);
    }
    async getSubscription(organizationId) {
        return this._subscriptionRepository.getSubscription(organizationId);
    }
    currentPeriodStart(subscriptionCreatedAt) {
        let date = (0, dayjs_1.default)(subscriptionCreatedAt);
        while (date.isBefore((0, dayjs_1.default)())) {
            date = date.add(1, 'month');
        }
        return date.subtract(1, 'month');
    }
    async resetCredits(organizationId, type) {
        const subscription = await this._subscriptionRepository.getSubscription(organizationId);
        if (!subscription) {
            return null;
        }
        const { count } = await this._subscriptionRepository.deleteCreditsFrom(organizationId, this.currentPeriodStart(subscription.createdAt), type);
        return { deleted: count };
    }
    async checkCredits(organization, checkType = 'ai_images') {
        const type = organization?.subscription?.subscriptionTier || 'FREE';
        if (type === 'FREE') {
            return { credits: 0 };
        }
        const checkFromMonth = this.currentPeriodStart(organization.subscription.createdAt);
        const imageGenerationCount = checkType === 'ai_images'
            ? pricing_1.pricing[type].image_generation_count
            : checkType === 'clipping_minutes'
                ? pricing_1.pricing[type].clipping_minutes
                : pricing_1.pricing[type].generate_videos;
        const totalUse = await this._subscriptionRepository.getCreditsFrom(organization.id, checkFromMonth, checkType);
        return {
            credits: imageGenerationCount - totalUse,
        };
    }
    async addSubscription(orgId, userId, subscription, provider) {
        await this._subscriptionRepository.setCustomerId(orgId, userId);
        return this.createOrUpdateSubscription(provider, false, (0, make_is_1.makeId)(5), userId, pricing_1.pricing[subscription].channel, subscription, 'MONTHLY', null, undefined, orgId);
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subscription_repository_1.SubscriptionRepository,
        integration_service_1.IntegrationService,
        organization_service_1.OrganizationService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map
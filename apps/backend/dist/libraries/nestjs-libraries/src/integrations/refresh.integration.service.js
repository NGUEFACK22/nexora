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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const integration_manager_1 = require("./integration.manager");
const integration_service_1 = require("../database/prisma/integrations/integration.service");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const timer_1 = require("../../../helpers/src/utils/timer");
let RefreshIntegrationService = class RefreshIntegrationService {
    constructor(_integrationManager, _integrationService, _temporalService) {
        this._integrationManager = _integrationManager;
        this._integrationService = _integrationService;
        this._temporalService = _temporalService;
    }
    async refresh(integration, cause = '') {
        const socialProvider = this._integrationManager.getSocialIntegration(integration.providerIdentifier);
        const refresh = await this.refreshProcess(integration, socialProvider, cause);
        if (!refresh) {
            return false;
        }
        await this._integrationService.createOrUpdateIntegration(undefined, !!socialProvider.oneTimeToken, integration.organizationId, integration.name, integration.picture, 'social', integration.internalId, integration.providerIdentifier, refresh.accessToken, refresh.refreshToken, refresh.expiresIn);
        return refresh;
    }
    async setBetweenSteps(integration, cause = '') {
        await this._integrationService.setBetweenRefreshSteps(integration.id);
        await this._integrationService.informAboutRefreshError(integration.organizationId, integration, cause);
    }
    async startRefreshWorkflow(orgId, id, integration) {
        if (!integration.refreshCron) {
            return false;
        }
        return this._temporalService.client
            .getRawClient()
            ?.workflow.start(`refreshTokenWorkflow`, {
            workflowId: `refresh_${id}`,
            args: [{ integrationId: id, organizationId: orgId }],
            taskQueue: 'main',
            workflowIdConflictPolicy: 'TERMINATE_EXISTING',
        });
    }
    async refreshProcess(integration, socialProvider, cause = '') {
        let refreshError = undefined;
        const refresh = await socialProvider
            .refreshToken(integration.refreshToken)
            .catch((err) => {
            refreshError = err;
            return false;
        });
        if (!refresh || !refresh.accessToken) {
            for (let attempt = 0; attempt < 3; attempt++) {
                const stored = await this._integrationService.getIntegrationById(integration.organizationId, integration.id);
                if (!stored ||
                    stored.refreshNeeded ||
                    stored.inBetweenSteps ||
                    stored.deletedAt) {
                    break;
                }
                if (stored.internalId === integration.internalId &&
                    stored.providerIdentifier === integration.providerIdentifier &&
                    stored.refreshToken &&
                    stored.refreshToken !== integration.refreshToken &&
                    stored.token !== integration.token &&
                    stored.tokenExpiration &&
                    stored.tokenExpiration.getTime() > Date.now()) {
                    return {
                        id: stored.internalId,
                        name: stored.name,
                        username: stored.profile || '',
                        picture: stored.picture || '',
                        accessToken: stored.token,
                        refreshToken: stored.refreshToken,
                        expiresIn: Math.floor((stored.tokenExpiration.getTime() - Date.now()) / 1000),
                    };
                }
                if (attempt < 2) {
                    await (0, timer_1.timer)(1000 * (attempt + 1));
                }
            }
            console.error(`Could not refresh ${integration.providerIdentifier} integration ${integration.id}`, refreshError?.response?.data ||
                refreshError?.message ||
                refreshError ||
                'no access token returned');
            const flagged = await this._integrationService.refreshNeeded(integration.organizationId, integration.id);
            if (flagged) {
                await this._integrationService.informAboutRefreshError(integration.organizationId, integration, socialProvider.refreshErrorMessage?.(refreshError) || cause);
            }
            return false;
        }
        if (!socialProvider.reConnect ||
            integration.rootInternalId === integration.internalId) {
            return refresh;
        }
        let reConnect;
        try {
            reConnect = await socialProvider.reConnect(integration.rootInternalId, integration.internalId, refresh.accessToken);
        }
        catch (err) {
            console.error(`Could not reconnect ${integration.providerIdentifier} integration ${integration.id} after a successful token refresh`, err?.response?.data || err?.message || err);
            throw err;
        }
        return {
            ...refresh,
            ...reConnect,
        };
    }
};
exports.RefreshIntegrationService = RefreshIntegrationService;
exports.RefreshIntegrationService = RefreshIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => integration_service_1.IntegrationService))),
    __metadata("design:paramtypes", [integration_manager_1.IntegrationManager,
        integration_service_1.IntegrationService,
        nestjs_temporal_core_1.TemporalService])
], RefreshIntegrationService);
//# sourceMappingURL=refresh.integration.service.js.map
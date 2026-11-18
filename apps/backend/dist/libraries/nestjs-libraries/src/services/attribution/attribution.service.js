"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributionService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const attribution_provider_manager_1 = require("@gitroom/nestjs-libraries/services/attribution/attribution.provider.manager");
let AttributionService = class AttributionService {
    constructor(_attributionProviderManager) {
        this._attributionProviderManager = _attributionProviderManager;
    }
    queryParams() {
        return (0, lodash_1.uniq)(this._attributionProviderManager
            .getProviders()
            .map((p) => p.provider.queryParam));
    }
    async lead(user, attribution) {
        try {
            await Promise.all(this._attributionProviderManager
                .getProviders()
                .map(async ({ name, provider }) => {
                const clickId = attribution?.[provider.queryParam];
                try {
                    await provider.lead({
                        id: user.id,
                        email: user.email?.includes('@') ? user.email : '',
                        firstName: user.name || '',
                        lastName: user.lastName || '',
                    }, typeof clickId === 'string' && clickId.length <= 500
                        ? clickId
                        : '');
                }
                catch (err) {
                    console.error(`Attribution provider ${name} failed to report user ${user.id}:`, err);
                }
            }));
        }
        catch (err) {
            console.error(`Attribution failed to report user ${user.id}:`, err);
        }
    }
};
exports.AttributionService = AttributionService;
exports.AttributionService = AttributionService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [attribution_provider_manager_1.AttributionProviderManager])
], AttributionService);
//# sourceMappingURL=attribution.service.js.map
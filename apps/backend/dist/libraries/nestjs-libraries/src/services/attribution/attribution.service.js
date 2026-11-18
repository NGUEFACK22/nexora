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
exports.AttributionService = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const attribution_provider_manager_1 = require("./attribution.provider.manager");
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
exports.AttributionService = AttributionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [attribution_provider_manager_1.AttributionProviderManager])
], AttributionService);
//# sourceMappingURL=attribution.service.js.map
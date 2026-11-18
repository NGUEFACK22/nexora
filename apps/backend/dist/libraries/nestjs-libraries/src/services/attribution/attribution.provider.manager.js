"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributionProviderManager = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const attribution_provider_interface_1 = require("@gitroom/nestjs-libraries/services/attribution/attribution.provider.interface");
let AttributionProviderManager = class AttributionProviderManager {
    constructor(_moduleRef) {
        this._moduleRef = _moduleRef;
    }
    getProviders() {
        const metadata = Reflect.getMetadata('attribution-provider', attribution_provider_interface_1.AttributionProviderAbstract) ||
            [];
        return metadata
            .map((m) => ({
            name: m.provider,
            provider: this._moduleRef.get(m.target, {
                strict: false,
            }),
        }))
            .filter((p) => p.provider.isEnabled());
    }
};
exports.AttributionProviderManager = AttributionProviderManager;
exports.AttributionProviderManager = AttributionProviderManager = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [core_1.ModuleRef])
], AttributionProviderManager);
//# sourceMappingURL=attribution.provider.manager.js.map
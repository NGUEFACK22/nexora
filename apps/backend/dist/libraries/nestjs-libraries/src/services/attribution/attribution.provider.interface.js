"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributionProviderAbstract = void 0;
exports.AttributionProvider = AttributionProvider;
const common_1 = require("@nestjs/common");
class AttributionProviderAbstract {
}
exports.AttributionProviderAbstract = AttributionProviderAbstract;
function AttributionProvider(params) {
    return function (target) {
        (0, common_1.Injectable)()(target);
        const existingMetadata = Reflect.getMetadata('attribution-provider', AttributionProviderAbstract) ||
            [];
        existingMetadata.push({ target, provider: params.provider });
        Reflect.defineMetadata('attribution-provider', existingMetadata, AttributionProviderAbstract);
    };
}
//# sourceMappingURL=attribution.provider.interface.js.map
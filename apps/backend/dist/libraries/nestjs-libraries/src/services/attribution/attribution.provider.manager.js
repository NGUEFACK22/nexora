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
exports.AttributionProviderManager = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const attribution_provider_interface_1 = require("./attribution.provider.interface");
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
exports.AttributionProviderManager = AttributionProviderManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], AttributionProviderManager);
//# sourceMappingURL=attribution.provider.manager.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdPartyModule = void 0;
const common_1 = require("@nestjs/common");
const heygen_provider_1 = require("./heygen/heygen.provider");
const reelfarm_provider_1 = require("./reelfarm/reelfarm.provider");
const hubspot_provider_1 = require("./hubspot/hubspot.provider");
const thirdparty_manager_1 = require("./thirdparty.manager");
let ThirdPartyModule = class ThirdPartyModule {
};
exports.ThirdPartyModule = ThirdPartyModule;
exports.ThirdPartyModule = ThirdPartyModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            heygen_provider_1.HeygenProvider,
            reelfarm_provider_1.ReelFarmProvider,
            hubspot_provider_1.HubspotProvider,
            thirdparty_manager_1.ThirdPartyManager,
        ],
        get exports() {
            return this.providers;
        },
    })
], ThirdPartyModule);
//# sourceMappingURL=thirdparty.module.js.map
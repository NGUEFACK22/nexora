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
exports.ThirdPartyManager = void 0;
const common_1 = require("@nestjs/common");
const thirdparty_interface_1 = require("./thirdparty.interface");
const core_1 = require("@nestjs/core");
const third_party_service_1 = require("../database/prisma/third-party/third-party.service");
let ThirdPartyManager = class ThirdPartyManager {
    constructor(_moduleRef, _thirdPartyService) {
        this._moduleRef = _moduleRef;
        this._thirdPartyService = _thirdPartyService;
    }
    getAllThirdParties() {
        return (Reflect.getMetadata('third:party', thirdparty_interface_1.ThirdPartyAbstract) || [])
            .filter((p) => !p.installUrl || p.installUrl())
            .map((p) => ({
            identifier: p.identifier,
            title: p.title,
            description: p.description,
            fields: p.fields || [],
            installUrl: p.installUrl?.(),
        }));
    }
    getThirdPartyByName(identifier) {
        const thirdParty = (Reflect.getMetadata('third:party', thirdparty_interface_1.ThirdPartyAbstract) || []).find((p) => p.identifier === identifier);
        return { ...thirdParty, instance: this._moduleRef.get(thirdParty.target) };
    }
    deleteIntegration(org, id) {
        return this._thirdPartyService.deleteIntegration(org, id);
    }
    getIntegrationById(org, id) {
        return this._thirdPartyService.getIntegrationById(org, id);
    }
    getAllThirdPartiesByOrganization(org) {
        return this._thirdPartyService.getAllThirdPartiesByOrganization(org);
    }
    saveIntegration(org, identifier, apiKey, data) {
        return this._thirdPartyService.saveIntegration(org, identifier, apiKey, data);
    }
};
exports.ThirdPartyManager = ThirdPartyManager;
exports.ThirdPartyManager = ThirdPartyManager = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        third_party_service_1.ThirdPartyService])
], ThirdPartyManager);
//# sourceMappingURL=thirdparty.manager.js.map
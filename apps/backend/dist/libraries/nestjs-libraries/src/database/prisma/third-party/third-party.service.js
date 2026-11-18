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
exports.ThirdPartyService = void 0;
const common_1 = require("@nestjs/common");
const third_party_repository_1 = require("./third-party.repository");
let ThirdPartyService = class ThirdPartyService {
    constructor(_thirdPartyRepository) {
        this._thirdPartyRepository = _thirdPartyRepository;
    }
    getAllThirdPartiesByOrganization(org) {
        return this._thirdPartyRepository.getAllThirdPartiesByOrganization(org);
    }
    deleteIntegration(org, id) {
        return this._thirdPartyRepository.deleteIntegration(org, id);
    }
    getIntegrationById(org, id) {
        return this._thirdPartyRepository.getIntegrationById(org, id);
    }
    saveIntegration(org, identifier, apiKey, data) {
        return this._thirdPartyRepository.saveIntegration(org, identifier, apiKey, data);
    }
};
exports.ThirdPartyService = ThirdPartyService;
exports.ThirdPartyService = ThirdPartyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [third_party_repository_1.ThirdPartyRepository])
], ThirdPartyService);
//# sourceMappingURL=third-party.service.js.map
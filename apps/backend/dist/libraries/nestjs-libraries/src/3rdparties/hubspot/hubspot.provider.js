"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubspotProvider = void 0;
const thirdparty_interface_1 = require("../thirdparty.interface");
const oauth_service_1 = require("../../database/prisma/oauth/oauth.service");
let HubspotProvider = class HubspotProvider extends thirdparty_interface_1.ThirdPartyAbstract {
    async checkConnection() {
        return false;
    }
    async sendData() {
        throw new Error('HubSpot provider does not support sendData');
    }
};
exports.HubspotProvider = HubspotProvider;
exports.HubspotProvider = HubspotProvider = __decorate([
    (0, thirdparty_interface_1.ThirdParty)({
        identifier: 'hubspot',
        title: 'HubSpot',
        description: 'Schedule and manage your posts from HubSpot agents in Agent Builder.',
        fields: [],
        installUrl: oauth_service_1.hubspotInstallUrl,
    })
], HubspotProvider);
//# sourceMappingURL=hubspot.provider.js.map
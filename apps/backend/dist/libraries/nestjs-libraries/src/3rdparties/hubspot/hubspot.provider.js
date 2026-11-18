"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubspotProvider = void 0;
const tslib_1 = require("tslib");
const thirdparty_interface_1 = require("@gitroom/nestjs-libraries/3rdparties/thirdparty.interface");
const oauth_service_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service");
let HubspotProvider = class HubspotProvider extends thirdparty_interface_1.ThirdPartyAbstract {
    async checkConnection() {
        return false;
    }
    async sendData() {
        throw new Error('HubSpot provider does not support sendData');
    }
};
exports.HubspotProvider = HubspotProvider;
exports.HubspotProvider = HubspotProvider = tslib_1.__decorate([
    (0, thirdparty_interface_1.ThirdParty)({
        identifier: 'hubspot',
        title: 'HubSpot',
        description: 'Schedule and manage your posts from HubSpot agents in Agent Builder.',
        fields: [],
        installUrl: oauth_service_1.hubspotInstallUrl,
    })
], HubspotProvider);
//# sourceMappingURL=hubspot.provider.js.map
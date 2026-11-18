"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadJourneyProvider = void 0;
const tslib_1 = require("tslib");
const attribution_provider_interface_1 = require("@gitroom/nestjs-libraries/services/attribution/attribution.provider.interface");
const timer_1 = require("@gitroom/helpers/utils/timer");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let LeadJourneyProvider = class LeadJourneyProvider extends attribution_provider_interface_1.AttributionProviderAbstract {
    constructor() {
        super(...arguments);
        this.queryParam = 'lj_click_id';
    }
    isEnabled() {
        return (!!process.env.LEADJOURNEY_POSTBACK_URL &&
            !!process.env.LEADJOURNEY_POSTBACK_SECRET);
    }
    async lead(lead, clickId) {
        const click_id = UUID.test(clickId) ? clickId : '';
        if (!click_id && !lead.email) {
            return;
        }
        const body = JSON.stringify({
            type: 'Lead',
            click_id,
            tag: 'signup',
            email: lead.email,
            firstname: lead.firstName,
            lastname: lead.lastName,
        });
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(process.env.LEADJOURNEY_POSTBACK_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.LEADJOURNEY_POSTBACK_SECRET}`,
                        'Content-Type': 'application/json',
                    },
                    body,
                    signal: AbortSignal.timeout(15000),
                });
                if (response.ok) {
                    await response.body?.cancel().catch(() => { });
                    return;
                }
                console.error(`LeadJourney rejected the lead of user ${lead.id}:`, response.status, await response.text().catch(() => ''));
                if (response.status < 500) {
                    return;
                }
            }
            catch (err) {
                console.error(`LeadJourney failed to send the lead of user ${lead.id}:`, err);
            }
            if (attempt === 1) {
                await (0, timer_1.timer)(5000);
            }
        }
    }
};
exports.LeadJourneyProvider = LeadJourneyProvider;
exports.LeadJourneyProvider = LeadJourneyProvider = tslib_1.__decorate([
    (0, attribution_provider_interface_1.AttributionProvider)({ provider: 'leadjourney' })
], LeadJourneyProvider);
//# sourceMappingURL=leadjourney.provider.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackService = void 0;
const track_enum_1 = require("../user/track.enum");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const facebook_provider_1 = require("../integrations/social/facebook.provider");
let TrackService = class TrackService {
    hashValue(value) {
        return (0, crypto_1.createHash)('sha256')
            .update(value.trim().toLowerCase())
            .digest('hex');
    }
    toFbc(fbc) {
        return fbc.startsWith('fb.') ? fbc : `fb.1.${Date.now()}.${fbc}`;
    }
    async track(uniqueId, ip, agent, tt, additional, fbc, user, fbp) {
        const accessToken = process.env.FACEBOOK_PIXEL_ACCESS_TOKEN;
        const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL;
        const userAgent = agent || user?.agent;
        if (!accessToken || !pixelId || !userAgent) {
            return;
        }
        try {
            const clientIp = ip || user?.ip;
            const response = await fetch(`https://graph.facebook.com/${facebook_provider_1.META_GRAPH_API_VERSION}/${pixelId}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    data: [
                        {
                            event_name: track_enum_1.TrackEnum[tt],
                            event_time: Math.floor(Date.now() / 1000),
                            event_id: uniqueId || user?.id,
                            event_source_url: process.env.FRONTEND_URL,
                            action_source: 'website',
                            user_data: {
                                client_user_agent: userAgent,
                                ...(clientIp ? { client_ip_address: clientIp } : {}),
                                ...(user?.email?.includes('@')
                                    ? { em: [this.hashValue(user.email)] }
                                    : {}),
                                ...(fbc ? { fbc: this.toFbc(fbc) } : {}),
                                ...(fbp ? { fbp } : {}),
                            },
                            ...(additional?.value
                                ? {
                                    custom_data: {
                                        value: additional.value,
                                        currency: (additional.currency || 'USD').toUpperCase(),
                                    },
                                }
                                : {}),
                        },
                    ],
                }),
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                console.error(`Facebook pixel rejected ${track_enum_1.TrackEnum[tt]}:`, await response.text());
                return;
            }
            await response.body?.cancel();
        }
        catch (err) {
            console.error(`Facebook pixel failed to send ${track_enum_1.TrackEnum[tt]}:`, err);
        }
    }
};
exports.TrackService = TrackService;
exports.TrackService = TrackService = __decorate([
    (0, common_1.Injectable)()
], TrackService);
//# sourceMappingURL=track.service.js.map
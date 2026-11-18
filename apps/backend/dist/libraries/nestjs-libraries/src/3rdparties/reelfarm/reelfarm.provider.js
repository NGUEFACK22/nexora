"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelFarmProvider = void 0;
const thirdparty_interface_1 = require("../thirdparty.interface");
const BASE_URL = 'https://reel.farm/api/v1';
let ReelFarmProvider = class ReelFarmProvider extends thirdparty_interface_1.ThirdPartyAbstract {
    async checkConnection(apiKey) {
        const res = await fetch(`${BASE_URL}/videos?limit=1`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
        if (!res.ok) {
            return false;
        }
        return {
            name: 'Reel.Farm',
            username: 'reelfarm',
            id: apiKey.slice(-8),
        };
    }
    async listMedia(apiKey, data) {
        const page = data?.page || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const allVideos = [];
        for (const videoType of ['ugc', 'greenscreen']) {
            const res = await fetch(`${BASE_URL}/videos?video_type=${videoType}&status=completed&limit=${limit}&offset=${offset}`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });
            if (res.ok) {
                const body = await res.json();
                const videos = body.videos || body.data || [];
                console.log(body);
                allVideos.push(...videos.map((v) => ({
                    ...v,
                    _video_type: videoType,
                })));
            }
        }
        const total = allVideos.length;
        console.log(allVideos);
        return {
            results: allVideos.slice(0, limit).map((v) => ({
                id: String(v.id || v.video_id),
                url: v.video_url || v.url || v.download_url || '',
                thumbnail: v.thumbnail_url || v.thumbnail || v.preview_url || '',
                name: `${v._video_type}`,
                type: 'video',
            })),
            pages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async importMedia(apiKey, items) {
        return items
            .filter((item) => item.url)
            .map((item) => ({
            url: item.url.split('#')[0].split('?')[0],
            name: item.name || 'reelfarm-video',
        }));
    }
    async sendData() {
        throw new Error('ReelFarm media-library provider does not support sendData');
    }
};
exports.ReelFarmProvider = ReelFarmProvider;
exports.ReelFarmProvider = ReelFarmProvider = __decorate([
    (0, thirdparty_interface_1.ThirdParty)({
        identifier: 'reelfarm',
        title: 'Reel.Farm',
        description: 'Import UGC and greenscreen videos from your Reel.Farm account.',
        position: 'media-library',
        fields: [],
    })
], ReelFarmProvider);
//# sourceMappingURL=reelfarm.provider.js.map
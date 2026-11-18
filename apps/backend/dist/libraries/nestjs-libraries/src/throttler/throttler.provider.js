"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerRealIpGuard = exports.ThrottlerBehindProxyGuard = void 0;
const throttler_1 = require("@nestjs/throttler");
const common_1 = require("@nestjs/common");
const isPublicComment = (method, url) => method === 'POST' && /^\/public\/posts\/[^/]+\/comments/.test(url);
let ThrottlerBehindProxyGuard = class ThrottlerBehindProxyGuard extends throttler_1.ThrottlerGuard {
    async canActivate(context) {
        const { url, method } = context.switchToHttp().getRequest();
        if ((method === 'POST' && url.includes('/public/v1/posts')) ||
            isPublicComment(method, url)) {
            return super.canActivate(context);
        }
        return true;
    }
    async getTracker(req) {
        if (!req.org) {
            const forwarded = String(req.headers?.['x-forwarded-for'] || '')
                .split(',')[0]
                .trim();
            return 'ip_' + (forwarded || req.ip || 'unknown');
        }
        return (req.org.id + '_' + (req.url.indexOf('/posts') > -1 ? 'posts' : 'other'));
    }
};
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard;
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard = __decorate([
    (0, common_1.Injectable)()
], ThrottlerBehindProxyGuard);
let ThrottlerRealIpGuard = class ThrottlerRealIpGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        const forwarded = String(req.headers?.['x-forwarded-for'] || '');
        return forwarded.split(',')[0].trim() || req.ip;
    }
};
exports.ThrottlerRealIpGuard = ThrottlerRealIpGuard;
exports.ThrottlerRealIpGuard = ThrottlerRealIpGuard = __decorate([
    (0, common_1.Injectable)()
], ThrottlerRealIpGuard);
//# sourceMappingURL=throttler.provider.js.map
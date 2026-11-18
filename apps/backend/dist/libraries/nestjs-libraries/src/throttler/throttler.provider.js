"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrottlerRealIpGuard = exports.ThrottlerBehindProxyGuard = void 0;
const tslib_1 = require("tslib");
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
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ThrottlerBehindProxyGuard);
let ThrottlerRealIpGuard = class ThrottlerRealIpGuard extends throttler_1.ThrottlerGuard {
    async getTracker(req) {
        const forwarded = String(req.headers?.['x-forwarded-for'] || '');
        return forwarded.split(',')[0].trim() || req.ip;
    }
};
exports.ThrottlerRealIpGuard = ThrottlerRealIpGuard;
exports.ThrottlerRealIpGuard = ThrottlerRealIpGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ThrottlerRealIpGuard);
//# sourceMappingURL=throttler.provider.js.map
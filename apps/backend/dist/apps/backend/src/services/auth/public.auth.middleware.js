"use strict";
var PublicAuthMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicAuthMiddleware = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const organization_service_1 = require("@gitroom/nestjs-libraries/database/prisma/organizations/organization.service");
const oauth_service_1 = require("@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service");
const exception_filter_1 = require("@gitroom/nestjs-libraries/services/exception.filter");
const initialize_sentry_1 = require("@gitroom/nestjs-libraries/sentry/initialize.sentry");
let PublicAuthMiddleware = PublicAuthMiddleware_1 = class PublicAuthMiddleware {
    constructor(_organizationService, _oauthService) {
        this._organizationService = _organizationService;
        this._oauthService = _oauthService;
        this._logger = new common_1.Logger(PublicAuthMiddleware_1.name);
    }
    setOrg(req, org) {
        req.org = { ...org, users: [{ users: { role: 'SUPERADMIN' } }] };
    }
    async use(req, res, next) {
        const auth = (req.headers.authorization ||
            req.headers.Authorization);
        if (!auth) {
            res.status(common_1.HttpStatus.UNAUTHORIZED).json({ msg: 'No API Key found' });
            return;
        }
        try {
            let org;
            const isOAuthApp = auth.startsWith('pos_');
            req.isOAuthApp = isOAuthApp;
            if (isOAuthApp) {
                const authorization = await this._oauthService.getOrgByOAuthToken(auth);
                if (!authorization) {
                    res
                        .status(common_1.HttpStatus.UNAUTHORIZED)
                        .json({ msg: 'Invalid OAuth token' });
                    return;
                }
                org = authorization.organization;
                req.oauthUserId = authorization.userId;
            }
            else {
                org = await this._organizationService.getOrgByApiKey(auth);
                if (!org) {
                    res
                        .status(common_1.HttpStatus.UNAUTHORIZED)
                        .json({ msg: 'Invalid API key' });
                    return;
                }
            }
            if (!!process.env.STRIPE_SECRET_KEY && !org.subscription) {
                res
                    .status(common_1.HttpStatus.UNAUTHORIZED)
                    .json({ msg: 'No subscription found' });
                return;
            }
            this.setOrg(req, org);
            const includeDeleted = req.headers['x-postiz-include-deleted']?.trim() === 'true';
            req.authOrgId = org.id;
            req.includeDeleted = includeDeleted;
            const overrideOrgId = req.headers['x-postiz-org']?.trim();
            if (overrideOrgId) {
                if (isOAuthApp ||
                    !(await this._organizationService.canUseSuperAdminApi(org.id))) {
                    res.status(common_1.HttpStatus.FORBIDDEN).json({ msg: 'Unauthorized' });
                    return;
                }
                const overrideOrg = await this._organizationService.getOrgByIdWithSubscription(overrideOrgId);
                if (!overrideOrg || (overrideOrg.deletedAt && !includeDeleted)) {
                    res
                        .status(common_1.HttpStatus.NOT_FOUND)
                        .json({ msg: 'Organization not found' });
                    return;
                }
                this.setOrg(req, overrideOrg);
                this._logger.log(`Organization override performed by organization ${org.id}: acting as ${overrideOrg.id} on ${req.method} ${req.path}`);
            }
        }
        catch (err) {
            throw new exception_filter_1.HttpForbiddenException();
        }
        (0, initialize_sentry_1.setSentryUserContext)({
            orgId: req.org.id,
            paymentId: req.org.paymentId,
        });
        next();
    }
};
exports.PublicAuthMiddleware = PublicAuthMiddleware;
exports.PublicAuthMiddleware = PublicAuthMiddleware = PublicAuthMiddleware_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [organization_service_1.OrganizationService,
        oauth_service_1.OAuthService])
], PublicAuthMiddleware);
//# sourceMappingURL=public.auth.middleware.js.map
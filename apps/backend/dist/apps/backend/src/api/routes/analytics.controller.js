"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const org_from_request_1 = require("@gitroom/nestjs-libraries/user/org.from.request");
const swagger_1 = require("@nestjs/swagger");
const integration_service_1 = require("@gitroom/nestjs-libraries/database/prisma/integrations/integration.service");
const posts_service_1 = require("@gitroom/nestjs-libraries/database/prisma/posts/posts.service");
let AnalyticsController = class AnalyticsController {
    constructor(_integrationService, _postsService) {
        this._integrationService = _integrationService;
        this._postsService = _postsService;
    }
    async getIntegration(org, integration, date) {
        return this._integrationService.checkAnalytics(org, integration, date);
    }
    async getPostAnalytics(org, postId, date) {
        return this._postsService.checkPostAnalytics(org.id, postId, +date);
    }
};
exports.AnalyticsController = AnalyticsController;
tslib_1.__decorate([
    (0, common_1.Get)('/:integration'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('integration')),
    tslib_1.__param(2, (0, common_1.Query)('date')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getIntegration", null);
tslib_1.__decorate([
    (0, common_1.Get)('/post/:postId'),
    tslib_1.__param(0, (0, org_from_request_1.GetOrgFromRequest)()),
    tslib_1.__param(1, (0, common_1.Param)('postId')),
    tslib_1.__param(2, (0, common_1.Query)('date')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPostAnalytics", null);
exports.AnalyticsController = AnalyticsController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('Analytics'),
    (0, common_1.Controller)('/analytics'),
    tslib_1.__metadata("design:paramtypes", [integration_service_1.IntegrationService,
        posts_service_1.PostsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map
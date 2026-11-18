"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const permission_exception_class_1 = require("./permission.exception.class");
let SubscriptionExceptionFilter = class SubscriptionExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const error = exception.getResponse();
        const message = getErrorMessage(error);
        const role = ctx.getRequest()?.org?.users?.[0]?.role;
        response.status(status).json({
            statusCode: status,
            message,
            url: process.env.FRONTEND_URL + '/billing',
            ...(role
                ? { canManageBillingUi: role === 'SUPERADMIN' || role === 'ADMIN' }
                : {}),
        });
    }
};
exports.SubscriptionExceptionFilter = SubscriptionExceptionFilter;
exports.SubscriptionExceptionFilter = SubscriptionExceptionFilter = __decorate([
    (0, common_1.Catch)(permission_exception_class_1.SubscriptionException)
], SubscriptionExceptionFilter);
const getErrorMessage = (error) => {
    switch (error.section) {
        case permission_exception_class_1.Sections.POSTS_PER_MONTH:
            switch (error.action) {
                default:
                    return 'You have reached the maximum number of posts for your subscription. Please upgrade your subscription to add more posts.';
            }
        case permission_exception_class_1.Sections.CHANNEL:
            switch (error.action) {
                default:
                    return 'You have reached the maximum number of channels for your subscription. Please upgrade your subscription to add more channels.';
            }
        case permission_exception_class_1.Sections.WEBHOOKS:
            switch (error.action) {
                default:
                    return 'You have reached the maximum number of webhooks for your subscription. Please upgrade your subscription to add more webhooks.';
            }
        case permission_exception_class_1.Sections.VIDEOS_PER_MONTH:
            switch (error.action) {
                default:
                    return 'You have reached the maximum number of generated videos for your subscription. Please upgrade your subscription to generate more videos.';
            }
        case permission_exception_class_1.Sections.ADMIN:
            switch (error.action) {
                default:
                    return 'Only an admin of this organization can do this.';
            }
        case permission_exception_class_1.Sections.CLIPPING_MINUTES:
            switch (error.action) {
                default:
                    return 'You have used all the clipping minutes of your subscription for this month. Please upgrade your subscription to clip more videos.';
            }
    }
};
//# sourceMappingURL=subscription.exception.js.map
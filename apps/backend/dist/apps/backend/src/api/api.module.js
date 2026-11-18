"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./routes/auth.controller");
const auth_service_1 = require("../services/auth/auth.service");
const users_controller_1 = require("./routes/users.controller");
const auth_middleware_1 = require("../services/auth/auth.middleware");
const stripe_service_1 = require("../../../../libraries/nestjs-libraries/src/services/stripe.service");
const payment_controller_1 = require("./routes/payment.controller");
const payment_service_1 = require("../../../../libraries/nestjs-libraries/src/services/payment/payment.service");
const payment_provider_manager_1 = require("../../../../libraries/nestjs-libraries/src/services/payment/payment.provider.manager");
const revenuecat_provider_1 = require("../../../../libraries/nestjs-libraries/src/services/payment/providers/revenuecat.provider");
const analytics_controller_1 = require("./routes/analytics.controller");
const permissions_guard_1 = require("../services/auth/permissions/permissions.guard");
const permissions_service_1 = require("../services/auth/permissions/permissions.service");
const integrations_controller_1 = require("./routes/integrations.controller");
const integration_manager_1 = require("../../../../libraries/nestjs-libraries/src/integrations/integration.manager");
const settings_controller_1 = require("./routes/settings.controller");
const posts_controller_1 = require("./routes/posts.controller");
const media_controller_1 = require("./routes/media.controller");
const clipping_controller_1 = require("./routes/clipping.controller");
const media_widget_controller_1 = require("./routes/media.widget.controller");
const upload_widget_auth_middleware_1 = require("../services/auth/upload.widget.auth.middleware");
const clipping_widget_controller_1 = require("./routes/clipping.widget.controller");
const clipping_widget_auth_middleware_1 = require("../services/auth/clipping.widget.auth.middleware");
const upload_module_1 = require("../../../../libraries/nestjs-libraries/src/upload/upload.module");
const billing_controller_1 = require("./routes/billing.controller");
const notifications_controller_1 = require("./routes/notifications.controller");
const openai_service_1 = require("../../../../libraries/nestjs-libraries/src/openai/openai.service");
const extract_content_service_1 = require("../../../../libraries/nestjs-libraries/src/openai/extract.content.service");
const codes_service_1 = require("../../../../libraries/nestjs-libraries/src/services/codes.service");
const copilot_controller_1 = require("./routes/copilot.controller");
const public_controller_1 = require("./routes/public.controller");
const root_controller_1 = require("./routes/root.controller");
const track_service_1 = require("../../../../libraries/nestjs-libraries/src/track/track.service");
const short_link_service_1 = require("../../../../libraries/nestjs-libraries/src/short-linking/short.link.service");
const webhooks_controller_1 = require("./routes/webhooks.controller");
const signature_controller_1 = require("./routes/signature.controller");
const autopost_controller_1 = require("./routes/autopost.controller");
const sets_controller_1 = require("./routes/sets.controller");
const third_party_controller_1 = require("./routes/third-party.controller");
const monitor_controller_1 = require("./routes/monitor.controller");
const no_auth_integrations_controller_1 = require("./routes/no.auth.integrations.controller");
const enterprise_controller_1 = require("./routes/enterprise.controller");
const oauth_app_controller_1 = require("./routes/oauth-app.controller");
const approved_apps_controller_1 = require("./routes/approved-apps.controller");
const oauth_controller_1 = require("./routes/oauth.controller");
const announcements_controller_1 = require("./routes/announcements.controller");
const admin_controller_1 = require("./routes/admin.controller");
const providers_manager_1 = require("../services/auth/providers/providers.manager");
const github_provider_1 = require("../services/auth/providers/github.provider");
const google_provider_1 = require("../services/auth/providers/google.provider");
const apple_provider_1 = require("../services/auth/providers/apple.provider");
const farcaster_provider_1 = require("../services/auth/providers/farcaster.provider");
const wallet_provider_1 = require("../services/auth/providers/wallet.provider");
const oauth_provider_1 = require("../services/auth/providers/oauth.provider");
const stripe_controller_1 = require("./routes/stripe.controller");
const authenticatedController = [
    users_controller_1.UsersController,
    analytics_controller_1.AnalyticsController,
    integrations_controller_1.IntegrationsController,
    settings_controller_1.SettingsController,
    posts_controller_1.PostsController,
    media_controller_1.MediaController,
    clipping_controller_1.ClippingController,
    billing_controller_1.BillingController,
    notifications_controller_1.NotificationsController,
    copilot_controller_1.CopilotController,
    webhooks_controller_1.WebhookController,
    signature_controller_1.SignatureController,
    autopost_controller_1.AutopostController,
    sets_controller_1.SetsController,
    third_party_controller_1.ThirdPartyController,
    oauth_app_controller_1.OAuthAppController,
    approved_apps_controller_1.ApprovedAppsController,
    oauth_controller_1.OAuthAuthorizedController,
    announcements_controller_1.AnnouncementsController,
    admin_controller_1.AdminController,
];
let ApiModule = class ApiModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes(...authenticatedController);
        consumer.apply(upload_widget_auth_middleware_1.UploadWidgetAuthMiddleware).forRoutes(media_widget_controller_1.MediaWidgetController);
        consumer
            .apply(clipping_widget_auth_middleware_1.ClippingWidgetAuthMiddleware)
            .forRoutes(clipping_widget_controller_1.ClippingWidgetController);
    }
};
exports.ApiModule = ApiModule;
exports.ApiModule = ApiModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule],
        controllers: process.env.MCP_ONLY
            ? [
                root_controller_1.RootController,
                oauth_controller_1.OAuthController,
                media_widget_controller_1.MediaWidgetController,
                clipping_widget_controller_1.ClippingWidgetController,
            ]
            : [
                root_controller_1.RootController,
                payment_controller_1.PaymentController,
                stripe_controller_1.StripeController,
                auth_controller_1.AuthController,
                public_controller_1.PublicController,
                monitor_controller_1.MonitorController,
                enterprise_controller_1.EnterpriseController,
                no_auth_integrations_controller_1.NoAuthIntegrationsController,
                oauth_controller_1.OAuthController,
                media_widget_controller_1.MediaWidgetController,
                clipping_widget_controller_1.ClippingWidgetController,
                ...authenticatedController,
            ],
        providers: [
            auth_service_1.AuthService,
            stripe_service_1.StripeService,
            payment_service_1.PaymentService,
            payment_provider_manager_1.PaymentProviderManager,
            revenuecat_provider_1.RevenueCatProvider,
            openai_service_1.OpenaiService,
            extract_content_service_1.ExtractContentService,
            auth_middleware_1.AuthMiddleware,
            upload_widget_auth_middleware_1.UploadWidgetAuthMiddleware,
            permissions_guard_1.PoliciesGuard,
            permissions_service_1.PermissionsService,
            codes_service_1.CodesService,
            integration_manager_1.IntegrationManager,
            track_service_1.TrackService,
            short_link_service_1.ShortLinkService,
            providers_manager_1.AuthProviderManager,
            github_provider_1.GithubProvider,
            google_provider_1.GoogleProvider,
            apple_provider_1.AppleProvider,
            farcaster_provider_1.FarcasterProvider,
            wallet_provider_1.WalletProvider,
            oauth_provider_1.OauthProvider,
        ],
        get exports() {
            return [...this.imports, ...this.providers];
        },
    })
], ApiModule);
//# sourceMappingURL=api.module.js.map
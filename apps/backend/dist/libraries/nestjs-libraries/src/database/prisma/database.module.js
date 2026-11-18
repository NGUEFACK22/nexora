"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const organization_repository_1 = require("./organizations/organization.repository");
const organization_service_1 = require("./organizations/organization.service");
const users_service_1 = require("./users/users.service");
const users_repository_1 = require("./users/users.repository");
const subscription_service_1 = require("./subscriptions/subscription.service");
const subscription_repository_1 = require("./subscriptions/subscription.repository");
const notification_service_1 = require("./notifications/notification.service");
const integration_service_1 = require("./integrations/integration.service");
const integration_repository_1 = require("./integrations/integration.repository");
const posts_service_1 = require("./posts/posts.service");
const posts_repository_1 = require("./posts/posts.repository");
const integration_manager_1 = require("../../integrations/integration.manager");
const media_service_1 = require("./media/media.service");
const media_repository_1 = require("./media/media.repository");
const notifications_repository_1 = require("./notifications/notifications.repository");
const email_service_1 = require("../../services/email.service");
const encryption_service_1 = require("../../services/encryption.service");
const stripe_service_1 = require("../../services/stripe.service");
const payment_service_1 = require("../../services/payment/payment.service");
const payment_provider_manager_1 = require("../../services/payment/payment.provider.manager");
const revenuecat_provider_1 = require("../../services/payment/providers/revenuecat.provider");
const attribution_service_1 = require("../../services/attribution/attribution.service");
const attribution_provider_manager_1 = require("../../services/attribution/attribution.provider.manager");
const leadjourney_provider_1 = require("../../services/attribution/providers/leadjourney.provider");
const extract_content_service_1 = require("../../openai/extract.content.service");
const openai_service_1 = require("../../openai/openai.service");
const deepgram_service_1 = require("../../deepgram/deepgram.service");
const clipping_service_1 = require("./clipping/clipping.service");
const clipping_repository_1 = require("./clipping/clipping.repository");
const agencies_service_1 = require("./agencies/agencies.service");
const agencies_repository_1 = require("./agencies/agencies.repository");
const track_service_1 = require("../../track/track.service");
const short_link_service_1 = require("../../short-linking/short.link.service");
const webhooks_repository_1 = require("./webhooks/webhooks.repository");
const webhooks_service_1 = require("./webhooks/webhooks.service");
const signature_repository_1 = require("./signatures/signature.repository");
const signature_service_1 = require("./signatures/signature.service");
const autopost_repository_1 = require("./autopost/autopost.repository");
const autopost_service_1 = require("./autopost/autopost.service");
const sets_service_1 = require("./sets/sets.service");
const sets_repository_1 = require("./sets/sets.repository");
const third_party_repository_1 = require("./third-party/third-party.repository");
const third_party_service_1 = require("./third-party/third-party.service");
const video_manager_1 = require("../../videos/video.manager");
const fal_service_1 = require("../../openai/fal.service");
const refresh_integration_service_1 = require("../../integrations/refresh.integration.service");
const oauth_repository_1 = require("./oauth/oauth.repository");
const oauth_service_1 = require("./oauth/oauth.service");
const announcements_repository_1 = require("./announcements/announcements.repository");
const announcements_service_1 = require("./announcements/announcements.service");
const errors_repository_1 = require("./errors/errors.repository");
const errors_service_1 = require("./errors/errors.service");
const admin_stats_repository_1 = require("./admin-stats/admin-stats.repository");
const admin_stats_service_1 = require("./admin-stats/admin-stats.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [],
        controllers: [],
        providers: [
            prisma_service_1.PrismaService,
            prisma_service_1.PrismaRepository,
            prisma_service_1.PrismaTransaction,
            users_service_1.UsersService,
            users_repository_1.UsersRepository,
            organization_service_1.OrganizationService,
            organization_repository_1.OrganizationRepository,
            subscription_service_1.SubscriptionService,
            subscription_repository_1.SubscriptionRepository,
            notification_service_1.NotificationService,
            notifications_repository_1.NotificationsRepository,
            webhooks_repository_1.WebhooksRepository,
            webhooks_service_1.WebhooksService,
            integration_service_1.IntegrationService,
            integration_repository_1.IntegrationRepository,
            posts_service_1.PostsService,
            posts_repository_1.PostsRepository,
            stripe_service_1.StripeService,
            payment_service_1.PaymentService,
            payment_provider_manager_1.PaymentProviderManager,
            revenuecat_provider_1.RevenueCatProvider,
            attribution_service_1.AttributionService,
            attribution_provider_manager_1.AttributionProviderManager,
            leadjourney_provider_1.LeadJourneyProvider,
            signature_repository_1.SignatureRepository,
            autopost_repository_1.AutopostRepository,
            autopost_service_1.AutopostService,
            signature_service_1.SignatureService,
            media_service_1.MediaService,
            media_repository_1.MediaRepository,
            agencies_service_1.AgenciesService,
            agencies_repository_1.AgenciesRepository,
            integration_manager_1.IntegrationManager,
            refresh_integration_service_1.RefreshIntegrationService,
            extract_content_service_1.ExtractContentService,
            openai_service_1.OpenaiService,
            deepgram_service_1.DeepgramService,
            clipping_service_1.ClippingService,
            clipping_repository_1.ClippingRepository,
            fal_service_1.FalService,
            email_service_1.EmailService,
            encryption_service_1.EncryptionService,
            track_service_1.TrackService,
            short_link_service_1.ShortLinkService,
            sets_service_1.SetsService,
            sets_repository_1.SetsRepository,
            third_party_repository_1.ThirdPartyRepository,
            third_party_service_1.ThirdPartyService,
            oauth_repository_1.OAuthRepository,
            oauth_service_1.OAuthService,
            video_manager_1.VideoManager,
            announcements_repository_1.AnnouncementsRepository,
            announcements_service_1.AnnouncementsService,
            errors_repository_1.ErrorsRepository,
            errors_service_1.ErrorsService,
            admin_stats_repository_1.AdminStatsRepository,
            admin_stats_service_1.AdminStatsService,
        ],
        get exports() {
            return this.providers;
        },
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map
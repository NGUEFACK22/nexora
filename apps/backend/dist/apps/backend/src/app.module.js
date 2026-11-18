"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../../../libraries/nestjs-libraries/src/database/prisma/database.module");
const api_module_1 = require("./api/api.module");
const core_1 = require("@nestjs/core");
const permissions_guard_1 = require("./services/auth/permissions/permissions.guard");
const public_api_module_1 = require("./public-api/public.api.module");
const throttler_provider_1 = require("../../../libraries/nestjs-libraries/src/throttler/throttler.provider");
const throttler_1 = require("@nestjs/throttler");
const agent_module_1 = require("../../../libraries/nestjs-libraries/src/agent/agent.module");
const thirdparty_module_1 = require("../../../libraries/nestjs-libraries/src/3rdparties/thirdparty.module");
const video_module_1 = require("../../../libraries/nestjs-libraries/src/videos/video.module");
const setup_1 = require("@sentry/nestjs/setup");
const sentry_exception_1 = require("../../../libraries/nestjs-libraries/src/sentry/sentry.exception");
const chat_module_1 = require("../../../libraries/nestjs-libraries/src/chat/chat.module");
const temporal_module_1 = require("../../../libraries/nestjs-libraries/src/temporal/temporal.module");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const temporal_register_1 = require("../../../libraries/nestjs-libraries/src/temporal/temporal.register");
const infinite_workflow_register_1 = require("../../../libraries/nestjs-libraries/src/temporal/infinite.workflow.register");
const throttler_storage_redis_1 = require("@nest-lab/throttler-storage-redis");
const redis_service_1 = require("../../../libraries/nestjs-libraries/src/redis/redis.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            setup_1.SentryModule.forRoot(),
            database_module_1.DatabaseModule,
            api_module_1.ApiModule,
            public_api_module_1.PublicApiModule,
            agent_module_1.AgentModule,
            thirdparty_module_1.ThirdPartyModule,
            video_module_1.VideoModule,
            chat_module_1.ChatModule,
            ...(process.env.TEMPORAL_ADDRESS &&
                process.env.TEMPORAL_ADDRESS.indexOf('<') === -1
                ? [
                    (0, temporal_module_1.getTemporalModule)(false),
                    temporal_register_1.TemporalRegisterMissingSearchAttributesModule,
                    infinite_workflow_register_1.InfiniteWorkflowRegisterModule,
                ]
                : [
                    {
                        provide: nestjs_temporal_core_1.TemporalService,
                        useValue: {
                            client: { getRawClient: () => undefined },
                        },
                    },
                ]),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [
                    {
                        ttl: 3600000,
                        limit: process.env.API_LIMIT ? Number(process.env.API_LIMIT) : 90,
                    },
                ],
                storage: new throttler_storage_redis_1.ThrottlerStorageRedisService(redis_service_1.ioRedis),
            }),
        ],
        controllers: [],
        providers: [
            sentry_exception_1.FILTER,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_provider_1.ThrottlerBehindProxyGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PoliciesGuard,
            },
        ],
        exports: [
            database_module_1.DatabaseModule,
            api_module_1.ApiModule,
            public_api_module_1.PublicApiModule,
            agent_module_1.AgentModule,
            throttler_1.ThrottlerModule,
            chat_module_1.ChatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
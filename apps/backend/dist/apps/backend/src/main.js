"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNestApp = createNestApp;
const tslib_1 = require("tslib");
const initialize_sentry_1 = require("@gitroom/nestjs-libraries/sentry/initialize.sentry");
(0, initialize_sentry_1.initializeSentry)('backend', true);
const compression_1 = tslib_1.__importDefault(require("compression"));
const load_swagger_1 = require("@gitroom/helpers/swagger/load.swagger");
const express_1 = require("express");
process.env.TZ = 'UTC';
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const subscription_exception_1 = require("@gitroom/backend/services/auth/permissions/subscription.exception");
const posts_validation_exception_1 = require("@gitroom/backend/api/routes/posts.validation.exception");
const exception_filter_1 = require("@gitroom/nestjs-libraries/services/exception.filter");
const configuration_checker_1 = require("@gitroom/helpers/configuration/configuration.checker");
const start_mcp_1 = require("@gitroom/nestjs-libraries/chat/start.mcp");
async function createNestApp() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
        cors: {
            ...(!process.env.NOT_SECURED ? { credentials: true } : {}),
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'auth',
                'showorg',
                'impersonate',
                'x-postiz-org',
                'x-postiz-include-deleted',
                'x-copilotkit-runtime-client-gql-version',
            ],
            exposedHeaders: [
                'reload',
                'onboarding',
                'activate',
                'x-copilotkit-runtime-client-gql-version',
                ...(process.env.NOT_SECURED ? ['auth', 'showorg', 'impersonate'] : []),
            ],
            origin: [
                process.env.FRONTEND_URL,
                'http://localhost:6274',
                ...(process.env.MAIN_URL ? [process.env.MAIN_URL] : []),
                ...(process.env.CANVA_APP_ORIGIN
                    ? [
                        process.env.CANVA_APP_ORIGIN.trim()
                            .replace(/\/+$/, '')
                            .toLowerCase(),
                    ]
                    : []),
            ],
        },
    });
    if (process.env.SERVERLESS !== 'true') {
        await (0, start_mcp_1.startMcp)(app);
    }
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
    }));
    app.use(['/copilot/{*splat}', '/posts'], (req, res, next) => {
        (0, express_1.json)({ limit: '50mb' })(req, res, next);
    });
    app.use((0, cookie_parser_1.default)());
    app.use((0, compression_1.default)());
    app.useGlobalFilters(new subscription_exception_1.SubscriptionExceptionFilter());
    app.useGlobalFilters(new posts_validation_exception_1.PostValidationExceptionFilter());
    app.useGlobalFilters(new exception_filter_1.HttpExceptionFilter());
    (0, load_swagger_1.loadSwagger)(app);
    return app;
}
async function start() {
    const app = await createNestApp();
    const port = process.env.PORT || 3000;
    try {
        await app.listen(port);
        const server = app.getHttpServer();
        server.keepAliveTimeout = 905_000;
        server.headersTimeout = 906_000;
        console.log('Backend started successfully on port ' + port);
        checkConfiguration();
        common_1.Logger.log(`🚀 Backend is running on: http://localhost:${port}`);
    }
    catch (e) {
        common_1.Logger.error(`Backend failed to start on port ${port}`, e);
    }
}
function checkConfiguration() {
    const checker = new configuration_checker_1.ConfigurationChecker();
    checker.readEnvFromProcess();
    checker.check();
    if (checker.hasIssues()) {
        for (const issue of checker.getIssues()) {
            common_1.Logger.warn(issue, 'Configuration issue');
        }
        common_1.Logger.warn('Configuration issues found: ' + checker.getIssuesCount());
    }
    else {
        common_1.Logger.log('Configuration check completed without any issues');
    }
}
if (!process.env.VERCEL) {
    start();
}
//# sourceMappingURL=main.js.map
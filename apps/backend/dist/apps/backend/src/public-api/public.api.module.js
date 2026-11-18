"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicApiModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth/auth.service");
const stripe_service_1 = require("../../../../libraries/nestjs-libraries/src/services/stripe.service");
const permissions_guard_1 = require("../services/auth/permissions/permissions.guard");
const permissions_service_1 = require("../services/auth/permissions/permissions.service");
const integration_manager_1 = require("../../../../libraries/nestjs-libraries/src/integrations/integration.manager");
const upload_module_1 = require("../../../../libraries/nestjs-libraries/src/upload/upload.module");
const openai_service_1 = require("../../../../libraries/nestjs-libraries/src/openai/openai.service");
const extract_content_service_1 = require("../../../../libraries/nestjs-libraries/src/openai/extract.content.service");
const codes_service_1 = require("../../../../libraries/nestjs-libraries/src/services/codes.service");
const public_integrations_controller_1 = require("./routes/v1/public.integrations.controller");
const public_auth_middleware_1 = require("../services/auth/public.auth.middleware");
const super_admin_guard_1 = require("../services/auth/super.admin.guard");
const authenticatedController = [public_integrations_controller_1.PublicIntegrationsController];
let PublicApiModule = class PublicApiModule {
    configure(consumer) {
        consumer.apply(public_auth_middleware_1.PublicAuthMiddleware).forRoutes(...authenticatedController);
    }
};
exports.PublicApiModule = PublicApiModule;
exports.PublicApiModule = PublicApiModule = __decorate([
    (0, common_1.Module)({
        imports: [upload_module_1.UploadModule],
        controllers: process.env.MCP_ONLY ? [] : [...authenticatedController],
        providers: [
            auth_service_1.AuthService,
            stripe_service_1.StripeService,
            openai_service_1.OpenaiService,
            extract_content_service_1.ExtractContentService,
            permissions_guard_1.PoliciesGuard,
            permissions_service_1.PermissionsService,
            codes_service_1.CodesService,
            integration_manager_1.IntegrationManager,
            super_admin_guard_1.SuperAdminGuard,
        ],
        get exports() {
            return [...this.imports, ...this.providers];
        },
    })
], PublicApiModule);
//# sourceMappingURL=public.api.module.js.map
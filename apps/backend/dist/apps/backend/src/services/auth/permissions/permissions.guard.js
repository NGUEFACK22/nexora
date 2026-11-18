"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliciesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_service_1 = require("./permissions.service");
const permissions_ability_1 = require("./permissions.ability");
const permission_exception_class_1 = require("./permission.exception.class");
let PoliciesGuard = class PoliciesGuard {
    constructor(_reflector, _authorizationService) {
        this._reflector = _reflector;
        this._authorizationService = _authorizationService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        if (request.path.indexOf('/auth') > -1 ||
            request.path.indexOf('/auth') > -1 ||
            request.path.indexOf('/integrations/social-connect') > -1 ||
            request.path.indexOf('/integrations/provider') > -1) {
            return true;
        }
        const policyHandlers = this._reflector.get(permissions_ability_1.CHECK_POLICIES_KEY, context.getHandler()) || [];
        if (!policyHandlers || !policyHandlers.length) {
            return true;
        }
        const { org } = request;
        const refreshChannelId = typeof request.query?.refresh === 'string' ? request.query.refresh : undefined;
        const ability = await this._authorizationService.check(org.id, org.createdAt, org.users[0].role, policyHandlers, refreshChannelId);
        const item = policyHandlers.find((handler) => !this.execPolicyHandler(handler, ability));
        if (item) {
            throw new permission_exception_class_1.SubscriptionException({
                section: item[1],
                action: item[0],
            });
        }
        return true;
    }
    execPolicyHandler(handler, ability) {
        return ability.can(handler[0], handler[1]);
    }
};
exports.PoliciesGuard = PoliciesGuard;
exports.PoliciesGuard = PoliciesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permissions_service_1.PermissionsService])
], PoliciesGuard);
//# sourceMappingURL=permissions.guard.js.map
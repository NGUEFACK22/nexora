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
exports.WebhooksRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let WebhooksRepository = class WebhooksRepository {
    constructor(_webhooks) {
        this._webhooks = _webhooks;
    }
    getTotal(orgId) {
        return this._webhooks.model.webhooks.count({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
    }
    getWebhooks(orgId) {
        return this._webhooks.model.webhooks.findMany({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
            include: {
                integrations: {
                    select: {
                        integration: {
                            select: {
                                id: true,
                                picture: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    deleteWebhook(orgId, id) {
        return this._webhooks.model.webhooks.update({
            where: {
                id,
                organizationId: orgId,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async createWebhook(orgId, body) {
        const { id } = await this._webhooks.model.webhooks.upsert({
            where: {
                id: body.id || (0, uuid_1.v4)(),
                organizationId: orgId,
            },
            create: {
                organizationId: orgId,
                url: body.url,
                name: body.name,
            },
            update: {
                url: body.url,
                name: body.name,
            },
        });
        await this._webhooks.model.webhooks.update({
            where: {
                id,
                organizationId: orgId,
            },
            data: {
                integrations: {
                    deleteMany: {},
                    create: body.integrations.map((integration) => ({
                        integrationId: integration.id,
                    })),
                },
            },
        });
        return { id };
    }
};
exports.WebhooksRepository = WebhooksRepository;
exports.WebhooksRepository = WebhooksRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository])
], WebhooksRepository);
//# sourceMappingURL=webhooks.repository.js.map
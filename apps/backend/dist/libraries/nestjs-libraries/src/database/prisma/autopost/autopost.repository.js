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
exports.AutopostRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let AutopostRepository = class AutopostRepository {
    constructor(_autoPost) {
        this._autoPost = _autoPost;
    }
    getTotal(orgId) {
        return this._autoPost.model.autoPost.count({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
    }
    getAutoposts(orgId) {
        return this._autoPost.model.autoPost.findMany({
            where: {
                organizationId: orgId,
                deletedAt: null,
            },
        });
    }
    deleteAutopost(orgId, id) {
        return this._autoPost.model.autoPost.update({
            where: {
                id,
                organizationId: orgId,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }
    getAutopost(id) {
        return this._autoPost.model.autoPost.findUnique({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
    updateUrl(id, url) {
        return this._autoPost.model.autoPost.update({
            where: {
                id,
            },
            data: {
                lastUrl: url,
            },
        });
    }
    changeActive(orgId, id, active) {
        return this._autoPost.model.autoPost.update({
            where: {
                id,
                organizationId: orgId,
            },
            data: {
                active,
            },
        });
    }
    async createAutopost(orgId, body, id) {
        const { id: newId, active } = await this._autoPost.model.autoPost.upsert({
            where: {
                id: id || (0, uuid_1.v4)(),
                organizationId: orgId,
            },
            create: {
                organizationId: orgId,
                url: body.url,
                title: body.title,
                integrations: JSON.stringify(body.integrations),
                active: body.active,
                content: body.content,
                generateContent: body.generateContent,
                addPicture: body.addPicture,
                syncLast: body.syncLast,
                onSlot: body.onSlot,
                lastUrl: body.lastUrl,
            },
            update: {
                url: body.url,
                title: body.title,
                integrations: JSON.stringify(body.integrations),
                active: body.active,
                content: body.content,
                generateContent: body.generateContent,
                addPicture: body.addPicture,
                syncLast: body.syncLast,
                onSlot: body.onSlot,
                lastUrl: body.lastUrl,
            },
        });
        return { id: newId, active };
    }
};
exports.AutopostRepository = AutopostRepository;
exports.AutopostRepository = AutopostRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository])
], AutopostRepository);
//# sourceMappingURL=autopost.repository.js.map
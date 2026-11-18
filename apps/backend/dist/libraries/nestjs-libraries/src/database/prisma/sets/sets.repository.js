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
exports.SetsRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let SetsRepository = class SetsRepository {
    constructor(_sets) {
        this._sets = _sets;
    }
    getTotal(orgId) {
        return this._sets.model.sets.count({
            where: {
                organizationId: orgId,
            },
        });
    }
    getSets(orgId) {
        return this._sets.model.sets.findMany({
            where: {
                organizationId: orgId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    deleteSet(orgId, id) {
        return this._sets.model.sets.delete({
            where: {
                id,
                organizationId: orgId,
            },
        });
    }
    async createSet(orgId, body) {
        const { id } = await this._sets.model.sets.upsert({
            where: {
                id: body.id || (0, uuid_1.v4)(),
                organizationId: orgId,
            },
            create: {
                id: body.id || (0, uuid_1.v4)(),
                organizationId: orgId,
                name: body.name,
                content: body.content,
            },
            update: {
                name: body.name,
                content: body.content,
            },
        });
        return { id };
    }
};
exports.SetsRepository = SetsRepository;
exports.SetsRepository = SetsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository])
], SetsRepository);
//# sourceMappingURL=sets.repository.js.map
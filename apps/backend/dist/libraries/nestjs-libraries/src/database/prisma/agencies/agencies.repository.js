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
exports.AgenciesRepository = void 0;
const prisma_service_1 = require("../prisma.service");
const common_1 = require("@nestjs/common");
let AgenciesRepository = class AgenciesRepository {
    constructor(_socialMediaAgencies, _socialMediaAgenciesNiche) {
        this._socialMediaAgencies = _socialMediaAgencies;
        this._socialMediaAgenciesNiche = _socialMediaAgenciesNiche;
    }
    getAllAgencies() {
        return this._socialMediaAgencies.model.socialMediaAgency.findMany({
            where: {
                deletedAt: null,
                approved: true,
            },
            include: {
                logo: true,
                niches: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    getCount() {
        return this._socialMediaAgencies.model.socialMediaAgency.count({
            where: {
                deletedAt: null,
                approved: true,
            },
        });
    }
    getAllAgenciesSlug() {
        return this._socialMediaAgencies.model.socialMediaAgency.findMany({
            where: {
                deletedAt: null,
                approved: true,
            },
            select: {
                slug: true,
            },
        });
    }
    approveOrDecline(action, id) {
        return this._socialMediaAgencies.model.socialMediaAgency.update({
            where: {
                id,
            },
            data: {
                approved: action === 'approve',
            },
        });
    }
    getAgencyById(id) {
        return this._socialMediaAgencies.model.socialMediaAgency.findFirst({
            where: {
                id,
                deletedAt: null,
                approved: true,
            },
            include: {
                logo: true,
                niches: true,
                user: true,
            },
        });
    }
    getAgencyInformation(agency) {
        return this._socialMediaAgencies.model.socialMediaAgency.findFirst({
            where: {
                slug: agency,
                deletedAt: null,
                approved: true,
            },
            include: {
                logo: true,
                niches: true,
            },
        });
    }
    getAgencyByUser(user) {
        return this._socialMediaAgencies.model.socialMediaAgency.findFirst({
            where: {
                userId: user.id,
                deletedAt: null,
            },
            include: {
                logo: true,
                niches: true,
            },
        });
    }
    async createAgency(user, body) {
        const insertAgency = await this._socialMediaAgencies.model.socialMediaAgency.upsert({
            where: {
                userId: user.id,
            },
            update: {
                userId: user.id,
                name: body.name,
                website: body.website,
                facebook: body.facebook,
                instagram: body.instagram,
                twitter: body.twitter,
                linkedIn: body.linkedIn,
                youtube: body.youtube,
                tiktok: body.tiktok,
                logoId: body.logo.id,
                shortDescription: body.shortDescription,
                description: body.description,
                approved: false,
            },
            create: {
                userId: user.id,
                name: body.name,
                website: body.website,
                facebook: body.facebook,
                instagram: body.instagram,
                twitter: body.twitter,
                linkedIn: body.linkedIn,
                youtube: body.youtube,
                tiktok: body.tiktok,
                logoId: body.logo.id,
                shortDescription: body.shortDescription,
                description: body.description,
                slug: body.name.toLowerCase().replace(/ /g, '-'),
                approved: false,
            },
            select: {
                id: true,
            },
        });
        await this._socialMediaAgenciesNiche.model.socialMediaAgencyNiche.deleteMany({
            where: {
                agencyId: insertAgency.id,
                niche: {
                    notIn: body.niches,
                },
            },
        });
        const currentNiche = await this._socialMediaAgenciesNiche.model.socialMediaAgencyNiche.findMany({
            where: {
                agencyId: insertAgency.id,
            },
            select: {
                niche: true,
            },
        });
        const addNewNiche = body.niches.filter((n) => !currentNiche.some((c) => c.niche === n));
        await this._socialMediaAgenciesNiche.model.socialMediaAgencyNiche.createMany({
            data: addNewNiche.map((n) => ({
                agencyId: insertAgency.id,
                niche: n,
            })),
        });
        return insertAgency;
    }
};
exports.AgenciesRepository = AgenciesRepository;
exports.AgenciesRepository = AgenciesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository])
], AgenciesRepository);
//# sourceMappingURL=agencies.repository.js.map
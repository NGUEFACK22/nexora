"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClippingRepository = void 0;
const tslib_1 = require("tslib");
const prisma_service_1 = require("@gitroom/nestjs-libraries/database/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let ClippingRepository = class ClippingRepository {
    constructor(_clipping, _clippingClip, _transaction) {
        this._clipping = _clipping;
        this._clippingClip = _clippingClip;
        this._transaction = _transaction;
    }
    createClipping(org, url, maxClips, fit, integrations) {
        return this._clipping.model.clipping.create({
            data: {
                organizationId: org,
                url,
                maxClips,
                fit,
                integrations: JSON.stringify(integrations),
            },
            select: {
                id: true,
                status: true,
            },
        });
    }
    getRunningClippings(org) {
        return this._clipping.model.clipping.findMany({
            where: {
                organizationId: org,
                deletedAt: null,
                status: {
                    notIn: ['completed', 'failed'],
                },
            },
            select: {
                id: true,
                status: true,
                createdAt: true,
            },
        });
    }
    countClippingsSince(org, since) {
        return this._clipping.model.clipping.count({
            where: {
                organizationId: org,
                createdAt: {
                    gte: since,
                },
            },
        });
    }
    getClippingById(id) {
        return this._clipping.model.clipping.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                clips: {
                    orderBy: {
                        start: 'asc',
                    },
                },
            },
        });
    }
    getClipping(org, id) {
        return this._clipping.model.clipping.findFirst({
            where: {
                id,
                organizationId: org,
                deletedAt: null,
            },
            select: {
                id: true,
                url: true,
                status: true,
                error: true,
                title: true,
                thumbnail: true,
                duration: true,
                createdAt: true,
                clips: {
                    orderBy: {
                        start: 'asc',
                    },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        start: true,
                        end: true,
                        status: true,
                        error: true,
                        mediaId: true,
                        path: true,
                        thumbnail: true,
                    },
                },
            },
        });
    }
    getClippingProgress(org, id) {
        return this._clipping.model.clipping.findFirst({
            where: {
                id,
                organizationId: org,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
                error: true,
                title: true,
                clips: {
                    orderBy: {
                        start: 'asc',
                    },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        error: true,
                        mediaId: true,
                        path: true,
                        thumbnail: true,
                    },
                },
            },
        });
    }
    async getClippings(org, page) {
        const pageNum = Math.max(+page || 1, 1) - 1;
        const where = {
            organizationId: org,
            deletedAt: null,
        };
        const pages = Math.ceil((await this._clipping.model.clipping.count({ where })) / 20);
        const results = await this._clipping.model.clipping.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                url: true,
                status: true,
                error: true,
                title: true,
                thumbnail: true,
                duration: true,
                createdAt: true,
            },
            skip: pageNum * 20,
            take: 20,
        });
        return {
            pages,
            results,
        };
    }
    updateClipping(org, id, data) {
        return this._clipping.model.clipping.update({
            where: {
                id,
                organizationId: org,
            },
            data,
            select: {
                id: true,
                status: true,
            },
        });
    }
    createClips(clippingId, clips) {
        return this._transaction.model.$transaction(async (tx) => {
            await tx.clipping.update({
                where: { id: clippingId },
                data: { updatedAt: new Date() },
                select: { id: true },
            });
            const select = { where: { clippingId }, select: { id: true } };
            const existing = await tx.clippingClip.findMany(select);
            if (existing.length) {
                return existing;
            }
            await tx.clippingClip.createMany({
                data: clips.map((clip) => ({
                    clippingId,
                    ...clip,
                })),
            });
            return tx.clippingClip.findMany(select);
        });
    }
    failUnfinishedClips(clippingId, error) {
        return this._clippingClip.model.clippingClip.updateMany({
            where: {
                clippingId,
                status: 'pending',
            },
            data: {
                status: 'failed',
                error,
            },
        });
    }
    async claimClipDraft(id) {
        const { count } = await this._clippingClip.model.clippingClip.updateMany({
            where: {
                id,
                draftedAt: null,
            },
            data: {
                draftedAt: new Date(),
            },
        });
        return count === 1;
    }
    getClipById(id) {
        return this._clippingClip.model.clippingClip.findUnique({
            where: {
                id,
            },
            include: {
                clipping: true,
            },
        });
    }
    updateClip(id, data) {
        return this._clippingClip.model.clippingClip.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                status: true,
            },
        });
    }
};
exports.ClippingRepository = ClippingRepository;
exports.ClippingRepository = ClippingRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaTransaction])
], ClippingRepository);
//# sourceMappingURL=clipping.repository.js.map
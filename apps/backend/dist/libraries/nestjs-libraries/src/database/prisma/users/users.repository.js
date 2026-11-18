"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const tslib_1 = require("tslib");
const prisma_service_1 = require("@gitroom/nestjs-libraries/database/prisma/prisma.service");
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const client_1 = require("@prisma/client");
const auth_service_1 = require("@gitroom/helpers/auth/auth.service");
const make_is_1 = require("@gitroom/nestjs-libraries/services/make.is");
let UsersRepository = class UsersRepository {
    constructor(_user, _transaction) {
        this._user = _user;
        this._transaction = _transaction;
    }
    async switchUserCredentials(currentUserId, targetUserId) {
        const current = await this._user.model.user.findUnique({
            where: { id: currentUserId },
        });
        const target = await this._user.model.user.findUnique({
            where: { id: targetUserId },
        });
        if (!current || !target) {
            throw new Error('User not found');
        }
        const currentCredentials = {
            email: current.email,
            password: current.password,
            providerName: current.providerName,
            providerId: current.providerId,
            account: current.account,
            connectedAccount: current.connectedAccount,
            activated: current.activated,
        };
        const targetCredentials = {
            email: target.email,
            password: target.password,
            providerName: target.providerName,
            providerId: target.providerId,
            account: target.account,
            connectedAccount: target.connectedAccount,
            activated: target.activated,
        };
        await this._transaction.model.$transaction([
            this._user.model.user.update({
                where: { id: current.id },
                data: { email: `switch-${(0, make_is_1.makeId)(10)}-${current.email}` },
            }),
            this._user.model.user.update({
                where: { id: target.id },
                data: currentCredentials,
            }),
            this._user.model.user.update({
                where: { id: current.id },
                data: targetCredentials,
            }),
        ]);
        return {
            kept: { id: current.id, email: targetCredentials.email },
            switched: { id: target.id, email: currentCredentials.email },
        };
    }
    getImpersonateUser(name) {
        return this._user.model.user.findMany({
            where: {
                deletedAt: null,
                OR: [
                    {
                        name: {
                            contains: name,
                        },
                    },
                    {
                        email: {
                            contains: name,
                        },
                    },
                    {
                        id: {
                            contains: name,
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 10,
        });
    }
    getUserById(id) {
        return this._user.model.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }
    getUserByEmail(email) {
        return this._user.model.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive',
                },
                providerName: client_1.Provider.LOCAL,
                deletedAt: null,
            },
            include: {
                picture: {
                    select: {
                        id: true,
                        path: true,
                    },
                },
            },
        });
    }
    getUserWithActiveSubscriptionByEmail(email, excludeUserId) {
        return this._user.model.user.findFirst({
            where: {
                email,
                id: { not: excludeUserId },
                deletedAt: null,
                organizations: {
                    some: {
                        role: client_1.Role.SUPERADMIN,
                        organization: {
                            subscription: { is: { deletedAt: null } },
                        },
                    },
                },
            },
            select: { id: true, email: true, providerName: true },
        });
    }
    activateUser(id) {
        return this._user.model.user.update({
            where: {
                id,
            },
            data: {
                activated: true,
            },
        });
    }
    getUserByProvider(providerId, provider) {
        return this._user.model.user.findFirst({
            where: {
                providerId,
                providerName: provider,
                deletedAt: null,
            },
        });
    }
    async deleteAccount(userId) {
        const user = await this._user.model.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user || user.deletedAt) {
            return;
        }
        const hash = (value) => (0, crypto_1.createHash)('md5').update(value).digest('hex');
        return this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                email: `deleted_${hash(user.email.toLowerCase())}_${(0, make_is_1.makeId)(5)}`,
                password: null,
                name: user.name ? hash(user.name) : null,
                lastName: user.lastName ? hash(user.lastName) : null,
                providerId: user.providerId ? hash(user.providerId) : null,
                bio: null,
                ip: null,
                agent: null,
                account: null,
                pictureId: null,
                deletedAt: new Date(),
            },
        });
    }
    updatePassword(id, password) {
        return this._user.model.user.update({
            where: {
                id,
                providerName: client_1.Provider.LOCAL,
            },
            data: {
                password: auth_service_1.AuthService.hashPassword(password),
            },
        });
    }
    changeAudienceSize(userId, audience) {
        return this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                audience,
            },
        });
    }
    async getPersonal(userId) {
        const user = await this._user.model.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                bio: true,
                picture: {
                    select: {
                        id: true,
                        path: true,
                    },
                },
            },
        });
        return user;
    }
    async changePersonal(userId, body) {
        await this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                name: body.fullname,
                bio: body.bio,
                picture: body.picture
                    ? {
                        connect: {
                            id: body.picture.id,
                        },
                    }
                    : {
                        disconnect: true,
                    },
            },
        });
    }
    async getEmailNotifications(userId) {
        return this._user.model.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                sendSuccessEmails: true,
                sendFailureEmails: true,
                sendStreakEmails: true,
            },
        });
    }
    async updateEmailNotifications(userId, body) {
        await this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                sendSuccessEmails: body.sendSuccessEmails,
                sendFailureEmails: body.sendFailureEmails,
                sendStreakEmails: body.sendStreakEmails,
            },
        });
    }
    async updateTimezone(userId, body) {
        await this._user.model.user.update({
            where: {
                id: userId,
            },
            data: {
                timezoneName: body.timezoneName || null,
            },
            select: {
                id: true,
            },
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [prisma_service_1.PrismaRepository,
        prisma_service_1.PrismaTransaction])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map
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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const notifications_repository_1 = require("./notifications.repository");
const email_service_1 = require("../../../services/email.service");
const organization_repository_1 = require("../organizations/organization.repository");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const common_2 = require("@temporalio/common");
const temporal_search_attribute_1 = require("../../../temporal/temporal.search.attribute");
let NotificationService = class NotificationService {
    constructor(_notificationRepository, _emailService, _organizationRepository, _temporalService) {
        this._notificationRepository = _notificationRepository;
        this._emailService = _emailService;
        this._organizationRepository = _organizationRepository;
        this._temporalService = _temporalService;
    }
    getMainPageCount(organizationId, userId) {
        return this._notificationRepository.getMainPageCount(organizationId, userId);
    }
    getNotificationsPaginated(organizationId, page) {
        return this._notificationRepository.getNotificationsPaginated(organizationId, page);
    }
    getNotifications(organizationId, userId) {
        return this._notificationRepository.getNotifications(organizationId, userId);
    }
    async inAppNotification(orgId, subject, message, sendEmail = false, digest = false, type = 'success') {
        await this._notificationRepository.createNotification(orgId, message);
        if (!sendEmail) {
            return;
        }
        if (digest) {
            try {
                await this._temporalService.client
                    .getRawClient()
                    ?.workflow.signalWithStart('digestEmailWorkflow', {
                    workflowId: 'digest_email_workflow_' + orgId,
                    signal: 'email',
                    signalArgs: [
                        [
                            {
                                title: subject,
                                message,
                                type,
                            },
                        ],
                    ],
                    taskQueue: 'main',
                    workflowIdConflictPolicy: 'USE_EXISTING',
                    args: [{ organizationId: orgId }],
                    typedSearchAttributes: new common_2.TypedSearchAttributes([
                        {
                            key: temporal_search_attribute_1.organizationId,
                            value: orgId,
                        },
                    ]),
                });
            }
            catch (err) { }
            return;
        }
        await this.sendEmailsToOrg(orgId, subject, message, type);
    }
    async sendEmailsToOrg(orgId, subject, message, type) {
        const userOrg = await this._organizationRepository.getAllUsersOrgs(orgId);
        for (const user of userOrg?.users || []) {
            if (type !== 'info') {
                if (type === 'success' && !user.user.sendSuccessEmails) {
                    continue;
                }
                if (type === 'fail' && !user.user.sendFailureEmails) {
                    continue;
                }
            }
            await this.sendEmail(user.user.email, subject, message);
        }
    }
    async sendEmail(to, subject, html, replyTo) {
        await this._emailService.sendEmail(to, subject, html, 'top', replyTo);
    }
    hasEmailProvider() {
        return this._emailService.hasProvider();
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_repository_1.NotificationsRepository,
        email_service_1.EmailService,
        organization_repository_1.OrganizationRepository,
        nestjs_temporal_core_1.TemporalService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map
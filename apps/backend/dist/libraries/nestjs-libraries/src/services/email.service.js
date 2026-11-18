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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const agentmail_provider_1 = require("../emails/agentmail.provider");
const resend_provider_1 = require("../emails/resend.provider");
const empty_provider_1 = require("../emails/empty.provider");
const node_mailer_provider_1 = require("../emails/node.mailer.provider");
const ses_provider_1 = require("../emails/ses.provider");
const nestjs_temporal_core_1 = require("nestjs-temporal-core");
const timer_1 = require("../../../helpers/src/utils/timer");
const crypto_1 = require("crypto");
let EmailService = class EmailService {
    constructor(_temporalService) {
        this._temporalService = _temporalService;
        this.emailService = this.selectProvider(process.env.EMAIL_PROVIDER);
        console.log('Email service provider:', this.emailService.name);
        for (const key of this.emailService.validateEnvKeys) {
            if (!process.env[key]) {
                console.error(`Missing environment variable: ${key}`);
            }
        }
    }
    hasProvider() {
        return !(this.emailService instanceof empty_provider_1.EmptyProvider);
    }
    selectProvider(provider) {
        switch (provider) {
            case 'agentmail':
                return new agentmail_provider_1.AgentMailProvider();
            case 'resend':
                return new resend_provider_1.ResendProvider();
            case 'nodemailer':
                return new node_mailer_provider_1.NodeMailerProvider();
            case 'ses':
                return new ses_provider_1.SesProvider();
            default:
                return new empty_provider_1.EmptyProvider();
        }
    }
    async sendEmail(to, subject, html, addTo, replyTo) {
        if (!to || !subject) {
            return;
        }
        return this._temporalService.client
            .getRawClient()
            ?.workflow.start('sendSingleEmailWorkflow', {
            taskQueue: 'main',
            workflowId: `send_email_${(0, crypto_1.randomUUID)()}`,
            args: [{ to, subject, html, replyTo, addTo }],
        });
    }
    async sendEmailSync(to, subject, html, replyTo) {
        if (to.indexOf('@') === -1) {
            return;
        }
        if (!process.env.EMAIL_FROM_ADDRESS || !process.env.EMAIL_FROM_NAME) {
            console.log('Email sender information not found in environment variables');
            return;
        }
        const settingsUrl = `${process.env.FRONTEND_URL}/settings`;
        const headers = process.env.FRONTEND_URL
            ? { 'List-Unsubscribe': `<${settingsUrl}>` }
            : undefined;
        const modifiedHtml = `
    <div style="
        background: linear-gradient(to bottom right, #e6f2ff, #f0e6ff);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    ">
        <div style="
            background-color: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(4px);
            border-radius: 0.5rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-width: 48rem;
            width: 100%;
            padding: 2rem;
        ">
            <h1 style="
                font-size: 1.875rem;
                font-weight: bold;
                margin-bottom: 1.5rem;
                text-align: left;
                color: #1f2937;
            ">${subject}</h1>
            
            <div style="
                margin-bottom: 2rem;
                color: #374151;
            ">
                ${html}
            </div>
            
            <div style="
                display: flex;
                align-items: center;
                border-top: 1px solid #e5e7eb;
                padding-top: 1.5rem;
            ">
                <div>
                    <h2 style="
                        font-size: 1.25rem;
                        font-weight: 600;
                        color: #1f2937;
                        margin: 0;
                    ">${process.env.EMAIL_FROM_NAME}</h2>
                    <div style="font-size: 12px">
                      You can change your notification preferences in your <a href="${settingsUrl}">account settings.</a>
                     </div>
                </div>
            </div>
        </div>
    </div>
    `;
        let lastErr;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const sends = await this.emailService.sendEmail(to, subject, modifiedHtml, process.env.EMAIL_FROM_NAME, process.env.EMAIL_FROM_ADDRESS, replyTo, headers);
                console.log(sends);
                return;
            }
            catch (err) {
                lastErr = err;
                console.log(`Email attempt ${attempt + 1}/3 failed:`, err);
                if (attempt < 2) {
                    await (0, timer_1.timer)(700);
                }
            }
        }
        console.log(`Email to ${to} failed after 3 attempts:`, lastErr);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_temporal_core_1.TemporalService])
], EmailService);
//# sourceMappingURL=email.service.js.map
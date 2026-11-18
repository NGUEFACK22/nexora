"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendProvider = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_132');
class ResendProvider {
    constructor() {
        this.name = 'resend';
        this.validateEnvKeys = ['RESEND_API_KEY'];
    }
    async sendEmail(to, subject, html, emailFromName, emailFromAddress, replyTo, headers) {
        const sends = await resend.emails.send({
            from: `${emailFromName} <${emailFromAddress}>`,
            to,
            subject,
            html,
            ...(replyTo && { reply_to: replyTo }),
            ...(headers && { headers }),
        });
        if (sends.error) {
            throw new Error(`${sends.error.name}: ${sends.error.message}`);
        }
        return sends;
    }
}
exports.ResendProvider = ResendProvider;
//# sourceMappingURL=resend.provider.js.map
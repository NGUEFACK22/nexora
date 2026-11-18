"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SesProvider = void 0;
const client_sesv2_1 = require("@aws-sdk/client-sesv2");
const ses = new client_sesv2_1.SESv2Client({
    region: process.env.SES_REGION,
    ...(process.env.SES_ACCESS_KEY
        ? {
            credentials: {
                accessKeyId: process.env.SES_ACCESS_KEY,
                secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
            },
        }
        : {}),
});
class SesProvider {
    constructor() {
        this.name = 'ses';
        this.validateEnvKeys = [
            'SES_REGION',
            ...(process.env.SES_ACCESS_KEY ? ['SES_SECRET_ACCESS_KEY'] : []),
        ];
    }
    async sendEmail(to, subject, html, emailFromName, emailFromAddress, replyTo, headers) {
        const fromName = /^[\x20-\x7e]*$/.test(emailFromName)
            ? `"${emailFromName.replace(/["\\]/g, '\\$&')}"`
            : `=?UTF-8?B?${Buffer.from(emailFromName).toString('base64')}?=`;
        return ses.send(new client_sesv2_1.SendEmailCommand({
            FromEmailAddress: `${fromName} <${emailFromAddress}>`,
            Destination: { ToAddresses: [to] },
            ...(replyTo && { ReplyToAddresses: [replyTo] }),
            Content: {
                Simple: {
                    Subject: { Data: subject, Charset: 'UTF-8' },
                    Body: { Html: { Data: html, Charset: 'UTF-8' } },
                    ...(headers && {
                        Headers: Object.entries(headers).map(([Name, Value]) => ({
                            Name,
                            Value,
                        })),
                    }),
                },
            },
        }));
    }
}
exports.SesProvider = SesProvider;
//# sourceMappingURL=ses.provider.js.map
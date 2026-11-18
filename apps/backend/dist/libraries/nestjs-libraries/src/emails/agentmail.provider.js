"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentMailProvider = void 0;
class AgentMailProvider {
    constructor() {
        this.name = 'agentmail';
        this.validateEnvKeys = ['AGENTMAIL_API_KEY', 'AGENTMAIL_INBOX_ID'];
    }
    async sendEmail(to, subject, html, emailFromName, emailFromAddress, replyTo, headers) {
        const response = await fetch(`https://api.agentmail.to/v0/inboxes/${process.env.AGENTMAIL_INBOX_ID}/messages/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.AGENTMAIL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                ...(replyTo && { reply_to: replyTo }),
                ...(headers && { headers }),
            }),
        });
        if (!response.ok) {
            const err = (await response.json().catch(() => null));
            throw new Error(`AgentMail ${response.status}: ${err?.message || err?.name || 'unknown error'}`);
        }
        return (await response.json());
    }
}
exports.AgentMailProvider = AgentMailProvider;
//# sourceMappingURL=agentmail.provider.js.map
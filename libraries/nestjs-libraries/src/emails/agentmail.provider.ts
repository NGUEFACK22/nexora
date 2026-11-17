import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';

// AgentMail (https://agentmail.to) is inbox based: messages are sent from the
// inbox configured in AGENTMAIL_INBOX_ID, so emailFromName/emailFromAddress
// are not part of the envelope — the inbox display name is used instead
export class AgentMailProvider implements EmailInterface {
  name = 'agentmail';
  validateEnvKeys = ['AGENTMAIL_API_KEY', 'AGENTMAIL_INBOX_ID'];
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    emailFromName: string,
    emailFromAddress: string,
    replyTo?: string,
    headers?: Record<string, string>
  ) {
    const response = await fetch(
      `https://api.agentmail.to/v0/inboxes/${process.env.AGENTMAIL_INBOX_ID}/messages/send`,
      {
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
      }
    );

    // a failed call must throw so sendEmailSync retries the send
    if (!response.ok) {
      const err = (await response.json().catch(() => null)) as {
        message?: string;
        name?: string;
      } | null;
      throw new Error(
        `AgentMail ${response.status}: ${
          err?.message || err?.name || 'unknown error'
        }`
      );
    }

    return (await response.json()) as {
      message_id: string;
      thread_id: string;
    };
  }
}

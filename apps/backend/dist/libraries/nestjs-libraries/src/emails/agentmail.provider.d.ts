import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';
export declare class AgentMailProvider implements EmailInterface {
    name: string;
    validateEnvKeys: string[];
    sendEmail(to: string, subject: string, html: string, emailFromName: string, emailFromAddress: string, replyTo?: string, headers?: Record<string, string>): Promise<{
        message_id: string;
        thread_id: string;
    }>;
}

import { EmailInterface } from '@gitroom/nestjs-libraries/emails/email.interface';
import { AgentMailProvider } from '@gitroom/nestjs-libraries/emails/agentmail.provider';
import { ResendProvider } from '@gitroom/nestjs-libraries/emails/resend.provider';
import { EmptyProvider } from '@gitroom/nestjs-libraries/emails/empty.provider';
import { NodeMailerProvider } from '@gitroom/nestjs-libraries/emails/node.mailer.provider';
import { SesProvider } from '@gitroom/nestjs-libraries/emails/ses.provider';
import { TemporalService } from 'nestjs-temporal-core';
export declare class EmailService {
    private _temporalService;
    emailService: EmailInterface;
    constructor(_temporalService: TemporalService);
    hasProvider(): boolean;
    selectProvider(provider: string): AgentMailProvider | ResendProvider | EmptyProvider | NodeMailerProvider | SesProvider;
    sendEmail(to: string, subject: string, html: string, addTo: 'top' | 'bottom', replyTo?: string): Promise<import("@temporalio/client").WorkflowHandleWithStartDetails<import("@temporalio/common").Workflow>>;
    sendEmailSync(to: string, subject: string, html: string, replyTo?: string): Promise<void>;
}

import { Organization } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { MastraService } from '@gitroom/nestjs-libraries/chat/mastra.service';
import { Request, Response } from 'express';
export type ChannelsContext = {
    integrations: string;
    organization: string;
    ui: string;
};
export declare class CopilotController {
    private _subscriptionService;
    private _mastraService;
    constructor(_subscriptionService: SubscriptionService, _mastraService: MastraService);
    private serviceAdapter;
    chatAgent(req: Request, res: Response): Promise<void> | globalThis.Response | Promise<globalThis.Response>;
    agent(req: Request, res: Response, organization: Organization): Promise<void | globalThis.Response>;
    calculateCredits(organization: Organization, type: 'ai_images' | 'ai_videos' | 'clipping_minutes'): Promise<{
        credits: number;
    }>;
    getMessagesList(organization: Organization, threadId: string): Promise<any>;
    getList(organization: Organization): Promise<{
        threads: any;
    }>;
}

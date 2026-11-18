import { Organization } from '@prisma/client';
import { AutopostService } from '@gitroom/nestjs-libraries/database/prisma/autopost/autopost.service';
import { AutopostDto } from '@gitroom/nestjs-libraries/dtos/autopost/autopost.dto';
import { OnlyURL } from '@gitroom/nestjs-libraries/dtos/webhooks/webhooks.dto';
export declare class AutopostController {
    private _autopostsService;
    constructor(_autopostsService: AutopostService);
    getAutoposts(org: Organization): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        title: string;
        url: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }[]>;
    createAutopost(org: Organization, body: AutopostDto): Promise<{
        id: string;
        active: boolean;
    }>;
    updateAutopost(org: Organization, body: AutopostDto, id: string): Promise<{
        id: string;
        active: boolean;
    }>;
    deleteAutopost(org: Organization, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        title: string;
        url: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }>;
    changeActive(org: Organization, id: string, active: boolean): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        content: string | null;
        title: string;
        url: string;
        lastUrl: string;
        onSlot: boolean;
        syncLast: boolean;
        active: boolean;
        addPicture: boolean;
        generateContent: boolean;
        integrations: string;
    }>;
    sendWebhook(query: OnlyURL): Promise<{
        success: boolean;
        date: any;
        url: any;
        description: string;
    } | {
        success: boolean;
        date?: undefined;
        url?: undefined;
        description?: undefined;
    }>;
}

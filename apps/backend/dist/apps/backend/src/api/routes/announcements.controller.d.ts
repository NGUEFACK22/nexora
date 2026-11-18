import { User } from '@prisma/client';
import { AnnouncementsService } from '@gitroom/nestjs-libraries/database/prisma/announcements/announcements.service';
import { AnnouncementDto } from '@gitroom/nestjs-libraries/dtos/announcements/announcements.dto';
export declare class AnnouncementsController {
    private _announcementsService;
    constructor(_announcementsService: AnnouncementsService);
    getAnnouncements(): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }[]>;
    createAnnouncement(user: User, body: AnnouncementDto): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }>;
    deleteAnnouncement(user: User, id: string): Promise<{
        id: string;
        description: string;
        createdAt: Date;
        title: string;
        color: import(".prisma/client").$Enums.AnnouncementColor;
    }>;
}

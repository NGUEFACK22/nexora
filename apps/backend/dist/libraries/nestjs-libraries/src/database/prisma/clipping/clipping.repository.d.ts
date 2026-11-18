import { PrismaRepository, PrismaTransaction } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
export declare class ClippingRepository {
    private _clipping;
    private _clippingClip;
    private _transaction;
    constructor(_clipping: PrismaRepository<'clipping'>, _clippingClip: PrismaRepository<'clippingClip'>, _transaction: PrismaTransaction);
    createClipping(org: string, url: string, maxClips: number, fit: 'crop' | 'blur', integrations: string[]): import(".prisma/client").Prisma.Prisma__ClippingClient<{
        id: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getRunningClippings(org: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        status: string;
    }[]>;
    countClippingsSince(org: string, since: Date): import(".prisma/client").Prisma.PrismaPromise<number>;
    getClippingById(id: string): import(".prisma/client").Prisma.Prisma__ClippingClient<{
        clips: {
            error: string | null;
            trimStart: number | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            path: string | null;
            thumbnail: string | null;
            status: string;
            start: number;
            end: number;
            content: string;
            title: string;
            mediaId: string | null;
            clippingId: string;
            draftedAt: Date | null;
        }[];
    } & {
        error: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        organizationId: string;
        thumbnail: string | null;
        status: string;
        title: string | null;
        url: string;
        integrations: string;
        fit: string;
        duration: number | null;
        maxClips: number;
        creditsId: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getClipping(org: string, id: string): import(".prisma/client").Prisma.Prisma__ClippingClient<{
        error: string;
        id: string;
        createdAt: Date;
        thumbnail: string;
        status: string;
        title: string;
        url: string;
        clips: {
            error: string;
            id: string;
            path: string;
            thumbnail: string;
            status: string;
            start: number;
            end: number;
            content: string;
            title: string;
            mediaId: string;
        }[];
        duration: number;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getClippingProgress(org: string, id: string): import(".prisma/client").Prisma.Prisma__ClippingClient<{
        error: string;
        id: string;
        status: string;
        title: string;
        clips: {
            error: string;
            id: string;
            path: string;
            thumbnail: string;
            status: string;
            title: string;
            mediaId: string;
        }[];
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    getClippings(org: string, page: number): Promise<{
        pages: number;
        results: {
            error: string;
            id: string;
            createdAt: Date;
            thumbnail: string;
            status: string;
            title: string;
            url: string;
            duration: number;
        }[];
    }>;
    updateClipping(org: string, id: string, data: {
        status?: string;
        error?: string | null;
        title?: string;
        thumbnail?: string;
        duration?: number;
        creditsId?: string | null;
    }): import(".prisma/client").Prisma.Prisma__ClippingClient<{
        id: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    createClips(clippingId: string, clips: {
        title: string;
        content: string;
        start: number;
        end: number;
    }[]): Promise<{
        id: string;
    }[]>;
    failUnfinishedClips(clippingId: string, error: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
    claimClipDraft(id: string): Promise<boolean>;
    getClipById(id: string): import(".prisma/client").Prisma.Prisma__ClippingClipClient<{
        clipping: {
            error: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            organizationId: string;
            thumbnail: string | null;
            status: string;
            title: string | null;
            url: string;
            integrations: string;
            fit: string;
            duration: number | null;
            maxClips: number;
            creditsId: string | null;
        };
    } & {
        error: string | null;
        trimStart: number | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        path: string | null;
        thumbnail: string | null;
        status: string;
        start: number;
        end: number;
        content: string;
        title: string;
        mediaId: string | null;
        clippingId: string;
        draftedAt: Date | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    updateClip(id: string, data: {
        status?: string;
        error?: string | null;
        trimStart?: number;
        mediaId?: string;
        path?: string;
        thumbnail?: string;
        draftedAt?: Date;
    }): import(".prisma/client").Prisma.Prisma__ClippingClipClient<{
        id: string;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}

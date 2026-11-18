import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { Integration } from '@prisma/client';
import { PinterestSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/pinterest.dto';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
type PinterestPendingData = {
    mediaId: string;
    message: string;
    settings: {
        link?: string;
        title?: string;
        dominant_color?: string;
        board: string;
    };
    imagePaths: string[];
    coverPath?: string;
    attempting?: boolean;
    confirmed?: boolean;
};
export declare class PinterestProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    maxLength(): number;
    dto: typeof PinterestSettingsDto;
    checkValidity([firstItem]: Array<ValidityMedia[]>): Promise<string | true>;
    editor: "normal";
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh: string;
    }): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        picture: any;
        username: any;
    }>;
    boards(accessToken: string): Promise<any>;
    postPending(id: string, accessToken: string, postDetails: PostDetails<PinterestSettingsDto>[]): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: PinterestPendingData, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: PinterestPendingData, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails<PinterestSettingsDto>[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
}
export {};

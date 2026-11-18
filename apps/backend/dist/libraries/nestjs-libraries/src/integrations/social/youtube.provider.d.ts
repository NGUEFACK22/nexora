import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { Integration } from '@prisma/client';
import { YoutubeSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/youtube.settings.dto';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
export declare class YoutubeProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    dto: typeof YoutubeSettingsDto;
    scopes: string[];
    editor: "normal";
    maxLength(): number;
    checkValidity(items: Array<ValidityMedia[]>): Promise<string | true>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body';
        value: string;
    } | undefined;
    refreshErrorMessage(err: any): string | undefined;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: any;
        codeVerifier: string;
        state: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<{
        accessToken: any;
        expiresIn: number;
        refreshToken: any;
        id: any;
        name: any;
        picture: any;
        username: string;
    }>;
    pages(accessToken: string): Promise<any>;
    fetchPageInformation(accessToken: string, data: {
        id: string;
    }): Promise<{
        id: any;
        name: any;
        access_token: string;
        picture: any;
        username: any;
    }>;
    reConnect(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
    private static readonly YOUTUBE_CHUNK_SIZE;
    private static readonly YOUTUBE_UPLOAD_BATCH_MS;
    private youtubeMediaSize;
    private youtubeChunkStream;
    private probeUploadSession;
    postPending(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: {
        uploadUri: string;
        videoSize: number;
        path: string;
        uploadedBytes: number;
        thumbnail: string;
        videoId?: string;
        postDbId?: string;
    }, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: {
        uploadUri: string;
        videoSize: number;
        path: string;
        uploadedBytes: number;
        thumbnail: string;
        videoId?: string;
        postDbId?: string;
    }, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
}

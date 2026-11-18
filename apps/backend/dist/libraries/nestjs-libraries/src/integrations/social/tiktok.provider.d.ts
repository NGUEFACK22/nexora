import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { Integration } from '@prisma/client';
export declare class TiktokProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    convertToJPEG: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    dto: typeof TikTokDto;
    editor: "normal";
    maxLength(): number;
    checkValidity(items: Array<ValidityMedia[]>): Promise<string | true>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'disconnect';
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
        refresh?: string;
    }): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    maxVideoLength(accessToken: string): Promise<{
        maxDurationSeconds: any;
    }>;
    checkPostStatus(accessToken: string, pendingData: {
        publishId: string;
    }, integration: Integration): Promise<PendingCheckResponse>;
    private postUrl;
    private parsePublishStatus;
    private contentPostingMethod;
    private postingMethod;
    private buildTikokPostInfoBody;
    private static readonly TIKTOK_MAX_SINGLE_CHUNK;
    private static readonly TIKTOK_CHUNK_SIZE;
    private tiktokChunkPlan;
    private tiktokChunkStream;
    private uploadTikTokVideoBytes;
    private uploadTikTokChunk;
    private buildTikokSourceInfoBody;
    postPending(id: string, accessToken: string, postDetails: PostDetails<TikTokDto>[], integration: Integration): Promise<PostResponse[]>;
    post(id: string, accessToken: string, postDetails: PostDetails<TikTokDto>[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    missing(id: string, accessToken: string): Promise<{
        id: string;
        url: string;
    }[]>;
    resolveReleaseId(accessToken: string, releaseId: string, integration: Integration, settings: any, releaseURL: string): Promise<{
        unavailable: true;
        pending?: undefined;
        postId?: undefined;
        releaseURL?: undefined;
    } | {
        pending: true;
        unavailable?: undefined;
        postId?: undefined;
        releaseURL?: undefined;
    } | {
        postId: string;
        releaseURL: string;
        unavailable?: undefined;
        pending?: undefined;
    }>;
    releaseUrl(accessToken: string, releaseId: string): Promise<string>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, fromDate: number): Promise<AnalyticsData[]>;
}

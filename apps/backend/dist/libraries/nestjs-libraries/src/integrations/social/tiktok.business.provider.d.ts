import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { TikTokDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tiktok.dto';
import { Integration } from '@prisma/client';
export declare class TiktokBusinessProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    convertToJPEG: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    dto: typeof TikTokDto;
    editor: "normal";
    maxLength(): number;
    private baseUrl;
    private redirectUri;
    checkValidity(items: Array<ValidityMedia[]>): Promise<string | true>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'disconnect';
        value: string;
    } | undefined;
    private fetchUserInformation;
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
    checkPostStatus(accessToken: string, pendingData: {
        publishId: string;
    }, integration: Integration): Promise<PendingCheckResponse>;
    private contentPostingMethod;
    private buildVideoBody;
    private pickRandomMusicId;
    private buildPhotoBody;
    postPending(id: string, accessToken: string, postDetails: PostDetails<TikTokDto>[], integration: Integration): Promise<PostResponse[]>;
    post(id: string, accessToken: string, postDetails: PostDetails<TikTokDto>[], integration: Integration): Promise<PostResponse[]>;
    musicSearch(accessToken: string, data: {
        genre?: string;
    }, id: string): Promise<any>;
    locationSearch(accessToken: string, data: {
        q: string;
    }, id: string): Promise<any>;
    private loadVideoList;
    private postUrl;
    private publicPostId;
    private throwIfTokenError;
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
    releaseUrl(accessToken: string, releaseId: string, integration: Integration): Promise<string>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, fromDate: number): Promise<AnalyticsData[]>;
}

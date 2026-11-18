import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { FacebookDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { Integration } from '@prisma/client';
export declare const META_GRAPH_API_VERSION = "v25.0";
export declare class FacebookProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    editor: "normal";
    maxLength(): number;
    dto: typeof FacebookDto;
    checkValidity([firstPost]: Array<ValidityMedia[]>, settings: any): Promise<string | true>;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    reConnect(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
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
        username: string;
    }>;
    pages(accessToken: string): Promise<any[]>;
    fetchPageInformation(accessToken: string, data: {
        page: string;
    }): Promise<{
        id: any;
        name: any;
        access_token: any;
        picture: any;
        username: any;
    }>;
    private fbVideoStatus;
    postPending(id: string, accessToken: string, postDetails: PostDetails<FacebookDto>[], integration: Integration): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: {
        postType: 'story';
        items: {
            kind: 'video' | 'photo';
            mediaId: string;
        }[];
        publishedCount: number;
        lastPostId: string;
        attempting?: number | null;
        confirmed?: boolean;
    }, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: {
        postType: 'story';
        items: {
            kind: 'video' | 'photo';
            mediaId: string;
        }[];
        publishedCount: number;
        lastPostId: string;
        attempting?: number | null;
        confirmed?: boolean;
    }, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails<FacebookDto>[], integration: Integration): Promise<PostResponse[]>;
    private markAsAiGenerated;
    private postNonStory;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<FacebookDto>[], integration: Integration): Promise<PostResponse[]>;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
    private videoPostAnalytics;
}

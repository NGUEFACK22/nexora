import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { XDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/x.dto';
type XPendingData = {
    message: string;
    settings: {
        who_can_reply_post?: 'everyone' | 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
        community?: string;
        made_with_ai?: boolean;
        paid_partnership?: boolean;
        post_type?: 'post' | 'article';
        article_title?: string;
        article_status?: 'draft' | 'published';
    };
    mediaIds: string[];
    coverMediaId?: string;
    inlineMediaIds?: Record<string, string>;
    processingIds: string[];
    attempting?: boolean;
    confirmed?: boolean;
};
export declare class XProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    stripLinks: () => boolean;
    maxConcurrentJob: number;
    toolTip: string;
    editor: "html";
    dto: typeof XDto;
    maxLength(additionalSettings?: any, settings?: any): 4000 | 100000 | 280;
    inlineImages(settings?: any): boolean;
    private toTweetText;
    checkValidity([firstPost, ...comments]: Array<{
        path: string;
    }[]>, settings: any): Promise<string | true>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    autoRepostPost(integration: Integration, id: string, fields: {
        likesAmount: string;
    }): Promise<boolean>;
    repostPostUsers(integration: Integration, originalIntegration: Integration, postId: string, information: any): Promise<void>;
    autoPlugPost(integration: Integration, id: string, fields: {
        likesAmount: string;
        post: string;
    }): Promise<boolean>;
    refreshToken(): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
    }): Promise<{
        id: string;
        accessToken: string;
        name: string;
        refreshToken: string;
        expiresIn: number;
        picture: string;
        username: string;
        additionalSettings: {
            title: string;
            description: string;
            type: "checkbox";
            value: boolean;
        }[];
    }>;
    private getClient;
    private signOAuth1;
    private static readonly X_UPLOAD_CHUNK_SIZE;
    private uploadVideoInChunks;
    private mediaProcessingStatus;
    private waitForMediaProcessing;
    private uploadWithRateLimitRetry;
    private uploadMediaEntries;
    private uploadMedia;
    postPending(id: string, accessToken: string, postDetails: PostDetails<{
        active_thread_finisher: boolean;
        thread_finisher: string;
        community?: string;
        who_can_reply_post: 'everyone' | 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
        made_with_ai?: boolean;
        paid_partnership?: boolean;
        post_type?: 'post' | 'article';
        article_title?: string;
        article_status?: 'draft' | 'published';
        article_cover?: {
            id: string;
            path: string;
        };
    }>[], integration: Integration): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: XPendingData, integration: Integration): Promise<PendingCheckResponse>;
    private articleImages;
    private articleContentState;
    private finalizeArticle;
    finalizePost(accessToken: string, pendingData: XPendingData, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails<{
        active_thread_finisher: boolean;
        thread_finisher: string;
        community?: string;
        who_can_reply_post: 'everyone' | 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
        made_with_ai?: boolean;
        paid_partnership?: boolean;
    }>[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<{
        active_thread_finisher: boolean;
        thread_finisher: string;
        made_with_ai?: boolean;
        paid_partnership?: boolean;
    }>[], integration: Integration): Promise<PostResponse[]>;
    private loadAllTweets;
    analytics(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    postAnalytics(integrationId: string, accessToken: string, postId: string, date: number): Promise<AnalyticsData[]>;
    mention(token: string, d: {
        query: string;
    }): Promise<{
        id: string;
        image: string;
        label: string;
    }[]>;
    mentionFormat(idOrHandle: string, name: string): string;
}
export {};

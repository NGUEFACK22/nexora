import { AnalyticsData, AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { InstagramDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/instagram.dto';
import { Integration } from '@prisma/client';
export declare class InstagramProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    toolTip: string;
    scopes: string[];
    maxConcurrentJob: number;
    editor: "normal";
    dto: typeof InstagramDto;
    maxLength(): number;
    checkValidity([firstPost]: Array<ValidityMedia[]>, settings: any): Promise<string | true>;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body' | 'retry' | 'disconnect';
        value: string;
    } | undefined;
    reConnect(id: string, requiredId: string, token: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
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
        expiresIn: number;
        picture: any;
        username: string;
    }>;
    pages(token: string): Promise<{
        pageId: any;
        id: any;
        name: any;
        picture: {
            data: {
                url: any;
            };
        };
    }[]>;
    fetchPageInformation(token: string, data: {
        pageId: string;
        id: string;
    }): Promise<{
        id: any;
        name: any;
        picture: any;
        access_token: string;
        username: any;
    }>;
    private stripHandle;
    private igContainerStatus;
    private igPublishedMediaId;
    private igPermalink;
    postPending(id: string, token: string, postDetails: PostDetails<InstagramDto>[], integration: Integration, type?: string): Promise<PostResponse[]>;
    checkPostStatus(token: string, pendingData: {
        type: string;
        postType: 'stories' | 'single' | 'carousel';
        containers: string[];
        message?: string;
        carouselId?: string;
        collaborators?: string[];
        madeWithAi?: boolean;
    }, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(token: string, pendingData: {
        type: string;
        postType: 'stories' | 'single' | 'carousel';
        containers: string[];
        message?: string;
        carouselId?: string;
        collaborators?: string[];
        madeWithAi?: boolean;
    }, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, token: string, postDetails: PostDetails<InstagramDto>[], integration: Integration, type?: string): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, token: string, postDetails: PostDetails<InstagramDto>[], integration: Integration, type?: string): Promise<PostResponse[]>;
    private setTitle;
    analytics(id: string, token: string, date: number, type?: string): Promise<AnalyticsData[]>;
    music(accessToken: string, data: {
        q: string;
    }): Promise<Response>;
    audioSearch(token: string, data: {
        q?: string;
        type?: 'music' | 'original_sound';
    }, internalId?: string): Promise<any>;
    postAnalytics(integrationId: string, token: string, postId: string, date: number, type?: string): Promise<AnalyticsData[]>;
}

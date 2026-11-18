import { AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { RedditSettingsDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/reddit.dto';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
type RedditPendingData = {
    subreddits: RedditSettingsDto['subreddit'];
    message: string;
    mediaPath?: string;
    mediaThumbnail?: string;
    cursor: number;
    results: {
        postId: string;
        releaseURL: string;
    }[];
    armed?: {
        sr: string;
        title: string;
        armedAt: number;
        media: boolean;
        submitted: boolean;
        lookups: number;
    };
};
export declare class RedditProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    dto: typeof RedditSettingsDto;
    maxLength(): number;
    checkValidity(posts: Array<ValidityMedia[]>, settings: any): Promise<string | true>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
    }): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        picture: any;
        username: any;
    }>;
    private uploadFileToReddit;
    private findSubmittedPost;
    private completedResponse;
    postPending(id: string, accessToken: string, postDetails: PostDetails<RedditSettingsDto>[]): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: RedditPendingData, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: RedditPendingData, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails<RedditSettingsDto>[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<RedditSettingsDto>[], integration: Integration): Promise<PostResponse[]>;
    subreddits(accessToken: string, data: any): Promise<any[]>;
    private subredditByName;
    private getPermissions;
    restrictions(accessToken: string, data: {
        subreddit: string;
    }): Promise<{
        subreddit: string;
        allow: any[];
        is_flair_required: boolean;
        flairs: {
            id: any;
            name: any;
        }[];
    }>;
}
export {};

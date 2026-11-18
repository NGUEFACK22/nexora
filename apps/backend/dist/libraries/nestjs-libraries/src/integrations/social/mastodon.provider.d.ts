import { AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
type MastodonPendingData = {
    url: string;
    message: string;
    mediaIds: string[];
    idempotencyKey: string;
};
export declare class MastodonProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    maxLength(): number;
    handleErrors(body: string, status: number): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    protected generateUrlDynamic(customUrl: string, state: string, clientId: string, url: string): string;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    protected dynamicAuthenticate(clientId: string, clientSecret: string, url: string, code: string): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: string;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<{
        id: any;
        name: any;
        accessToken: any;
        refreshToken: string;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    uploadFile(instanceUrl: string, fileUrl: string, accessToken: string, alt?: string): Promise<string>;
    protected dynamicPostPending(id: string, accessToken: string, url: string, postDetails: PostDetails[]): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: MastodonPendingData, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: MastodonPendingData, integration: Integration): Promise<PendingCheckResponse>;
    dynamicPost(id: string, accessToken: string, url: string, postDetails: PostDetails[]): Promise<PostResponse[]>;
    dynamicComment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, url: string, postDetails: PostDetails[]): Promise<PostResponse[]>;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    postPending(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
}
export {};

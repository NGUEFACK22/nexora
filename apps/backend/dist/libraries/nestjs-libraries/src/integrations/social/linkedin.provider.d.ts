import { AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { LinkedinDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/linkedin.dto';
type LinkedinPendingData = {
    authorId: string;
    postType: 'company' | 'personal';
    message: string;
    isPdf: boolean;
    pdfTitle?: string;
    mediaIds: string[];
    poll: {
        urn: string;
        endpoint: 'videos' | 'images' | 'documents';
    }[];
    graceChecks: number;
    statusStalls?: number;
    attempting?: boolean;
    confirmed?: boolean;
};
export declare class LinkedinProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    oneTimeToken: boolean;
    isBetweenSteps: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    refreshWait: boolean;
    refreshRepeat: boolean;
    editor: "normal";
    dto: typeof LinkedinDto;
    maxLength(): number;
    checkValidity(posts: Array<ValidityMedia[]>, vals: any): Promise<string | true>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
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
        accessToken: any;
        refreshToken: any;
        expiresIn: any;
        name: any;
        picture: any;
        username: any;
    }>;
    company(token: string, data: {
        url: string;
    }): Promise<{
        options: any;
    }>;
    protected uploadPicture(fileName: string, accessToken: string, personId: string, picture: Buffer | {
        path: string;
    }, type?: "company" | "personal"): Promise<{
        id: string;
        poll?: {
            urn: string;
            endpoint: 'videos' | 'images' | 'documents';
        };
        grace?: boolean;
    }>;
    private mediaProcessingStatus;
    protected fixText(text: string): string;
    private convertImagesToPdfCarousel;
    private streamToBuffer;
    private processMediaForPosts;
    private prepareMediaBuffer;
    private buildPostContent;
    private createLinkedInPostPayload;
    private createMainPost;
    private createCommentPost;
    private createPostResponse;
    postPending(id: string, accessToken: string, postDetails: PostDetails<LinkedinDto>[], integration: Integration, type?: "company" | "personal"): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: LinkedinPendingData, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: LinkedinPendingData, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails<LinkedinDto>[], integration: Integration, type?: "company" | "personal"): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<LinkedinDto>[], integration: Integration, type?: "company" | "personal"): Promise<PostResponse[]>;
    addComment(integration: Integration, originalIntegration: Integration, postId: string, information: any, isPersonal?: boolean): Promise<PostResponse[]>;
    repostPostUsers(integration: Integration, originalIntegration: Integration, postId: string, information: any, isPersonal?: boolean): Promise<void>;
    mention(token: string, data: {
        query: string;
    }): Promise<any>;
    mentionFormat(idOrHandle: string, name: string): string;
}
export {};

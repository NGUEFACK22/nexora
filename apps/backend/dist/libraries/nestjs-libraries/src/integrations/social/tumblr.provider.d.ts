import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { TumblrDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/tumblr.dto';
import { Integration } from '@prisma/client';
export declare class TumblrProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    dto: typeof TumblrDto;
    maxLength(): number;
    checkValidity(posts: Array<ValidityMedia[]>): Promise<string | true>;
    handleErrors(body: string, status?: number): {
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
    }): Promise<{
        id: string;
        name: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        picture: string;
        username: string;
    }>;
    pages(accessToken: string): Promise<{
        id: string;
        name: string;
        username: string;
        followers: number;
        primary: boolean;
        picture: {
            data: {
                url: string;
            };
        };
    }[]>;
    fetchPageInformation(accessToken: string, data: {
        id: string;
    }): Promise<{
        id: string;
        name: string;
        access_token: string;
        picture: string;
        username: string;
    }>;
    reConnect(id: string, requiredId: string, accessToken: string): Promise<Omit<AuthTokenDetails, 'refreshToken' | 'expiresIn'>>;
    post(id: string, accessToken: string, postDetails: PostDetails<TumblrDto>[], integration: Integration): Promise<PostResponse[]>;
    private redirectUri;
    private getAvatarUrl;
    private normalizeUrl;
    private getMediaUrl;
    private getMimeType;
    private isVideoPath;
    private getVideoDimensions;
    private getPrimaryBlog;
    private requestToken;
    private getUserInfo;
    private createJsonPost;
    private createMultipartPost;
    private createContentBlocks;
    private textBlocks;
    private chunkText;
    private hasErrorCode;
}

import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { FarcasterDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/farcaster.dto';
export declare class FarcasterProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    isWeb3: boolean;
    scopes: string[];
    maxConcurrentJob: number;
    editor: "normal";
    maxLength(): number;
    dto: typeof FarcasterDto;
    checkValidity(list: Array<ValidityMedia[]>): Promise<string | true>;
    refreshToken(refresh_token: string): Promise<AuthTokenDetails>;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    createSigner(): Promise<{
        signerUuid: string;
        approvalUrl: string;
        qrCode: string;
    }>;
    signerStatus(signerUuid: string): Promise<{
        status: string;
        code?: string;
    }>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<{
        id: string;
        name: any;
        accessToken: any;
        refreshToken: string;
        expiresIn: number;
        picture: any;
        username: any;
    }>;
    post(id: string, accessToken: string, postDetails: PostDetails<FarcasterDto>[]): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails<FarcasterDto>[], integration: Integration): Promise<PostResponse[]>;
    subreddits(accessToken: string, data: any, id: string, integration: Integration): Promise<{
        title: string;
        name: string;
        id: string;
    }[]>;
}

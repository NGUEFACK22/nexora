import { AuthTokenDetails, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
import { WordpressDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/wordpress.dto';
export declare class WordpressProvider extends SocialAbstract implements SocialProvider {
    identifier: string;
    name: string;
    isBetweenSteps: boolean;
    editor: "html";
    scopes: string[];
    maxConcurrentJob: number;
    dto: typeof WordpressDto;
    maxLength(): number;
    inlineImages(): boolean;
    generateAuthUrl(): Promise<{
        url: string;
        codeVerifier: string;
        state: string;
    }>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    handleErrors(body: string): {
        type: 'refresh-token' | 'bad-body' | 'retry';
        value: string;
    } | undefined;
    customFields(): Promise<({
        key: string;
        label: string;
        validation: string;
        type: "text";
        hint?: undefined;
    } | {
        key: string;
        label: string;
        validation: string;
        type: "password";
        hint: string;
    })[]>;
    authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<string | {
        refreshToken: string;
        expiresIn: number;
        accessToken: string;
        id: string;
        name: any;
        picture: any;
        username: string;
    }>;
    private wpGet;
    postTypes(token: string): Promise<any[]>;
    categoriesList(token: string): Promise<{
        id: any;
        name: any;
    }[]>;
    tagsList(token: string): Promise<{
        id: any;
        name: any;
    }[]>;
    post(id: string, accessToken: string, postDetails: PostDetails<WordpressDto>[], integration: Integration): Promise<PostResponse[]>;
}

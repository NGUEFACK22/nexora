import { AuthTokenDetails, PendingCheckResponse, PostDetails, PostResponse, SocialProvider } from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { SocialAbstract, ValidityMedia } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { Integration } from '@prisma/client';
type BlueskyPendingData = {
    jobId: string;
    message: string;
    media: {
        path: string;
        alt?: string;
    }[];
    attempting?: boolean;
    confirmed?: boolean;
    prepFailures?: number;
};
export declare class BlueskyProvider extends SocialAbstract implements SocialProvider {
    maxConcurrentJob: number;
    identifier: string;
    name: string;
    toolTip: string;
    isBetweenSteps: boolean;
    scopes: string[];
    editor: "normal";
    maxLength(): number;
    checkValidity(posts: Array<ValidityMedia[]>): Promise<string | true>;
    customFields(): Promise<({
        key: string;
        label: string;
        defaultValue: string;
        validation: string;
        type: "text";
    } | {
        key: string;
        label: string;
        validation: string;
        type: "text";
        defaultValue?: undefined;
    } | {
        key: string;
        label: string;
        validation: string;
        type: "password";
        defaultValue?: undefined;
    })[]>;
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
    }): Promise<"Invalid credentials" | "Invalid service URL: must be a public HTTPS address" | "Bluesky is temporarily refusing logins for this account, please try again later" | "Could not reach a Bluesky server at the Service URL" | {
        refreshToken: string;
        expiresIn: number;
        accessToken: string;
        id: string;
        name: string;
        picture: string;
        username: string;
    }>;
    private loginIdentifier;
    private getAgent;
    private uploadMediaForPost;
    postPending(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    checkPostStatus(accessToken: string, pendingData: BlueskyPendingData, integration: Integration): Promise<PendingCheckResponse>;
    finalizePost(accessToken: string, pendingData: BlueskyPendingData, integration: Integration): Promise<PendingCheckResponse>;
    post(id: string, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    comment(id: string, postId: string, lastCommentId: string | undefined, accessToken: string, postDetails: PostDetails[], integration: Integration): Promise<PostResponse[]>;
    autoRepostPost(integration: Integration, id: string, fields: {
        likesAmount: string;
    }): Promise<boolean>;
    autoPlugPost(integration: Integration, id: string, fields: {
        likesAmount: string;
        post: string;
    }): Promise<boolean>;
    mention(token: string, d: {
        query: string;
    }, id: string, integration: Integration): Promise<{
        label: string;
        id: string;
        image: string;
    }[]>;
    mentionFormat(idOrHandle: string, name: string): string;
}
export {};

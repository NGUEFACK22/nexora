export declare class AddCommentDto {
    content: string;
}
export declare class CreatePublicCommentDto extends AddCommentDto {
    postId?: string;
    anchorStart?: number;
    anchorEnd?: number;
    anchorQuote?: string;
    parentId?: string;
    displayName?: string;
    recaptchaToken?: string;
}
export declare class ResolveCommentDto {
    resolved: boolean;
}

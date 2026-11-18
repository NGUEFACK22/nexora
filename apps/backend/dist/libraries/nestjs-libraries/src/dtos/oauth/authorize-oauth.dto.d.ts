export declare class AuthorizeOAuthQueryDto {
    client_id: string;
    response_type: string;
    state?: string;
    redirect_uri?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    scope?: string;
    resource?: string;
}
export declare class ApproveOAuthDto {
    client_id: string;
    state?: string;
    action: 'approve' | 'deny';
    redirect_uri?: string;
    code_challenge?: string;
    code_challenge_method?: string;
}
export declare class AuthorizeSelfHostedDto {
    client_id: string;
    state?: string;
    redirect_uri?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    resource?: string;
    instance_url: string;
    api_key?: string;
    email?: string;
}

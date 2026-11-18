export type PostListStateFilter = 'all' | 'scheduled' | 'draft' | 'published';
export declare class GetPostsListDto {
    page?: number;
    limit?: number;
    customer?: string;
    integrations?: string[];
    state?: PostListStateFilter;
}

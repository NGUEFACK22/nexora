import { MediaDto } from '@gitroom/nestjs-libraries/dtos/media/media.dto';
export declare class XDto {
    community?: string;
    who_can_reply_post: 'everyone' | 'following' | 'mentionedUsers' | 'subscribers' | 'verified';
    post_type?: 'post' | 'article';
    article_title?: string;
    article_status?: 'draft' | 'published';
    article_cover?: MediaDto;
    made_with_ai?: boolean;
    paid_partnership?: boolean;
}

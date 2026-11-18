export declare const FACEBOOK_PRESET_MAX_CHARS = 130;
export interface FacebookPreset {
    id: string;
    name: string;
}
export declare const FACEBOOK_PRESETS: FacebookPreset[];
export declare class FacebookDto {
    url?: string;
    post_type?: 'post' | 'story';
    text_format_preset_id?: string;
    title?: string;
    made_with_ai?: boolean;
}

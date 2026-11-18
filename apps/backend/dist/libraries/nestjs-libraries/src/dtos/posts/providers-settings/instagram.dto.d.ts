export declare class Collaborators {
    label: string;
}
export declare class InstagramAudio {
    id: string;
    title?: string;
    artist?: string;
    image?: string;
    audio_volume?: number;
    video_volume?: number;
}
export declare class InstagramDto {
    post_type: 'post' | 'story';
    is_trial_reel?: boolean;
    graduation_strategy?: 'MANUAL' | 'SS_PERFORMANCE';
    collaborators: Collaborators[];
    audio?: InstagramAudio;
    made_with_ai?: boolean;
}

export declare class OpenaiService {
    pickClips(title: string, language: string, segments: {
        start: number;
        end: number;
        text: string;
    }[], maxClips: number): Promise<{
        content?: string;
        title?: string;
        from?: number;
        to?: number;
    }[]>;
    generateImage(prompt: string, isVertical?: boolean): Promise<string>;
    generatePromptForPicture(prompt: string): Promise<string>;
    generateVoiceFromText(prompt: string): Promise<string>;
    generatePosts(content: string): Promise<any>;
    extractWebsiteText(content: string): Promise<any>;
    separatePosts(content: string, len: number): Promise<{
        posts: any[];
    }>;
    generateSlidesFromText(text: string): Promise<{
        imagePrompt?: string;
        voiceText?: string;
    }[]>;
}

import { ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
import { MediaDto } from '@gitroom/nestjs-libraries/dtos/media/media.dto';
export declare const YOUTUBE_TAGS_MAX_LENGTH = 500;
export declare function getYoutubeTagsLength(tags: YoutubeTagsSettings[]): number;
export declare class IsYoutubeTagsLengthConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, _args: ValidationArguments): boolean;
    defaultMessage(_args: ValidationArguments): string;
}
export declare function IsYoutubeTagsLength(validationOptions?: ValidationOptions): (object: object, propertyName: string) => void;
export declare class YoutubeTagsSettings {
    value: string;
    label: string;
}
export declare class YoutubeSettingsDto {
    title: string;
    type: string;
    selfDeclaredMadeForKids: 'no' | 'yes';
    thumbnail?: MediaDto;
    tags: YoutubeTagsSettings[];
    made_with_ai?: boolean;
}

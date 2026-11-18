import { TrackEnum } from '@gitroom/nestjs-libraries/user/track.enum';
import { User } from '@prisma/client';
export declare class TrackService {
    private hashValue;
    private toFbc;
    track(uniqueId: string, ip: string, agent: string, tt: TrackEnum, additional: Record<string, any>, fbc?: string, user?: User, fbp?: string): Promise<void>;
}

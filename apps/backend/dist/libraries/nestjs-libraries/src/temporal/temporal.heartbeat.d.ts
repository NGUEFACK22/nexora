export declare const setHeartbeatDetails: (details: string) => void;
export declare const withHeartbeat: <T>(fn: () => Promise<T>) => Promise<T>;

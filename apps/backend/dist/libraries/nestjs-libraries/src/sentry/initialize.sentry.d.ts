export declare const setSentryUserContext: (params: {
    userId?: string;
    email?: string;
    orgId?: string;
    paymentId?: string | null;
}) => void;
export declare const initializeSentry: (appName: string, allowLogs?: boolean) => boolean;

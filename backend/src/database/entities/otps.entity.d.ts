export declare class OTP {
    id: string;
    email: string;
    code: string;
    expires_at: Date;
    used: boolean;
    created_at: Date;
    attempts: number;
}

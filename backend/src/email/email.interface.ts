export interface IEmailService {

    sendOtp(to: string, otp: string): Promise<void>;
}

export const EMAIL_SERVICE = 'EMAIL_SERVICE';
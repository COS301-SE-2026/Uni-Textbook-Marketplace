export interface IEmailService {
  sendOtp(to: string, otp: string): Promise<void>;
  // sendNotificationEmail(to: string, entityType:string,data: any)
}

export const EMAIL_SERVICE = 'EMAIL_SERVICE';

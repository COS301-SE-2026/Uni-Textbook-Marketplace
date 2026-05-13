import { Injectable, Logger } from "@nestjs/common";
import { ConfigService} from '@nestjs/config';
import {Resend} from 'resend';
import { IEmailService } from "./email.interface";

@Injectable()
export class ResendEmailProvider implements IEmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(ResendEmailProvider.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Uni Marketplace <noreply@yourdomain.com>',
        to,
        subject: 'Your Textbook Marketplace verification code',
        html: `
          <h2>Your verification code</h2>
          <p>Enter this code to verify your university email:</p>
          <h1 style="letter-spacing: 8px; font-size: 36px;">${otp}</h1>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new Error('Could not send verification email');
    }
  }
}
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IEmailService } from "./email.interface";

@Injectable()
export class MailtrapEmailProvider implements IEmailService {
  private transporter;
  private readonly logger = new Logger(MailtrapEmailProvider.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: this.config.get('MAILTRAP_USER'),
        pass: this.config.get('MAILTRAP_PASS'),
      },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'Uni Marketplace <noreply@unimarketplace.com>',
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
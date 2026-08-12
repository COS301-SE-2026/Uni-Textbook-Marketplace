import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from './email.interface';

@Injectable()
export class MailtrapEmailProvider implements IEmailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailtrapEmailProvider.name);
  private readonly isTestEnvironment: boolean;

  constructor(private readonly config: ConfigService) {
    this.isTestEnvironment = this.config.get<string>('NODE_ENV') === 'test';

    if (this.isTestEnvironment) {
      this.logger.log('Test environment detected - email sending disabled');
      return;
    }

    const host = this.config.getOrThrow<string>('MAIL_HOST');
    const nodeEnv = this.config.get<string>('NODE_ENV');

    if (host.includes('live.smtp') && nodeEnv !== 'production') {
      throw new Error(
        'Refusing to start: live Mailtrap SMTP host configured outside production environment.',
      );
    }

    if (!host) {
      if (nodeEnv === 'test') {
        this.logger.warn(
          'MAIL_HOST not set in test environment - email sending disabled',
        );
        return;
      }
      throw new Error('MAIL_HOST is not configured');
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('MAIL_PORT') || 2525),
        secure: false,
        requireTLS: true,
        auth: {
          user: this.config.get<string>('MAILTRAP_USER') || 'test',
          pass: this.config.get<string>('MAILTRAP_PASS') || 'test',
        },
      });
    } catch (error) {
      this.logger.error('Failed to create email transporter', error);
      if (nodeEnv !== 'test') {
        throw error;
      }
    }
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    if (this.isTestEnvironment || !this.transporter) {
      this.logger.log(`[TEST MODE] Would send OTP ${otp} to ${to}`);
      return;
    }

    const fromEmail = this.config.get<string>('MAIL_FROM');
    if (!fromEmail) {
      this.logger.error('MAIL_FROM is not configured');
      throw new Error('Email sender address not configured');
    }
    try {
      await this.transporter.sendMail({
        from: this.config.getOrThrow<string>('MAIL_FROM'),
        to,
        subject: 'Your Textbook Marketplace verification code',
        html: `
        <div style="max-width:500px; margin: auto; background:#fff; padding:30px; border-radius:12px; color:#333;">
          <h2 style="color:#00f2b; text-align:center;">
            Uni Textbook Marketplace
          </h2>

          <p>Welcome! Use the code below to verify your email and complete registration.</p>

          <h1 style="text-align:center; background:#00B4D8; color:white; padding:15px; border-radius:8px; letter-spacing:8px;"> ${otp} </h1>

          <p style="text-align:center;">This code expires in <strong>3 minutes</strong>.</p>
          <p>if you didn't request this, please ignore this email</p>

          <hr>

          <p style="font-size:14px; text-align:center; color:#666;">
            Thank you for being part of our community.
            This is became possible due to the support of our Industry clients at
            <strong>Agile Bridge </strong> and our lectures at <strong>UP</strong> Thank you.
          </p>

          <p style=" text-align:center;">
            <strong>NexusDev</strong>.
          </p>


        </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new Error('Could not send verification email');
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from './email.interface';

@Injectable()
export class MailtrapEmailProvider implements IEmailService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailtrapEmailProvider.name);

  constructor(private readonly config: ConfigService) {
    const host = this.config.getOrThrow<string>('MAIL_HOST');
    const nodeEnv = this.config.getOrThrow<string>('NODE_ENV');

    if (host.includes('live.smtp') && nodeEnv !== 'production') {
      throw new Error(
        'Refusing to start: live Mailtrap SMTP host configured outside production environment.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.getOrThrow('MAIL_PORT')),
      secure: false,
      requireTLS: true,
      auth: {
        user: this.config.getOrThrow<string>('MAILTRAP_USER'),
        pass: this.config.getOrThrow<string>('MAILTRAP_PASS'),
      },
    });
  }

  async sendOtp(to: string, otp: string): Promise<void> {
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

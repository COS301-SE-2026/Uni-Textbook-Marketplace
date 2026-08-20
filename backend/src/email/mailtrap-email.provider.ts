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
        text: `Uni Textbook Marketplace

Welcome! Use the code below to verify your email and complete registration.

Your verification code: ${otp}

This code expires in 3 minutes.

If you didn't request this, please ignore this email.

---
Thank you for being part of our community. This project is made possible with the support of our industry partner Agile Bridge and our lecturers at the University of Pretoria.

NexusDev`,

        html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Uni Textbook Marketplace</title>
            <link
              href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
              rel="stylesheet"
            />
          </head>
          <body style="margin:0; padding:0; background-color:#F5F5F5; font-family:'Montserrat', Helvetica, Arial, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table role="presentation" width="500" cellpadding="0" cellspacing="0" border="0" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:6px; overflow:hidden;">
 
                    <!-- Header -->
                    <tr>
                      <td align="center" style="padding:32px 30px 8px 30px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; margin:0 auto 12px auto;">
                          <path d="M2 4.5C2 4.5 5 3 8 3s5 1.5 5 1.5v14S10.5 17 8 17s-6 1.5-6 1.5v-14z"></path>
                          <path d="M22 4.5C22 4.5 19 3 16 3s-5 1.5-5 1.5v14S13.5 17 16 17s6 1.5 6 1.5v-14z"></path>
                        </svg>
                        <h2 style="margin:0; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:22px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#000f2b;">
                        <span style="color:#00B4D8;">Uni-Textbook</span> Marketplace
                        </h2>
                      </td>
                    </tr>
 
                    <!-- Intro -->
                    <tr>
                      <td style="padding:8px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:#3a3a3a;">
                        <p style="margin:0 0 20px 0;">Welcome! Use the code below to verify your email and complete registration.</p>
                      </td>
                    </tr>
 
                    <!-- OTP code -->
                    <tr>
                      <td style="padding:0 30px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" style="background-color:#00B4D8; border-radius:6px; padding:16px;">
                              <span style="font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:32px; font-weight:700; letter-spacing:8px; color:#ffffff;">${otp}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
 
                    <!-- Expiry + disclaimer -->
                    <tr>
                      <td style="padding:20px 30px 0 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6; color:#3a3a3a;">
                        <p style="margin:0 0 12px 0; text-align:center;">This code expires in <strong>3 minutes</strong>.</p>
                        <p style="margin:0; text-align:center; color:#4B4F58;">If you didn't request this, please ignore this email.</p>
                      </td>
                    </tr>
 
                    <!-- Divider -->
                    <tr>
                      <td style="padding:24px 30px 0 30px;">
                        <hr style="border:none; border-top:1px solid #dddddd; margin:0;" />
                      </td>
                    </tr>
 
                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px 30px 32px 30px; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; text-align:center; color:#4B4F58;">
                        <p style="margin:4px 0; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; text-align:center; color:#4B4F58;">
                  Built by <strong style="color:#000f2b;">NexusDev</strong> with support from 
                  <strong style="color:#00B4D8;">Agile Bridge</strong>
                </p>
                <p style="margin:8px 0 0 0; font-family:'Montserrat', Helvetica, Arial, sans-serif; font-size:12px; line-height:1.5; text-align:center; color:#6b7280;">
                  University of Pretoria &bull; COS 301 Software Engineering
                </p>
                      </td>
                    </tr>
 
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new Error('Could not send verification email');
    }
  }
}

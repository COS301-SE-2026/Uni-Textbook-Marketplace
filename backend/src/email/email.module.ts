import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EMAIL_SERVICE } from './email.interface';
import { MailtrapEmailProvider } from './mailtrap-email.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    MailtrapEmailProvider,
    {
      provide: EMAIL_SERVICE,
      useClass: MailtrapEmailProvider,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}

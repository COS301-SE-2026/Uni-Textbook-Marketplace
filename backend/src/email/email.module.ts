import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EMAIL_SERVICE } from './email.interface';
import { ResendEmailProvider } from './resend-email.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    ResendEmailProvider,
    {
      provide: EMAIL_SERVICE,
      useClass: ResendEmailProvider,
    },
  ],
  exports: [EMAIL_SERVICE],
})
export class EmailModule {}
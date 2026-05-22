import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailtrapEmailProvider } from '../email/mailtrap-email.provider';
import { EMAIL_SERVICE } from '../email/email.interface';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/users.entity';
import { OTP } from '../database/entities/otps.entity';
import { University } from '../database/entities/university.entity';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
      }),
    }),
    TypeOrmModule.forFeature([User, University, OTP]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtStrategy,
    {
      provide: EMAIL_SERVICE,
      useClass: MailtrapEmailProvider,
    },
    RolesGuard,
  ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ResendEmailProvider } from '../email/resend-email.provider';
import { EMAIL_SERVICE } from '../email/email.interface';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { University } from './entities/university.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            secret: config.get('JWT_ACCESS_SECRET'),
        }),
    }),
    TypeOrmModule.forFeature([User, University, Otp]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    JwtStrategy,
    {
      provide: EMAIL_SERVICE,
      useClass: ResendEmailProvider,
    },
  ],
})
export class AuthModule {}
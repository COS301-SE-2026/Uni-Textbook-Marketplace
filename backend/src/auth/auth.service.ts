import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { OtpService } from './otp.service';
import type { IEmailService } from '../email/email.interface';
import { EMAIL_SERVICE } from '../email/email.interface';

import { User } from '../database/entities/users.entity';
import { University } from '../database/entities/university.entity';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(University)
    private readonly universityRepository: Repository<University>,

    private readonly otpService: OtpService,

    private readonly jwtService: JwtService,

    private readonly configService: ConfigService,

    @Inject(EMAIL_SERVICE)
    private readonly emailService: IEmailService,
  ) { }

  async register(dto: RegisterDto) {
    const uniResult = await this.universityRepository.findOne({
      select: {
        id: true,
        email_domain: true,
      },
      where: {
        id: dto.university_id,
      },
    });

    if (!uniResult) {
      throw new BadRequestException('Selected university is not valid');
    }

    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const emailDomain = dto.email.split('@')[1].toLocaleLowerCase();

    if (emailDomain !== uniResult.email_domain.toLocaleLowerCase()) {
      throw new BadRequestException(
        `Your email must be a ${uniResult.email_domain} address for this university`,
      );
    }

    const password_hash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    const user = this.userRepository.create({
      email: dto.email.toLowerCase().trim(),
      password_hash,
      first_name: dto.first_name,
      last_name: dto.last_name,
      university: { id: dto.university_id },
      faculty: dto.faculty ?? undefined,
    });
    await this.userRepository.save(user);

    const otp = await this.otpService.createOtp(dto.email);
    await this.emailService.sendOtp(dto.email, otp);

    return {
      message:
        'Registration successful. Check your university email for verification code',
    };
  }

  async verifyEmail(email: string, code: string) {
    await this.otpService.verifyOtp(email, code);

    await this.userRepository.update(
      {
        email,
      },
      {
        is_verified: true,
        updated_at: new Date(),
      },
    );

    const userResult = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        role: true,
        first_name: true,
        last_name: true,
      },
      where: {
        email: email,
      },
    });

    if (!userResult) {
      throw new UnauthorizedException('User not found');
    }

    const user = userResult;
    const tokens = await this.issueTokens(user);

    return { tokens, user };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        password_hash: true,
        role: true,
        is_verified: true,
      },
      where: {
        email,
        deleted_at: IsNull(),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.is_verified) {
      const otp = await this.otpService.createOtp(dto.email);
      await this.emailService.sendOtp(dto.email, otp);

      throw new UnauthorizedException(
        'Email not verified. A new verification code has been sent.',
      );
    }

    return this.issueTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private issueTokens(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async getUniversities() {
    const unis = await this.universityRepository.find({
      select: {
        id: true,
        name: true,
        email_domain: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return unis;
  }

  async resendOtp(email: string) {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        is_verified: true,
      },
      where: {
        email,
        deleted_at: IsNull(),
      },
    });

    if (!user) {
      return {
        message: 'If this email is registered, a new code has been sent.',
      };
    }

    if (user.is_verified) {
      return {
        message: 'This account is already verified.',
      };
    }

    await this.otpService.canRequestOtp(email);

    const otp = await this.otpService.createOtp(email);

    await this.emailService.sendOtp(email, otp);

    return {
      message: 'Verification code sent successfully.',
    };
  }

  async getMe(userId: string) {

    const result = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
      },
      where: {
        id: userId,
      },
    });

    if (!result) {
      throw new UnauthorizedException('User not found');
    }

    return result;
  }
}

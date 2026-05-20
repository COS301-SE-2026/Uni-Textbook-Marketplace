import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    id: string;
    email?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
      maxAge,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-email')
  @HttpCode(200)
  async verifyEmail(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.verifyEmail(dto.email, dto.code);

    res.cookie(
      'access_token',
      tokens.tokens.accessToken,
      this.getCookieOptions(15 * 60 * 1000),
    );

    res.cookie(
      'refresh_token',
      tokens.tokens.refreshToken,
      this.getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

    return { message: 'Email verified successfully.', user: tokens.user };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto);

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Login successful.' };
  }

  @Get('universities')
  @HttpCode(200)
  async getUniversities() {
    return this.authService.getUniversities();
  }

  @Throttle({ default: { limit: 4, ttl: 60000 } })
  @Post('resend-otp')
  @HttpCode(200)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', this.getCookieOptions(0));
    res.clearCookie('refresh_token', this.getCookieOptions(0));
    return { message: 'Logged out successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.id);
  }
}

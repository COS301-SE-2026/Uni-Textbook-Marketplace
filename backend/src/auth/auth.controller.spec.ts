import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';

const mockAuthService = {
  getUniversities: jest.fn(),
  register: jest.fn(),
  verifyEmail: jest.fn(),
  login: jest.fn(),
  resendOtp: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    
    jest.clearAllMocks();
  });

  describe('getUniversities', () => {
    it('should call authService.getUniversities', async () => {
      mockAuthService.getUniversities.mockResolvedValue([]);

      await controller.getUniversities();

      expect(mockAuthService.getUniversities).toHaveBeenCalledTimes(1);
    });

    it('should return the result from authService.getUniversities', async () => {
      const fakeList = [
        {
          id: 'uuid-1',
          name: 'University of Pretoria',
          email_domain: 'tuks.ac.za',
        },
      ];

      mockAuthService.getUniversities.mockResolvedValue(fakeList);

      const result = await controller.getUniversities();

      expect(result).toEqual(fakeList);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'u12345678@tuks.ac.za',
      password: 'password098',
      first_name: 'Gift',
      last_name: 'M',
      university_id: '1',
    };

    const serviceResponse = {
      message: 'Registration successful. Check your university email for verification code',
    };

    it('should call authService.register with the dto', async () => {
      mockAuthService.register.mockResolvedValue(serviceResponse);
      
      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(serviceResponse);
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailDto = {
      email: 'u12345678@tuks.ac.za',
      code: '123456',
    };

   
    const verifyEmailResponse = {
      tokens: {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      },
      user: {
        id: 'user-1',
        email: 'u12345678@tuks.ac.za',
        role: 'student',
      },
    };

    it('should verify email and set cookies', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(verifyEmailResponse);

      const result = await controller.verifyEmail(verifyEmailDto, mockResponse);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        verifyEmailDto.email,
        verifyEmailDto.code
      );
      expect(mockAuthService.verifyEmail).toHaveBeenCalledTimes(1);
      
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        verifyEmailResponse.tokens.accessToken,
        expect.objectContaining({ httpOnly: true, maxAge: 15 * 60 * 1000 })
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        verifyEmailResponse.tokens.refreshToken,
        expect.objectContaining({ httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
      );
      
      expect(result).toEqual({ message: 'Email verified successfully.' });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'u12345678@tuks.ac.za',
      password: 'Password123!',
    };

    const tokens = {
      accessToken: 'access-token-789',
      refreshToken: 'refresh-token-012',
    };

    it('should login and set cookies', async () => {
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        tokens.accessToken,
        expect.objectContaining({ httpOnly: true, maxAge: 15 * 60 * 1000 })
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        tokens.refreshToken,
        expect.objectContaining({ httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
      );
      
      expect(result).toEqual({ message: 'Login successful.' });
    });
  });

  describe('resendOtp', () => {
    const resendOtpDto = {
      email: 'u12345678@tuks.ac.za',
    };

    const successResponse = {
      message: 'Verification code sent successfully.',
    };

    it('should resend OTP successfully', async () => {
      mockAuthService.resendOtp.mockResolvedValue(successResponse);

      const result = await controller.resendOtp(resendOtpDto);

      expect(mockAuthService.resendOtp).toHaveBeenCalledWith(resendOtpDto.email);
      expect(mockAuthService.resendOtp).toHaveBeenCalledTimes(1);
      expect(result).toEqual(successResponse);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Logged out successfully.' });
    });
  });
});
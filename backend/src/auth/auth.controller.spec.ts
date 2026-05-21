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

  // Mock response object with cookie and clearCookie methods
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
        {
          id: 'uuid-2',
          name: 'Wits University',
          email_domain: 'wits.ac.za',
        },
      ];

      mockAuthService.getUniversities.mockResolvedValue(fakeList);

      const result = await controller.getUniversities();

      expect(result).toEqual(fakeList);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no universities exist', async () => {
      mockAuthService.getUniversities.mockResolvedValue([]);

      const result = await controller.getUniversities();

      expect(result).toEqual([]);
      expect(mockAuthService.getUniversities).toHaveBeenCalledTimes(1);
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

    it('should handle registration errors from service', async () => {
      const error = new Error('Registration failed');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow('Registration failed');
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailDto = {
      email: 'u12345678@tuks.ac.za',
      code: '123456',
    };

    const tokens = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
    };

    it('should verify email and set cookies', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(tokens);

      const result = await controller.verifyEmail(verifyEmailDto, mockResponse);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
        verifyEmailDto.email,
        verifyEmailDto.code
      );
      expect(mockAuthService.verifyEmail).toHaveBeenCalledTimes(1);
      
      // Check that cookies were set
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
      
      expect(result).toEqual({ message: 'Email verified successfully.' });
    });

    it('should handle verification errors', async () => {
      const error = new Error('Invalid OTP');
      mockAuthService.verifyEmail.mockRejectedValue(error);

      await expect(controller.verifyEmail(verifyEmailDto, mockResponse)).rejects.toThrow('Invalid OTP');
      expect(mockResponse.cookie).not.toHaveBeenCalled();
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
      
      // Check that cookies were set
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

    it('should handle login errors (invalid credentials)', async () => {
      const error = new Error('Invalid email or password');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow('Invalid email or password');
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should handle unverified account error', async () => {
      const error = new Error('Email not verified. A new verification code has been sent.');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockResponse)).rejects.toThrow(
        'Email not verified. A new verification code has been sent.'
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
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

    it('should handle rate limiting error', async () => {
      const error = new Error('Please wait before requesting another OTP');
      mockAuthService.resendOtp.mockRejectedValue(error);

      await expect(controller.resendOtp(resendOtpDto)).rejects.toThrow(
        'Please wait before requesting another OTP'
      );
    });

    it('should handle case when email is already verified', async () => {
      const alreadyVerifiedResponse = {
        message: 'This account is already verified.',
      };
      mockAuthService.resendOtp.mockResolvedValue(alreadyVerifiedResponse);

      const result = await controller.resendOtp(resendOtpDto);

      expect(result).toEqual(alreadyVerifiedResponse);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', async () => {
      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true, maxAge: 0 })
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ httpOnly: true, maxAge: 0 })
      );
      expect(result).toEqual({ message: 'Logged out successfully.' });
    });
  });

  // Test for cookie options consistency
  describe('Cookie configuration', () => {
    it('should set secure flag based on environment', async () => {
      // Save original NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      
      // Test production
      process.env.NODE_ENV = 'production';
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.login.mockResolvedValue(tokens);

      await controller.login({ email: 'test@tuks.ac.za', password: 'password' }, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        tokens.accessToken,
        expect.objectContaining({ secure: true })
      );

      // Reset mocks
      jest.clearAllMocks();
      
      // Test development
      process.env.NODE_ENV = 'development';
      await controller.login({ email: 'test@tuks.ac.za', password: 'password' }, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        tokens.accessToken,
        expect.objectContaining({ secure: false })
      );

      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});
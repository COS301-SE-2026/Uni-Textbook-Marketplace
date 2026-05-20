import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { User } from '../database/entities/users.entity';
import { University } from '../database/entities/university.entity';
import { EMAIL_SERVICE } from '../email/email.interface';


jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));


import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  
  
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUniversityRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOtpService = {
    createOtp: jest.fn(),
    verifyOtp: jest.fn(),
    canRequestOtp: jest.fn(),
  };

  const mockEmailService = {
    sendOtp: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(University), useValue: mockUniversityRepository },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EMAIL_SERVICE, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    
    jest.clearAllMocks();
  });

  // Register tests
  describe('register', () => {
    const validRegisterData = {
      email: 'u12345678@tuks.ac.za',
      password: 'Password123!',
      first_name: 'Gift',
      last_name: 'M',
      university_id: 'uni-1',
      faculty: 'Engineering',
    };

    const mockUniversity = {
      id: 'uni-1',
      email_domain: 'tuks.ac.za',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ id: 'user-1' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-1' });
      mockOtpService.createOtp.mockResolvedValue('123456');
      mockEmailService.sendOtp.mockResolvedValue(undefined);
      
      // Use the mocked bcrypt.hash directly - NO jest.spyOn
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Act
      const result = await service.register(validRegisterData);

      // Assert
      expect(result).toEqual({
        message: 'Registration successful. Check your university email for verification code',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterData.password, 12);
      expect(mockOtpService.createOtp).toHaveBeenCalledWith(validRegisterData.email);
      expect(mockEmailService.sendOtp).toHaveBeenCalled();
    });

    it('should reject if university does not exist', async () => {
      // Arrange
      mockUniversityRepository.findOne.mockResolvedValue(null);

      // Act and Assert
      await expect(service.register(validRegisterData)).rejects.toThrow(
        new BadRequestException('Selected university is not valid')
      );
    });

    it('should reject if email is already registered', async () => {
      // Arrange
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      // Act and Assert
      await expect(service.register(validRegisterData)).rejects.toThrow(
        new ConflictException('Email already registered')
      );
    });

    // Domain allowlist rejection
    it('should reject if email domain does not match university domain', async () => {
      // ARRANGE
      const wrongDomainData = {
        ...validRegisterData,
        email: 'student@gmail.com', 
      };
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.register(wrongDomainData)).rejects.toThrow(
        new BadRequestException('Your email must be a tuks.ac.za address for this university')
      );
    });
  });

  // Email verification
  describe('verifyEmail', () => {
    const email = 'u12345678@tuks.ac.za';
    const otpCode = '123456';

    it('should verify email with valid OTP', async () => {
      // Arrange
      mockOtpService.verifyOtp.mockResolvedValue(undefined);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: email,
        role: 'student',
      });
      mockJwtService.sign.mockReturnValue('fake-token');
      mockConfigService.get.mockReturnValue('secret');

      // Act
      const result = await service.verifyEmail(email, otpCode);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { email },
        expect.objectContaining({ is_verified: true })
      );
    });

    it('should fail with invalid OTP', async () => {
      // Arrange
      mockOtpService.verifyOtp.mockRejectedValue(new BadRequestException('Invalid OTP code.'));

      // Act and Assert
      await expect(service.verifyEmail(email, otpCode)).rejects.toThrow(
        new BadRequestException('Invalid OTP code.')
      );
    });
  });

  // Login
  describe('login', () => {
    const loginData = {
      email: 'u12345678@tuks.ac.za',
      password: 'Password123!',
    };

    const verifiedUser = {
      id: 'user-1',
      email: 'u12345678@tuks.ac.za',
      password_hash: 'hashed_password',
      role: 'student',
      is_verified: true,
    };

    it('should login verified user successfully', async () => {
      // ARRANGE
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);
      // Use mocked bcrypt.compare directly - NO jest.spyOn
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      mockJwtService.sign.mockReturnValue('fake-token');
      mockConfigService.get.mockReturnValue('secret');

      // Act 
      const result = await service.login(loginData);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, verifiedUser.password_hash);
    });

    it('should reject with wrong password', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);
      // Use mocked bcrypt.compare directly - NO jest.spyOn
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Act and Assert
      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.')
      );
    });

    it('should reject if user does not exist', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act and Assert
      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.')
      );
    });

    it('should send new OTP if user is not verified', async () => {
      // Arrange
      const unverifiedUser = { ...verifiedUser, is_verified: false };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      // Use mocked bcrypt.compare directly - NO jest.spyOn
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      mockOtpService.createOtp.mockResolvedValue('654321');
      mockEmailService.sendOtp.mockResolvedValue(undefined);

      // Act and Assert
      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Email not verified. A new verification code has been sent.')
      );
      expect(mockOtpService.createOtp).toHaveBeenCalledWith(loginData.email);
      expect(mockEmailService.sendOtp).toHaveBeenCalled();
    });
  });

  // Universities
  describe('getUniversities', () => {
    it('should return list of universities', async () => {
      // Arrange
      const universities = [
        { id: '1', name: 'University of Pretoria', email_domain: 'tuks.ac.za' },
        { id: '2', name: 'Wits University', email_domain: 'wits.ac.za' },
      ];
      mockUniversityRepository.find.mockResolvedValue(universities);

      // Act
      const result = await service.getUniversities();

      // Assert
      expect(result).toEqual(universities);
      expect(result).toHaveLength(2);
    });
  });
});
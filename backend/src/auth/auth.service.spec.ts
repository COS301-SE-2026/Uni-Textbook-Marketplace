import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { User } from '../database/entities/users.entity';
import { University } from '../database/entities/university.entity';
import { OTP } from '../database/entities/otps.entity';
import { EMAIL_SERVICE } from '../email/email.interface';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';


jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));


jest.mock('node:crypto', () => ({
  randomInt: jest.fn(),
  timingSafeEqual: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';

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

  
  
  //Register tests
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

    // Happy path test
    it('should successfully register a new user (happy path)', async () => {
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ id: 'user-1' });
      mockUserRepository.save.mockResolvedValue({ id: 'user-1' });
      mockOtpService.createOtp.mockResolvedValue('123456');
      mockEmailService.sendOtp.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(validRegisterData);

      expect(result).toEqual({
        message: 'Registration successful. Check your university email for verification code',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterData.password, 12);
      expect(mockOtpService.createOtp).toHaveBeenCalledWith(validRegisterData.email);
      expect(mockEmailService.sendOtp).toHaveBeenCalled();
    });

    //Rejected Domain test
    it('should reject registration if email domain does not match university domain', async () => {
      const wrongDomainData = {
        ...validRegisterData,
        email: 'student@gmail.com',
      };
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.register(wrongDomainData)).rejects.toThrow(
        new BadRequestException('Your email must be a tuks.ac.za address for this university')
      );
    });

    it('should reject if university does not exist', async () => {
      mockUniversityRepository.findOne.mockResolvedValue(null);

      await expect(service.register(validRegisterData)).rejects.toThrow(
        new BadRequestException('Selected university is not valid')
      );
    });

    it('should reject if email is already registered', async () => {
      mockUniversityRepository.findOne.mockResolvedValue(mockUniversity);
      mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(validRegisterData)).rejects.toThrow(
        new ConflictException('Email already registered')
      );
    });
  });

  // OTP verification tests
  describe('verifyEmail (OTP Validation)', () => {
    const email = 'u12345678@tuks.ac.za';
    const validOtp = '123456';

    //Correct OTP test
    it('should successfully verify email with correct OTP', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(undefined);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: email,
        role: 'student',
        first_name: 'Gift',
        last_name: 'M',
      });
      mockJwtService.sign.mockReturnValue('fake-token');
      mockConfigService.get.mockReturnValue('secret');

      const result = await service.verifyEmail(email, validOtp);

      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { email },
        expect.objectContaining({ is_verified: true })
      );
    });

    // Expired otp test 
    it('should fail with expired OTP', async () => {
      mockOtpService.verifyOtp.mockRejectedValue(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );

      await expect(service.verifyEmail(email, validOtp)).rejects.toThrow(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );
    });

    // test for an already used OTP 
    it('should fail with already used OTP', async () => {
      mockOtpService.verifyOtp.mockRejectedValue(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );

      await expect(service.verifyEmail(email, validOtp)).rejects.toThrow(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );
    });

    // test for an invalid otp
    it('should fail with invalid OTP code', async () => {
      mockOtpService.verifyOtp.mockRejectedValue(
        new BadRequestException('Invalid OTP code.')
      );

      await expect(service.verifyEmail(email, '999999')).rejects.toThrow(
        new BadRequestException('Invalid OTP code.')
      );
    });

    // test for too many attempts
    it('should fail after too many failed OTP attempts', async () => {
      mockOtpService.verifyOtp.mockRejectedValue(
        new BadRequestException('Too many failed attempts. Please request a new OTP.')
      );

      await expect(service.verifyEmail(email, '000000')).rejects.toThrow(
        new BadRequestException('Too many failed attempts. Please request a new OTP.')
      );
    });
  });

  // Login tests
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

    // Credentials tests
    it('should successfully login with correct credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('fake-token');
      mockConfigService.get.mockReturnValue('secret');

      const result = await service.login(loginData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, verifiedUser.password_hash);
    });

    //Wrong Password test
    it('should reject login with wrong password', async () => {
      mockUserRepository.findOne.mockResolvedValue(verifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.')
      );
    });

    // Unverified account tests
    it('should send new OTP and reject when account is not verified', async () => {
      const unverifiedUser = { ...verifiedUser, is_verified: false };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockOtpService.createOtp.mockResolvedValue('654321');
      mockEmailService.sendOtp.mockResolvedValue(undefined);

      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Email not verified. A new verification code has been sent.')
      );
      expect(mockOtpService.createOtp).toHaveBeenCalledWith(loginData.email);
      expect(mockEmailService.sendOtp).toHaveBeenCalled();
    });

    // User not existing test
    it('should reject if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginData)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.')
      );
    });

    // Email error test
    it('should reject with wrong email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const wrongEmailData = {
        email: 'wrong@tuks.ac.za',
        password: 'Password123!',
      };

      await expect(service.login(wrongEmailData)).rejects.toThrow(
        new UnauthorizedException('Invalid email or password.')
      );
    });
  });

  // Get Universities test
  describe('getUniversities', () => {
    it('should return list of universities', async () => {
      const universities = [
        { id: '1', name: 'University of Pretoria', email_domain: 'tuks.ac.za' },
        { id: '2', name: 'Wits University', email_domain: 'wits.ac.za' },
      ];
      mockUniversityRepository.find.mockResolvedValue(universities);

      const result = await service.getUniversities();

      expect(result).toEqual(universities);
      expect(result).toHaveLength(2);
    });
  });

  // Resend OTPs test
  describe('resendOtp', () => {
    const email = 'u12345678@tuks.ac.za';

    it('should send new OTP when user exists and is not verified', async () => {
      const unverifiedUser = {
        id: 'user-1',
        email: email,
        is_verified: false,
      };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      mockOtpService.canRequestOtp.mockResolvedValue(undefined);
      mockOtpService.createOtp.mockResolvedValue('789012');
      mockEmailService.sendOtp.mockResolvedValue(undefined);

      const result = await service.resendOtp(email);

      expect(result).toEqual({
        message: 'Verification code sent successfully.',
      });
    });

    it('should return success message when user not found (security measure)', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.resendOtp(email);

      expect(result).toEqual({
        message: 'If this email is registered, a new code has been sent.',
      });
    });
  });

  // user get tests
  describe('getMe', () => {
    const userId = 'user-1';

    it('should return user profile when user exists', async () => {
      const userProfile = {
        id: userId,
        email: 'u12345678@tuks.ac.za',
        first_name: 'Gift',
        last_name: 'M',
        role: 'student',
      };
      mockUserRepository.findOne.mockResolvedValue(userProfile);

      const result = await service.getMe(userId);

      expect(result).toEqual(userProfile);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getMe(userId)).rejects.toThrow(
        new UnauthorizedException('User not found')
      );
    });
  });
});

// OTP service
describe('OtpService', () => {
  let otpService: OtpService;

  const mockOtpRepository = {
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: getRepositoryToken(OTP), useValue: mockOtpRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    otpService = module.get<OtpService>(OtpService);
    jest.clearAllMocks();
  });

  describe('createOtp', () => {
    const email = 'test@tuks.ac.za';

    it('should create a new OTP and return a 6-digit code', async () => {
      mockOtpRepository.update.mockResolvedValue({ affected: 1 });
      mockOtpRepository.create.mockReturnValue({ email, code: '123456' });
      mockOtpRepository.save.mockResolvedValue({ email, code: '123456' });
      (crypto.randomInt as jest.Mock).mockReturnValue(123456);

      const result = await otpService.createOtp(email);

      expect(result).toBe('123456');
      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        { email, used: false },
        { used: true }
      );
      expect(mockOtpRepository.create).toHaveBeenCalledWith({
        email,
        code: '123456',
        expires_at: expect.any(Date),
      });
      expect(mockOtpRepository.save).toHaveBeenCalled();
    });

    it('should mark existing unused OTPs as used before creating new one', async () => {
      mockOtpRepository.update.mockResolvedValue({ affected: 2 });
      mockOtpRepository.create.mockReturnValue({ email, code: '789012' });
      mockOtpRepository.save.mockResolvedValue({ email, code: '789012' });
      (crypto.randomInt as jest.Mock).mockReturnValue(789012);

      const result = await otpService.createOtp(email);

      expect(result).toBe('789012');
      expect(mockOtpRepository.update).toHaveBeenCalledWith(
        { email, used: false },
        { used: true }
      );
    });
  });

  describe('verifyOtp', () => {
    const email = 'test@tuks.ac.za';
    const validCode = '123456';
    const invalidCode = '999999';

    const validOtpEntity = {
      id: 'otp-1',
      email,
      code: '123456',
      attempts: 0,
      used: false,
      expires_at: new Date(Date.now() + 600000),
      created_at: new Date(),
    };

    it('should successfully verify a valid OTP', async () => {
      mockOtpRepository.findOne.mockResolvedValue(validOtpEntity);
      mockOtpRepository.increment.mockResolvedValue({ affected: 1 });
      mockOtpRepository.update.mockResolvedValue({ affected: 1 });
      (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

      await expect(otpService.verifyOtp(email, validCode)).resolves.not.toThrow();
      expect(mockOtpRepository.increment).toHaveBeenCalledWith({ id: validOtpEntity.id }, 'attempts', 1);
      expect(mockOtpRepository.update).toHaveBeenCalledWith({ id: validOtpEntity.id }, { used: true });
    });

    it('should throw error when no valid OTP found', async () => {
      mockOtpRepository.findOne.mockResolvedValue(null);

      await expect(otpService.verifyOtp(email, validCode)).rejects.toThrow(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );
      expect(mockOtpRepository.update).not.toHaveBeenCalled();
    });

    
    it('should throw error when OTP is expired', async () => {
      mockOtpRepository.findOne.mockResolvedValue(null);

      await expect(otpService.verifyOtp(email, validCode)).rejects.toThrow(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );
    });

    
    it('should throw error when OTP is already used', async () => {
      mockOtpRepository.findOne.mockResolvedValue(null);

      await expect(otpService.verifyOtp(email, validCode)).rejects.toThrow(
        new BadRequestException('No valid OTP found. Please request a new one.')
      );
    });

    it('should throw error after too many failed attempts', async () => {
      const otpWithManyAttempts = {
        ...validOtpEntity,
        attempts: 3,
      };
      mockOtpRepository.findOne.mockResolvedValue(otpWithManyAttempts);
      mockOtpRepository.increment.mockResolvedValue({ affected: 1 });
      mockOtpRepository.update.mockResolvedValue({ affected: 1 });

      await expect(otpService.verifyOtp(email, validCode)).rejects.toThrow(
        new BadRequestException('Too many failed attempts. Please request a new OTP.')
      );
      expect(mockOtpRepository.update).toHaveBeenCalledWith({ id: otpWithManyAttempts.id }, { used: true });
    });

    it('should throw error when OTP code does not match', async () => {
      mockOtpRepository.findOne.mockResolvedValue(validOtpEntity);
      mockOtpRepository.increment.mockResolvedValue({ affected: 1 });
      (crypto.timingSafeEqual as jest.Mock).mockReturnValue(false);

      await expect(otpService.verifyOtp(email, invalidCode)).rejects.toThrow(
        new BadRequestException('Invalid OTP code.')
      );
      expect(mockOtpRepository.update).not.toHaveBeenCalled();
    });

    it('should increment attempts on each failed verification', async () => {
      mockOtpRepository.findOne.mockResolvedValue(validOtpEntity);
      mockOtpRepository.increment.mockResolvedValue({ affected: 1 });
      (crypto.timingSafeEqual as jest.Mock).mockReturnValue(false);

      await expect(otpService.verifyOtp(email, invalidCode)).rejects.toThrow();
      expect(mockOtpRepository.increment).toHaveBeenCalledWith({ id: validOtpEntity.id }, 'attempts', 1);
    });
  });

  describe('canRequestOtp', () => {
  const email = 'test@tuks.ac.za';

  
  it('should throw error when an unused OTP already exists (rate limiting)', async () => {
    const existingOtp = {
      id: 'otp-1',
      email,
      used: false,
      created_at: new Date(),
    };
    mockOtpRepository.findOne.mockResolvedValue(existingOtp);

    await expect(otpService.canRequestOtp(email)).rejects.toThrow(
      new BadRequestException('An OTP has already been sent. Please wait before requesting another one.')
    );
  });

  
  it('should not throw error when no unused OTP exists', async () => {
    mockOtpRepository.findOne.mockResolvedValue(null);

    await expect(otpService.canRequestOtp(email)).resolves.not.toThrow();
  });

  
  it('should not throw error when existing OTP is used', async () => {
    const usedOtp = {
      id: 'otp-1',
      email,
      used: true,
    };
    mockOtpRepository.findOne.mockResolvedValue(usedOtp);

    await expect(otpService.canRequestOtp(email)).resolves.not.toThrow();
  });
});
});

// Auth module tests
describe('AuthModule', () => {
  let moduleRef: TestingModule;

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

  const mockOtpRepository = {
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
  };

  const mockEmailService = {
    sendOtp: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn().mockReturnValue('test-secret'),
  };

  const mockJwtStrategy = {
    validate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        OtpService,
        {
          provide: JwtStrategy,
          useValue: mockJwtStrategy,
        },
        {
          provide: EMAIL_SERVICE,
          useValue: mockEmailService,
        },
        RolesGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(University),
          useValue: mockUniversityRepository,
        },
        {
          provide: getRepositoryToken(OTP),
          useValue: mockOtpRepository,
        },
      ],
    }).compile();

    moduleRef = module;
    jest.clearAllMocks();
  });

  it('should compile the module without errors', async () => {
    expect(moduleRef.get(AuthService)).toBeDefined();
    expect(moduleRef.get(OtpService)).toBeDefined();
    expect(moduleRef.get(AuthController)).toBeDefined();
    expect(moduleRef.get(RolesGuard)).toBeDefined();
  });

  it('should have all providers properly injected', async () => {
    const authService = moduleRef.get(AuthService);
    const otpService = moduleRef.get(OtpService);
    const authController = moduleRef.get(AuthController);
    const rolesGuard = moduleRef.get(RolesGuard);

    expect(authService).toBeInstanceOf(AuthService);
    expect(otpService).toBeInstanceOf(OtpService);
    expect(authController).toBeInstanceOf(AuthController);
    expect(rolesGuard).toBeInstanceOf(RolesGuard);
  });

  it('should have proper dependency injection between services', async () => {
    const authService = moduleRef.get(AuthService);
    
    expect(authService).toBeDefined();
    expect((authService as any).otpService).toBeDefined();
    expect((authService as any).userRepository).toBeDefined();
    expect((authService as any).universityRepository).toBeDefined();
  });

  it('should have TypeOrmModule configured with correct entities', async () => {
    const userRepo = moduleRef.get(getRepositoryToken(User));
    const universityRepo = moduleRef.get(getRepositoryToken(University));
    const otpRepo = moduleRef.get(getRepositoryToken(OTP));

    expect(userRepo).toBeDefined();
    expect(universityRepo).toBeDefined();
    expect(otpRepo).toBeDefined();
  });

  it('should wire EmailService provider correctly', async () => {
    const authService = moduleRef.get(AuthService);
    const emailService = moduleRef.get(EMAIL_SERVICE);

    expect(emailService).toBe(mockEmailService);
    expect((authService as any).emailService).toBe(mockEmailService);
  });

  it('should have RolesGuard available for injection', async () => {
    const rolesGuard = moduleRef.get(RolesGuard);
    expect(rolesGuard).toBeInstanceOf(RolesGuard);
  });

  it('should have AuthController with properly injected dependencies', async () => {
    const authController = moduleRef.get(AuthController);
    expect(authController).toBeDefined();
    expect((authController as any).authService).toBeDefined();
  });
});
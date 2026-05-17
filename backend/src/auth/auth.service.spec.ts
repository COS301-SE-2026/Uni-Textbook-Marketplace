import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OtpService } from './otp.service';

describe('AuthService', () => {
    
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUniversityRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
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
    sign: jest.fn().mockReturnValue('token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        { provide: 'UserRepository', useValue: mockUserRepository },
        { provide: 'UniversityRepository', useValue: mockUniversityRepository },
        { provide: OtpService, useValue: mockOtpService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'EMAIL_SERVICE', useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('getUniversities', () => {
    it('should return universities', async () => {
      const fakeUniversities = [
        {
          id: '1',
          name: 'University of Pretoria',
          email_domain: 'tuks.ac.za',
        },
        {
          id: '2',
          name: 'Wits University',
          email_domain: 'wits.ac.za',
        },
      ];

      mockUniversityRepository.find.mockResolvedValue(fakeUniversities);

      const result = await service.getUniversities();

      expect(result).toEqual(fakeUniversities);
    });
  });
});
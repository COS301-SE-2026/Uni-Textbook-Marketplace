import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  getUniversities: jest.fn(),
  register: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

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

  describe('register', () =>  {
    it('should call authService.register with the dto', async () =>{

      const dto = {
        email: 'u12345678@tuks.ac.za',
        password: 'password098',
        first_name: 'Gift',
        last_name: 'M',
        university_id: '1',
      };

      const serviceResponse = {
        message: 'Registration successful. Check your university email for verification code',
      };

      mockAuthService.register.mockResolvedValue(serviceResponse);
      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);

      expect(result).toEqual(serviceResponse);
    });
  });
});
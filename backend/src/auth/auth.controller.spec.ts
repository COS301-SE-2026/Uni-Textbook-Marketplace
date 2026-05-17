import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  getUniversities: jest.fn(),
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

    it('should return an empty array when authService returns no universities', async () => {
      mockAuthService.getUniversities.mockResolvedValue([]);

      const result = await controller.getUniversities();

      expect(result).toEqual([]);
    });
  });
});
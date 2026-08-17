import { Test, TestingModule } from '@nestjs/testing';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { ReportCategory } from './enums/report-category.dto';
import { CreateReportDto } from './dto/create-report.dto';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ReportsController],
        providers: [
          {
            provide: ReportsService,
            useValue: service,
          },
        ],
      }).compile();

    controller =
      module.get<ReportsController>(
        ReportsController,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a report for the authenticated user', async () => {
      const request = {
        user: {
          id: 'user-123',
        },
      };

      const dto: CreateReportDto = {
        listing_id: 'listing-123',
        category: ReportCategory.FRAUD,
        reason: 'This listing is fraudulent.',
      };

      const expectedReport = {
        id: 'report-123',
        ...dto,
        user: request.user,
      };

      service.create.mockResolvedValue(
        expectedReport,
      );

      const result = await controller.create(
        request as any,
        dto,
      );

      expect(service.create).toHaveBeenCalledWith(
        'user-123',
        dto,
      );

      expect(result).toBe(expectedReport);
    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const reports = [
        {
          id: 'report-1',
          category: ReportCategory.FRAUD,
        },
        {
          id: 'report-2',
          category: ReportCategory.DUPLICATE,
        },
      ];

      service.findAll.mockResolvedValue(reports);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBe(reports);
    });
  });

  describe('findOne', () => {
    it('should return a report by ID', async () => {
      const report = {
        id: 'report-123',
        category: ReportCategory.MISLEADING,
      };

      service.findOne.mockResolvedValue(report);

      const result =
        await controller.findOne('report-123');

      expect(service.findOne).toHaveBeenCalledWith(
        'report-123',
      );

      expect(result).toBe(report);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import {
    Report,
    ReportStatus,
} from '../database/entities/report.entity';

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

        controller = module.get<ReportsController>(ReportsController,);
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
            reason:
                'This listing is fraudulent.',
        };

        const expectedReport = {
            id: 'report-123',
            reporter: request.user,
            listing: {
                id: 'listing-123',
            },
            reason: dto.reason,
            status: ReportStatus.PENDING,
        } as unknown as Report;

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
                    reason: 'Fraudulent listing',
                    status: ReportStatus.PENDING,
                },
                {
                    id: 'report-2',
                    reason: 'Duplicate listing',
                    status: ReportStatus.REVIEWED,
                },
            ] as Report[];

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
                reason: 'Misleading listing',
                status: ReportStatus.PENDING,
            } as Report;

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
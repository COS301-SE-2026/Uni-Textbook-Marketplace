import { Test, TestingModule } from '@nestjs/testing';

import { ReportsController } from '../reports/reports.controller';
import { ReportsService } from '../reports/reports.service';
import { CreateReportDto } from '../reports/dto/create-report.dto';
import { AdminController } from './admin.controller';
import {
    Report,
    ReportStatus,
} from '../database/entities/report.entity';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReportFiltersDto } from 'src/reports/dto/report-filters.dto';

describe('Reports and admin controllers', () => {
    let controller: ReportsController;
    let admin: AdminController;
    let service: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        dismiss: jest.Mock;
    };

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            dismiss: jest.fn(),
        };

        const module: TestingModule =
        await Test.createTestingModule({
            controllers: [ReportsController, AdminController],
            providers: [
            {
                provide: ReportsService,
                useValue: service,
            },
            {
                provide: AdminService,
                useValue:{
                    JwtAuthGuard,
                    RolesGuard,
                }
            },
            {
                provide: EventEmitter2,
                useValue: {
                    emit: jest.fn()
                }
            }
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController,);
        admin = module.get<AdminController>(AdminController,);
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

            const result = await admin.findAll({
                page: 1,
                limit: 20,
            });

            expect(service.findAll).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
            });
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
                await admin.findOne('report-123');

            expect(service.findOne).toHaveBeenCalledWith(
                'report-123',
            );

            expect(result).toBe(report);
        });
    });

    describe('dismissReport', () => {
        it('should dismiss a report', async () => {
            const report = {
                id: 'report-123',
                status: ReportStatus.REVIEWED,
            } as Report;

            service.dismiss = jest.fn();

            service.dismiss.mockResolvedValue(report);

            const result =
                await admin.dismissReport(
                    'report-123',
                );

            expect(
                service.dismiss,
            ).toHaveBeenCalledWith(
                'report-123',
            );
                expect(result).toBe(report);
        });
    });
});



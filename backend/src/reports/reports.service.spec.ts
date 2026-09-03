import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportsService } from './reports.service';
import { Report } from '../database/entities/report.entity';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '../database/entities/report.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ReportsService', () => {
    let service: ReportsService;
    let reportsRepository: jest.Mocked<Repository<Report>>;
    let listingsRepository: jest.Mocked<Repository<Listing>>;
    let usersRepository: jest.Mocked<Repository<User>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            ReportsService,

            {
                provide: getRepositoryToken(Report),
                useValue: {
                    create: jest.fn(),
                    save: jest.fn(),
                    find: jest.fn(),
                    findOne: jest.fn(),
                },
            },

            {
                provide: getRepositoryToken(Listing),
                useValue: {
                    findOne: jest.fn(),
                },
            },

            {
                provide: getRepositoryToken(User),
                useValue: {
                    findOne: jest.fn(),
                },
            },

            {
                provide: EventEmitter2,
                useValue: {
                    emit: jest.fn(),
                },
            },
        ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        reportsRepository = module.get(getRepositoryToken(Report));
        listingsRepository = module.get(getRepositoryToken(Listing));
        usersRepository = module.get(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('create', () => {
        const userId = 'user-123';
        const createReportDto: CreateReportDto = {
            listing_id: 'listing-123',
            reason: 'This listing appears to be fraudulent.',
        };

        const listing = {
            id: 'listing-123',
        } as Listing;

        const user = {
            id: 'user-123',
        } as User;

        const report = {
            id: 'report-123',
            reporter: user,
            listing,
            reason: createReportDto.reason,
            status: ReportStatus.PENDING,
        } as Report;

        it('should create a report successfully', async () => {
            listingsRepository.findOne.mockResolvedValue(listing);
            usersRepository.findOne.mockResolvedValue(user);
            reportsRepository.create.mockReturnValue(report);
            reportsRepository.save.mockResolvedValue(report);

            const result = await service.create(
                userId,
                createReportDto,
            );

            expect(listingsRepository.findOne).toHaveBeenCalledWith({
                where: {
                id: createReportDto.listing_id,
                },
            });

            expect(usersRepository.findOne).toHaveBeenCalledWith({
                where: {
                id: userId,
                },
            });

            expect(
                    reportsRepository.save,
                ).toHaveBeenCalledWith(report);

            expect(reportsRepository.save).toHaveBeenCalledWith(
                report,
            );

            expect(result).toBe(report);
        });

        it('should set the report status to PENDING', async () => {
            listingsRepository.findOne.mockResolvedValue(
                listing,
            );

            usersRepository.findOne.mockResolvedValue(
                user,
            );

            reportsRepository.create.mockReturnValue(
                report,
            );

            reportsRepository.save.mockResolvedValue(
                report,
            );

            const result = await service.create(
                userId,
                createReportDto,
            );

            expect(result.status).toBe(
                ReportStatus.PENDING,
            );
        });

        it('should assign the correct reporter', async () => {
            listingsRepository.findOne.mockResolvedValue(
                listing,
            );

            usersRepository.findOne.mockResolvedValue(
                user,
            );

            reportsRepository.create.mockReturnValue(
                report,
            );

            reportsRepository.save.mockResolvedValue(
                report,
            );

            await service.create(
                userId,
                createReportDto,
            );

            expect(
                reportsRepository.create,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    reporter: user,
                }),
            );
        });

        it('should assign the correct listing', async () => {
            listingsRepository.findOne.mockResolvedValue(
                listing,
            );

            usersRepository.findOne.mockResolvedValue(
                user,
            );

            reportsRepository.create.mockReturnValue(
                report,
            );

            reportsRepository.save.mockResolvedValue(
                report,
            );

            await service.create(
                userId,
                createReportDto,
            );

            expect(
                reportsRepository.create,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    listing,
                }),
            );
        });

        it('should save the provided reason', async () => {
            listingsRepository.findOne.mockResolvedValue(
                listing,
            );

            usersRepository.findOne.mockResolvedValue(
                user,
            );

            reportsRepository.create.mockReturnValue(
                report,
            );

            reportsRepository.save.mockResolvedValue(
                report,
            );

            await service.create(
                userId,
                createReportDto,
            );

            expect(
                reportsRepository.create,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    reason: createReportDto.reason,
                }),
            );
        });

        it('should throw NotFoundException when listing does not exist', async () => {
            listingsRepository.findOne.mockResolvedValue(
                null,
            );

            await expect(
                service.create(
                    userId,
                    createReportDto,
                ),
            ).rejects.toThrow(
                new NotFoundException(
                    'Listing not found',
                ),
            );

            expect(
                usersRepository.findOne,
            ).not.toHaveBeenCalled();

            expect(
                reportsRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                reportsRepository.save,
            ).not.toHaveBeenCalled();
        });
        
        it('should throw NotFoundException when user does not exist', async () => {
            listingsRepository.findOne.mockResolvedValue(
                listing,
            );

            usersRepository.findOne.mockResolvedValue(
                null,
            );

            await expect(
                service.create(
                    userId,
                    createReportDto,
                ),
            ).rejects.toThrow(
                new NotFoundException(
                    'User not found',
                ),
            );

            expect(
                reportsRepository.create,
            ).not.toHaveBeenCalled();

            expect(
                reportsRepository.save,
            ).not.toHaveBeenCalled();
        });


    });

    describe('findAll', () => {
        it('should return all reports', async () => {
            const reports = [
                    {
                        id: 'report-1',
                        reporter: {
                            id: 'user-1',
                        },
                        listing: {
                            id: 'listing-1',
                        },
                        reason: 'Fraudulent listing',
                        status: ReportStatus.PENDING,
                    },
                    {
                        id: 'report-2',
                        reporter: {
                            id: 'user-2',
                        },
                        listing: {
                            id: 'listing-2',
                        },
                        reason: 'Duplicate listing',
                        status: ReportStatus.REVIEWED,
                    },
                ] as Report[];

            reportsRepository.find.mockResolvedValue(reports);

            const result = await service.findAll();

            expect(
                reportsRepository.find,
            ).toHaveBeenCalledWith({
                relations: {
                    reporter: true,
                    listing: true,
                },
                order: {
                    created_at: 'DESC',
                },
            });

             expect(result).toBe(reports);
        });

        it('should return an empty array when there are no reports', async () => {
            reportsRepository.find.mockResolvedValue([]);
            const result = await service.findAll();
            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a report by ID', async () => {
            const report = {
                id: 'report-123',
                reporter: {
                    id: 'user-123',
                },
                listing: {
                    id: 'listing-123',
                },
                reason: 'Fraudulent listing',
                status: ReportStatus.PENDING,
            } as Report;

            reportsRepository.findOne.mockResolvedValue(report);
            const result = await service.findOne('report-123');

            expect(reportsRepository.findOne).toHaveBeenCalledWith({
                where: {
                    id: 'report-123',
                },
                    relations: {
                    // user: true,
                    reporter:true,
                    listing: true,
                },
            });

        expect(result).toBe(report);
        });

        it('should throw NotFoundException when report does not exist', async () => {
        reportsRepository.findOne.mockResolvedValue(null);

        await expect(
            service.findOne('does-not-exist'),
        ).rejects.toThrow(
            new NotFoundException('Report not found'),
        );
        });
    });

    describe('dismiss', () => {
        it('should mark a report as REVIEWED', async () => {
            const report = {
                id: 'report-123',
                reporter: {
                    id: 'user-123',
                },
                listing: {
                    id: 'listing-123',
                    title: 'Test Textbook',
                },
                status: ReportStatus.PENDING,
            } as Report;

            reportsRepository.findOne.mockResolvedValue(report);

            reportsRepository.save.mockResolvedValue({
                ...report,
                status: ReportStatus.REVIEWED,
            } as Report);

            const result = await service.dismiss(
                'report-123',
            );

            expect(
                reportsRepository.findOne,
            ).toHaveBeenCalledWith({
                where: {
                    id: 'report-123',
                },
                relations: {
                    reporter: true,
                    listing: true,
                },
            });

            expect(report.status).toBe(
                ReportStatus.REVIEWED,
            );

            expect(
                reportsRepository.save,
            ).toHaveBeenCalledWith(report);

            expect(result.status).toBe(
                ReportStatus.REVIEWED,
            );
        });

        it('should throw NotFoundException if the report does not exist', async () => {
            reportsRepository.findOne.mockResolvedValue(
                null,
            );

            await expect(
                service.dismiss('does-not-exist'),
            ).rejects.toThrow(
                new NotFoundException(
                    'Report not found',
                ),
            );

            expect(
                reportsRepository.save,
            ).not.toHaveBeenCalled();
        });
    });
});
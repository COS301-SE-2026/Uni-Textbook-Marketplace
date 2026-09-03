import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report } from '../database/entities/report.entity';
import { ReportStatus } from '../database/entities/report.entity';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';

import { CreateReportDto } from './dto/create-report.dto';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReportEvent } from './events/report.events';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,

    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    const listing = await this.listingsRepository.findOne({
      where: {
        id: createReportDto.listing_id,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const report = this.reportsRepository.create({
      reporter: user,
      listing,
      reason: createReportDto.reason,
      status: ReportStatus.PENDING,
    });

    const savedReport = await this.reportsRepository.save(report);

    const event = new ReportEvent();
    event.reportId = savedReport.id;
    event.reporterId = user.id;
    event.listingId = listing.id;
    event.action = 'REPORT_CREATED';
    event.message = `A new report has been submitted for "${listing.title}".`;

    this.eventEmitter.emit('report.created', event);

    return savedReport;
  }

  async findAll(): Promise<Report[]> {
    return this.reportsRepository.find({
      relations: {
        reporter: true,
        listing: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: {
        id,
      },
      relations: {
        reporter: true,
        listing: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async dismiss(id: string): Promise<Report> {
    const report = await this.reportsRepository.findOne({
      where: {
        id,
      },
      relations: {
        reporter: true,
        listing: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.REVIEWED;

    const savedReport = await this.reportsRepository.save(report);
    const event = new ReportEvent();
    event.reportId = savedReport.id;
    event.reporterId = report.reporter.id;
    event.listingId = report.listing.id;
    event.action = 'REPORT_REVIEWED';
    event.message = `Your report regarding "${report.listing.title}" has been reviewed.`;

    this.eventEmitter.emit('report.reviewed', event);

    return savedReport;
  }
}

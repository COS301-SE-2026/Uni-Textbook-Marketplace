import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report } from '../database/entities/report.entity';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';

import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Report)
        private readonly reportsRepository: Repository<Report>,

        @InjectRepository(Listing)
        private readonly listingsRepository: Repository<Listing>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
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
        user,
        listing,
        category: createReportDto.category,
        reason: createReportDto.reason,
        });

        return this.reportsRepository.save(report);
    }

    async findAll(): Promise<Report[]> {
        return this.reportsRepository.find({
        relations: {
            user: true,
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
            user: true,
            listing: true,
        },
        });

        if (!report) {
        throw new NotFoundException('Report not found');
        }

        return report;
    }
}
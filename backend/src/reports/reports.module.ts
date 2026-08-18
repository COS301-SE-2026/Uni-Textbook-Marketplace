import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { Report } from '../database/entities/report.entity';
import { Listing } from '../database/entities/listing.entity';
import { User } from '../database/entities/users.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
        Report,
        Listing,
        User,
        ]),
    ],
    controllers: [
        ReportsController,
    ],
    providers: [
        ReportsService,
    ],
    exports:[
        ReportsService,
    ]
})
export class ReportsModule {}
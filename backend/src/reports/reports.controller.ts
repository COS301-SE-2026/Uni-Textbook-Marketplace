import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
} from '@nestjs/common';

import { Request } from 'express';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
    ) {}

    @Post()
    async create(
        @Req() req: Request,
        @Body() createReportDto: CreateReportDto,
    ) {
        const userId = (req as any).user.id;

        return this.reportsService.create(
        userId,
        createReportDto,
        );
    }

    @Get()
    async findAll() {
        return this.reportsService.findAll();
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
    ) {
        return this.reportsService.findOne(id);
    }
}
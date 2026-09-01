import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createReportDto: CreateReportDto,
  ) {
    const userId = req.user.id;

    return this.reportsService.create(userId, createReportDto);
  }
  //moved the GETter and GET ID to admin
  
}

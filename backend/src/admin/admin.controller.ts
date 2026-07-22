import { Controller, Post, Param, Body, Req, Get, Query } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { User } from '../database/entities/users.entity';
import { AuditLogFiltersDto } from '../audit/dto/audit-log-filters.dto';

// Define the request with user interface
interface RequestWithUser extends Request {
  user: User; // Make it required, not optional
}

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post(':id/approve')
  async approveListing(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.adminService.approveListing(id, req.user.id);
  }

  @Post(':id/reject')
  async rejectListing(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.adminService.rejectListing(id, req.user.id);
  }

  @Get('audit-log')
  async getAuditLog(@Query() filters: AuditLogFiltersDto) {
    return await this.adminService.getAuditLog(filters);
  }

  @Get('audit-log/stats')
  async getAuditLogStats() {
    return await this.adminService.getAuditLogStats();
  }

  @Get('audit-log/:entityType/:entityId')
  async getAuditLogByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return await this.adminService.getAuditLogByEntity(entityType, entityId);
  }
}

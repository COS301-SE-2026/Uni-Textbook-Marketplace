import {
  Controller,
  Param,
  Body,
  Req,
  Get,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveListing(@Param('id') id: string, @Req() req: RequestWithUser) {
    return await this.adminService.approveListing(id, req.user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async rejectListing(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: RequestWithUser,
  ) {
    return await this.adminService.rejectListing(id, req.user.id, reason);
  }

  @Get('audit-log')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAuditLog(@Query() filters: AuditLogFiltersDto) {
    return await this.adminService.getAuditLog(filters);
  }

  @Get('emails')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getadmin() {
    return await this.adminService.getusersAdmin();
  }
}

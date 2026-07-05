import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { User } from '../database/entities/users.entity';

// Define the request with user interface
interface RequestWithUser extends Request {
  user: User; // Make it required, not optional
}

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post(':id/reject')
  async rejectListing(
    @Param('id') id: string,
    //@Body('reason') reason: string,
    @Req() req: RequestWithUser, 
  ) {
    return await this.adminService.rejectListing(id, req.user);
  }

  @Post(':id/approve')
  async approveListing(
    @Param('id') id: string,
    @Req() req: RequestWithUser, 
  ) {
    return await this.adminService.approveListing(id, req.user);
  }
}
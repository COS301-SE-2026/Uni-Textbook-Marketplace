import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

import { ListingsService } from './listings.service';
import { AdminService } from '../admin/admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateListingDto } from './dto/create-listing.dto';
import { ListingFiltersDto } from './dto/listingFilter.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly adminService: AdminService, // ✅ Inject AdminService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create listing' })
  createListing(@Req() req: RequestWithUser, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user.id, dto);
  }

  @Get()
  getAll(@Query() query: ListingFiltersDto) {
    return this.listingsService.getAllApproved(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@Req() req: RequestWithUser) {
    return this.listingsService.getMyListings(req.user.id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.listingsService.getListingById(id);
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getPending() {
    return this.adminService.getPendingListings();
  }

  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  approve(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.adminService.approveListing(id, req.user.id);
  }

  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.adminService.rejectListing(id, req.user.id);
  }
}

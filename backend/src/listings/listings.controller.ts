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
import { EditListingDto } from './dto/editListing.dtos';
import { UpdateListingStatusDto } from './dto/updateListingStatus.dto';

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
    private readonly adminService: AdminService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create listing' })
  createListing(@Req() req: RequestWithUser, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user.id, dto);
  }

  @Get()
  async getAll(@Query() query: ListingFiltersDto) {
    const [listings, total] = await this.listingsService.getAllApproved(query);
    return { listings, total };
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

  //for student to edit listings
  @Patch('editlist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  async editlisting(@Body() dto: EditListingDto) {
    return this.listingsService.editlisting(dto);
  }

  //ListingStatus updates
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({
    summary: "Updates a listing's sale status (RESERVED, SOLD, WITHDRAWN)",
  })
  updateListingStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.listingsService.updateListingStatus(
      req.user.id,
      id,
      dto.listing_status,
    );
  }

  @Get('admin/all')
  async getAllForAdmin() {
    return this.listingsService.getAllListingsForAdmin();
  }
}

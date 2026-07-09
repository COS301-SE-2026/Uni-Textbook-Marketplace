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
  NotFoundException,
} from '@nestjs/common';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { ListingsService } from './listings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

import { CreateListingDto } from './dto/create-listing.dto';

import { Request } from 'express';

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
  constructor(private readonly listingsService: ListingsService) {}

  //create
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create listing' })
  createListing(@Req() req: RequestWithUser, @Body() dto: CreateListingDto) {
    return this.listingsService.createListing(req.user.id, dto);
  }

  //get approved
  @Get()
  async getAll(@Query() query: ListingFiltersDto) {
    const [listings, total] = await this.listingsService.getAllApproved(query);
    return { listings, total };
  }

  // my
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  getMine(@Req() req: RequestWithUser) {
    return this.listingsService.getMyListings(req.user.id);
  }

  // search by ID
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.listingsService.getListingById(id);
  }

  // admins only
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getPending() {
    return this.listingsService.getPendingListings();
  }

  // admins only
  @Patch('admin/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @Req() req: RequestWithUser) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id))
      throw new NotFoundException(`Invalid listing ID format`);
    try {
      return await this.listingsService.approveListing(id, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }
  }

  // admins only
  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string, @Req() req: RequestWithUser) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id))
      throw new NotFoundException(`Invalid listing ID format`);

    try {
      return await this.listingsService.rejectListing(id, req.user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }
  }
}

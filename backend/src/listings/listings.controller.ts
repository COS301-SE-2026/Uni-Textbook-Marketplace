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

import { ListingsService } from './listings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

import { CreateListingDto } from './dto/create-listing.dto';

import { Request } from 'express';

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

  //get appro
  @Get()
  getAll(@Query() query: any) {
    return this.listingsService.getAllApproved(query);
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
  approve(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.listingsService.approveListing(id, req.user.id);
  }

  // admins only
  @Patch('admin/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reject(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.listingsService.rejectListing(id, req.user.id);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation
} from '@nestjs/swagger';

import { ListingsService } from './listings.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

import { CreateListingDto } from './dto/create-listing.dto';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
    constructor(private readonly listingsService: ListingsService) {}

    // UC1 - CREATE LISTING (STUDENT ONLY)
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create listing' })
    createListing(@Req() req, @Body() dto: CreateListingDto) {
        return this.listingsService.createListing(req.user.id, dto);
    }

    // UC2 - APPROVED ONLY
    @Get()
    getAll() {
        return this.listingsService.getAllApproved();
    }

    // UC2 - MY LISTINGS
    @Get('mine')
    @UseGuards(JwtAuthGuard)
    getMine(@Req() req) {
        return this.listingsService.getMyListings(req.user.id);
    }

    // UC2 - BY ID
    @Get(':id')
    getById(@Param('id') id: string) {
        return this.listingsService.getListingById(id);
    }

    // UC3 - ADMIN PENDING
    @Get('admin/pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    getPending() {
        return this.listingsService.getPendingListings();
    }

    // UC3 - APPROVE
    @Patch('admin/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    approve(@Param('id') id: string, @Req() req) {
        return this.listingsService.approveListing(id, req.user.id);
    }

    // UC3 - REJECT
    @Patch('admin/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    reject(@Param('id') id: string, @Req() req) {
        return this.listingsService.rejectListing(id, req.user.id);
    }
}
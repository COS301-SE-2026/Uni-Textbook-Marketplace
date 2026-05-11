import {
  Controller,
  Get,
  Post,
  Param,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { ListingsService } from './listings.service';

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_INTERNAL_SERVER_ERROR = 500;

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
    constructor(
        private readonly listingsService:ListingsService,
    ){};

    //Post listings
    @Post()
    @ApiOperation({
        summary: 'Creating a new listing',
    })
    @ApiResponse({
        status: 201,
        description: 'Listing submitted for review',
    })
    createListing() {
        return this.listingsService.createListing();
    }
}
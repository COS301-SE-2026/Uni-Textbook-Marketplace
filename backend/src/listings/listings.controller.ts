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

    //Get listings
    //getAll:
    @Get()
    @ApiOperation({
        summary: 'Return all the listings',
    })
    @ApiResponse({
        status: 200,
        description: 'Returns all listings',
    })
    getAllListings(){
        return this.listingsService.getAllListings();
    }

    @Get('mine')
    @ApiOperation({
        summary: 'Returns the listings this user has made',
    })
    @ApiResponse({
        status: 200,
        description: 'Returns the listings this user has made',
    })
    getMyListings(){
        return this.listingsService.getMyListings();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Returns all listings that match the inputted id',
    })
    @ApiResponse({
        status: 200,
        description: 'Returns all listings that match the inputted',
    })
    @ApiResponse({
        status: 404,
        description: 'Listing not found',
    })
    getListingsById(@Param('id') id: string){
        return this.listingsService.getListingById(id);
    }
}
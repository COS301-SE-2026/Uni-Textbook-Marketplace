import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation
} from '@nestjs/swagger';

import { ListingsService } from './listings.service';

import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
    constructor(
        private readonly listingsService:ListingsService,
    ){};

    //Post listings
    @Post()
    @UseGuards(AuthGuard) //hasnt fully been implemented, just a placeholder
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
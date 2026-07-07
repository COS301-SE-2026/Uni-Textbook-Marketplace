import { Controller, Delete, Get, Post, Param,ParseUUIDPipe, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {

    constructor(private readonly wislidtService: WishlistService) {}

    @Post(':listingId')
    @UseGuards(JwtAuthGuard)
    async save(@Req() req,@Param('listingId',ParseUUIDPipe) listingId: string){
        
    }

    @Delete(':listingId')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('listingId',ParseUUIDPipe) listingId: string){

    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    async mylist(){

    }
}

/* swegger  */
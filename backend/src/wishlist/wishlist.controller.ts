import { Controller, Delete, Get, Post, Param,ParseUUIDPipe, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WishlistService } from './wishlist.service';
import { Request as ExpressRequest } from "express";

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
    };
}

@Controller('wishlist')
export class WishlistController {

    constructor(private readonly wishlistService: WishlistService) {}

    @Post(':listingId')
    @UseGuards(JwtAuthGuard)
    async save(@Req() req: AuthenticatedRequest, @Param('listingId', ParseUUIDPipe) listingId: string) {
        return this.wishlistService.save(req.user.id, listingId);
    }

    @Delete(':listingId')
    @UseGuards(JwtAuthGuard)
    async remove(@Req() req: AuthenticatedRequest, @Param('listingId', ParseUUIDPipe) listingId: string) {
        return this.wishlistService.remove(req.user.id, listingId);
    }

    @Get('mine')
    @UseGuards(JwtAuthGuard)
    async mylist(@Req() req: AuthenticatedRequest) {
        return this.wishlistService.mylist(req.user.id);
    }

    @Get('mywishlist')
    @UseGuards(JwtAuthGuard)
    async mywishlist(@Req() req: AuthenticatedRequest){
        return this.wishlistService.mywishlist(req.user.id);
    }
}

/* swegger  */
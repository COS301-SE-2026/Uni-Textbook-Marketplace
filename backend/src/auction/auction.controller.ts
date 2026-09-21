import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { CreateAuctionDto } from './dto/CreateAuctionDto';
import { AuctionService } from './auction.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { PlaceBidDto } from './dto/PlaceBidDto';
import { User } from '../database/entities/users.entity';

@ApiTags('Auctions')
@ApiBearerAuth()
@Controller('auction')
@UseGuards(JwtAuthGuard,RolesGuard)
export class AuctionController {

    constructor(
        private readonly auctionService: AuctionService
    ) { }

    @Post('auction')
    @ApiOperation({
        summary: 'Create an auction',
        description: 'Creates an auction for an approved listing',
    })
    @Roles('student')
    async createAuction(@Body() dto: CreateAuctionDto,@CurrentUser('id') userId: string,) {
        return this.auctionService.createAuction(dto, userId);
    }

    @Post(':id/bid')
    @ApiOperation({
        summary: 'place a bid',
    })
    @Roles('student')
    async placeBid(@Param('id') auctionId: string, @Body() dto: PlaceBidDto, @CurrentUser() user: User){
        return this.auctionService.placeBid(auctionId, user.id, dto.amount);
    }

    @Get('auctions')
    @ApiOperation({
        summary: 'retuns the avilable auctions'
    })
    async getAuctions(){
        return this.auctionService.getAuctions();
    }

}

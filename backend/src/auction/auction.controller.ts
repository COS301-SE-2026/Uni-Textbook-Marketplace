import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { CreateAuctionDto } from './dto/CreateAuctionDto';
import { AuctionService } from './auction.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

@ApiTags('Auctions')
@ApiBearerAuth()
@Controller('auction')
@UseGuards(JwtAuthGuard)
export class AuctionController {

    constructor(
        private readonly auctionService: AuctionService
    ) { }

    @Post()
    @ApiOperation({
        summary: 'Create an auction',
        description: 'Creates an auction for an approved listing',
    })
    @UseGuards(RolesGuard)
    @Roles('student')
    createAuction(@Body() dto: CreateAuctionDto,@CurrentUser('id') userId: string,) {
        return this.auctionService.createAuction(dto, userId);
    }
}

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../database/entities/auction.entity';
import { Bid } from '../database/entities/bid.entity';
import { Listing } from '../database/entities/listing.entity';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { User } from '../database/entities/users.entity';
import { AuctionProcessor } from './auction.processor';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction, Bid, Listing,User]),
        BullModule.registerQueue({ name: 'auction' }),
    ],
    controllers: [AuctionController],
    providers: [AuctionService,AuctionProcessor],
    exports: [AuctionService],
})
export class AuctionModule { }

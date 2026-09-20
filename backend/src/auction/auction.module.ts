import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../database/entities/auction.entity';
import { Listing } from '../database/entities/listing.entity';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auction, Listing]),
        BullModule.registerQueue({ name: 'auction' }),
    ],
    controllers: [AuctionController],
    providers: [AuctionService],
    exports: [AuctionService],
})
export class AuctionModule { }

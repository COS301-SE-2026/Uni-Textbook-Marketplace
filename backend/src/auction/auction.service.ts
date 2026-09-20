import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction, AuctionStatus } from "../database/entities/auction.entity";
import { Queue } from "bullmq";
import { Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/CreateAuctionDto";
import { Listing } from "../database/entities/listing.entity";

@Injectable()
export class AuctionService {

    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(Listing)
        private readonly listingRepo: Repository<Listing>,

        @InjectQueue('auction')
        private readonly auctionQueue: Queue,
    ) { }

    async createAuction(dto: CreateAuctionDto, userId: string): Promise<Auction> {

        const listing = await this.listingRepo.findOne({
            where: {
                id: dto.listing_id,
            },
            relations: {
                seller: true,
            },
        });

        if (!listing || listing.seller?.id !== userId) {
            throw new ForbiddenException();
        }

        if (listing.status !== 'APPROVED') {
            throw new BadRequestException('Listing must be approved');
        }

        const startTime = dto.start_time ? new Date(dto.start_time) : new Date();
        const endTime = new Date(dto.end_time);

        if (startTime >= endTime) {
            throw new BadRequestException('Start time must be before end time');
        }

        const isImmediate = !dto.start_time || startTime <= new Date();

        const auction = this.auctionRepository.create({
            listing,
            seller: listing.seller,
            starting_price: dto.starting_price,
            reserve_price: dto.reserve_price ?? null,
            start_time: isImmediate ? new Date() : startTime,
            end_time: endTime,
            status: isImmediate ? AuctionStatus.ACTIVE : AuctionStatus.SCHEDULED,
        });

        const savedAuction = await this.auctionRepository.save(auction);

        if (!isImmediate) {
            await this.auctionQueue.add('activate-auction', {
                auctionId: savedAuction.id,
            }, {
                delay: savedAuction.start_time!.getTime() - Date.now(),
            });
        }

        return savedAuction;

    }
}
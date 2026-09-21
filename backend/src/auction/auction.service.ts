import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction, AuctionStatus } from "../database/entities/auction.entity";
import { Bid, BidStatus } from "../database/entities/bid.entity";
import { Queue } from "bullmq";
import { DataSource, Repository } from "typeorm";
import { CreateAuctionDto } from "./dto/CreateAuctionDto";
import { Listing } from "../database/entities/listing.entity";
import { User } from "src/database/entities/users.entity";
import { db } from "../firebase/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

const MIN_INCREMENT = 5;

function validateBid(auction: Auction, bidderId: string, amount: number): string | null {
    if (auction.status !== 'ACTIVE') {
        return 'auction not active';
    }

    if (!auction.end_time || Date.now() >= auction.end_time.getTime()) {
        return 'auction has ended';
    }

    if (bidderId === auction.seller_id) {
        return 'seller cannot bid on own auction';
    }

    if (bidderId === auction.current_highest_bidder_id) {
        return 'already the highest bidder';
    }

    const minAcceptable = auction.current_highest_bid
        ? auction.current_highest_bid + MIN_INCREMENT
        : auction.starting_price;

    if (amount < minAcceptable) {
        return `bid must be at least ${minAcceptable}`;
    }

    return null;
}

@Injectable()
export class AuctionService {

    constructor(
        @InjectRepository(Auction)
        private readonly auctionRepository: Repository<Auction>,

        @InjectRepository(Listing)
        private readonly listingRepo: Repository<Listing>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectQueue('auction')
        private readonly auctionQueue: Queue,

        private readonly dataSource: DataSource,
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

        await this.auctionQueue.add('close-auction', {
            auctionId: savedAuction.id,
        }, {
            delay: endTime.getTime() - Date.now(),
        })

        if (!isImmediate) {
            await this.auctionQueue.add('activate-auction', {
                auctionId: savedAuction.id,
            }, {
                delay: savedAuction.start_time!.getTime() - Date.now(),
            });
        }

        return savedAuction;

    }

    async placeBid(auctionId: string, bidderId: string, amount: number) {

        const result = await this.dataSource.transaction(async (manager) => {

            const auction = await manager
                .createQueryBuilder(Auction, 'auction')
                .setLock('pessimistic_write')
                .where('auction.id = :auctionId', { auctionId })
                .getOne();

            if (!auction) {
                throw new NotFoundException('auction not found');
            }

            const rejectionReason = validateBid(auction, bidderId, amount);

            if (rejectionReason) {

                await manager.insert(Bid, {
                    auction: { id: auctionId },
                    bidder: { id: bidderId },
                    amount,
                    status: BidStatus.REJECTED,
                    rejection_reason: rejectionReason,
                });

                return {
                    status: 'REJECTED' as const,
                    reason: rejectionReason
                };
            }

            auction.current_highest_bid = amount;
            auction.current_highest_bidder = { id: bidderId } as Auction['current_highest_bidder'];

            const EXTENSION_WINDOW_MS = 30_000;
            const msRemaining = auction.end_time!.getTime() - Date.now();
            if (msRemaining < EXTENSION_WINDOW_MS) {

                auction.end_time = new Date(Date.now() + EXTENSION_WINDOW_MS);
                auction.extension_count += 1;
            }

            await manager.save(auction);
            await manager.insert(
                Bid, {
                auction: { id: auctionId },
                bidder: { id: bidderId },
                amount,
                status: BidStatus.ACCEPTED,
            }
            );

            return { status: 'ACCEPTED' as const, auction };
        });

        if (result.status === 'ACCEPTED') {

            const bidder = await this.userRepository.findOne({
                where: {
                    id: bidderId
                }
            });

            await db.doc(`actions/${auctionId}`).set({
                currentHighestBid: result.auction.current_highest_bid,
                currentHighestBidderName: bidder
                    ? `${bidder.first_name} ${bidder.last_name}`.trim()
                    : 'Anonymous',
                endTime: Timestamp.fromDate(result.auction.end_time!),
                extensionCount: result.auction.extension_count,
            })
        }

        return result;
    }

    async getAuctions(): Promise<Auction[]> {
        return this.auctionRepository.find({
            relations: {
                listing: true,
            },
        });
    }
}
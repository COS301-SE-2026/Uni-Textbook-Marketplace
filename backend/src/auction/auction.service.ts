import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Auction, AuctionStatus } from "../database/entities/auction.entity";
import { Bid, BidStatus } from "../database/entities/bid.entity";
import { Job, Queue } from "bullmq";
import { DataSource, In, Repository } from "typeorm";
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

        @InjectRepository(Bid)
        private readonly bidRepository: Repository<Bid>,

        @InjectRepository(Listing)
        private readonly listingRepo: Repository<Listing>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectQueue('auction')
        private readonly auctionQueue: Queue,

        private readonly dataSource: DataSource,
    ) { }

    async createAuction(dto: CreateAuctionDto,userId: string): Promise<{ message: string }> {

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

        if (listing.listing_status === 'SOLD') {
            throw new BadRequestException('Sold listings cannot be auctioned');
        }

        if (listing.listing_status === 'RESERVED') {
            throw new BadRequestException('Reserved listings cannot be auctioned');
        }

        const existingAuction = await this.auctionRepository.findOne({
            where: {
                listing_id: listing.id,
                status: In([AuctionStatus.ACTIVE, AuctionStatus.SCHEDULED]),
            },
        });

        if (existingAuction) {
            throw new BadRequestException('This listing already has an active or scheduled auction');
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

        let closeJob: Job | undefined;
        try {
            closeJob = await this.auctionQueue.add('close-auction', {
                auctionId: savedAuction.id,
            }, {
                delay: endTime.getTime() - Date.now(),
            });

            if (!isImmediate) {
                await this.auctionQueue.add('activate-auction', {
                    auctionId: savedAuction.id,
                }, {
                    delay: savedAuction.start_time!.getTime() - Date.now(),
                });
            }
        } catch (error) {
            console.error('Failed to schedule auction jobs', error);
            await closeJob?.remove();
            await this.auctionRepository.remove(savedAuction);
            throw new InternalServerErrorException('Auction could not be scheduled');
        }

        await db.doc(`actions/${savedAuction.id}`).set({
            status: savedAuction.status,
            currentHighestBid: null,
            startTime: Timestamp.fromDate(savedAuction.start_time!),
            endTime: Timestamp.fromDate(savedAuction.end_time!),
            extensionCount: 0,
        });

        return { message: 'Auction created successfully' };

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

    async getAuctions(): Promise<Array<Auction & { bidCount: number }>> {
        const auctions = await this.auctionRepository.find({
            relations: {
                listing: {
                    book: true,
                    module: {
                        faculty: true,
                        university: true,
                    },
                    seller: true,
                },
            },
        });

        if (auctions.length === 0) return [];

        const counts = await this.bidRepository
            .createQueryBuilder('bid')
            .select('bid.auction_id', 'auctionId')
            .addSelect('COUNT(bid.id)', 'count')
            .where('bid.auction_id IN (:...auctionIds)', {
                auctionIds: auctions.map((auction) => auction.id),
            })
            .groupBy('bid.auction_id')
            .getRawMany<{ auctionId: string; count: string }>();

        const countByAuctionId = new Map(
            counts.map((row) => [row.auctionId, Number(row.count)]),
        );

        return auctions.map((auction) => ({
            ...auction,
            bidCount: countByAuctionId.get(auction.id) ?? 0,
        }));
    }

    async getAuctionForListing(listingId: string): Promise<Auction | null> {
        return this.auctionRepository.findOne({
            where: {
                listing_id: listingId,
                status: In([AuctionStatus.ACTIVE, AuctionStatus.SCHEDULED]),
            },
            relations: {
                listing: {
                    book: true,
                    module: {
                        faculty: true,
                        university: true,
                    },
                    seller: true,
                },
            },
        });
    }

    async getBidHistory(auctionId: string, page = 1, limit = 20) {
        const validPage = Math.max(1, page);
        const validLimit = Math.min(100, Math.max(1, limit));
        const [data, total] = await this.bidRepository.findAndCount({
            where: {
                auction: { id: auctionId}
            },
            relations: {
                bidder: true,
            },
            order: {
                placed_at: 'DESC',
            },
            skip: (validPage - 1) * validLimit,
            take: validLimit,
        });

        return {
            data,
            meta: {
                total,
                page: validPage,
                limit: validLimit,
                totalPages: Math.ceil(total / validLimit),
            },
        };
    }

    async getAuction(id: string){

        const auction = await this.auctionRepository.findOne({
            where: { id},
            relations: {
                listing: {
                    book: true,
                    module: {
                        faculty: true,
                    },
                    seller: true,
                },
                seller: true,
                current_highest_bidder: true
            }
        });

        if(!auction) throw new NotFoundException('auction not found');

        return auction;
    }
}
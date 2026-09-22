import { Processor, WorkerHost, InjectQueue } from "@nestjs/bullmq";
import { InjectRepository } from "@nestjs/typeorm";
import { Job, Queue } from "bullmq";
import { Auction, AuctionStatus } from "src/database/entities/auction.entity";
import { Repository } from "typeorm";
import { Listing, ListingsStatus } from "../database/entities/listing.entity";


@Processor('auction')
export class AuctionProcessor extends WorkerHost {

    constructor(
        @InjectRepository(Auction)
        private readonly auctiondb: Repository<Auction>,

        @InjectQueue('auction')
        private readonly auctionQueue: Queue,

        @InjectRepository(Listing)
        private readonly listingdb: Repository<Listing>,
    ) { super(); }

    async process(job: Job): Promise<any> {

        if (job.name === 'active-auction') {
            await this.handleActivateAuction(job.data.auctionId);
        }

        if (job.name === 'close-auction') {
            await this.handleCloseAuction(job.data.auctionId);
        }
    }

    private async handleActivateAuction(auctionId: string) {

        const auction = await this.auctiondb.findOne({
            where: {
                id: auctionId
            }
        });

        if (auction && auction.status === AuctionStatus.SCHEDULED) {
            auction.status = AuctionStatus.ACTIVE;
            await this.auctiondb.save(auction);
        }
    }

    private async handleCloseAuction(auctionId: string) {

        const auction = await this.auctiondb.findOne({
            where: {
                id: auctionId
            },
            relations: { listing: true},
        });

        if (!auction || auction.status !== AuctionStatus.ACTIVE) {
            return;
        }

        if (Date.now() < auction.end_time!.getTime()) {

            await this.auctionQueue.add(
                'close-auction',
                { auctionId },
                { delay: auction.end_time!.getTime() - Date.now() },
            );
            return;
        }

        const reserveMet = auction.current_highest_bid != null && auction.current_highest_bid >= (auction.reserve_price ?? auction.starting_price);

        if (reserveMet) {

            auction.status = AuctionStatus.ENDED;
            await this.auctiondb.save(auction);

        

            if (auction.listing) {

                auction.listing.listing_status = ListingsStatus.RESERVED;
                await this.listingdb.save(auction.listing); 
            }

            //wire notification for seller and winner
        } else {

            auction.status = AuctionStatus.ENDED;
            await this.auctiondb.save(auction);

            // const reason = auction.current_highest_bid == null 
            //     ? "No bids recived" : "Reserve not met"

            //notify seller
        }
    }
}
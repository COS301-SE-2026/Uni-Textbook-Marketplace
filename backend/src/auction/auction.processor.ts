import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue } from 'bullmq';
import { Auction, AuctionStatus } from 'src/database/entities/auction.entity';
import { Repository } from 'typeorm';
import { Listing, ListingsStatus } from '../database/entities/listing.entity';
import { db } from '../firebase/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NotificationsService } from '../notifications/notifications.service';

type AuctionJobData = {
  auctionId: string;
};

@Processor('auction')
export class AuctionProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Auction)
    private readonly auctiondb: Repository<Auction>,

    @InjectQueue('auction')
    private readonly auctionQueue: Queue,

    @InjectRepository(Listing)
    private readonly listingdb: Repository<Listing>,

    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job<AuctionJobData>): Promise<any> {
    if (job.name === 'activate-auction') {
      await this.handleActivateAuction(job.data.auctionId);
    }

    if (job.name === 'close-auction') {
      await this.handleCloseAuction(job.data.auctionId);
    }
  }

  private async handleActivateAuction(auctionId: string) {
    const auction = await this.auctiondb.findOne({
      where: {
        id: auctionId,
      },
    });

    if (auction?.status === AuctionStatus.SCHEDULED) {
      auction.status = AuctionStatus.ACTIVE;
      await this.auctiondb.save(auction);
      await db.doc(`actions/${auctionId}`).set(
        {
          status: AuctionStatus.ACTIVE,
          startTime: Timestamp.fromDate(auction.start_time!),
          endTime: Timestamp.fromDate(auction.end_time!),
        },
        { merge: true },
      );
    }
  }

  private async handleCloseAuction(auctionId: string) {
    const auction = await this.auctiondb.findOne({
      where: {
        id: auctionId,
      },
      relations: { listing: { seller: true } },
    });

    if (auction?.status !== AuctionStatus.ACTIVE) {
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

    const reserveMet =
      auction.current_highest_bid != null &&
      auction.current_highest_bid >=
        (auction.reserve_price ?? auction.starting_price);
    let outcome: 'SOLD' | 'RESERVE_NOT_MET' | 'NO_BIDS';
    if (reserveMet) {
      outcome = 'SOLD';
    } else if (auction.current_highest_bid == null) {
      outcome = 'NO_BIDS';
    } else {
      outcome = 'RESERVE_NOT_MET';
    }

    if (reserveMet) {
      auction.status = AuctionStatus.ENDED;
      await this.auctiondb.save(auction);

      if (auction.listing) {
        auction.listing.listing_status = ListingsStatus.RESERVED;
        await this.listingdb.save(auction.listing);
      }

      await db.doc(`actions/${auctionId}`).set(
        {
          status: AuctionStatus.ENDED,
          outcome: 'SOLD',
          winnerId: auction.current_highest_bidder_id,
          endedAt: Timestamp.now(),
        },
        { merge: true },
      );
    } else {
      auction.status = AuctionStatus.ENDED;
      await this.auctiondb.save(auction);

      await db.doc(`actions/${auctionId}`).set(
        {
          status: AuctionStatus.ENDED,
          outcome:
            auction.current_highest_bid == null ? 'NO_BIDS' : 'RESERVE_NOT_MET',
          winnerId: null,
          endedAt: Timestamp.now(),
        },
        { merge: true },
      );
    }

    await this.notificationsService.notifyAuctionEnded({
      sellerId: auction.seller_id ?? auction.listing?.seller?.id ?? null,
      bidderId: auction.current_highest_bidder_id,
      listingId: auction.listing?.id ?? auction.listing_id,
      listingTitle: auction.listing?.title ?? 'your textbook listing',
      outcome,
      finalBid: auction.current_highest_bid,
    });
  }
}

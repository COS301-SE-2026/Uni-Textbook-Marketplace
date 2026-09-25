import ListingCard, { type Listing } from '@/components/listings/listingCard'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import { Button } from '@/components/ui'

interface AuctionCardProps {
    readonly auctionId: string
    readonly listing: Listing
    readonly startingPrice: number
    readonly currentBid: number
    readonly startTime: string | null
    readonly endsAt: string
    readonly status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'
    readonly bidCount?: number
}

function getStatusPresentation(status: AuctionCardProps['status']) {
    switch (status) {
        case 'ACTIVE':
            return { badgeVariant: 'active' as const, label: 'In progress', action: 'Place bid' }
        case 'SCHEDULED':
            return { badgeVariant: 'pending' as const, label: 'Scheduled', action: 'View auction' }
        default:
            return { badgeVariant: 'sold' as const, label: 'Ended', action: 'View auction' }
    }
}

export default function AuctionCard({
    auctionId,
    listing,
    startingPrice,
    currentBid,
    startTime,
    endsAt,
    status,
    bidCount = 0,
}: AuctionCardProps) {
    const router = useRouter()
    const formatDate = (value: string | null) => {
        if (!value) return 'Not available'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return 'Not available'
        return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    }
    const statusPresentation = getStatusPresentation(status)
    const hasBids = bidCount > 0

    return (
        <article className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] gap-4 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <ListingCard listing={listing} horizontal />

            <aside className="flex flex-col justify-center gap-4 border-t border-gray-200 px-2 py-3 lg:border-l lg:border-t-0 lg:pl-5 dark:border-gray-700">
                <div className="flex items-center justify-between gap-3">
                    <Badge variant={statusPresentation.badgeVariant}>
                        {statusPresentation.label}
                    </Badge>
                </div>
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{hasBids ? 'Current bid' : 'Starting bid'}</p>
                    <p className="text-2xl font-bold text-[#000f2b] dark:text-white">R{(hasBids ? currentBid : startingPrice).toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-500">Bids</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{bidCount}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Starts</p>
                        <time dateTime={startTime || undefined} className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(startTime)}
                        </time>
                    </div>
                </div>
                <div>
                    <p className="text-gray-500">Ends</p>
                    <time dateTime={endsAt} className="font-semibold text-gray-900 dark:text-white">{formatDate(endsAt)}</time>
                </div>

                <Button
                    variant="primary"
                    className="w-full"
                    onClick={(event) => {
                        event.stopPropagation()
                        router.push(`/auction/bid?auctionId=${auctionId}`)
                    }}
                >
                    {statusPresentation.action}
                </Button>
            </aside>
        </article>
    )
}


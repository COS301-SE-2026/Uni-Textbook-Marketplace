import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import type { Listing } from '@/components/listings/listingCard'
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
            return { badgeVariant: 'active' as const, label: 'In progress', action: 'Bid now' }
        case 'SCHEDULED':
            return { badgeVariant: 'pending' as const, label: 'Scheduled', action: 'View auction' }
        default:
            return { badgeVariant: 'sold' as const, label: 'Ended', action: 'View auction' }
    }
}

function ordinalSuffix(value: number) {
    const remainder100 = value % 100
    if (remainder100 >= 11 && remainder100 <= 13) return `${value}th`

    switch (value % 10) {
        case 1: return `${value}st`
        case 2: return `${value}nd`
        case 3: return `${value}rd`
        default: return `${value}th`
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
    const rawImage = listing.photo_urls?.[0]
    const image = rawImage?.startsWith('http')
        ? rawImage
        : rawImage?.startsWith('./')
            ? rawImage.replace('./', '/')
            : rawImage ?? '/images/placeholder.png'

    return (
        <article className="group grid grid-cols-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00B4D8]/50 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.7fr)]">
            <div className="relative min-h-56 overflow-hidden bg-gray-100 md:min-h-full dark:bg-gray-800">
                <Image
                    src={image}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                    <Badge variant={listing.condition}>{listing.condition}</Badge>
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={statusPresentation.badgeVariant}>
                        {statusPresentation.label}
                    </Badge>
                    <span className="text-sm text-gray-500">{listing.module?.code}</span>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-[#1a1a2e] dark:text-white">{listing.title}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {listing.book?.edition ? `${ordinalSuffix(listing.book.edition)} edition` : 'Edition not specified'}
                        {listing.module?.code ? ` · ${listing.module.code}` : ''}
                    </p>
                    {listing.book?.author && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{listing.book.author}</p>}
                    {listing.seller && (
                        <p className="mt-2 text-xs text-gray-500">
                            {listing.seller.first_name} {listing.seller.last_name}
                            {listing.seller.is_verified && <span className="ml-1 font-medium text-[#006D8A]">· Verified</span>}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-700 sm:grid-cols-4">
                    <div>
                        <p className="text-xs text-gray-500">{hasBids ? 'Current bid' : 'Starting bid'}</p>
                        <p className="mt-1 font-semibold text-[#000f2b] dark:text-white">R{(hasBids ? currentBid : startingPrice).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Bids</p>
                        <p className="mt-1 font-semibold text-[#000f2b] dark:text-white">{bidCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Starts</p>
                        <time dateTime={startTime || undefined} className="mt-1 block font-semibold text-[#000f2b] dark:text-white">{formatDate(startTime)}</time>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Ends</p>
                        <time dateTime={endsAt} className="mt-1 block font-semibold text-[#000f2b] dark:text-white">{formatDate(endsAt)}</time>
                    </div>
                </div>

                <div className="mt-auto flex flex-wrap justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/listings/${listing.id}`)}
                    >
                        View listing
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => router.push(`/auction/bid?auctionId=${auctionId}`)}
                    >
                        {statusPresentation.action}
                    </Button>
                </div>
            </div>
        </article>
    )
}


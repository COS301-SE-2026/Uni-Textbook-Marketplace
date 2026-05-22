'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'

export type ListingStatus =
  | 'APPROVED'| 'PENDING'| 'REJECTED'| 'SOFT_DELETED'

export interface Listing {
    id: string
    title: string
    price: number
    condition: 'new' | 'good' | 'fair' | 'poor'
    annotation_level: 'none' | 'light' | 'heavy'
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SOFT_DELETED'

    photo_urls: string[]
    created_at: string

    book: {
        edition: number
        author: string
        isbn: string
        title: string
    }

    module: {
        code: string
        faculty?: string
    }

    seller?: {
        first_name: string
        last_name: string
        is_verified: boolean
    }
}

interface ListingCardProps {
    listing: Listing
    showStatus?: boolean
}

const CONDITION_LABEL: Record<Listing['condition'], string> = {
    new: 'New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
}

export default function ListingCard({
    listing,
    showStatus = false,
    }: ListingCardProps) {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/listings/${listing.id}`)
    }

    const raw = listing.photo_urls?.[0]

    const image =
    raw?.startsWith('http')
        ? raw
        : raw?.startsWith('./')
        ? raw.replace('./', '/')
        : raw ?? '/images/placeholder.png'

    return (
        <div
        onClick={handleClick}
        className="card cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
        >
        {/* Image */}
        <div className="relative w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            {image ? (
            <Image
                src={image}
                alt={listing.title}
                fill
                className="object-cover"
            />
            ) : (
            <svg
                className="w-16 h-16 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16
                    16m-2-2l1.586-1.586a2 2 0 012.828
                    0L20 14m-6-6h.01M6 20h12a2 2 0
                    002-2V6a2 2 0 00-2-2H6a2 2 0
                    00-2 2v12a2 2 0 002 2z"
                />
            </svg>
            )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm line-clamp-2">
            {listing.title}
            </p>

            <p className="text-xs text-gray-500">
            {listing.book?.edition} Edition • {listing.module?.code}
            </p>
        </div>

        {/* Price + condition */}
        <div className="flex items-center justify-between mt-auto">
            <span className="font-bold text-base">
            R{parseFloat(String(listing.price)).toFixed(2)}
            </span>

            <span className="text-xs text-gray-500">
            {CONDITION_LABEL[listing.condition]}
            </span>
        </div>

        {/* Seller badge */}
        {listing.seller && (
        <div className="text-xs text-green-600 font-medium">
            {listing.seller.first_name} {listing.seller.last_name}
            {listing.seller.is_verified && ' • Verified'}
        </div>
        )}

        {/* Status badge */}
        {showStatus && listing.status !== 'APPROVED' && (
            <div className="absolute top-2 left-2">
            {listing.status === 'PENDING' && (
                <Badge variant="pending">Pending</Badge>
            )}
            {listing.status === 'REJECTED' && (
                <Badge variant="rejected">Rejected</Badge>
            )}
            </div>
        )}
        </div>
    )
}
'use client'

import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'

export type ListingStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

export interface Listing {
    id: string
    title: string
    edition: string
    author: string
    price: number
    condition: 'LIKE_NEW' | 'GOOD' | 'ACCEPTABLE'
    annotationLevel: 'NONE' | 'LIGHT' | 'HEAVY'
    moduleCode: string
    faculty: string
    isbn: string
    description: string
    images: string[]
    status: ListingStatus
    createdAt: string
    seller?: {
        name: string
        verified: boolean
        rating: number
        reviewCount: number
        memberSince: string
        meetupPreference: string
    }
}

interface ListingCardProps {
    listing: Listing
    showStatus?: boolean   
}

const CONDITION_LABEL: Record<Listing['condition'], string> = {
    LIKE_NEW:   'Like New',
    GOOD:       'Good',
    ACCEPTABLE: 'Acceptable',
}

export default function ListingCard({
    listing,
    showStatus = false,
}: ListingCardProps) {

    const router = useRouter()

    const handleClick = () => {
        router.push(`/listings/${listing.id}`)
    }

    return (
        <div
            onClick={handleClick}
            className="card cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col gap-3"
        >
            {/* Image placeholder / actual image */}
            <div className="relative w-full h-40 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {listing.images?.[0] ? (
                    <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    /* Generic image placeholder SVG */
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

                {/* Pending badge overlay */}
                {showStatus && listing.status === 'PENDING' && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="pending"><span>Pending Review</span></Badge>
                    </div>
                )}

                {showStatus && listing.status === 'REJECTED' && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="rejected"><span>Rejected</span></Badge>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1">
                <p className="font-semibold text-sm leading-tight line-clamp-2">
                    {listing.title}
                </p>
                <p className="text-xs text-gray-500">
                    {listing.edition} Edition
                </p>
            </div>

            {/* Price + condition */}
            <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-base">
                    R{listing.price}
                </span>
                <span className="text-xs text-gray-500">
                    Condition: {CONDITION_LABEL[listing.condition]}
                </span>
            </div>
        </div>
    )
}

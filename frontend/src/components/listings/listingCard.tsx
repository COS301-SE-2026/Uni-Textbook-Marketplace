'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Heartbutton from '../icons/Heartbutton'
import { save, remove } from '@/lib/wishlist.api'

export type ListingStatus =
    | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SOFT_DELETED'

export interface Listing {
    id: string
    title: string
    price: number
    condition: 'new' | 'good' | 'fair' | 'poor'
    annotation_level: 'none' | 'light' | 'heavy'
    status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SOFT_DELETED'
    listing_status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'

    photo_urls: string[]
    created_at: string
    description: string

    book: {
        edition: number
        author: string
        isbn: string
        title: string
        publisher: string
    }

    module: {
        name: string
        code: string
        semester: number
        faculty?: {
            name: string
        }

    }

    seller?: {
        first_name: string
        last_name: string
        is_verified: boolean
        university: {
            name: string
        }
    }
}

interface ListingCardProps {
    readonly listing: Listing
    readonly showStatus?: boolean
    readonly isLiked?: boolean
    readonly removeClick?: boolean
}

const CONDITION_LABEL: Record<Listing['condition'], string> = {
    new: 'New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
}

// Condition badge variant mapping
const CONDITION_VARIANT: Record<Listing['condition'], 'new' | 'good' | 'fair' | 'poor'> = {
    new: 'new',
    good: 'good',
    fair: 'fair',
    poor: 'poor',
}

export default function ListingCard({
    listing,
    showStatus = false,

    isLiked: initialIsliked = false,
    removeClick = false,
}: ListingCardProps) {
    const router = useRouter()

    const [isLiked, setIsLiked] = useState(initialIsliked)

    const handleClick = () => {
        if (removeClick) return
        router.push(`/listings/${listing.id}`)
    }

    const handleLike = async (liked: boolean) => {
        setIsLiked(liked)

        try {
            if (liked) {
                await save(listing.id)
            } else {
                await remove(listing.id)
            }
           
            window.dispatchEvent(new CustomEvent('wishlist:changed'))
            
        } catch (error) {
            console.error('Failed to update wishlist', error)
            setIsLiked(!liked)
        }
    }

    const raw = listing.photo_urls?.[0]

    const image =
        raw?.startsWith('http')
            ? raw
            : raw?.startsWith('./')
                ? raw.replace('./', '/')
                : raw ?? '/images/placeholder.png'

    const conditionVariant = CONDITION_VARIANT[listing.condition]

    return (
        <div
            onClick={handleClick}
            className={`group card hover:shadow-xl transition-all duration-300 flex flex-col gap-2 relative overflow-hidden ${
                !removeClick ? 'cursor-pointer' : ''
            }`}
            style={{
                height: '420px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
        >
            
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            }} />

            
            <div className="relative w-full h-[240px] bg-gray-100 overflow-hidden flex items-center justify-center">
                {image ? (
                    <Image
                        src={image}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
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

                
                <div className="absolute bottom-0 left-0 right-0 h-12" style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
                }} />

                
                <div className="absolute top-2 right-2">
                    <Badge variant={conditionVariant}>
                        {CONDITION_LABEL[listing.condition]}
                    </Badge>
                </div>

                
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

                
                {listing.status === 'APPROVED' && (listing.listing_status === 'RESERVED' || listing.listing_status === 'SOLD') && (
                    <div className="absolute top-2 left-2">
                        <Badge variant={listing.listing_status === 'RESERVED' ? 'reserved' : 'sold'}>
                            {listing.listing_status === 'RESERVED' ? 'Reserved' : 'Sold'}
                        </Badge>


                    </div>
                )}
            </div>

            
            <div className="flex flex-col gap-1 px-3 pb-3 flex-1">
                
                <p className="font-semibold text-sm line-clamp-1 text-[#1a1a2e] dark:text-white">
                    {listing.title}
                </p>



                
                <p className="text-xs text-gray-500">
                    {listing.book?.edition} Edition • {listing.module?.code}
                </p>

                
                {listing.book?.author && (
                    <p className="text-xs text-gray-400 truncate">
                        {listing.book.author}
                    </p>
                )}

                
                <div className="flex items-center justify-between mt-auto pt-1">

                    <span className="font-bold text-lg text-[#000f2b] dark:text-white">
                        R{parseFloat(String(listing.price)).toFixed(2)}
                    </span>

                    <Heartbutton liked={isLiked} onClick={handleLike} />


                </div>

                {/* Seller badge */}
                {listing.seller && (
                    <div className="flex items-center gap-1 text-xs">


                        <span className="text-gray-500">

                            {listing.seller.first_name} {listing.seller.last_name}
                        </span>
                        
                        {listing.seller.is_verified && (
                            <span className="text-[#00B4D8] font-medium">• Verified ✓</span>
                        )}
                    </div>

                )}
            </div>

            
            <div className="absolute inset-0 pointer-events-none rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                boxShadow: 'inset 0 0 0 2px rgba(0,180,216,0.3)',
            }} />
        </div>
    )
}

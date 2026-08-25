'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Heartbutton from '../icons/Heartbutton'
import { save, remove } from '@/lib/wishlist.api'
import { createReport } from '@/lib/reports.api'
import { Button } from '@/components/ui/Button'


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
    listing: Listing
    showStatus?: boolean
    isLiked?: boolean
    removeClick?: boolean
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
    isLiked: initialIsliked = false,
    removeClick = false,
}: ListingCardProps) {
    const router = useRouter()
    const [isLiked, setIsLiked] = useState(initialIsliked)
    /* const [prevInitialIsliked, setPrevInitialIsliked] = useState(initialIsliked)

    if (prevInitialIsliked !== initialIsliked){
        setPrevInitialIsliked(initialIsliked)
        setIsLiked(initialIsliked)
    } */

    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [isReporting, setIsReporting] = useState(false)

    const reportReasons = [
        'Fraud',
        'Misleading information',
        'Duplicate listing',
        'Other',
    ]

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


    const handleReport = async () => {
        if (!reportReason) {
            return
        }

        setIsReporting(true)

        try {
            await createReport({
                listing_id: listing.id,
                reason: reportReason,
            })

            alert('Report submitted successfully')

            setShowReportModal(false)
            setReportReason('')
        } catch (error) {
            console.error('Failed to report listing', error)
            alert('Failed to submit report')
        } finally {
            setIsReporting(false)
        }
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
            className={`card hover:shadow-md transition-shadow duration-200 flex flex-col gap-3 relative ${!removeClick ? 'cursor-pointer' : ''
                }`}
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

            {/* Price + like button */}
            <div className="flex items-center justify-between mt-auto">
                <span className="font-bold text-base">
                    R{parseFloat(String(listing.price)).toFixed(2)}
                </span>

                <Heartbutton liked={isLiked} onClick={handleLike} />

            </div>

            {/* Seller badge */}
            {listing.seller && (
                <div className="text-xs text-green-600 font-medium">
                    {listing.seller.first_name} {listing.seller.last_name}
                    {listing.seller.is_verified && ' • Verified'}
                </div>
            )}

            {/* condition */}
            <div className="absolute right-0 top-0">
                <Badge variant='approved'>
                    {CONDITION_LABEL[listing.condition]}
                </Badge>
            </div>

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

            <Button
                type="button"
                variant="danger"
                onClick={(e) => {
                    e.stopPropagation()
                    setShowReportModal(true)
                }}
            >
                Report
            </Button>

            {showReportModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h2 className="text-lg font-semibold mb-2">
                        Report Listing
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                        Why are you reporting this listing?
                    </p>

                    <div className="flex flex-col gap-2">
                        {reportReasons.map((reason) => (
                            <label
                                key={reason}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name={`report-reason-${listing.id}`}
                                    value={reason}
                                    checked={reportReason === reason}
                                    onChange={(e) =>
                                        setReportReason(e.target.value)
                                    }
                                />

                                <span className="text-sm">
                                    {reason}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            onClick={() => {
                                setShowReportModal(false)
                                setReportReason('')
                            }}
                            disabled={isReporting}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleReport}
                            disabled={!reportReason || isReporting}
                        >
                            {isReporting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </div>
            </div>
        )}
        </div>
    )

}
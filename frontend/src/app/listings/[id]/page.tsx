'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Listing } from '@/components/listings/listingCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

// Helpers

const CONDITION_LABEL: Record<string, string> = {
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    ACCEPTABLE: 'Acceptable',
}

const ANNOTATION_LABEL: Record<string, string> = {
    NONE: 'None',
    LIGHT: 'Light',
    HEAVY: 'Heavy',
}

const FACULTY_LABEL: Record<string, string> = {
    ENG: 'Engineering',
    EBIT: 'EBIT',
    LAW: 'Law',
    HUM: 'Humanities',
    MED: 'Health Sciences',
    NAT: 'Natural & Agricultural Sciences',
    ECO: 'Economic & Management Sciences',
    EDU: 'Education',
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86_400_000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    const weeks = Math.floor(days / 7)
    if (weeks === 1) return '1 week ago'
    return `${weeks} weeks ago`
}

//Page 

export default function ListingDetailPage() {

    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [listing, setListing] = useState<Listing | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(0)
    const [showMessageModal, setShowMessageModal] = useState(false)
    const [message, setMessage] = useState('')
    const [messageSent, setMessageSent] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Fetch listing

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await fetch(`/api/listings/${id}`)
                if (!res.ok) throw new Error('Not found')
                const data = await res.json()
                setListing(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    // Actions 

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch(`/api/listings/${id}/save`, { method: 'POST' })
            setSaved(true)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleSendMessage = async () => {
        if (!message.trim()) return
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listingId: id, content: message }),
            })
            setMessageSent(true)
            setMessage('')
        } catch (err) {
            console.error(err)
        }
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: listing?.title,
                url: window.location.href,
            })
        } catch {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    // Loading 

    if (loading) {
        return (
            <div className="container-content py-8">
                <div className="animate-pulse flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-72 h-72 bg-gray-200 rounded-lg" />
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="h-6 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="h-8 bg-gray-200 rounded w-1/4 mt-4" />
                    </div>
                </div>
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="container-content py-8">
                <p className="text-gray-500">Listing not found.</p>
                <button
                    onClick={() => router.push('/listings')}
                    className="btn-secondary mt-4"
                >
                    Back to listings
                </button>
            </div>
        )
    }

    const seller = listing.seller

    return (
        <div className="container-content py-8">

            {/* Back */}
            <Button
                variant='secondary'
                onClick={() => router.back()}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6"
            >
                ← Back to results
            </Button>

            <div className="flex flex-col lg:flex-row gap-8">

                <div className="flex-1">

                    {/* Main image */}
                    <div className="relative w-full aspect-square max-w-sm bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {listing.images?.[activeImage] ? (
                            <Image
                                src={listing.images[activeImage]}
                                alt={listing.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            />
                        ) : (
                            <svg
                                className="w-24 h-24 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16
                                       16m-2-2l1.586-1.586a2 2 0 012.828 0L20
                                       14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2
                                       0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {listing.images?.length > 1 && (
                        <div className="flex gap-2">
                            {listing.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative w-14 h-14 rounded border-2 overflow-hidden ${activeImage === i
                                            ? 'border-blue-600'
                                            : 'border-transparent'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="mt-6">
                        <h4 className="font-semibold mb-1">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                </div>

                {/*Centre: book info*/}
                <div className="flex-1">

                    <h2 className="text-xl font-bold leading-snug">
                        {listing.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {listing.edition} Edition
                    </p>
                    <p className="text-gray-700 text-sm mt-1">
                        {listing.author}
                    </p>

                    <p className="text-2xl font-bold mt-4">
                        R {listing.price}
                    </p>

                    {/* Details table */}
                    <table className="mt-6 w-full text-sm">
                        <tbody>
                            {[
                                ['Condition', CONDITION_LABEL[listing.condition] ?? listing.condition],
                                ['Annotations', ANNOTATION_LABEL[listing.annotationLevel] ?? listing.annotationLevel],
                                ['Module Code', listing.moduleCode],
                                ['Faculty', FACULTY_LABEL[listing.faculty] ?? listing.faculty],
                                ['ISBN', listing.isbn],
                                ['Listed', timeAgo(listing.createdAt)],
                            ].map(([label, value]) => (
                                <tr key={label} className="border-b border-gray-100">
                                    <td className="py-2 text-gray-500 w-32">
                                        {label}
                                    </td>
                                    <td className="py-2 font-medium">
                                        {value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* CTA buttons */}
                    <div className="flex gap-3 mt-8 flex-wrap">
                        <button
                            onClick={() => setShowMessageModal(true)}
                            className="btn-primary"
                        >
                            MESSAGE SELLER
                        </button>
                        <Button
                            variant='secondary'
                            onClick={handleSave}
                            disabled={saving || saved}

                        >
                            {saved ? '✓ SAVED' : saving ? 'Saving...' : 'SAVE LISTING'}
                        </Button>
                        <Button
                            onClick={handleShare}
                            variant='secondary'
                        >
                            SHARE
                        </Button>
                    </div>

                </div>

                {seller && (
                    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">

                        {/* Seller info */}
                        <div className="card">
                            <h4 className="font-semibold mb-3">
                                Seller Information
                            </h4>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                    {seller.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {seller.name}
                                    </p>
                                    {seller.verified && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            ✓ Verified Student
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mb-1">
                                Member since {seller.memberSince}
                            </p>

                            <div className="flex items-center gap-1 text-sm">
                                <span className="text-yellow-400">★</span>
                                <span className="font-medium">
                                    {seller.rating.toFixed(1)}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    ({seller.reviewCount} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Meetup preferences */}
                        <div className="card">
                            <h4 className="font-semibold mb-2 text-sm">
                                Meet up Preferences
                            </h4>
                            <p className="text-sm text-gray-600">
                                {seller.meetupPreference}
                            </p>
                        </div>

                        {/* Safety tip */}
                        <div className="card bg-amber-50 border border-amber-200">
                            <h4 className="font-semibold mb-1 text-sm text-amber-800">
                                Stay Safe
                            </h4>
                            <p className="text-xs text-amber-700">
                                Keep all conversations inside the app. Do not share
                                personal details with sellers.
                            </p>
                        </div>

                    </aside>
                )}

            </div>

            <Modal
                isOpen={showMessageModal}
                onClose={() => {
                    setShowMessageModal(false)
                    setMessageSent(false)
                }}
                title={`Message ${seller?.name ?? 'Seller'}`}
            >
                {messageSent ? (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-3">✉️</div>
                        <p className="font-semibold">Message sent!</p>
                        <p className="text-sm text-gray-500 mt-1">
                            You will receive a reply in your messages.
                        </p>
                        <button
                            onClick={() => {
                                setShowMessageModal(false)
                                setMessageSent(false)
                            }}
                            className="btn-primary mt-4"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600">
                            Enquiring about: <strong>{listing.title}</strong>
                        </p>
                        <textarea
                            className="w-full border border-gray-300 rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Hi, is this book still available?"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                        <Button onClick={handleSendMessage} disabled={!message.trim()}>
                            Send Message
                        </Button>
                    </div>
                )}
            </Modal>

        </div>
    )
}
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Listing } from '@/components/listings/listingCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui'
import { normalizeImage } from '@/lib/image'
import BASE_URL from '@/lib/api';
import AccordionSection from '@/components/ui/AccordionSection'


const CONDITION_LABEL: Record<string, string> = {
    'new': 'Like New',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
}

const ANNOTATION_LABEL: Record<string, string> = {
    'none': 'None',
    'light': 'Light',
    'heavy': 'Heavy',
}

const LISTING_LABEL: Record<string, string> = {
    'AVAILABLE': 'Available',
    'RESERVED': 'Reserved',
    'SOLD': 'Sold',
    'WITHDRAWN': 'Available'
}

const SECTIONS = [
    { key: "bookDetails", title: "Book Details" },
    { key: "moduleDetails", title: "Module Details" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];
type OpenSection = Record<SectionKey, boolean>;


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
    const [openSections, setOpenSection] = useState<OpenSection>({
        bookDetails: false,
        moduleDetails: false,
    })

    // Fetch listing

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${BASE_URL}/listings/${id}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                })
                if (!res.ok) throw new Error('Not found')
                const data = await res.json()
                setListing(data)
            } catch (err) {
                console.error('Error fetching listing:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    function onselect(section: SectionKey) {
        setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }))
    }

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
                <Button
                    onClick={() => router.push('/listings')}
                    className="btn-secondary mt-4"
                    variant='secondary'
                >
                    Back to listings
                </Button>
            </div>
        )
    }

    return (
        <div className="container-content py-8">

            <Button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6 group"
                variant='secondary'
            >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span>
                Back 
            </Button>

            <div className="flex flex-col lg:flex-row gap-8">

                <div className="flex-1">

                    <div className="relative w-full aspect-square max-w-sm bg-gray-100 rounded-lg overflow-hidden mb-3">
                        {listing.photo_urls.length > 0 ? (
                            <Image
                                src={normalizeImage(listing.photo_urls[activeImage] || listing.photo_urls[0])}
                                alt={listing.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16
                                        16m-2-2l1.586-1.586a2 2 0 012.828 0L20
                                        14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2
                                        0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {listing.photo_urls.length > 1 && (
                        <div className="flex gap-2">
                            {listing.photo_urls.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative w-14 h-14 rounded border-2 overflow-hidden ${activeImage === i
                                        ? 'border-blue-600'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <Image
                                        src={normalizeImage(img)}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                <div className="flex-1">

                    <h2 className="text-xl font-bold leading-snug">
                        {listing.title}
                    </h2>

                    <p className="text-2xl font-bold mt-4">
                        R {Number(listing.price).toFixed(2)}
                    </p>

                    <div className="mt-6">
                        <h5 className="font-semibold mb-1">Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                    <table className="mt-6 w-full text-sm">
                        <tbody>
                            {[
                                ['Condition', CONDITION_LABEL[listing.condition]],
                                ['Annotations', ANNOTATION_LABEL[listing.annotation_level]],
                                ['Listing status', <Badge key="listing-status" variant='approved'>{LISTING_LABEL[listing.listing_status]}</Badge>],
                                ['Listed', timeAgo(listing.created_at)],
                            ].map(([label, value], index) => (
                                <tr key={`detail-row-${index}`} className="border-b border-gray-100">
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

                    {SECTIONS.map(({ key, title }) => (

                        <AccordionSection
                            key={key}
                            title={title}
                            isOpen={openSections[key]}
                            OnToggle={() => onselect(key)}
                        >
                            {key === "bookDetails" && listing && (
                                <table className="mt-2 w-full text-sm">
                                    <tbody>
                                        {[
                                            ['Title', listing.book.title],
                                            ['Edition', listing.book.edition?.toString() ?? 'N/A'],
                                            ['ISBN', listing.book.isbn ?? 'N/A'],
                                            ['Name of Author', listing.book.author ?? 'N/A'],
                                            ['Name of Publisher', listing.book.publiser ?? 'N/A']
                                        ].map(([label, value], index) => (
                                            <tr key={`book-detail-${index}`} className="border-b border-gray-100">
                                                <td className="py-2 text-gray-500 w-32">{label}</td>
                                                <td className="py-2 font-medium">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {key === "moduleDetails" && listing && (
                                <table className="mt-2 w-full text-sm">
                                    <tbody>
                                        {[
                                            ['Name', listing.module.name],
                                            ['Code', listing.module.code],
                                            ['Semester', listing.module.semester?.toString() ?? 'N/A'],
                                        ].map(([label, value], index) => (
                                            <tr key={`module-detail-${index}`} className="border-b border-gray-100">
                                                <td className="py-2 text-gray-500 w-32">{label}</td>
                                                <td className="py-2 font-medium">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </AccordionSection>
                    ))}


                </div>

                <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4">

                    <div className="card">
                        <h4 className="font-semibold mb-3">
                            Seller Information
                        </h4>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                                {listing.seller?.first_name?.[0]}{listing.seller?.last_name?.[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">
                                    {listing.seller?.first_name} {listing.seller?.last_name}
                                </p>

                                {listing.seller?.is_verified && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                        ✓ Verified Student
                                    </span>
                                )}
                            </div>
                        </div>
                        <p>
                            {listing.seller?.university.name}
                        </p>

                    </div>

                    <div className="card">
                        <h4 className="font-semibold mb-1 text-sm">
                            Stay Safe
                        </h4>
                        <p className="text-xs ">
                            Keep all conversations inside the app. Do not share
                            personal details with sellers.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-8 flex-wrap">
                        <Button
                            onClick={() => setShowMessageModal(true)}
                            variant='secondary'
                        >
                            MESSAGE SELLER
                        </Button>
                    </div>
                </aside>
            </div>

            <Modal
                isOpen={showMessageModal}
                onClose={() => {
                    setShowMessageModal(false)
                    setMessageSent(false)
                }}
                title={`Message ${listing.seller?.first_name ?? 'Seller'}`}
            >
                {messageSent ? (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-3">✉️</div>
                        <p className="font-semibold">Message sent!</p>
                        <p className="text-sm text-gray-500 mt-1">
                            You will receive a reply in your messages.
                        </p>
                        <Button
                            onClick={() => {
                                setShowMessageModal(false)
                                setMessageSent(false)
                            }}
                            className="btn-primary mt-4"
                        >
                            Close
                        </Button>
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
                    </div>
                )}
            </Modal>

        </div>
    )
}
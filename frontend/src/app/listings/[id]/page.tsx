'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Listing } from '@/components/listings/listingCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui'
import { normalizeImage } from '@/lib/image'
import api from '@/lib/api';
import AccordionSection from '@/components/ui/AccordionSection'
import { useMessaging } from '@/hooks/useMessaging'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/components/tutorials/tutorial.css'
import { ArrowLeft, Send, AlertTriangle, CheckCircle } from 'lucide-react'


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

const LISTING_STATUS_BADGE_VARIANT: Record<string, 'approved' | 'reserved' | 'sold' | 'pending'> = {
    'AVAILABLE': 'approved',
    'RESERVED': 'reserved',
    'SOLD': 'sold',
    'WITHDRAWN': 'pending',
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
    const [showReportModal, setShowReportModal] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [message, setMessage] = useState('')
    const [messageSent, setMessageSent] = useState(false)
    const [reportSubmitted, setReportSubmitted] = useState(false)
    const [openSections, setOpenSection] = useState<OpenSection>({
        bookDetails: false,
        moduleDetails: false,
    })
    const {startConversation} = useMessaging();

    // Fetch listing

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const data = await api.get<Listing>(`/listings/${id}`);
                setListing(data)
            } catch (err) {
                console.error('Error fetching listing:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchListing()
    }, [id])

    useEffect(() => {

        if(loading || !listing) return;

        if(sessionStorage.getItem('tutorial_contact_seller') !== '1') return;

        sessionStorage.removeItem('tutorial_contact_seller')

        const tour = driver({
            showProgress: true,
            steps: [
                {
                    element: '#message-seller-btn',
                    popover: {
                        title: 'Message the seller',
                        description: 'Click here to send them a message, and your contact details stay private'
                    }
                }
            ]
        })
        tour.drive()
    }, [loading,listing])

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
                    variant='primary'
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
                variant='primary'
            >

                <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform duration-200" />
                Back 
            </Button>



            <div className="flex flex-col lg:flex-row gap-8">

                <div className="flex-1">

                    <div className="relative w-full aspect-square max-w-sm bg-gray-100 rounded-lg overflow-hidden mb-3 shadow-md hover:shadow-lg transition-shadow duration-300">
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
                                    type="button"
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative w-14 h-14 rounded border-2 overflow-hidden transition-all duration-200 ${
                                        activeImage === i
                                            ? 'border-blue-600 shadow-md shadow-blue-200'
                                            : 'border-transparent hover:border-gray-300'
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

                    <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">


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
                                    ['Listing status', <Badge key="listing-status" variant={LISTING_STATUS_BADGE_VARIANT[listing.listing_status]}>{LISTING_LABEL[listing.listing_status]}</Badge>],
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


                    </div>

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
                                            ['Name of Publisher', listing.book.publisher ?? 'N/A']
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
                                            ['Faculty', listing.module.faculty?.name ?? 'N/A'],
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

                    <div className="card p-6 shadow-md hover:shadow-lg transition-shadow duration-300">


                        <h4 className="font-semibold mb-3">
                            Seller Information
                        </h4>


                        <div className="flex items-center gap-3 mb-3">

                            <div className="w-10 h-10 rounded-full bg-[#00B4D8] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                {listing.seller?.first_name?.[0]}{listing.seller?.last_name?.[0]}
                            </div>

                            <div>

                                <p className="font-semibold text-sm">


                                    {listing.seller?.first_name} {listing.seller?.last_name}
                                </p>

                                {listing.seller?.is_verified && (
                                    <span className="text-xs text-[#00B4D8] flex items-center gap-1">
                                        ✓ Verified Student
                                    </span>
                                )}
                            </div>


                        </div>

                        <p>
                            {listing.seller?.university?.name}
                        </p>

                    </div>


                    <div className="card p-5 shadow-md hover:shadow-lg transition-shadow duration-300">


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
                            variant='primary'
                            id='message-seller-btn'
                        
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Send size={16} />
                            MESSAGE SELLER
                        </Button>

                        <Button
                            onClick={() => setShowReportModal(true)}
                            variant="primary"
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <AlertTriangle size={16} />
                            REPORT LISTING
                        </Button>

                    </div>

                </aside>

            </div>

            {/* Message Modal */}
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
                        <div className="flex justify-end gap-3">


                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowMessageModal(false);
                                    setMessage("");
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!message.trim()) {
                                        return;
                                    }

                                    try {
                                        await startConversation(
                                            listing.id,
                                            message,
                                        );

                                        setMessageSent(true);
                                        setMessage("");
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }}
                            >
                                Send Message
                            </Button>


                        </div>

                    </div>

                    
                    
                )}
            </Modal>

            
            <Modal
                isOpen={showReportModal}
                onClose={() => {
                    if (!reportSubmitted) {
                        setShowReportModal(false)
                        setReportReason('')
                    }
                }}
                title="Report Listing"
            >

                {reportSubmitted ? (
                    <div className="text-center py-6">


                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">

                            <CheckCircle size={32} className="text-green-600" />
                        </div>


                        <p className="font-semibold text-lg">Report submitted!</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Thank you for helping keep our community safe. Our admin team will review this listing shortly.
                        </p>


                        <Button
                            onClick={() => {
                                setShowReportModal(false)
                                setReportSubmitted(false)
                                setReportReason('')
                            }}
                            className="btn-primary mt-4"
                        >
                            Close
                        </Button>

                    </div>
                ) : (
                    <div className="flex flex-col gap-4">

                        <p className="text-sm text-gray-600">
                            Please describe why you are reporting this listing.
                        </p>

                        <textarea
                            className="w-full border border-gray-300 rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={5}
                            placeholder="Describe the problem with this listing..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">

                            <Button
                                variant="primary"
                                onClick={() => {
                                    setShowReportModal(false)
                                    setReportReason('')
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={async () => {
                                    if (!reportReason.trim()) {
                                        return
                                    }

                                    try {
                                        await api.post('/reports', {
                                            listing_id: listing.id,
                                            reason: reportReason,
                                        })

                                        setReportSubmitted(true)
                                    } catch (error) {
                                        console.error('Error submitting report:', error)
                                        alert('Failed to submit report. Please try again.')
                                    }
                                }}
                            >

                                Submit
                            </Button>

                        </div>

                    </div>
                )}
            </Modal>
            

        </div>
    )
}
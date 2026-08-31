'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import AdminRoute from '@/components/auth/AdminRoute'
import {
    approveListing,
    rejectListing,
    AdminListing,
    getAllAdminListings,
} from '@/lib/admin.api'

import { normalizeImage } from '@/lib/image'
import FiltersTabs from '@/components/admin/filtersTabs'
import { useRouter } from 'next/navigation'
import { getMe } from '@/lib/auth.api'
import { Shield, Loader2 } from 'lucide-react'

import api from '@/lib/api'


interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

interface AdminReport {
    id: string
    reason: string
    status: 'PENDING' | 'REVIEWED'
    created_at: string

    reporter: {
        id: string
        first_name: string
        last_name: string
        email: string
    }

    listing: {
        id: string
        title: string
        price: number
        photo_urls: string[]
        seller: {
            id: string
            first_name: string
            last_name: string
            email: string
        }
    }
}

const TABLE_HEADERS = ['Book', 'Module', 'Price', 'Seller', 'Date', 'Actions']

type FilterValue = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function BookCell({ listing }: Readonly<{ listing: AdminListing }>) {
    return (
        <td className="px-4 py-3">

            <div className="flex items-center gap-3">


                <div className="relative w-10 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {listing.photo_urls?.[0] ? (
                        <Image src={normalizeImage(listing.photo_urls[0])} alt="" fill className="object-cover" />
                    ) : (
                        <span className="text-gray-300 text-xs">📷</span>
                    )}
                </div>
                <div>


                    <p className="font-medium line-clamp-1 max-w-[180px]">{listing.book.title}</p>
                    <p className="text-xs text-gray-400">
                        {listing.book.edition} Ed · ISBN {listing.book.isbn}
                    </p>
                </div>


            </div>
        </td>
    )
}

function ModuleCell({ module }: Readonly<{ module: AdminListing['module'] }>) {
    if (!module) {
        return <td className="px-4 py-3"><span className="text-xs text-gray-400">—</span></td>
    }
    return (
        <td className="px-4 py-3">
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {module.code}
            </span>

        </td>
    )
}

function ActionsCell({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: Readonly<{
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onViewDetails: (id: string) => void
}>) {
    const isLoading = actionLoading === listing.id

    return (
        <td className="px-4 py-3">
            <div className="flex gap-1.5 flex-wrap">


                <Button 
                    variant="primary" 
                    onClick={() => onViewDetails(listing.id)} 
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 cursor-pointer"
                >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'View'}
                </Button>


                {listing.status === 'PENDING' && (
                    <>
                        <Button 
                            variant="primary" 
                            onClick={() => onApprove(listing.id)} 
                            disabled={isLoading}
                            className="text-xs px-3 py-1.5 cursor-pointer"
                        >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                        </Button>


                        <Button 
                            variant="danger" 
                            onClick={() => onStartReject(listing.id)} 
                            disabled={isLoading}
                            className="text-xs px-3 py-1.5 cursor-pointer"
                        >
                            Reject
                        </Button>
                    </>
                )}
            </div>


        </td>
    )
}


function ListingRow({
    listing,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: {
    listing: AdminListing
    actionLoading: string | null
    onApprove: (id: string) => void
    onStartReject: (id: string) => void
    onViewDetails: (id: string) => void
}) {
    // Status badge colors
    const statusColors = {
        PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
        APPROVED: 'bg-green-100 text-green-700 border-green-300',
        REJECTED: 'bg-red-100 text-red-700 border-red-300',
    }

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-150">
            <BookCell listing={listing} />
            <ModuleCell module={listing.module} />

            <td className="px-4 py-3 font-semibold text-[#000f2b]">
                R{Number(listing.price).toFixed(2)}
            </td>
            <td className="px-4 py-3">
                <p className="font-medium text-sm">{listing.seller.first_name} {listing.seller.last_name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[150px]">{listing.seller.email}</p>
            </td>



            <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(listing.created_at)}</td>
            <td className="px-4 py-3">
                {/* Status Badge */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border mr-2 ${statusColors[listing.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'}`}>
                    {listing.status}
                </span>
                {/* Actions */}
                <ActionsCell
                    listing={listing}
                    actionLoading={actionLoading}
                    onApprove={onApprove}
                    onStartReject={onStartReject}
                    onViewDetails={onViewDetails}
                />
            </td>


        </tr>
    )
}

function ToastList({ toasts }: { readonly toasts: readonly Toast[] }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">

            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-2.5 rounded-xl text-white text-sm shadow-lg animate-in slide-in-from-right-5 backdrop-blur-sm ${
                        t.type === 'success' 
                            ? 'bg-green-600/90 border border-green-400/30' 
                            : 'bg-red-600/90 border border-red-400/30'
                    }`}
                >

                    {t.message}
                </div>

            ))}
        </div>
    )
}

function ListingsTable({
    listings,
    actionLoading,
    onApprove,
    onStartReject,
    onViewDetails,
}: {
    readonly listings: AdminListing[]
    readonly actionLoading: string | null
    readonly onApprove: (id: string) => void
    readonly onStartReject: (id: string) => void
    readonly onViewDetails: (id: string) => void
}) {
    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Shield size={48} className="mb-4 opacity-30" />

                <p className="text-sm font-medium">No listings found</p>
                
                <p className="text-xs mt-1">Try adjusting your filter</p>

            </div>
        )
    }

    return (
        <div className="card overflow-x-auto p-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                        {TABLE_HEADERS.map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {h}
                            </th>
                        ))}
                    </tr>

                </thead>
                <tbody>
                    {listings.map(listing => (
                        <ListingRow
                            key={listing.id}
                            listing={listing}
                            actionLoading={actionLoading}
                            onApprove={onApprove}
                            onStartReject={onStartReject}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </tbody>
            </table>


        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="card p-4 space-y-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
        </div>
    )
}

function RejectionModal({
    listing,
    reason,
    setReason,
    onConfirm,
    onCancel,
    loading,
}: {
    readonly listing: AdminListing | undefined
    readonly reason: string
    readonly setReason: (r: string) => void
    readonly onConfirm: () => void
    readonly onCancel: () => void
    readonly loading: boolean
}) {
    return (
        <Modal
            isOpen={!!listing}
            onClose={onCancel}
            title={`Reject "${listing?.title ?? 'listing'}"`}
        >
            <div className='flex flex-col gap-4'>
                <p className='text-sm text-gray-600'>
                    Let the seller know why this listing doesn&apos;t meet the requirements
                </p>

                <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8] transition-all"
                    rows={4}
                    placeholder="Enter reject reason..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    autoFocus
                />

                <div className='flex justify-end gap-2'>
                    <Button variant='secondary' onClick={onCancel} className="cursor-pointer">
                        Cancel
                    </Button>



                    <Button variant='danger' onClick={onConfirm} disabled={!reason.trim() || loading} className="cursor-pointer">
                        {loading ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
                        {loading ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                </div>


            </div>
        </Modal>
    )
}

function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: Toast['type']) => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }, [])

    return { toasts, showToast }
}

function useListings(showToast: (msg: string, type: Toast['type']) => void, currentAdminId: string | null) {
    const [listings, setListings] = useState<AdminListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        getAllAdminListings()
            .then(data => {
                setListings(data ?? [])
                setLoading(false)
            })
            .catch(() => {
                showToast('Failed to load listings', 'error')
                setLoading(false)
            })
    }, [showToast])

    const updateListingStatus = (id: string, status: string, reviewerId: string | null) => {
        setListings(prev => prev.map(l =>
            l.id === id ? { ...l, status, reviewer: reviewerId ? { id: reviewerId } : l.reviewer } : l
        ))
    }

    const handleApprove = async (id: string) => {
        setActionLoading(id)
        try {
            await approveListing(id)
            updateListingStatus(id, 'APPROVED',currentAdminId)
            showToast('Listing approved successfully', 'success')
        } catch {
            showToast('Failed to approve listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id: string, reason: string) => {
        setActionLoading(id)
        try {
            await rejectListing(id, reason)
            updateListingStatus(id, 'REJECTED',currentAdminId)
            showToast('Listing rejected successfully', 'success')
        } catch {
            showToast('Failed to reject listing', 'error')
        } finally {
            setActionLoading(null)
        }
    }

    return {
        listings,
        loading,
        actionLoading,
        handleApprove,
        handleReject,
    }
}

function useRejection(onReject: (id: string, reason: string) => Promise<void>) {
    const [rejectionTarget, setRejectionTarget] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const startReject = (id: string) => {
        setRejectionTarget(id)
        setRejectionReason('')
    }

    const cancelReject = () => {
        setRejectionTarget(null)
        setRejectionReason('')
    }

    const confirmReject = async () => {
        if (!rejectionTarget || !rejectionReason.trim()) return
        await onReject(rejectionTarget, rejectionReason)
        cancelReject()
    }

    return { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject }
}

function ReportCard({
    report,
    onDismiss,
    onBan,
    actionLoading,
}: {
    readonly report: AdminReport
    readonly onDismiss: (reportId: string) => Promise<void>
    readonly onBan: (report: AdminReport) => Promise<void>
    readonly actionLoading: boolean
}) {
    return (
        <div className="card p-5 border border-gray-200">
            <div className="flex justify-between items-start gap-4">

                <div className="flex gap-4">

                    <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {report.listing.photo_urls?.[0] ? (
                            <Image
                                src={normalizeImage(report.listing.photo_urls[0])}
                                alt={report.listing.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                                📚
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-[#000f2b]">
                            {report.listing.title}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            R{Number(report.listing.price).toFixed(2)}
                        </p>

                        <p className="text-sm text-gray-600 mt-2">
                            Reported by{' '}
                            <strong>
                                {report.reporter.first_name} {report.reporter.last_name}
                            </strong>
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                            {report.reporter.email}
                        </p>
                    </div>

                </div>

                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    {report.status}
                </span>

            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 mb-1">
                    Report reason
                </p>

                <p className="text-sm text-gray-700">
                    {report.reason}
                </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">

                <Button
                    variant="primary"
                    onClick={() => window.location.href = `/listings/${report.listing.id}`}
                    disabled={actionLoading}
                >
                    View Listing
                </Button>

                <Button
                    variant="secondary"
                    onClick={() => onDismiss(report.id)}
                    disabled={actionLoading}
                >
                    {actionLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        'Dismiss'
                    )}
                </Button>

                <Button
                    variant="danger"
                    onClick={() => onBan(report)}
                    disabled={actionLoading}
                >
                    {actionLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        'Ban Seller'
                    )}
                </Button>

            </div>
        </div>
    )
}

export default function AdminReviewDashboard() {
    const router = useRouter()
    const { toasts, showToast } = useToasts()
    const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
    const { listings, loading, actionLoading, handleApprove, handleReject } = useListings(showToast,currentAdminId)
    const { rejectionTarget, rejectionReason, setRejectionReason, startReject, cancelReject, confirmReject } = useRejection(handleReject)
    const [reports, setReports] = useState<AdminReport[]>([])
    const [reportActionLoading, setReportActionLoading] = useState<string | null>(null)

    useEffect(() => {
        getMe()
            .then(user => setCurrentAdminId(user.id))
            .catch(() => showToast('failed to load user','error'))
    },[showToast])

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await api.get<AdminReport[]>('/admin/reports')
                setReports(data)
            } catch (error) {
                console.error('Failed to fetch reports:', error)
            }
        }

        fetchReports()
    }, [])

    const pendingCount = listings.filter(l => l.status === 'PENDING').length
    const approveByMeCount = listings.filter(l => l.status === 'APPROVED' && l.reviewer?.id === currentAdminId).length
    const rejectedByMeCount = listings.filter(l => l.status === 'REJECTED' && l.reviewer?.id === currentAdminId).length

    const [activeFilter, setActiveFilter] = useState<FilterValue>('PENDING')
    const counts: Record<FilterValue, number> = {
        ALL: listings.length,
        PENDING: pendingCount,
        APPROVED: approveByMeCount,
        REJECTED: rejectedByMeCount,
    }

    const filtered = activeFilter === 'ALL'
        ? listings
        : activeFilter === 'APPROVED'
        ? listings.filter(l => l.status === 'APPROVED' && l.reviewer?.id === currentAdminId)
        : activeFilter === 'REJECTED'
        ? listings.filter(l => l.status === 'REJECTED' && l.reviewer?.id === currentAdminId)
        : listings.filter(l => l.status === activeFilter)

    const rejectionListing = listings.find(li => li.id === rejectionTarget)

    const handleViewDetails = (id: string) => {
        router.push(`/listings/${id}`)
    }

    const handleDismissReport = async (reportId: string) => {
        setReportActionLoading(reportId)
        try {
            await api.patch(`/admin/reports/${reportId}/dismiss`)

            setReports(prev =>
                prev.filter(report => report.id !== reportId)
            )

            showToast('Report dismissed', 'success')
        } catch (error) {
            console.error(error)
            showToast('Failed to dismiss report', 'error')
        } finally {
            setReportActionLoading(null)
        }
    }

    const handleBanUser = async (report: AdminReport) => {
        setReportActionLoading(report.id)
        try {
            await api.patch(`/admin/${report.listing.seller.id}/ban`, {
                reason: report.reason,
            })

            await api.patch(`/admin/reports/${report.id}/dismiss`)

            setReports(prev =>
                prev.filter(r => r.id !== report.id)
            )

            showToast('Seller banned and report reviewed', 'success')
        } catch (error) {
            console.error(error)
            showToast('Failed to ban seller', 'error')
        } finally {
            setReportActionLoading(null)
        }
    }
    return (
        <AdminRoute>
            {/* Hero Section */}
            <div className="relative overflow-hidden w-full" style={{
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #d5e0ea 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.05)',
            }}>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 opacity-30" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                }} />


                
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />


                
                {/* Glossy Highlight Line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                }} />
                
                <div className="relative z-10 px-6 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl" style={{
                            background: 'rgba(0, 180, 216, 0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 180, 216, 0.1)',
                        }}>
                            <Shield size={28} className="text-[#00B4D8]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#000f2b] tracking-tight">
                                Admin Review Dashboard
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base mt-0.5">
                                Manage and moderate all textbook listings
                            </p>
                        </div>


                    </div>
                </div>
                
                {/* Bottom Glossy Edge */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.15), transparent)',
                }} />

            </div>

            <div className="container-content py-6">
                <ToastList toasts={toasts} />

                <FiltersTabs activeFilter={activeFilter} counts={counts} onChange={setActiveFilter} />

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <ListingsTable
                        listings={filtered}
                        actionLoading={actionLoading}
                        onApprove={handleApprove}
                        onStartReject={startReject}
                        onViewDetails={handleViewDetails}
                    />
                )}

                <div className="mt-8">
                    <h2 className="text-xl font-bold text-[#000f2b] mb-4">
                        Reports
                    </h2>

                    <div className="space-y-4">
                        {reports.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No reports found.
                            </p>
                        ) : (
                            reports.map(report => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onDismiss={handleDismissReport}
                                    onBan={handleBanUser}
                                    actionLoading={reportActionLoading === report.id}
                                />
                            ))
                        )}
                    </div>
                </div>

                <RejectionModal
                    listing={rejectionListing}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                    onConfirm={confirmReject}
                    onCancel={cancelReject}
                    loading={actionLoading === rejectionTarget}
                />
            </div>

        </AdminRoute>

    )
}
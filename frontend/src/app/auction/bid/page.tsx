"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { CheckCircle2, Clock3, Gavel, Radio, ShieldCheck } from "lucide-react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Input from "@/components/ui/Input"
import { Badge, Button } from "@/components/ui"
import {
    getAuction,
    getBidHistory,
    placeBid,
    type Auction,
    type Bid,
    type BidHistoryResponse,
} from "@/lib/auction.api"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

const MIN_INCREMENT = 5

type LiveAuctionState = {
    status?: Auction["status"]
    outcome?: "SOLD" | "NO_BIDS" | "RESERVE_NOT_MET"
    currentHighestBid?: number | null
    currentHighestBidderName?: string
    endTime?: { toDate?: () => Date } | Date | string
    extensionCount?: number
}

function bidAmount(auction: Auction) {
    return Number(auction.current_highest_bid ?? auction.starting_price)
}

function formatCurrency(value: number) {
    return `R${value.toFixed(2)}`
}

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "Not available"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "Not available"
    return new Intl.DateTimeFormat("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date)
}

function resolveLiveDate(value: LiveAuctionState["endTime"], fallback: string | null) {
    if (value && typeof value === "object" && "toDate" in value && value.toDate) return value.toDate()
    if (value instanceof Date || typeof value === "string") return value
    return fallback
}

function bidderName(bid: Bid) {
    const bidder = bid.bidder
    if (!bidder) return "Anonymous bidder"
    const firstName = typeof bidder.first_name === "string" ? bidder.first_name : ""
    const lastName = typeof bidder.last_name === "string" ? bidder.last_name : ""
    return `${firstName} ${lastName}`.trim() || "Anonymous bidder"
}

function auctionStatusLabel(status: Auction["status"] | undefined, closed: boolean, outcome: LiveAuctionState["outcome"] | undefined) {
    if (status === "ACTIVE" && !closed) return "In progress"
    if (status === "SCHEDULED") return "Scheduled"
    if (outcome === "SOLD") return "SOLD"
    return "Ended"
}

function auctionBadgeVariant(label: string) {
    if (label === "In progress") return "active" as const
    if (label === "Scheduled") return "pending" as const
    return "sold" as const
}

function auctionClosedMessage(outcome: LiveAuctionState["outcome"] | undefined) {
    if (outcome === "SOLD") return "Auction ended successfully. The reserve price was met and the highest bidder won."
    if (outcome === "RESERVE_NOT_MET") return "Auction ended without a sale because the reserve price was not met."
    if (outcome === "NO_BIDS") return "Auction ended without a sale because no bids were placed."
    return "This auction is not accepting bids. You can still review its bid history."
}

function formatTimeRemaining(ms: number) {

    if (ms <= 0) return "Ended"

    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${totalSeconds % 60}s`
    return `${minutes}m ${totalSeconds % 60}s`
}

function refreshBidHistory(
    auctionId: string,
    isLatestRequest: () => boolean,
    onHistoryLoaded: (history: BidHistoryResponse) => void,
) {
    void getBidHistory(auctionId)
        .then((historyData) => {
            if (isLatestRequest()) onHistoryLoaded(historyData)
        })
        .catch((historyError: unknown) => console.error("Unable to refresh live bid history", historyError))
}

function useLiveAuctionState(
    auctionId: string | null,
    onHistoryLoaded: (history: BidHistoryResponse) => void,
) {
    const [liveState, setLiveState] = useState<LiveAuctionState>({})

    useEffect(() => {
        if (!auctionId) return

        let active = true
        let historyRequest = 0
        const unsubscribe = onSnapshot(
            doc(db, "actions", auctionId),
            (snapshot) => {
                if (!snapshot.exists()) return

                setLiveState(snapshot.data() as LiveAuctionState)
                const requestId = ++historyRequest
                refreshBidHistory(
                    auctionId,
                    () => active && requestId === historyRequest,
                    onHistoryLoaded,
                )
            },
            (snapshotError: unknown) => console.error("Unable to listen for live auction updates", snapshotError),
        )

        return () => {
            active = false
            unsubscribe()
        }
    }, [auctionId, onHistoryLoaded])

    return liveState
}

function ownerOutcome(closed: boolean, outcome: LiveAuctionState["outcome"] | undefined) {
    if (!closed) return "In progress"
    if (outcome === "SOLD") return "Sold: reserve met"
    if (outcome === "RESERVE_NOT_MET") return "Not sold: reserve not met"
    if (outcome === "NO_BIDS") return "Not sold: no bids"
    return "Ended"
}

type OwnerSummaryProps = {
    highestBid: number | null
    timeRemaining: string
    acceptedBidCount: number
    extensionCount: number
    closed: boolean
    outcome: LiveAuctionState["outcome"]
}

function OwnerSummary({ highestBid, timeRemaining, acceptedBidCount, extensionCount, closed, outcome }: OwnerSummaryProps) {
    const rows = [
        ["Highest bid", highestBid == null ? "No bids yet" : formatCurrency(highestBid)],
        ["Time remaining", timeRemaining],
        ["Accepted bids", String(acceptedBidCount)],
        ["Extensions", String(extensionCount)],
        ["Outcome", ownerOutcome(closed, outcome)],
    ]

    return (

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#00B4D8]" size={20} />
                <h2 className="text-lg font-semibold normal-case text-[#000f2b] dark:text-white">Manage your auction</h2>
            </div>
            <p className="mt-3 rounded-lg bg-gray-100 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                You own this auction.
            </p>
            <dl className="mt-5 divide-y divide-gray-100 dark:divide-gray-800">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-2 text-sm">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="font-semibold text-[#000f2b] dark:text-white">{value}</dd>
                    </div>
                ))}
            </dl>
        </aside>
    )
}

function BidPageContent() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const auctionId = searchParams.get("auctionId")
    const [auction, setAuction] = useState<Auction | null>(null)
    const [history, setHistory] = useState<BidHistoryResponse | null>(null)
    const liveState = useLiveAuctionState(auctionId, setHistory)
    const [amount, setAmount] = useState("")
    const [consent, setConsent] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [currentTime, setCurrentTime] = useState(() => Date.now())
    const { user } = useAuth();
    const isOwner = Boolean(user && auction && String(auction.seller_id) === String(user.id))
    const acceptedBids = history?.data.filter((bid) => bid.status === 'ACCEPTED') ?? []

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(Date.now()), 1000)
        return () => window.clearInterval(timer)
    }, [])

    useEffect(() => {
        if (!auctionId) {
            return
        }

        let active = true
        const loadAuction = async () => {
            setLoading(true)
            setError("")
            try {
                const [auctionData, historyData] = await Promise.all([
                    getAuction(auctionId),
                    getBidHistory(auctionId),
                ])
                if (!active) return
                setAuction(auctionData)
                setHistory(historyData)
                const hasExistingBid = auctionData.current_highest_bid != null
                const nextBid = hasExistingBid
                    ? bidAmount(auctionData) + MIN_INCREMENT
                    : auctionData.starting_price
                setAmount(String(nextBid))
            } catch (loadError) {
                if (!active) return
                setError(loadError && typeof loadError === "object" && "message" in loadError
                    ? String(loadError.message)
                    : "This auction could not be loaded.")
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadAuction()
        return () => {
            active = false
        }
    }, [auctionId])

    const fallbackBid = auction ? bidAmount(auction) : 0
    const hasBids = liveState.currentHighestBid != null || auction?.current_highest_bid != null
    const currentBid = liveState.currentHighestBid == null
        ? fallbackBid
        : Number(liveState.currentHighestBid)
    const minimumBid = hasBids ? currentBid + MIN_INCREMENT : Number(auction?.starting_price ?? 0)
    const endTime = resolveLiveDate(liveState.endTime, auction?.end_time ?? null)
    const listing = auction?.listing
    const endTimestamp = endTime ? new Date(endTime).getTime() : Number.NaN
    const auctionStatus = liveState.status ?? auction?.status
    const auctionClosed = auctionStatus !== "ACTIVE" || !Number.isFinite(endTimestamp) || endTimestamp <= currentTime
    const timeRemaining = Number.isFinite(endTimestamp) ? formatTimeRemaining(endTimestamp - currentTime) : "Not available"
    const selectedError = error || (!auctionId ? "No auction was selected." : "")
    const statusLabel = auctionStatusLabel(auctionStatus, auctionClosed, liveState.outcome)
    const statusVariant = auctionBadgeVariant(statusLabel)
    let bidButtonLabel = "Place bid"
    if (submitting) bidButtonLabel = "Submitting bid..."
    if (auctionClosed) bidButtonLabel = "Auction not active"

    const reloadHistory = async () => {
        if (!auctionId) return
        setHistory(await getBidHistory(auctionId))
    }

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault()
        setError("")
        setSuccess("")

        const bid = Number(amount)
        if (!consent) {
            setError("Please confirm that you understand the bidding terms before placing a bid.")
            return
        }
        if (!Number.isFinite(bid) || bid < minimumBid) {
            setError(`Your bid must be at least ${formatCurrency(minimumBid)}.`)
            return
        }
        if (!auctionId || auctionClosed) {
            setError("This auction is no longer accepting bids.")
            return
        }

        setSubmitting(true)
        try {
            const response = await placeBid(auctionId, { amount: bid })
            if (response.status === "REJECTED") {
                setError(response.reason)
                return
            }

            setAuction((current) => current ? { ...current, ...response.auction } : current)
            setSuccess("Your bid was placed successfully.")
            setAmount(String(Number(response.auction.current_highest_bid ?? bid) + MIN_INCREMENT))
            await reloadHistory()
        } catch (submitError) {
            setError(submitError && typeof submitError === "object" && "message" in submitError
                ? String(submitError.message)
                : "Your bid could not be placed. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading && auctionId) {
        return <div className="mx-auto max-w-6xl animate-pulse px-5 py-10"><div className="h-8 w-64 rounded bg-gray-200" /><div className="mt-4 h-72 rounded-xl bg-gray-100" /></div>
    }

    if (selectedError && !auction) {
        return <div className="mx-auto max-w-6xl px-5 py-10"><p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{selectedError}</p></div>
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <header className="bg-[#000f2b] px-5 py-6 text-white md:px-10">
                <div className="mx-auto max-w-6xl">

                    <Button
                        type="button"
                        value="outline"
                        onClick={() => router.push('/auction')}
                    >
                        Back to auctions
                    </Button>

                    <div className="mt-6 flex items-start justify-between gap-4">
                        <div className="min-w-0">

                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00B4D8]">
                                Auction
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                                {listing?.title ?? "Auction"}
                            </h1>
                            <p className="mt-1 text-sm text-white/70">{listing?.book?.author ?? "Review this textbook auction"}</p>

                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                            <Gavel className="mt-1 text-[#00B4D8]" />
                            <Badge variant={statusVariant}>{statusLabel}</Badge>
                        </div>

                    </div>
                </div>
            </header>

            <main className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)] md:px-10">
                <section className="space-y-5">

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                            <p className="text-xs uppercase tracking-wide text-gray-500">{hasBids ? "Current bid" : "Starting bid"}</p>
                            <p className="mt-1 text-3xl font-bold text-[#000f2b] dark:text-white">
                                {formatCurrency(hasBids ? currentBid : Number(auction?.starting_price ?? 0))}
                            </p>
                            {!auctionClosed && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                                    <Radio size={13} /> Live
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Minimum next bid</p>
                            <p className="mt-1 text-2xl font-bold text-[#000f2b] dark:text-white">{formatCurrency(minimumBid)}</p>
                            <p className="mt-1 text-xs text-gray-500">Minimum increment {formatCurrency(MIN_INCREMENT)}</p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Time remaining</p>
                            <p className="mt-1 text-lg font-bold text-[#000f2b] dark:text-white">{timeRemaining}</p>
                            <p className="mt-1 text-xs text-gray-500">Ends {formatDate(endTime)}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                <Clock3 size={13} /> {liveState.extensionCount ?? auction?.extension_count ?? 0} extensions
                            </p>
                        </div>
                    </div>


                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold normal-case text-[#000f2b] dark:text-white">Live bid activity</h2>
                            <span className="text-xs text-gray-500">{acceptedBids.length} bids</span>
                        </div>
                        {acceptedBids.length ? (
                            <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                                {acceptedBids.map((bid) => (
                                    <div key={bid.id} className="flex items-center justify-between gap-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{bidderName(bid)}</p>
                                            <p className="text-xs text-gray-500">{formatDate(bid.placed_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[#000f2b] dark:text-white">{formatCurrency(Number(bid.amount))}</p>
                                            <p className="text-xs text-emerald-600">Accepted</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-gray-500">
                                {auctionClosed || isOwner ? "No bids were placed." : "No bids yet. Be the first bidder."}
                            </p>
                        )}
                    </div></section>

                {isOwner ? (
                    <OwnerSummary
                        highestBid={hasBids ? currentBid : null}
                        timeRemaining={timeRemaining}
                        acceptedBidCount={acceptedBids.length}
                        extensionCount={liveState.extensionCount ?? auction?.extension_count ?? 0}
                        closed={auctionClosed}
                        outcome={liveState.outcome}
                    />
                ) : (
                    <aside className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-[#00B4D8]" size={20} />
                            <h2 className="text-lg font-semibold normal-case text-[#000f2b] dark:text-white">
                                {auctionClosed ? "Auction details" : "Place your bid"}
                            </h2>
                        </div>

                        {auctionClosed ? (
                            <p className="mt-3 rounded-lg bg-gray-100 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                {auctionClosedMessage(liveState.outcome)}
                            </p>
                        ) : (
                            <>
                                <p className="mt-2 text-sm text-gray-500">You are responsible for any bid you confirm.</p>

                                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                    <Input
                                        id="bid-amount"
                                        label="Your bid (R)"
                                        type="number"
                                        value={amount}
                                        onChange={(event) => setAmount(event.target.value)}
                                        placeholder={formatCurrency(minimumBid)}
                                    />

                                    <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={consent}
                                            onChange={(event) => setConsent(event.target.checked)}
                                            className="mt-1 size-4"
                                        />
                                        <span>I understand that a confirmed bid is binding, must meet the minimum bid, and cannot be withdrawn.</span>
                                    </label>

                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                    {success && (
                                        <p className="flex items-center gap-2 text-sm text-emerald-600">
                                            <CheckCircle2 size={16} /> {success}
                                        </p>
                                    )}

                                    <Button type="submit" variant="primary" className="w-full" disabled={submitting || !consent}>
                                        {bidButtonLabel}
                                    </Button>
                                </form>

                                <p className="mt-4 text-xs leading-5 text-gray-500">
                                    By placing a bid, you confirm that you have reviewed the auction details and agree to the marketplace bidding rules.
                                </p>
                            </>
                        )}
                    </aside>
                )}</main>
        </div>
    )
}

export default function AuctionBidPage() {
    return <ProtectedRoute><Suspense fallback={<div className="mx-auto max-w-6xl px-5 py-10">Loading auction...</div>}><BidPageContent /></Suspense></ProtectedRoute>
}

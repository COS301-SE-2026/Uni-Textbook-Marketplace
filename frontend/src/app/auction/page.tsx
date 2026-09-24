"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { Clock3, Filter, Gavel, Search, SlidersHorizontal, X } from "lucide-react"
import AuctionCard from "@/components/auction/auctionCard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { getAuctions, type Auction } from "@/lib/auction.api"
import { mapListing } from "@/lib/mappers/listingMapper"
import { getUniversities, type University } from "@/lib/auth.api"
import { useAuth } from "@/context/AuthContext"

interface AuctionFilters {
    university: string
    status: string
    moduleCode: string
    priceMin: string
    priceMax: string
    sort: string
}

const EMPTY_FILTERS: AuctionFilters = {
    university: "",
    status: "",
    moduleCode: "",
    priceMin: "",
    priceMax: "",
    sort: "ending",
}

function auctionAmount(auction: Auction) {
    return Number(auction.current_highest_bid ?? auction.starting_price)
}

function auctionListing(auction: Auction) {
    const source = auction.listing ?? {}
    const listing = mapListing({
        ...source,
        id: source.id ?? auction.listing_id ?? auction.id,
        title: source.title ?? "Textbook auction",
        price: source.price ?? auction.starting_price,
        condition: source.condition ?? "good",
        annotation_level: source.annotation_level ?? "none",
        status: source.status ?? "APPROVED",
        listing_status: source.listing_status ?? "AVAILABLE",
        photo_urls: source.photo_urls ?? [],
        book: source.book ?? {},
        module: source.module ?? {},
    })

    return {
        ...listing,
        price: Number(source.price ?? auction.starting_price),
    }
}

export default function AuctionPage() {
    const { user } = useAuth()
    const [auctions, setAuctions] = useState<Auction[]>([])
    const [filters, setFilters] = useState<AuctionFilters>(EMPTY_FILTERS)
    const [appliedFilters, setAppliedFilters] = useState<AuctionFilters>(EMPTY_FILTERS)
    const [universities, setUniversities] = useState<University[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        getUniversities().then(setUniversities).catch((loadError) => {
            console.error("Failed to fetch universities", loadError)
        })
    }, [])

    useEffect(() => {
        if (!user?.university?.id) return

        setFilters((current) => current.university ? current : { ...current, university: user.university!.id })
        setAppliedFilters((current) => current.university ? current : { ...current, university: user.university!.id })
    }, [user])

    useEffect(() => {
        const loadAuctions = async () => {
            setLoading(true)
            setError("")

            try {
                const auctionData = await getAuctions()
                setAuctions(auctionData)
            } catch {
                setAuctions([])
                setError("Auctions could not be loaded right now.")
            } finally {
                setLoading(false)
            }
        }

        loadAuctions()
    }, [])

    const handleFilterChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target
        setFilters((current) => ({ ...current, [name]: value }))
    }

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS)
        setAppliedFilters(EMPTY_FILTERS)
    }

    const activeFilterCount = [
        filters.university,
        filters.status,
        filters.moduleCode,
        filters.priceMin,
        filters.priceMax,
    ].filter(Boolean).length

    const filteredAuctions = auctions
        .filter((auction) => {
            const listing = auction.listing
            const moduleCode = listing?.module?.code ?? ""
            const universityId = listing?.module?.university?.id ?? ""
            const amount = auctionAmount(auction)

            return (
                (!appliedFilters.university || universityId === appliedFilters.university) &&
                (!appliedFilters.status || auction.status === appliedFilters.status) &&
                (!appliedFilters.moduleCode || moduleCode.toLowerCase().includes(appliedFilters.moduleCode.toLowerCase())) &&
                (!appliedFilters.priceMin || amount >= Number(appliedFilters.priceMin)) &&
                (!appliedFilters.priceMax || amount <= Number(appliedFilters.priceMax))
            )
        })
        .sort((first, second) => {
            if (appliedFilters.sort === "highest") return auctionAmount(second) - auctionAmount(first)
            if (appliedFilters.sort === "lowest") return auctionAmount(first) - auctionAmount(second)
            if (appliedFilters.sort === "newest") {
                return new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
            }

            return new Date(first.end_time ?? "").getTime() - new Date(second.end_time ?? "").getTime()
        })

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <div className="flex min-h-[calc(100vh-4rem)] w-full">
                    <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="top-16 h-[calc(100vh-4rem)] border-r">
                        <SidebarContent className="p-4">
                            <SidebarGroup>
                                <div className="mb-5 flex items-center justify-between">
                                    <SidebarGroupLabel className="flex gap-2 p-0 text-base font-semibold text-foreground">
                                        <Filter size={18} />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <span className="rounded-full bg-[#00B4D8] px-2 py-0.5 text-xs text-white">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </SidebarGroupLabel>
                                    <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-[#00B4D8] hover:text-[#006D8A]">
                                        <X size={14} />
                                        Clear
                                    </button>
                                </div>

                                <form onSubmit={(event) => {
                                    event.preventDefault()
                                    setAppliedFilters(filters)
                                }}>
                                <label htmlFor="auction-university" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">University</label>
                                <Select id="auction-university" name="university" value={filters.university} onChange={handleFilterChange}>
                                    <option value="">All universities</option>
                                    {universities.map((university) => (
                                        <option key={university.id} value={university.id}>{university.name}</option>
                                    ))}
                                </Select>

                                <label htmlFor="auction-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Status</label>
                                <Select id="auction-status" name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="">All statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="SCHEDULED">Scheduled</option>
                                    <option value="ENDED">Ended</option>
                                </Select>

                                <label htmlFor="auction-module" className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">Module code</label>
                                <Input id="auction-module" name="moduleCode" value={filters.moduleCode} onChange={handleFilterChange} placeholder="e.g. COS301" />

                                <label htmlFor="auction-price-min" className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">Current bid range</label>
                                <div className="flex items-center gap-2">
                                    <Input id="auction-price-min" name="priceMin" type="number" value={filters.priceMin} onChange={handleFilterChange} placeholder="Min" />
                                    <span className="text-gray-400">-</span>
                                    <Input id="auction-price-max" name="priceMax" type="number" value={filters.priceMax} onChange={handleFilterChange} placeholder="Max" />
                                </div>

                                <label htmlFor="auction-sort" className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wider text-gray-500">Sort by</label>
                                <Select id="auction-sort" name="sort" value={filters.sort} onChange={handleFilterChange}>
                                    <option value="ending">Ending soon</option>
                                    <option value="newest">Recently added</option>
                                    <option value="highest">Highest bid</option>
                                    <option value="lowest">Lowest bid</option>
                                </Select>

                                <button type="submit" className="btn-primary mt-5 w-full">
                                    APPLY FILTERS
                                </button>
                                </form>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>

                    <SidebarInset className="min-w-0 flex-1">
                        <header className="relative overflow-hidden bg-[#000f2b] px-6 py-7 text-white md:px-10 lg:px-14">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,180,216,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,.2) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
                            <div className="relative z-10 mx-auto max-w-6xl">
                                <div className="flex items-start gap-3">
                                    <SidebarTrigger className="mt-1 text-white hover:text-[#00B4D8]" />
                                    <div>
                                        <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#00B4D8]"><Gavel size={15} /> Live marketplace</p>
                                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Textbook auctions</h1>
                                        <p className="mt-1 max-w-xl text-sm text-white/70">Bid on the books you need before someone else gets there first.</p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="mx-auto w-full max-w-6xl px-5 py-6 md:px-8 lg:px-10">
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <SlidersHorizontal size={17} className="text-[#00B4D8]" />
                                        <h2 className="text-xl font-semibold normal-case text-[#000f2b] dark:text-white">Available auctions</h2>
                                    </div>
                                    {!loading && <p className="mt-1 text-sm text-gray-500">{filteredAuctions.length} auction{filteredAuctions.length === 1 ? "" : "s"} match your filters</p>}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500"><Clock3 size={15} /> Ending soon is shown first</div>
                            </div>

                            {loading && (
                                <div className="space-y-4" aria-label="Loading auctions">
                                    {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />)}
                                </div>
                            )}

                            {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>}

                            {!loading && !error && filteredAuctions.length === 0 && (
                                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-6 text-center">
                                    <Search size={30} className="mb-3 text-gray-400" />
                                    <h3 className="text-lg font-semibold text-[#000f2b] dark:text-white">No auctions found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Try clearing a filter or searching for another module.</p>
                                    <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-[#006D8A] hover:underline">Clear filters</button>
                                </div>
                            )}

                            {!loading && !error && filteredAuctions.length > 0 && (
                                <main className="space-y-4">
                                    {filteredAuctions.map((auction) => (
                                        <AuctionCard
                                            key={auction.id}
                                            auctionId={auction.id}
                                            listing={auctionListing(auction)}
                                            startingPrice={Number(auction.starting_price)}
                                            currentBid={auctionAmount(auction)}
                                            startTime={auction.start_time}
                                            endsAt={auction.end_time ?? auction.created_at}
                                            status={auction.status}
                                            bidCount={auction.bidCount ?? 0}
                                        />
                                    ))}
                                </main>
                            )}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    )
}

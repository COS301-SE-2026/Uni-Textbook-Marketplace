'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import ListingCard, { Listing } from '@/components/listings/listingCard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { mapListing } from '@/lib/mappers/listingMapper'
import { getListings } from '@/lib/listings.api'
import SearchBar from '@/components/SearchBar'
import { mylist } from '@/lib/wishlist.api'
import { useSearchParams } from 'next/navigation'

import SaveSearchButton from '@/components/listings/SaveSearchButton'
import Link from 'next/link'
import { Bookmark } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'

// Filter state

interface Filters {
    faculty: string
    moduleCode: string
    edition: string
    priceMin: string
    priceMax: string
    condition: string
    annotationLevel: string
    search: string
}

const EMPTY_FILTERS: Filters = {
    faculty: '',
    moduleCode: '',
    edition: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    annotationLevel: '',
    search: '',
}

// Page 

function BrowseListingsContent() {

    const boundSearches = useSearchParams()

    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    const getInitialFilters = (): Filters => {
        return {
            faculty: boundSearches?.get('faculty') || '',
            moduleCode: boundSearches?.get('moduleCode') || '',
            edition: boundSearches?.get('edition') || '',
            priceMin: boundSearches?.get('priceMin') || '',
            priceMax: boundSearches?.get('priceMax') || '',
            condition: boundSearches?.get('condition') || '',
            annotationLevel: boundSearches?.get('annotationLevel') || '',
            search: boundSearches?.get('search') || '',
        }
    }

    const initialFilters = getInitialFilters()

    const [filters, setFilters] = useState<Filters>(initialFilters)


    const [applied, setApplied] = useState<Filters>(initialFilters)

    const [total, setTotal] = useState(0)

    const [likedIds, setLikedIds] = useState<Set<string>>(new Set())


    const fetchListings = useCallback(async (f: Filters) => {
        try {

            const params = new URLSearchParams()

            if (f.search) params.set('search', f.search)
            if (f.faculty) params.set('faculty', f.faculty)
            if (f.moduleCode) params.set('moduleCode', f.moduleCode)
            if (f.edition) params.set('edition', f.edition)
            if (f.priceMin) params.set('priceMin', f.priceMin)
            if (f.priceMax) params.set('priceMax', f.priceMax)
            if (f.condition) params.set('condition', f.condition)
            if (f.annotationLevel) params.set('annotationLevel', f.annotationLevel)

            const response = await getListings(params.toString())


            const listings = Array.isArray(response.listings) ? response.listings : [];

            const total = typeof response.total === 'number' ? response.total : listings.length;

            return {


                listings: listings.map(mapListing),
                total: total,
            }
        } catch (err) {

            console.error('Failed to fetch listings', err)
            return { listings: [], total: 0 }
        }
    }, [])


    useEffect(() => {
        const loadListings = async () => {
            setLoading(true)
            const { listings: data, total: count } = await fetchListings(applied)
            setListings(data)
            setTotal(count)
            setLoading(false)
        }
        loadListings()
    }, [applied, fetchListings])

    useEffect(() => {
        const loadWishlist = async () => {

            try {
                const items = await mylist()
                const ids = items.map((item) => item.listings_id)
                setLikedIds(new Set(ids))
            } catch (error) {
                console.error('failed to fetch wishlist', error)
            }
        }
        loadWishlist()
    }, [])


    // Handlers

    const handleFilterChange = (

        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {



        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const searchApplicte = (query: string) => {

        setFilters(prev => ({ ...prev, search: query }))

        setApplied(prev => ({ ...prev, search: query }))
    }

    const handleApply = () => setApplied(filters)

    const handleClear = () => {
        setFilters(EMPTY_FILTERS)
        setApplied(EMPTY_FILTERS)
    }

    const getOrdinal = (n: number): string => {
        if (n === 1) return '1st';
        if (n === 2) return '2nd';
        if (n === 3) return '3rd';
        return `${n}th`;
    }

    // Render



    return (
        <ProtectedRoute>
            <SidebarProvider>
                <div className="flex w-full">
                    <Sidebar side='left' variant='sidebar' collapsible='offcanvas' 
                        className="border-r top-16 h-[calc(100vh-4rem)]"
                    >
                        <SidebarContent className="p-4">
                            <SidebarGroup>
                                <div className="mb-4 flex items-center justify-between">
                                    <SidebarGroupLabel className="p-0 text-base font-semibold text-foreground">
                                        Filters
                                    </SidebarGroupLabel>
                                    <button
                                        onClick={handleClear}
                                        className="text-sm font-bold text-blue-600 hover:underline"
                                    >
                                        clear all
                                    </button>
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Faculty
                                    </label>
                                    <Select
                                        name="faculty"
                                        value={filters.faculty}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Select Faculty</option>
                                        <option value="Engineering, Built Environment and IT">EBIT - Engineering, Built-Environment and IT</option>
                                        <option value="Law">Law</option>
                                        <option value="Humanities">Humanities</option>
                                        <option value="Health Sciences">Health Sciences</option>
                                        <option value="Gordon Institute of Business Science">Gordon Institute of Business Science</option>
                                        <option value="Natural and Agricultural Sciences">Natural and Agricultural Sciences</option>
                                        <option value="Economic and Management Sciences">Economic and Management Sciences</option>
                                        <option value="Education">Education</option>
                                        <option value="Theology and Religion">Theology and Religion</option>
                                        <option value="Veterinary Sciences">Veterinary Sciences</option>
                                    </Select>
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Module Code
                                    </label>
                                    <Input
                                        name="moduleCode"
                                        value={filters.moduleCode}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. COS301"
                                    />
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Edition
                                    </label>
                                    <Select
                                        name="edition"
                                        value={filters.edition}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Any Edition</option>
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(e => (
                                            <option key={e} value={e}>{getOrdinal(Number.parseInt(e))}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Price Range
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            name="priceMin"
                                            value={filters.priceMin}
                                            onChange={handleFilterChange}
                                            placeholder="R (Min)"
                                            type="number"
                                        />
                                        <span className="text-gray-400">–</span>
                                        <Input
                                            name="priceMax"
                                            value={filters.priceMax}
                                            onChange={handleFilterChange}
                                            placeholder="R (Max)"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Condition
                                    </label>
                                    <Select
                                        name="condition"
                                        value={filters.condition}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Any Condition</option>
                                        <option value="new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </Select>
                                </div>

                                <div className="mb-1">
                                    <label className="mb-1 block text-xs font-medium">
                                        Annotation Level
                                    </label>
                                    <Select
                                        name="annotationLevel"
                                        value={filters.annotationLevel}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Any Level</option>
                                        <option value="none">None</option>
                                        <option value="light">Light</option>
                                        <option value="heavy">Heavy</option>
                                    </Select>
                                </div>

                                <button
                                    onClick={handleApply}
                                    className="btn-primary mt-2 w-full"
                                >
                                    APPLY FILTERS
                                </button>

                                <div className="border-t border-gray-200 pt-4">
                                    <SaveSearchButton
                                        filters={applied}
                                        onSave={() => console.log('Search saved!')}
                                    />
                                </div>

                                <Link
                                    href="/saved-searches"
                                    className="flex items-center gap-1 text-lg text-blue hover:underline"
                                >
                                    <Bookmark size={20} />
                                    Saved Searches
                                </Link>
                
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>

                    <SidebarInset className="flex-1">
                        <div className="py-8 mx-18">
                            <div className="mb-6 flex gap-2">
    
                                <SidebarTrigger/>
                               
                                <div>
                                    <h1>Browse Textbooks</h1>
                                    <p className="text-sm text-gray-500">
                                        Find the right textbook for your module
                                    </p>
                                </div>
  
                            </div>

                            <SearchBar
                                onSearch={searchApplicte}
                                initialQuery={filters.search}
                                className="mb-6"
                            />

                            <main className="flex-1">
                                {!loading && (
                                    <p className="mb-4 text-sm text-gray-500">
                                        {total} result{total !== 1 ? 's' : ''} found
                                    </p>
                                )}

                                {loading ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="card animate-pulse flex flex-col gap-3"
                                            >
                                                <div className="h-40 rounded bg-gray-200" />
                                                <div className="h-4 w-3/4 rounded bg-gray-200" />
                                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                                                <div className="h-4 w-1/4 rounded bg-gray-200" />
                                            </div>
                                        ))}
                                    </div>
                                ) : listings.length === 0 ? (
                                    <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                                        <svg
                                            className="mb-3 h-12 w-12"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1}
                                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p className="text-sm">No listings found</p>
                                        <button
                                            onClick={handleClear}
                                            className="mt-3 text-sm text-blue-600 hover:underline"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {listings.map(listing => (
                                            <ListingCard key={listing.id} listing={listing} isLiked={likedIds.has(listing.id)} />
                                        ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </ProtectedRoute>
    )
}

export default function BrowseListingsPage() {

    return (
        <Suspense fallback={

            <div className="container-content py-8">
                <div className="mb-6">

                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />

                    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
                </div>

                <div className="flex flex-col md:flex-row gap-6">

                    <div className="w-full md:w-56 flex-shrink-0">

                        <div className="card flex flex-col gap-4">

                            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                            {[1, 2, 3, 4, 5, 6].map((i) => (

                                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>

                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {[1, 2, 3, 4, 5, 6].map((i) => (

                                <div key={i} className="card animate-pulse flex flex-col gap-3">
                                    <div className="h-40 bg-gray-200 rounded" />

                                    <div className="h-4 bg-gray-200 rounded w-3/4" />

                                    <div className="h-3 bg-gray-100 rounded w-1/2" />

                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        }>
            <BrowseListingsContent />
        </Suspense>
    )
}
'use client'

import { useEffect, useState, useCallback } from 'react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import ListingCard, { Listing } from '@/components/listings/listingCard'
import { mapListing } from '@/lib/mappers/listingMapper'

// Filter state

interface Filters {
    faculty: string
    moduleCode: string
    edition: string
    priceMin: string
    priceMax: string
    condition: string
    annotationLevel: string
}

const EMPTY_FILTERS: Filters = {
    faculty: '',
    moduleCode: '',
    edition: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    annotationLevel: '',
}

// Page 

export default function BrowseListingsPage() {

    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
    const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)
    const [total, setTotal] = useState(0)

    
    const fetchListings = useCallback(async (f: Filters) => {
        try {
            const BASE = process.env.NEXT_PUBLIC_API_URL

            const params = new URLSearchParams()

            if (f.faculty) params.set('faculty', f.faculty)
            if (f.moduleCode) params.set('moduleCode', f.moduleCode)
            if (f.edition) params.set('edition', f.edition)
            if (f.priceMin) params.set('priceMin', f.priceMin)
            if (f.priceMax) params.set('priceMax', f.priceMax)
            if (f.condition) params.set('condition', f.condition)
            if (f.annotationLevel) params.set('annotationLevel', f.annotationLevel)

            const url = `${BASE}/listings?${params.toString()}`
            console.log('FETCH URL:', url)

            const res = await fetch(url)

            console.log('STATUS:', res.status)
            console.log('OK:', res.ok)

            const raw = await res.text()
            console.log('RAW RESPONSE:', raw)

            const data = JSON.parse(raw)

            const listings = data.map(mapListing)
            const total = data.length

            return {
            listings,
            total,
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

    // Handlers

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleApply = () => setApplied(filters)

    const handleClear = () => {
        setFilters(EMPTY_FILTERS)
        setApplied(EMPTY_FILTERS)
    }

    // Render

    return (
        <div className="container-content py-8">

            {/* Header */}
            <div className="mb-6">
                <h1>Browse Textbooks</h1>
                <p className="text-gray-500 text-sm">
                    Find the right textbook for your module
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">

                {/* Sidebar filterslet  */}
                <aside className="w-full md:w-56 flex-shrink-0">
                    <div className="card flex flex-col gap-4">

                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">Filters</h3>
                            <button
                                onClick={handleClear}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                clear all
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Faculty
                            </label>
                            <Select
                                name="faculty"
                                value={filters.faculty}
                                onChange={handleFilterChange}
                            >
                                <option value="">Select Faculty</option>
                                <option value="ENG">Engineering</option>
                                <option value="EBIT">EBIT</option>
                                <option value="LAW">Law</option>
                                <option value="HUM">Humanities</option>
                                <option value="MED">Health Sciences</option>
                                <option value="NAT">Natural Sciences</option>
                                <option value="ECO">Economic Sciences</option>
                                <option value="EDU">Education</option>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Module Code
                            </label>
                            <Input
                                name="moduleCode"
                                value={filters.moduleCode}
                                onChange={handleFilterChange}
                                placeholder="e.g. COS301"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Edition
                            </label>
                            <Select
                                name="edition"
                                value={filters.edition}
                                onChange={handleFilterChange}
                            >
                                <option value="">Any Edition</option>
                                {['1st','2nd','3rd','4th','5th',
                                  '6th','7th','8th','9th','10th'].map(e => (
                                    <option key={e} value={e}>{e}</option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Price Range
                            </label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    name="priceMin"
                                    value={filters.priceMin}
                                    onChange={handleFilterChange}
                                    placeholder="R Min"
                                    type="number"
                                />
                                <span className="text-gray-400">–</span>
                                <Input
                                    name="priceMax"
                                    value={filters.priceMax}
                                    onChange={handleFilterChange}
                                    placeholder="R Max"
                                    type="number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
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

                        <div>
                            <label className="block text-xs font-medium mb-1">
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
                            className="btn-primary w-full mt-2"
                        >
                            APPLY FILTERS
                        </button>

                    </div>
                </aside>

                {/* Listing grid*/}
                <main className="flex-1">

                    {/* Result count */}
                    {!loading && (
                        <p className="text-sm text-gray-500 mb-4">
                            {total} result{total !== 1 ? 's' : ''} found
                        </p>
                    )}

                    {loading ? (
                        /* Skeleton grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="card animate-pulse flex flex-col gap-3"
                                >
                                    <div className="h-40 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <svg
                                className="w-12 h-12 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M9.172 16.172a4 4 0 015.656
                                       0M9 10h.01M15 10h.01M21 12a9
                                       9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm">No listings found</p>
                            <button
                                onClick={handleClear}
                                className="mt-3 text-blue-600 text-sm hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {listings.map(listing => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    )}

                </main>

            </div>

        </div>
    )
}
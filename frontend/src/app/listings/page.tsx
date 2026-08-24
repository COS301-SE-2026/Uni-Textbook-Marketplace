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
import { Bookmark, Filter, X } from 'lucide-react'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import Image from 'next/image'

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

const CONDITION_STYLES: Record<string, { readonly selected: string; readonly unselected: string; readonly text: string; readonly border: string }> = {
    new: {
        selected: 'bg-[#2196F3]',
        unselected: 'bg-[#E3F2FD] hover:bg-[#BBDEFB]',
        text: 'text-[#1565C0]',
        border: 'border-[#90CAF9]',
    },
    good: {
        selected: 'bg-[#4CAF50]',
        unselected: 'bg-[#E8F5E9] hover:bg-[#C8E6C9]',
        text: 'text-[#2E7D32]',
        border: 'border-[#A5D6A7]',
    },
    fair: {
        selected: 'bg-[#FF9800]',
        unselected: 'bg-[#FFF3E0] hover:bg-[#FFE0B2]',
        text: 'text-[#E65100]',
        border: 'border-[#FFCC80]',
    },
    poor: {
        selected: 'bg-[#F44336]',
        unselected: 'bg-[#FFEBEE] hover:bg-[#FFCDD2]',
        text: 'text-[#C62828]',
        border: 'border-[#EF9A9A]',
    },
    default: {
        selected: 'bg-[#9E9E9E]',
        unselected: 'bg-[#F5F5F5] hover:bg-[#E0E0E0]',
        text: 'text-[#616161]',
        border: 'border-[#BDBDBD]',
    },
}

// Condition Badge Component
function ConditionBadge({ 
    condition, 
    selected, 
    onClick 
}: { 
    readonly condition: string
    readonly selected: boolean
    readonly onClick: () => void 
}) {
    const getConditionStyles = (cond: string) => {
        const conditionStyles = CONDITION_STYLES[cond] ?? CONDITION_STYLES.default
        return {
            bg: selected ? conditionStyles.selected : conditionStyles.unselected,
            text: selected ? 'text-white' : conditionStyles.text,
            border: selected ? conditionStyles.selected : conditionStyles.border,
        }
    }

    const styles = getConditionStyles(condition)
    const label = condition.charAt(0).toUpperCase() + condition.slice(1)

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                border-2 ${styles.bg} ${styles.text} ${styles.border}
                hover:scale-105 active:scale-95 cursor-pointer
                ${selected ? 'shadow-md' : ''}
            `}
        >
            {label}
        </button>
    )
}

// Page Content
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
            const listings = Array.isArray(response.listings) ? response.listings : []
            const total = typeof response.total === 'number' ? response.total : listings.length

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

    const handleConditionToggle = (condition: string) => {
        setFilters(prev => ({
            ...prev,
            condition: prev.condition === condition ? '' : condition
        }))
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
        if (n === 1) return '1st'
        if (n === 2) return '2nd'
        if (n === 3) return '3rd'
        return `${n}th`
    }

    // Count active filters
    const getActiveFilterCount = () => {
        let count = 0
        if (filters.faculty) count++
        if (filters.moduleCode) count++
        if (filters.edition) count++
        if (filters.priceMin || filters.priceMax) count++
        if (filters.condition) count++
        if (filters.annotationLevel) count++
        return count
    }

    let listingsContent
    if (loading) {
        listingsContent = (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">


                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="card animate-pulse flex flex-col gap-3">
                        <div className="h-40 rounded bg-gray-200" />

                        <div className="h-4 w-3/4 rounded bg-gray-200" />


                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                        <div className="h-4 w-1/4 rounded bg-gray-200" />

                    </div>
                ))}
            </div>
        )
    } else if (listings.length === 0) {
        listingsContent = (
            <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                <svg className="mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-sm">No listings found</p>



                <button
                    type="submit"
                    onClick={handleClear}
                    className="mt-3 text-sm text-[#00B4D8] hover:underline cursor-pointer"
                >
                    Clear filters
                </button>


            </div>
        )
    } else {
        listingsContent = (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map(listing => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        isLiked={likedIds.has(listing.id)}
                    />


                ))}
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <SidebarProvider>

                
                <div className="flex w-full">

                    <Sidebar 
                        side='left' 
                        variant='sidebar' 
                        collapsible='offcanvas'
                        className="border-r top-16 h-[calc(100vh-4rem)]"
                    >
                        <SidebarContent className="p-4">
                            <SidebarGroup>


                                <div className="mb-4 flex items-center justify-between">
                                    <SidebarGroupLabel className="p-0 text-base font-semibold text-foreground flex items-center gap-2">
                                        <Filter size={18} />
                                        Filters
                                        {getActiveFilterCount() > 0 && (
                                            <span className="ml-1 text-xs bg-[#00B4D8] text-white px-2 py-0.5 rounded-full">
                                                {getActiveFilterCount()}
                                            </span>
                                        )}
                                    </SidebarGroupLabel>


                                    <button
                                        type='submit'
                                        onClick={handleClear}
                                        className="text-sm font-medium text-[#00B4D8] hover:text-[#0096B4] transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <X size={14} />
                                        Clear all
                                    </button>

                                    
                                </div>

                                
                                <div className="mb-4">
                                    <label htmlFor="faculty-filter" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Faculty
                                    </label>


                                    <Select
                                        id="faculty-filter"
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

                                
                                <div className="mb-4">


                                    <label htmlFor='moduleCode-filter' className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Module Code
                                    </label>
                                    <Input
                                        id="moduleCode-filter"
                                        name="moduleCode"
                                        value={filters.moduleCode}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. COS301"
                                    />
                                </div>

                                
                                <div className="mb-4">


                                    <label htmlFor='edition-filter' className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Edition
                                    </label>


                                    <Select
                                        id="edition-filter"
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

                                
                                <div className="mb-4">


                                    <label htmlFor="priceMin-filter" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Price Range (R)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="priceMin-filter"
                                            name="priceMin"
                                            value={filters.priceMin}
                                            onChange={handleFilterChange}
                                            placeholder="R (Min)"
                                            type="number"
                                        />
                                        <span className="text-gray-400">–</span>
                                        <Input
                                            id="priceMax-filter"
                                            name="priceMax"
                                            value={filters.priceMax}
                                            onChange={handleFilterChange}
                                            placeholder="R (Max)"
                                            type="number"
                                        />
                                    </div>
                                </div>

                                
                                <div className="mb-4">


                                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Condition
                                    </span>

                                    <div className="flex flex-wrap gap-2">
                                        <ConditionBadge
                                            condition="new"
                                            selected={filters.condition === 'new'}
                                            onClick={() => handleConditionToggle('new')}
                                        />


                                        <ConditionBadge
                                            condition="good"
                                            selected={filters.condition === 'good'}
                                            onClick={() => handleConditionToggle('good')}
                                        />
                                        <ConditionBadge
                                            condition="fair"
                                            selected={filters.condition === 'fair'}
                                            onClick={() => handleConditionToggle('fair')}
                                        />
                                        <ConditionBadge
                                            condition="poor"
                                            selected={filters.condition === 'poor'}
                                            onClick={() => handleConditionToggle('poor')}
                                        />


                                    </div>
                                </div>

                                
                                <div className="mb-4">
                                    <label htmlFor='annotationLevel-filter' className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Annotation Level
                                    </label>
                                    <Select
                                        id="annotationLevel-filter"
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
                                    type='submit'
                                    onClick={handleApply}
                                    className="btn-primary mt-2 w-full cursor-pointer"
                                >
                                    APPLY FILTERS
                                </button>

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <SaveSearchButton
                                        filters={applied}
                                        onSave={() => console.log('Search saved!')}
                                    />
                                </div>
                            </SidebarGroup>


                            
                        </SidebarContent>
                    </Sidebar>

                    <SidebarInset className="flex-1">


                        
                        <div className="relative overflow-hidden h-[180px] md:h-[200px]" style={{
                            background: 'linear-gradient(135deg, #000f2b 0%, #001a3d 30%, #00264a 55%, #004F66 75%, #006D8A 100%)',
                        }}>
                            
                            <div className="absolute inset-0 right-0 w-full md:w-3/5 lg:w-1/2 ml-auto">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/../boy_on_book.png"
                                        alt="Student reading textbook"
                                        fill
                                        className="object-contain object-right"
                                        priority
                                        style={{ objectPosition: '100% 50%' }}
                                    />
                                    
                                    <div className="absolute inset-0" style={{
                                        background: 'linear-gradient(90deg, rgba(0,15,43,0.9) 0%, rgba(0,26,61,0.6) 30%, rgba(0,38,74,0.3) 50%, transparent 70%)',
                                    }} />
                                </div>
                            </div>
                            
                            
                            <div className="absolute inset-0 opacity-20" style={{
                                background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                            }} />
                            
                            
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 180, 216, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0, 180, 216, 0.15) 0%, transparent 50%)',
                            }} />
                            
                            
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }} />
                            
                            
                            <div className="absolute top-0 left-0 right-0 h-px" style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                            }} />
                            
                            <div className="relative z-10 px-6 py-4 md:px-8 lg:px-12 h-full flex flex-col justify-center">
                                <div className="flex items-start gap-4">



                                    <SidebarTrigger className="text-white hover:text-[#00B4D8] transition-colors cursor-pointer" />
                                    <div>
                                        <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg">
                                            Browse Textbooks
                                        </h1>
                                        <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow-md">
                                            Find the right textbook for your module
                                        </p>
                                    </div>
                                </div>

                                
                                <div className="mt-3 max-w-2xl relative">

                                    <SearchBar
                                        onSearch={searchApplicte}
                                        initialQuery={filters.search}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            
                            
                            <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                                background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.3), transparent)',
                            }} />
                        </div>

                        <div className="py-6 px-6 md:px-8 lg:px-12">

                            
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                                <div className="flex items-center gap-3">
                                    {!loading && (
                                        <p className="text-sm text-gray-500">
                                            Showing <span className="font-semibold text-gray-700">{total}</span> result{total !== 1 ? 's' : ''} found
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">

                                    
                                    <Link
                                        href="/saved-searches"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#00B4D8] border border-[#00B4D8] rounded-lg hover:bg-[#00B4D8] hover:text-white transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-[#00B4D8]/20"
                                    >
                                        <Bookmark size={16} />
                                        Saved Searches
                                    </Link>
                                </div>

                            </div>

                            <main className="flex-1">
                                {listingsContent}
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
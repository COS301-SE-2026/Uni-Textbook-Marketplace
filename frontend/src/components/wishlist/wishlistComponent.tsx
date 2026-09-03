'use client'

import ListingCard, { Listing } from "@/components/listings/listingCard";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

//filters LISTTABS
type Tab = 'ALL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'WITHDRAWN'

const LISTTABS: { label: string; value: Tab }[] = [
    { label: 'ALL', value: 'ALL' },
    { label: 'Available', value: 'AVAILABLE' },


    { label: 'Reserved', value: 'RESERVED' },
    { label: 'Sold', value: 'SOLD' },
    { label: 'Withdrawn', value: 'WITHDRAWN' },
]

export default function WishlistComponent() {

    const [loading, setLoading] = useState(true)


    const [listings, setListings] = useState<Listing[]>([])

    const [listactiveTab, setlistactiveTab] = useState<Tab>('ALL')

    const [wishlistVersion, setWishlistVersion] = useState(0);

    useEffect(() => {
        const handleWishlistChanged = () => {
            setWishlistVersion(prev => prev + 1)
        }

        window.addEventListener('wishlist:changed', handleWishlistChanged)

        return () => {
            window.removeEventListener('wishlist:changed', handleWishlistChanged)
        }
    }, [])

    useEffect(() => {

        const fetchMywishlist = async () => {


            setLoading(true)

            try {
                const data = await api.get<Listing[]>('/wishlist/mywishlist')
                console.log(Array.isArray(data));

                setListings(data)

            } catch (err) {
                console.error('Failed to load wishlists', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMywishlist()
    }, [wishlistVersion]);

    const safelisting = Array.isArray(listings) ? listings : [];
    
    const filters = listactiveTab == 'ALL' ? safelisting : safelisting.filter(lis => lis.listing_status === listactiveTab)

    const listnum: Record<Tab, number> = {
        ALL: safelisting.length,
        AVAILABLE: safelisting.filter(lis => lis.listing_status === 'AVAILABLE').length,
        RESERVED: safelisting.filter(lis => lis.listing_status === 'RESERVED').length,
        SOLD: safelisting.filter(lis => lis.listing_status === 'SOLD').length,
        WITHDRAWN: safelisting.filter(lis => lis.listing_status === 'WITHDRAWN').length,
    }

    return (
        <>
            
            <div className="relative overflow-hidden h-[180px] md:h-[200px] w-full" style={{
                background: 'linear-gradient(135deg, #000f2b 0%, #001a3d 30%, #00264a 55%, #004F66 75%, #006D8A 100%)',
                
            }}>
                
                <div className="absolute inset-0 right-0 w-full md:w-3/5 lg:w-1/2 ml-auto">


                    <div className="relative w-full h-full">
                        <Image
                            src="/../../wishlist_books.png"
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
                
                <div className="relative z-10 px-6 py-4 md:px-8 lg:px-12 h-full flex flex-col justify-center max-w-7xl mx-auto w-full">
                    <div className="flex items-start gap-4">


                        <div className="p-2 rounded-xl" style={{
                            background: 'rgba(255,255,255,0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <Heart size={24} className="text-[#00B4D8] fill-[#00B4D8]" />
                        </div>


                        <div>
                            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-lg">
                                My Wishlist
                            </h1>

                            <p className="text-white/80 text-xs md:text-sm mt-0.5 drop-shadow-md">
                                Keep up to date with your favourite listings
                            </p>


                        </div>

                    </div>
                </div>
                
                
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.3), transparent)',
                }} />
            </div>

            
            <div className="container-content py-8">

                {/* LISTTABS */}
                <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                    {LISTTABS.map(tab => (
                        <button
                            type="button"
                            key={tab.value}
                            onClick={() => setlistactiveTab(tab.value)}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                                listactiveTab === tab.value
                                    ? 'border-[#00B4D8] text-[#00B4D8]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >

                            {tab.label}
                            {listnum[tab.value] > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                                    listactiveTab === tab.value
                                        ? 'bg-[#00B4D8] text-white'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {listnum[tab.value]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card animate-pulse flex flex-col gap-3">
                                <div className="h-40 bg-gray-200 rounded" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filters.length === 0 && (
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2
                                   2v7m16 0v5a2 2 0 01-2 2H6a2 2 0
                                   01-2-2v-5m16 0h-2.586a1 1 0
                                   00-.707.293l-2.414 2.414a1 1 0
                                   01-.707.293h-3.172a1 1 0
                                   01-.707-.293l-2.414-2.414A1 1 0
                                   006.586 13H4"
                            />
                        </svg>
                        <p className="text-sm">
                            {listactiveTab === 'ALL'
                                ? "You do not have favourites yet."
                                : `No ${listactiveTab.toLowerCase()} listings.`}
                        </p>
                        {listactiveTab === 'ALL' && (
                            <Link href="/listings">


                                <button className="btn-primary mt-4" type="button">
                                    Browse our listings to find your favourite listing
                                </button>


                            </Link>
                        )}
                    </div>
                )}

                {!loading && filters.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map(listing => (
                            <div key={listing.id} className="relative group">


                                <ListingCard listing={listing} showStatus={false} isLiked={true} />
                            </div>
                            
                            
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
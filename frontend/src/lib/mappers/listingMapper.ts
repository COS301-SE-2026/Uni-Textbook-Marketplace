import { Listing } from '@/components/listings/listingCard'

export function mapListing(apiListing: any): Listing {
    return {
        id: apiListing.id,

        title: apiListing.title || apiListing.book?.title || '',

        price: Number(apiListing.price),

        condition: apiListing.condition,

        annotation_level: apiListing.annotation_level,

        status: apiListing.status,

        listing_status: apiListing.listing_status,

        photo_urls: apiListing.photo_urls || [],

        created_at: apiListing.created_at,

        description: apiListing.description,

        book: {
            edition: apiListing.book?.edition || 0,
            author: apiListing.book?.author || '',
            isbn: apiListing.book?.isbn || '',
            title: apiListing.book?.title || '',
            publisher: apiListing.book?.publiser || '',
        },

        module: {
            code: apiListing.module?.code || '',
            faculty: apiListing.module?.faculty || '',
            name: apiListing.module?.name || '',
            semester: apiListing.module?.semester || '',
        },

        seller: apiListing.seller
            ? {
                first_name: apiListing.seller.first_name,
                last_name: apiListing.seller.last_name,
                is_verified: apiListing.seller.is_verified,
                university: {
                    name: apiListing.university?.name || '',
                },
            }
            : undefined,
    }
}
import { Listing } from '@/components/listings/listingCard'

export function mapListing(api: any): Listing {
    return {
        id: api.id,
        title: api.title,

        price: Number(api.price),

        condition: api.condition,
        annotation_level: api.annotation_level,
        status: api.status,

        photo_urls: api.photo_urls ?? [],

        created_at: api.created_at,

        book: {
        edition: api.book?.edition,
        author: api.book?.author,
        isbn: api.book?.isbn,
        title: api.book?.title,
        },

        module: {
        code: api.module?.code,
        faculty: api.module?.faculty,
        },

        seller: api.seller
        ? {
            first_name: api.seller.first_name,
            last_name: api.seller.last_name,
            is_verified: api.seller.is_verified,
            }
        : undefined,
    }
}
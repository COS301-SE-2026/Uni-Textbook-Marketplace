import { BundleResult } from '@/types/bundles';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function optimizeBundle(
    moduleIds: string[],
    ): Promise<BundleResult> {
    const response = await fetch(`${API_URL}/bundles/optimize`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ moduleIds }),
    });

    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(
        message || `Bundle optimizer failed (${response.status})`,
        );
    }

    const data = await response.json();

    return {
        recommended: {
        sellerGroups: buildSellerGroups(data.optimizedBundle?.listings ?? []),
        totalPrice: Number(data.optimizedBundle?.totalPrice ?? 0),
        sellerCount: data.optimizedBundle?.sellerIds?.length ?? 0,
        meetupCount: data.optimizedBundle?.sellerIds?.length ?? 0,
        },
        naive: {
        totalPrice: Number(data.cheapestIndividualOption?.totalPrice ?? 0),
        sellerCount:
            data.cheapestIndividualOption?.sellerIds?.length ?? 0,
        },
    };
    }

function buildSellerGroups(listings: any[]) {
    const groups = new Map<string, any>();

    for (const listing of listings) {
        const sellerId = listing.seller?.id ?? listing.sellerId;
        const sellerName =
        listing.seller?.first_name && listing.seller?.last_name
            ? `${listing.seller.first_name} ${listing.seller.last_name}`
            : listing.seller?.first_name ??
            listing.sellerName ??
            'Seller';

        if (!groups.has(sellerId)) {
        groups.set(sellerId, {
            sellerId,
            sellerName,
            listings: [],
            booksCovered: 0,
            subtotal: 0,
        });
        }

        const group = groups.get(sellerId);

        group.listings.push({
        id: listing.id,
        title: listing.title ?? listing.book?.title ?? 'Book',
        price: Number(listing.price),
        sellerId,
        sellerName,
        });

        group.booksCovered += 1;
        group.subtotal += Number(listing.price);
    }

    return [...groups.values()];
}
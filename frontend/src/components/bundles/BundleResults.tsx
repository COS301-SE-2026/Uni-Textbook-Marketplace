'use client';

import Card from '@/components/ui/Card';
import { BundleResult } from '@/types/bundles';

interface BundleResultsProps {
  result: BundleResult;
}

const money = (value: number) => `R${Number(value).toFixed(2)}`;

export default function BundleResults({ result }: BundleResultsProps) {
    const savings =
        Number(result.naive.totalPrice) -
        Number(result.recommended.totalPrice);

    return (
        <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="text-sm text-cyan-200">
                Recommended total
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
                {money(result.recommended.totalPrice)}
            </p>
            </Card>

            <Card className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
                Sellers
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
                {result.recommended.sellerCount}
            </p>
            </Card>

            <Card className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
                Meetups
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
                {result.recommended.meetupCount}
            </p>
            </Card>
        </div>

        {savings > 0 && (
            <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-300">
                Bundle optimisation
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
                Save {money(savings)}
            </p>

            <p className="mt-1 text-sm text-emerald-200/80">
                compared with buying the cheapest listing for every
                book independently.
            </p>
            </Card>
        )}

        <div>
            <h2 className="mb-4 text-xl font-bold text-white">
            Recommended bundle
            </h2>

            <div className="space-y-4">
            {result.recommended.sellerGroups.map((group) => (
                <Card
                key={group.sellerId}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
                >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                    <h3 className="font-semibold text-white">
                        {group.sellerName}
                    </h3>

                    <p className="text-sm text-slate-400">
                        {group.booksCovered} book
                        {group.booksCovered === 1 ? '' : 's'} covered
                    </p>
                    </div>

                    <div className="text-lg font-bold text-cyan-300">
                    {money(group.subtotal)}
                    </div>
                </div>

                <div className="mt-4 divide-y divide-slate-800">
                    {group.listings.map((listing) => (
                    <div
                        key={listing.id}
                        className="flex items-center justify-between gap-4 py-3"
                    >
                        <span className="text-sm text-slate-300">
                        {listing.title}
                        </span>

                        <span className="text-sm font-medium text-white">
                        {money(listing.price)}
                        </span>
                    </div>
                    ))}
                </div>
                </Card>
            ))}
            </div>
        </div>

        <Card className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <h2 className="text-lg font-bold text-white">
            Cheapest-per-book comparison
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
                <p className="text-sm text-slate-400">
                Naive total
                </p>

                <p className="text-xl font-bold text-white">
                {money(result.naive.totalPrice)}
                </p>
            </div>

            <div>
                <p className="text-sm text-slate-400">
                Sellers required
                </p>

                <p className="text-xl font-bold text-white">
                {result.naive.sellerCount}
                </p>
            </div>
            </div>
        </Card>
        </div>
    );
}
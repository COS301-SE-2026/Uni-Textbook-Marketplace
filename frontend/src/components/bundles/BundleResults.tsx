'use client';

import Card from '@/components/ui/Card';
import { BundleResult } from '@/types/bundles';
import { createConversation, sendMessage, } from '@/lib/messaging.api';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
            <Card className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
            <p className="text-sm text-muted-foreground">
                Recommended total
            </p>

            <p className="mt-1 text-3xl font-bold text-foreground">
                {money(result.recommended.totalPrice)}
            </p>
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
                Sellers
            </p>

            <p className="mt-1 text-3xl font-bold text-foreground">
                {result.recommended.sellerCount}
            </p>
            </Card>

            <Card className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
                Meetups
            </p>

            <p className="mt-1 text-3xl font-bold text-foreground">
                {result.recommended.meetupCount}
            </p>
            </Card>
        </div>

        {savings > 0 && (
            <Card className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Bundle optimisation
            </p>

            <p className="mt-1 text-2xl font-bold text-foreground">
                Save {money(savings)}
            </p>

            <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
                compared with buying the cheapest listing for every
                book independently.
            </p>
            </Card>
        )}

        <div>
            <h2 className="mb-4 text-xl font-bold text-foreground normal-case">
            Recommended bundle
            </h2>

            <div className="space-y-4">
            {result.recommended.sellerGroups.map((group) => (
                <Card
                key={group.sellerId}
                className="rounded-2xl border border-border bg-card p-5"
                >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <div>
                    <h3 className="font-semibold text-foreground">
                        {group.sellerName}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        {group.booksCovered} book
                        {group.booksCovered === 1 ? '' : 's'} covered
                    </p>
                    </div>

                    <div className="text-lg font-bold text-primary">
                    {money(group.subtotal)}
                    </div>
                </div>

                <div className="mt-4 divide-y divide-border">
                    {group.listings.map((listing) => (
                    <div
                        key={listing.id}
                        className="flex items-center justify-between gap-4 py-3"
                    >
                        <span className="text-sm text-foreground">
                        {listing.title}
                        </span>

                        <span className="text-sm font-medium text-foreground">
                        {money(listing.price)}
                        </span>
                    </div>
                    ))}
                </div>
                </Card>
            ))}
            </div>
        </div>

        <Card className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold text-foreground normal-case">
            Cheapest-per-book comparison
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
                <p className="text-sm text-muted-foreground">
                Naive total
                </p>

                <p className="text-xl font-bold text-foreground">
                {money(result.naive.totalPrice)}
                </p>
            </div>

            <div>
                <p className="text-sm text-muted-foreground">
                Sellers required
                </p>

                <p className="text-xl font-bold text-foreground">
                {result.naive.sellerCount}
                </p>
            </div>
            </div>
        </Card>
        </div>
    );
}
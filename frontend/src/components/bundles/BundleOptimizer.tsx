'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ModulePicker from './ModulePicker';
import BundleResults from './BundleResults';
import { optimizeBundle } from '@/lib/bundles.api';
import { BundleModule, BundleResult } from '@/types/bundles';

export default function BundleOptimizer() {
    const [selectedModules, setSelectedModules] = useState<
        BundleModule[]
    >([]);

    const [result, setResult] = useState<BundleResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleOptimize = async () => {
        if (selectedModules.length === 0) {
        setError('Select at least one module.');
        return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
        const response = await optimizeBundle(
            selectedModules.map((module) => module.id),
        );

        setResult(response);
        } catch (err) {
        setError(
            err instanceof Error
            ? err.message
            : 'Unable to optimise this bundle.',
        );
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8">
        <Card className="rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl md:p-8">
            <div className="mb-8">
            <div className="mb-3 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                Smart Bundle Optimizer
            </div>

            <h1 className="text-3xl font-bold text-white md:text-4xl">
                Find the best way to buy your books
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
                Select your modules and we&apos;ll find a combination
                of sellers that covers your books while keeping the
                overall cost and number of meetups low.
            </p>
            </div>

            <ModulePicker
            selectedModules={selectedModules}
            onChange={setSelectedModules}
            />

            {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
            </div>
            )}

            <Button
            type="button"
            variant="primary"
            onClick={handleOptimize}
            disabled={loading || selectedModules.length === 0}
            className="mt-6 w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
            {loading ? 'Finding the best bundle...' : 'Find Best Deal'}
            </Button>
        </Card>

        {result && <BundleResults result={result} />}
        </div>
    );
}
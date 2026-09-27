'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import { BundleModule } from '@/types/bundles';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    interface ModulePickerProps {
    selectedModules: BundleModule[];
    onChange: (modules: BundleModule[]) => void;
    }

    export default function ModulePicker({
    selectedModules,
    onChange,
    }: ModulePickerProps) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<BundleModule[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!search.trim()) {
        setResults([]);
        return;
        }

        const controller = new AbortController();

        const searchModules = async () => {
        setLoading(true);

        try {
            const response = await fetch(
            `${API_URL}/modules?search=${encodeURIComponent(search)}`,
            {
                credentials: 'include',
                signal: controller.signal,
            },
            );

            if (!response.ok) {
            throw new Error('Failed to search modules');
            }

            const data = await response.json();

            setResults(Array.isArray(data) ? data : data.modules ?? []);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
            setResults([]);
            }
        } finally {
            setLoading(false);
        }
        };

        const timeout = setTimeout(searchModules, 250);

        return () => {
        clearTimeout(timeout);
        controller.abort();
        };
    }, [search]);

    const addModule = (module: BundleModule) => {
        if (selectedModules.some((item) => item.id === module.id)) {
        return;
        }

        onChange([...selectedModules, module]);
        setSearch('');
        setResults([]);
    };

    const removeModule = (id: string) => {
        onChange(selectedModules.filter((module) => module.id !== id));
    };

    return (
        <div className="space-y-4">
        <div className="relative">
            <Input
            id="bundle-module-search"
            label="Modules"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules e.g. COS212..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            {search.trim() && (
            <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
                {loading && (
                <div className="px-4 py-3 text-sm text-slate-400">
                    Searching...
                </div>
                )}

                {!loading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-400">
                    No modules found.
                </div>
                )}

                {!loading &&
                results.map((module) => {
                    const alreadySelected = selectedModules.some(
                    (item) => item.id === module.id,
                    );

                    return (
                    <button
                        key={module.id}
                        type="button"
                        disabled={alreadySelected}
                        onClick={() => addModule(module)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <div>
                        <div className="font-semibold text-white">
                            {module.code}
                        </div>

                        <div className="text-sm text-slate-400">
                            {module.name}
                        </div>
                        </div>

                        {alreadySelected && (
                        <span className="text-xs text-cyan-400">
                            Selected
                        </span>
                        )}
                    </button>
                    );
                })}
            </div>
            )}
        </div>

        {selectedModules.length > 0 && (
            <div className="flex flex-wrap gap-2">
            {selectedModules.map((module) => (
                <div
                key={module.id}
                className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200"
                >
                <span className="font-semibold">{module.code}</span>

                <button
                    type="button"
                    onClick={() => removeModule(module.id)}
                    className="text-cyan-300 transition hover:text-white"
                    aria-label={`Remove ${module.code}`}
                >
                    ×
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
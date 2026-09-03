'use client'

type FilterValue = 'ALL' | 'PENDING' | 'UPHELD' | 'REVERSED'

interface CasesFiltersProps {
    activeFilter: FilterValue
    counts: Record<FilterValue, number>
    onChange: (filter: FilterValue) => void
}

const FILTER_TABS: Readonly<{ value: FilterValue; label: string }[]> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Upheld', value: 'UPHELD' },
    { label: 'Reversed', value: 'REVERSED' },
]

export default function CasesFilters({ activeFilter, counts, onChange }: CasesFiltersProps) {
    return (
        <div className="flex gap-2 border-b border-gray-200 my-6 overflow-x-auto">
            {FILTER_TABS.map(tab => (
                <button
                    type="button"
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeFilter === tab.value
                            ? 'border-[#00B4D8] text-[#00B4D8]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    {tab.label}
                    {counts[tab.value] > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                            activeFilter === tab.value
                                ? 'bg-[#00B4D8]/10 text-[#00B4D8]'
                                : 'bg-gray-100 text-gray-500'
                        }`}>
                            {counts[tab.value]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
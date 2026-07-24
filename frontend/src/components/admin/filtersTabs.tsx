
type FilterValue = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

interface FilterTabsProps {
    activeFilter: FilterValue
    counts: Record<FilterValue, number>
    onChange: (filter: FilterValue) => void
}

const FILTER_TABS: Readonly<{ value: FilterValue; label: string }[]> = [
    {label: 'All', value: 'ALL'},
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
]

export default function FilterTab({ activeFilter, counts, onChange }: FilterTabsProps) {

    return (
        <div className="flex gap-2 border-b border-gray-200 my-6 overflow-x-auto">
            {FILTER_TABS.map(tab => (
                <button
                    key={tab.value}
                    onClick={() => onChange(tab.value)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeFilter === tab.value
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {tab.label}
                    {counts[tab.value] > 0 && (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${activeFilter === tab.value
                            ? 'bg-blue-100 text-blue-700'
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
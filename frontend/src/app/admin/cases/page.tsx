'use client'

import { useCallback, useEffect, useState } from 'react'
import { Shield, Loader2, FileText } from 'lucide-react'
import AdminRoute from '@/components/auth/AdminRoute'
import Card from '@/components/ui/Card'
import CasesTable, { AdminCase } from '@/components/admin/casesTable'
import CasesFilters from '@/components/admin/casesFilters'
import CaseDecisionModal from '@/components/admin/caseDecisionModal'
import { getAdminCases, reviewCase, CaseFilter } from '@/lib/admin.api'

type FilterValue = 'ALL' | 'PENDING' | 'UPHELD' | 'REVERSED'

interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

function ToastList({ toasts }: { readonly toasts: readonly Toast[] }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`px-4 py-2.5 rounded-xl text-white text-sm shadow-lg animate-in slide-in-from-right-5 backdrop-blur-sm ${
                        t.type === 'success'
                            ? 'bg-green-600/90 border border-green-400/30'
                            : 'bg-red-600/90 border border-red-400/30'
                    }`}
                >
                    {t.message}
                </div>
            ))}
        </div>
    )
}

function useToasts() {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: Toast['type']) => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }, [])

    return { toasts, showToast }
}

export default function AdminCasesDashboard() {
    const { toasts, showToast } = useToasts()
    const [cases, setCases] = useState<AdminCase[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState<FilterValue>('PENDING')
    const [selectedCase, setSelectedCase] = useState<AdminCase | undefined>()
    const [isModalOpen, setIsModalOpen] = useState(false)

    
    useEffect(() => {
        const fetchCases = async () => {
            setLoading(true)
            try {
                const response = await getAdminCases({ page: 1, limit: 100 })
                setCases(response.data)
            } catch {
                showToast('Failed to load cases', 'error')
            } finally {
                setLoading(false)
            }
        }
        fetchCases()
    }, [showToast])

    
    const handleReview = (caseId: string) => {
        const caseItem = cases.find(c => c.id === caseId)
        if (caseItem) {
            setSelectedCase(caseItem)
            setIsModalOpen(true)
        }
    }

    
    const handleDecision = async (decision: 'upheld' | 'reversed', adminNotes: string) => {
        if (!selectedCase) return

        setActionLoading(selectedCase.id)
        try {
            const updated = await reviewCase(selectedCase.id, decision, adminNotes)
            
            
            setCases(prev => prev.map(c => 
                c.id === updated.id ? updated : c
            ))
            
            showToast(
                decision === 'upheld' 
                    ? 'Ban upheld successfully' 
                    : 'User reinstated successfully',
                'success'
            )
        } catch {
            showToast('Failed to review case', 'error')
        } finally {
            setActionLoading(null)
            setIsModalOpen(false)
            setSelectedCase(undefined)
        }
    }

   
    const counts: Record<FilterValue, number> = {
        ALL: cases.length,
        PENDING: cases.filter(c => c.status === 'pending').length,
        UPHELD: cases.filter(c => c.status === 'upheld').length,
        REVERSED: cases.filter(c => c.status === 'reversed').length,
    }

    const filteredCases = cases.filter(c => {
        if (activeFilter === 'ALL') return true
        return c.status === activeFilter.toLowerCase()
    })

    return (
        <AdminRoute>
            {/* Hero Section */}
            <div className="relative overflow-hidden w-full" style={{
                background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #d5e0ea 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 20px rgba(0,0,0,0.05)',
            }}>
                <div className="absolute inset-0 opacity-30" style={{
                    background: 'radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(0,180,216,0.05) 0%, transparent 50%)',
                }} />
                <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
                <div className="absolute top-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                }} />
                
                <div className="relative z-10 px-6 py-8 md:px-8 lg:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl" style={{
                            background: 'rgba(0, 180, 216, 0.08)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 180, 216, 0.1)',
                        }}>
                            <Shield size={28} className="text-[#00B4D8]" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#000f2b] tracking-tight">
                                Appeal Cases
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base mt-0.5">
                                Review and manage user appeal cases
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,180,216,0.15), transparent)',
                }} />
            </div>

            <div className="container-content py-6">
                <ToastList toasts={toasts} />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <p className="text-sm text-gray-500">Total Cases</p>
                        <p className="text-2xl font-bold text-[#000f2b]">{counts.ALL}</p>
                    </Card>
                    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-amber-400">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">{counts.PENDING}</p>
                    </Card>
                    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-red-400">
                        <p className="text-sm text-gray-500">Upheld</p>
                        <p className="text-2xl font-bold text-red-600">{counts.UPHELD}</p>
                    </Card>
                    <Card className="p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-green-400">
                        <p className="text-sm text-gray-500">Reversed</p>
                        <p className="text-2xl font-bold text-green-600">{counts.REVERSED}</p>
                    </Card>
                </div>

                {/* Filters */}
                <CasesFilters
                    activeFilter={activeFilter}
                    counts={counts}
                    onChange={setActiveFilter}
                />

                {/* Table */}
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 p-0">
                    <CasesTable
                        cases={filteredCases}
                        loading={loading}
                        actionLoading={actionLoading}
                        onReview={handleReview}
                    />
                </Card>

                {/* Decision Modal */}
                <CaseDecisionModal
                    caseItem={selectedCase}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedCase(undefined)
                    }}
                    onConfirm={handleDecision}
                    loading={!!actionLoading}
                />
            </div>
        </AdminRoute>
    )
}
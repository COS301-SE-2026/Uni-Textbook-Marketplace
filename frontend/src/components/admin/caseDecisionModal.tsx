'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { AdminCase } from './casesTable'

interface CaseDecisionModalProps {
    caseItem: AdminCase | undefined
    isOpen: boolean
    onClose: () => void
    onConfirm: (decision: 'upheld' | 'reversed', notes: string) => void
    loading: boolean
}

export default function CaseDecisionModal({
    caseItem,
    isOpen,
    onClose,
    onConfirm,
    loading,
}: CaseDecisionModalProps) {
    const [decision, setDecision] = useState<'upheld' | 'reversed'>('upheld')
    const [adminNotes, setAdminNotes] = useState('')

    const handleConfirm = () => {
        onConfirm(decision, adminNotes)
    }

    const handleClose = () => {
        setDecision('upheld')
        setAdminNotes('')
        onClose()
    }

    if (!caseItem) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Review Appeal Case">
            <div className="flex flex-col gap-4">
                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700">User</p>
                    <p className="text-sm text-gray-900">
                        {caseItem.user.first_name} {caseItem.user.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{caseItem.user.email}</p>
                </div>

                {/* Appeal Message */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700">Appeal Message</p>
                    <p className="text-sm text-gray-600 mt-1">
                        {caseItem.appeal_message || 'No message provided'}
                    </p>
                </div>

                {/* Ban Reason */}
                {caseItem.user.ban_reason && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                        <p className="text-sm font-medium text-red-700">Ban Reason</p>
                        <p className="text-sm text-red-600 mt-1">
                            {caseItem.user.ban_reason}
                        </p>
                    </div>
                )}

                {/* Decision Selection */}
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">Decision</p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setDecision('upheld')}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                decision === 'upheld'
                                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Uphold Ban
                        </button>
                        <button
                            type="button"
                            onClick={() => setDecision('reversed')}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                decision === 'reversed'
                                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Reinstate User
                        </button>
                    </div>
                </div>

                {/* Admin Notes */}
                <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                        Admin Notes (optional)
                    </label>
                    <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8] transition-all"
                        rows={3}
                        placeholder="Add notes about this decision..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant={decision === 'upheld' ? 'danger' : 'primary'}
                        onClick={handleConfirm}
                        disabled={loading}
                        className="cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : decision === 'upheld' ? (
                            'Uphold Ban'
                        ) : (
                            'Reinstate User'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
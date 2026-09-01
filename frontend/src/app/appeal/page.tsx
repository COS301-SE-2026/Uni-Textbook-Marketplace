'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { AlertCircle, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AppealCase {
    id: string
    status: 'pending' | 'upheld' | 'reversed'
    appeal_message: string | null
    created_at: string
}

export default function AppealPage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const [appealMessage, setAppealMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingCase, setExistingCase] = useState<AppealCase | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    
    const isBanned = user?.is_banned === true

    
    useEffect(() => {
        const checkExistingAppeal = async () => {
            if (!user) return

            try {
                const response = await api.get('/cases/mine')
                let cases: AppealCase[] = []
                
                
                if (Array.isArray(response)) {
                    cases = response
                } else if (response && typeof response === 'object' && 'data' in response) {
                    cases = (response as any).data || []
                }
                
                if (cases.length > 0) {
                    const sortedCases = cases.sort((a, b) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    )
                    setExistingCase(sortedCases[0])
                }
            } catch (err) {
                console.error('Failed to check existing appeal:', err)
            } finally {
                setLoading(false)
            }
        }

        if (user) {
            checkExistingAppeal()
        } else if (!isLoading) {
            router.push('/auth/login')
        }
    }, [user, isLoading, router])

    
    // redirect the user if they're NOT banned
    
    useEffect(() => {
        if (user && !isBanned && !isLoading) {
            router.push('/listings')
        }
    }, [user, isLoading, router, isBanned])

    
    const handleSubmitAppeal = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            await api.post('/cases', {
                appeal_message: appealMessage
            })
            setSuccess(true)
            setAppealMessage('')
            
           
            try {
                const response = await api.get('/cases/mine')
                let cases: AppealCase[] = []
                if (Array.isArray(response)) {
                    cases = response
                } else if (response && typeof response === 'object' && 'data' in response) {
                    cases = (response as any).data || []
                }
                if (cases.length > 0) {
                    setExistingCase(cases[0])
                }
            } catch (err) {
                console.error('Failed to refresh case:', err)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit appeal. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        router.push('/auth/login')
    }

    
    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#00B4D8] animate-spin" />
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        )
    }

   
    if (user && !isBanned) {
        return null
    }

    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8">
                {/* Header */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-[#00B4D8]" />
                        <span className="text-lg font-bold text-[#000f2b]">Uni Textbook Marketplace</span>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#000f2b]">Account Banned</h1>
                    <p className="text-gray-600 text-sm mt-1">
                        Your account has been banned. You may submit an appeal to have it reviewed.
                    </p>
                </div>

                {/* Success Message */}
                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700 text-sm">
                            ✅ Your appeal has been submitted successfully! 
                            An admin will review it and notify you of the decision.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitAppeal}>
                        {/* Appeal Message Textarea */}
                        <div className="mb-4">
                            <label htmlFor="appeal_message" className="block text-sm font-medium text-gray-700 mb-1">
                                Appeal Message
                            </label>
                            <textarea
                                id="appeal_message"
                                value={appealMessage}
                                onChange={(e) => setAppealMessage(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B4D8] focus:border-[#00B4D8] outline-none transition-colors resize-none"
                                placeholder="Please explain why you believe the ban should be reviewed..."
                                required
                                minLength={10}
                                maxLength={5000}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                {appealMessage.length}/5000 characters (minimum 10)
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={isSubmitting || appealMessage.length < 10}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Appeal'
                            )}
                        </Button>

                        {/* Log Out Button */}
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full mt-3"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    )
}
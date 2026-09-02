'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { AlertCircle, CheckCircle, Loader2, BookOpen, Shield, FileText, Clock } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AppealCase {
    id: string
    status: 'pending' | 'upheld' | 'reversed'
    appeal_message: string | null
    created_at: string
}


const fetchAppealCases = async (): Promise<AppealCase[]> => {
    try {
        const response = await api.get('/cases/mine')
        let cases: AppealCase[] = []
        
        if (Array.isArray(response)) {
            cases = response
        } else if (response && typeof response === 'object' && 'data' in response) {
            cases = (response as any).data || []
        }
        
        return cases
    } catch (err) {
        console.error('Failed to fetch appeal cases:', err)
        return []
    }
}

const getLatestAppealCase = (cases: AppealCase[]): AppealCase | null => {
    if (cases.length === 0) return null
    return cases.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
}


interface AppealHeaderProps {
    icon: React.ReactNode
    title: string
    subtitle: string
    description: string
    color?: 'yellow' | 'red' | 'green'
    iconBgColor?: string
}

const AppealHeader: React.FC<AppealHeaderProps> = ({ 
    icon, 
    title, 
    subtitle, 
    description,
    color = 'red'
}) => {
    const getColorClasses = () => {
        switch(color) {
            case 'yellow': return 'bg-yellow-100 text-yellow-600'
            case 'green': return 'bg-green-100 text-green-600'
            default: return 'bg-red-100 text-red-600'
        }
    }

    return (
        <div 
            className="w-full relative overflow-hidden px-6 py-10 flex flex-col items-center justify-center"
            style={{
                background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
        >
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)',
            }} />
            <div className="absolute inset-0 pointer-events-none" style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 255, 255, 0.1) 100px, rgba(255, 255, 255, 0.1) 102px)',
            }} />
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10" style={{
                background: `radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent 70%)`,
                filter: 'blur(40px)',
            }} />

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    {icon}
                </div>
                <h2 className="text-center font-bold" style={{ fontSize: "1.25rem", color: '#1a1a2e', textShadow: '0 2px 20px rgba(0, 0, 0, 0.08)' }}>
                    {title}
                </h2>
                <h2 className="text-center font-bold mb-1" style={{ fontSize: "1.25rem", color: '#EF4444', textShadow: '0 2px 20px rgba(239, 68, 68, 0.2)' }}>
                    {subtitle}
                </h2>
                <div className="relative w-16 h-px my-2">
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.4), transparent)' }} />
                </div>
                <p className="text-center text-[#4B4F58]/80 text-sm">
                    {description}
                </p>
            </div>
        </div>
    )
}

interface AppealContentProps {
    children: React.ReactNode
}

const AppealContent: React.FC<AppealContentProps> = ({ children }) => {
    return (
        <div className="w-full px-6 py-8 relative" style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(5px)',
        }}>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

// Extracted Status Components
const AppealPending: React.FC<{ caseData: AppealCase; onLogout: () => void }> = ({ caseData, onLogout }) => (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="card max-w-md w-full p-0 shadow-2xl overflow-hidden">
            <AppealHeader 
                icon={<Clock className="w-10 h-10 text-yellow-600" />}
                title="APPEAL PENDING"
                subtitle="REVIEW"
                description="Your appeal is being reviewed by an admin."
                color="yellow"
            />
            <AppealContent>
                <p className="text-[#4B4F58]/80 text-sm mb-6">
                    Your appeal has been submitted and is currently awaiting admin review.
                    You will be notified once a decision has been made.
                </p>
                
                {caseData.appeal_message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200/50">
                        <p className="text-xs font-medium text-[#4B4F58]/60 uppercase tracking-wider mb-1">Your Appeal:</p>
                        <p className="text-sm text-[#1a1a2e]">{caseData.appeal_message}</p>
                        <p className="text-xs text-[#4B4F58]/40 mt-2">
                            Submitted: {new Date(caseData.created_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}

                <Button variant="secondary" onClick={onLogout} className="w-full">
                    Log Out
                </Button>
            </AppealContent>
        </Card>
    </div>
)

const AppealUpheld: React.FC<{ caseData: AppealCase; onLogout: () => void }> = ({ caseData, onLogout }) => (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="card max-w-md w-full p-0 shadow-2xl overflow-hidden">
            <AppealHeader 
                icon={<AlertCircle className="w-10 h-10 text-red-600" />}
                title="BAN"
                subtitle="UPHELD"
                description="Your appeal has been reviewed and denied."
                color="red"
            />
            <AppealContent>
                <p className="text-[#4B4F58]/80 text-sm mb-6">
                    Your appeal has been reviewed and the ban has been upheld.
                    You are currently unable to access the platform.
                </p>
                
                {caseData.appeal_message && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200/50">
                        <p className="text-xs font-medium text-[#4B4F58]/60 uppercase tracking-wider mb-1">Your Appeal:</p>
                        <p className="text-sm text-[#1a1a2e]">{caseData.appeal_message}</p>
                    </div>
                )}

                <Button variant="secondary" onClick={onLogout} className="w-full">
                    Log Out
                </Button>
            </AppealContent>
        </Card>
    </div>
)

const AppealReversed: React.FC = () => (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="card max-w-md w-full p-0 shadow-2xl overflow-hidden">
            <AppealHeader 
                icon={<CheckCircle className="w-10 h-10 text-green-600" />}
                title="BAN"
                subtitle="REVERSED! 🎉"
                description="Your appeal was successful! You can now access the platform."
                color="green"
            />
            <AppealContent>
                <p className="text-[#4B4F58]/80 text-sm mb-6">
                    Your appeal has been reviewed and the ban has been lifted.
                    You can now access the platform again.
                </p>

                <Link href="/listings">
                    <Button variant="primary" className="w-full">
                        Go to Marketplace
                    </Button>
                </Link>
            </AppealContent>
        </Card>
    </div>
)

// Extracted Loading Component
const LoadingState: React.FC = () => (
    <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="card max-w-md w-full p-12 text-center shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-[#00B4D8] animate-spin" />
                <p className="text-[#4B4F58]/80 text-sm">Loading...</p>
            </div>
        </Card>
    </div>
)

// Extracted Ban Message Component
const BanMessage: React.FC<{ message: string | null }> = ({ message }) => {
    if (!message) return null
    
    return (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">⚠️ Ban Reason:</p>
            <p className="text-red-600 text-sm mt-1">{message}</p>
        </div>
    )
}

// Extracted Success Message Component
const SuccessMessage: React.FC = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-green-700 font-medium text-sm">Appeal Submitted!</p>
                <p className="text-green-600 text-sm mt-1">
                    Your appeal has been submitted successfully. An admin will review it and notify you of the decision.
                </p>
            </div>
        </div>
    </div>
)

// Extracted Appeal Form Component
interface AppealFormProps {
    appealMessage: string
    setAppealMessage: (value: string) => void
    isSubmitting: boolean
    error: string | null
    onSubmit: (e: React.FormEvent) => void
    onLogout: () => void
    banMessage: string | null
}

const AppealForm: React.FC<AppealFormProps> = ({
    appealMessage,
    setAppealMessage,
    isSubmitting,
    error,
    onSubmit,
    onLogout,
    banMessage
}) => (
    <form onSubmit={onSubmit} className="space-y-5">
        <BanMessage message={banMessage} />
        
        <div>
            <label htmlFor="appeal_message" className="form-label">
                Appeal Message
            </label>
            <textarea
                id="appeal_message"
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                rows={6}
                className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.15)] transition-all w-full box-border resize-none"
                placeholder="Please explain why you believe the ban should be reviewed..."
                required
                minLength={10}
                maxLength={5000}
            />
            <div className="flex justify-between text-xs text-[#4B4F58]/40 mt-1">
                <span>Minimum 10 characters</span>
                <span>{appealMessage.length}/5000</span>
            </div>
        </div>

        {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        )}

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

        <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onLogout}
        >
            Log Out
        </Button>
    </form>
)

// Main Component
export default function AppealPage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const [appealMessage, setAppealMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [existingCase, setExistingCase] = useState<AppealCase | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const banMessage = typeof window !== 'undefined' 
        ? sessionStorage.getItem('ban_message') 
        : null;

    const isBanned = user?.is_banned === true

    // Check if user has an existing appeal
    useEffect(() => {
        const checkExistingAppeal = async () => {
            if (!user) return

            const cases = await fetchAppealCases()
            const latestCase = getLatestAppealCase(cases)
            
            if (latestCase) {
                setExistingCase(latestCase)
            }
            setLoading(false)
        }

        if (user) {
            checkExistingAppeal()
        } else if (!isLoading) {
            router.push('/auth/login')
        }
    }, [user, isLoading, router])

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
            
            const cases = await fetchAppealCases()
            const latestCase = getLatestAppealCase(cases)
            if (latestCase) {
                setExistingCase(latestCase)
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

    // Loading state
    if (isLoading || loading) {
        return <LoadingState />
    }

    // If user is not banned, return null (redirect)
    if (user && !isBanned) {
        return null
    }

    // If user has a pending appeal
    if (existingCase && existingCase.status === 'pending') {
        return <AppealPending caseData={existingCase} onLogout={handleLogout} />
    }

    // If user has an upheld (rejected) appeal
    if (existingCase && existingCase.status === 'upheld') {
        return <AppealUpheld caseData={existingCase} onLogout={handleLogout} />
    }

    // If user has a reversed (successful) appeal
    if (existingCase && existingCase.status === 'reversed') {
        return <AppealReversed />
    }

    // Show appeal form (no existing case)
    return (
        <div className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
            <Card className="card w-full max-w-md p-0 shadow-2xl overflow-hidden">
                <AppealHeader 
                    icon={
                        <div className="relative p-3 rounded-2xl" style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                        }}>
                            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-red-600" />
                            </div>
                            <div className="absolute -top-px left-1/4 right-1/4 h-px" style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            }} />
                        </div>
                    }
                    title="ACCOUNT"
                    subtitle="BANNED"
                    description="Submit an appeal to have your account reviewed."
                    color="red"
                />
                <AppealContent>
                    {success ? (
                        <SuccessMessage />
                    ) : (
                        <AppealForm
                            appealMessage={appealMessage}
                            setAppealMessage={setAppealMessage}
                            isSubmitting={isSubmitting}
                            error={error}
                            onSubmit={handleSubmitAppeal}
                            onLogout={handleLogout}
                            banMessage={banMessage}
                        />
                    )}
                </AppealContent>
            </Card>
        </div>
    )
}
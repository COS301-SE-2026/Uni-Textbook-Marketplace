'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const QUICK_FAQS = [
    { q: 'How do I create a listing?', a: 'Go to the Sell page, fill in your book details, and submit. Your listing will be reviewed by Admin.' },
    { q: 'How long does approval take?', a: 'Listings are reviewed within 24-48 hours. You will be notified when approved or rejected.' },
    { q: 'How do I contact a seller?', a: 'Click on a listing and use the "Message Seller" button. Your contact details remain private.' },
]

export default function HelpMenu() {

    const [isOpen, setIsOpen] = useState(false)

    
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {

            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    return (
        <>
            
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-[#00B4D8] text-white rounded-full shadow-lg hover:bg-[#0096B4] hover:shadow-xl transition-all duration-300 cursor-pointer group"
                aria-label="Help"
            >


                <HelpCircle size={27} className="group-hover:scale-110 transition-transform duration-300" />


            </button>

           
            {isOpen && (
                <div
                    role="presentation"
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[var(--card-bg)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-[var(--card-border)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
                            <div className="flex items-center gap-3">


                                <div className="p-2 rounded-xl bg-[#00B4D8]/10">
                                    <HelpCircle size={20} className="text-[#00B4D8]" />
                                </div>


                                <h2 className="text-lg font-bold text-[var(--foreground)]">Quick Help</h2>
                            </div>


                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <X size={22} className="text-[var(--foreground)]" />
                            </button>


                        </div>

                        
                        <div className="p-5 space-y-4">


                            <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                                Here are answers to the most common questions. For more detailed help, visit our full Help Center.
                            </p>

                            {QUICK_FAQS.map((faq) => (
                                <div key={faq.q} className="border-b border-[var(--card-border)] pb-4 last:border-0 last:pb-0">


                                    <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-start gap-2">


                                        <span className="text-[#00B4D8] font-bold">Q:</span>
                                        {faq.q}
                                    </h3>


                                    <p className="text-sm text-[var(--foreground)]/70 mt-1.5 pl-5">
                                        {faq.a}
                                    </p>


                                </div>
                            ))}

                            <div className="mt-6 pt-4 border-t border-[var(--card-border)]">

                                <Link
                                    href="/help"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between w-full px-5 py-3 bg-[#00B4D8]/10 hover:bg-[#00B4D8]/20 rounded-xl transition-all duration-200 group"
                                >
                                    <span className="text-sm font-medium text-[#00B4D8]">View full help center</span>


                                    <ChevronRight size={18} className="text-[#00B4D8] group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </div>

                            
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
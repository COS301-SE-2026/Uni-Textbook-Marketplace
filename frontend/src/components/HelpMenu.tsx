'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

const FAQS = [

    { q: 'How do I create a listing?', a: 'Go to the Sell page, fill in your book details, and submit. Your listing will be reviewed by Admin.'},


    { q: 'How long does approval take?', a: 'Listings are reviewed within 24-48  hours. You will be notified when your listing is approved or rejected.'},
    { q: 'How do I contact a seller?', a: 'Click on a listing and use the "Message Seller" button. Your contact details remain private until both parties agree to share.'},


    { q: 'What is a pending listing?', a: 'A pending listing is waiting for admin review. It is not visible to other students/buyers until approved.'},
]

export default function HelpMenu() {

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Help Button */}
            <button
                onClick={() => setIsOpen(true)}

                className="fixed bottom-6 right-6 z-50 p-4 bg-[#00B4D8] text-white rounded-full shadow-lg hover:bg-[#0090B0] transition-colors" aria-label="Help">
                    <HelpCircle size={27} />


            </button>

            {/* Modal */}
            {isOpen && (

                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">


                    <div className="bg-[var(--card-bg)] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">


                            <h2 className="text-xl font-bold text-[var(--foreground)]">Help & FAQs</h2>

                            <button
                                onClick={() => setIsOpen(false)}

                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">

                                    <X size={24} className="text-[var(--foreground)]" />

                                </button>
                        </div>

                        <div className="p-4 space-y-4">

                            <p className="text-sm text-[var(--foreground)]">
                                Welcome to the Uni Textbook Marketplace! Here are some frequently asked questions.
                            </p>

                            {FAQS.map((faq, i) => (

                                <div key={i} className="border-b border-[var(--card-border)] pb-3 last:border-0">
                                    <h3 className="font-semibold text-sm text-[var(--foreground)]">{faq.q}</h3>

                                    <p className="text-sm text-[var(--foreground)] mt-1 opacity-80">{faq.a}</p>
                                </div> 
                            ))}

                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">

                                <p className="text-sm text-[var(--foreground)]">
                                    Need more help? Reach out to the Agile Bridge team.
                                </p>

                            </div>


                        </div>
                    </div>
                    
                </div>

            )}
        </>
    )
}
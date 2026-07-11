import Link from 'next/link'
import Image from 'next/image'
import { HelpCircle, MessageCircle, Mail, BookOpen, Shield } from 'lucide-react'
import Footer from '@/components/Footer'

const HIERARCHY_FAQS = [
    {
        question: 'What exactly is the Uni Textbook Marketplace?',
        answer: 'It is a peer-to-peer platform designed strictly for students to buy, sell, or trade textbooks safely.',
    },
    {
        question: 'Who is allowed to create an account?',
        answer: 'Access is limited to registered students. You must verify your account using your official university student email address ending in @university.ac.za or @tuks.co.za.',
    },
    {
        question: 'How long do I wait for my listing to get approved?',
        answer: 'Our admin team usually clears the pending review queue within 24 to 48 hours. You will receive an immediate notice if it gets rejecteed or goes live.',
    },
    {
        question: 'How do I safely reach out to a book seller?',
        answer: 'Hit the "Message Seller" button directly on the listing page. Transactions happen within our built-in system, so your phone number stays hidden.',
    },
    {
        question: 'Where should I meet up to exchange textbooks?',
        answer: 'We highly suggest public spaces on your main university campus.',
    },
    {
        question: 'What does a "Pending" status badge mean?',
        answer: 'It means your book post is stuck in the moderation queue. Other students cannot browse or buy it until an administrator reviews and flags it clean.',
    },
]

export default function HelpPage() {
    return (
        <>
            {/* Hero section */}
            <section className="relative py-20 bg-[#000f2b] overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image src="/help-bg.jpg"
                        alt="Help Hero Section"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="container-content relative z-10 text-center text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold mb-5 tracking-wide uppercase">
                        <HelpCircle size={16} className="text-[#00B4D8]" />
                        <span>Support Desk</span>
                    </div>
                    <h1 className="text-4xl text-white md:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
                        How can we help you out?
                    </h1>
                    <p className="text-slate-300 text-sm max-w-md mx-auto mt-4 leading-relaxed">
                        Browse through common troubleshooting questions regarding listings, student verification profiles, and campus trade protocols.
                    </p>
                </div>

            </section>


            {/* Dynamic Q&A grid */}
            <section className="py-20 bg-slate-50/50">
                <div className="container-content">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-14">

                            <h2 className="text-2xl font-extrabold text-[#000f2b] tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                Everything you need to know about navigating the campus trade platform.
                            </p>
                        </div>
                        {/* Layout tree */}


                        <div className="space-y-4">
                            {HIERARCHY_FAQS.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
                                    <details className="group">
                                        <summary className="flex items-center justify-between w-full px-6 py-5 cursor-pointer list-none select-none">
                                            <span className="font-bold text-[#000f2b] text-lg tracking-tight">
                                                {item.question}
                                            </span>
                                            <span className="text-[#00B4D8] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </span>
                                        </summary>

                                        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 font-normal">
                                            {item.answer}
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>


            {/* Manual Support Contact */}

            <section className="py-20 bg-[#EEEEEE]">

                <div className="container-content">
                    <div className="max-w-xl mx-auto text-center">
                        <div className="w-14 h-14 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mx-auto mb-5">
                            <MessageCircle size={24} className="text-[#00B4D8]" />

                        </div>
                        <h3 className="text-lg font-bold text-[#000f2b] tracking-tight">Still Stuck?</h3>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                            If you are facing an activation issue or listing bug, reach out directly. Our student admin team will review your ticket within 24 hours.
                        </p>
                        <Link href="/contact"
                        className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#00B4D8] text-[#000f2b] text-xs font-bold rounded-lg hover:bg-[#0096B4] transition-colors no-underline shadow-sm">
                            <Mail size={24} />
                            Contact Support
                        </Link>
                    </div>

                </div>
            </section>
            <Footer />
        </>
    )
}
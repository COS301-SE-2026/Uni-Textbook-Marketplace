'use client'

import Image from 'next/image'
import { useState } from 'react'
import { HelpCircle, MessageCircle, Mail } from 'lucide-react'
import Footer from '@/components/Footer'

const FAQ_CATEGORIES = [
    'General',
    'Listings',
    'Messaging',
    'Auctions',
    'Saved Searches',
    'Browsing',
    'Notifications',
    'Account & Safety',
] as const

type FaqCategory = (typeof FAQ_CATEGORIES)[number]

const HIERARCHY_FAQS = [
    {
        category: 'General',
        question: 'What exactly is the Uni Textbook Marketplace?',
        answer: 'It is a peer-to-peer platform designed strictly for students to buy, sell, or trade textbooks safely.',
    },
    {
        category: 'Account & Safety',
        question: 'Who is allowed to create an account?',
        answer: 'Access is limited to registered students. You must verify your account using your official university student email address ending in @tuks.co.za, @uct.ac.za or @wits.ac.za.',
    },
    {
        category: 'Listings',
        question: 'How long do I wait for my listing to get approved?',
        answer: 'Our admin team usually clears the pending review queue within 24 to 48 hours. You will receive a notice if it is rejected or goes live.',
    },
    {
        category: 'Messaging',
        question: 'How do I safely reach out to a book seller?',
        answer: 'Hit the "Message Seller" button directly on the listing page. Conversations stay inside our built-in messaging, so your phone number stays hidden.',
    },
    {
        category: 'Account & Safety',
        question: 'Where should I meet up to exchange textbooks?',
        answer: 'We highly suggest public spaces on your main university campus.',
    },
    {
        category: 'Listings',
        question: 'What does a "Pending" status badge mean?',
        answer: 'It means your book post is in the moderation queue. Other students cannot browse or buy it until an administrator reviews it.',
    },
    {
        category: 'Auctions',
        question: 'Can I schedule an auction for later?',
        answer: 'Yes. When creating an auction from an approved listing, choose the scheduled start option and set its start and end times.',
    },
    {
        category: 'Auctions',
        question: 'What is a reserve price?',
        answer: 'A reserve price is an optional minimum sale price you can set when creating an auction. It must be at least the starting price.',
    },
    {
        category: 'Saved Searches',
        question: 'What is a saved search?',
        answer: 'A saved search keeps a set of book-search criteria together so you can return to those results without entering the same filters again.',
    },
    {
        category: 'Saved Searches',
        question: 'Where can I find my saved searches?',
        answer: 'Open Saved Searches from your account navigation to view the searches you have saved.',
    },
    {
        category: 'General',
        question: 'Does the platform handle payments?',
        answer: 'No. You and the other student agree a price in messaging and complete the exchange in person at a meetup. Never send money in advance.',
    },
    {
        category: 'Account & Safety',
        question: 'I did not get my verification code. What now?',
        answer: 'Check your spam folder, then use "Resend OTP code" once the countdown ends. Codes are only sent to your university email and expire after 10 minutes.',
    },
    {
        category: 'Account & Safety',
        question: 'How do I reset my password or update my profile?',
        answer: 'Use "Forgot Password?" on the login page to reset it with a one-time code. To edit your profile, change your password or manage notification preferences, open Profile and Settings.',
    },
    {
        category: 'Browsing',
        question: 'How do I find the textbook for my module?',
        answer: 'Go to Browse and search by title, module code or faculty. Filters let you narrow by edition, condition, annotation level and price range.',
    },
    {
        category: 'Browsing',
        question: 'How does the wishlist work?',
        answer: 'Select the heart icon on a listing to save it to your Wishlist. You are notified if a wishlisted listing changes status, for example when it is reserved or sold.',
    },
    {
        category: 'Browsing',
        question: 'What is the Bundle Optimizer?',
        answer: 'Pick your modules and select Find Best Deal. It recommends which sellers to buy from, showing the total price and number of meetups next to the cheapest-per-book total, so you can choose the trade-off.',
    },
    {
        category: 'Saved Searches',
        question: 'Will I be told when a matching book is listed?',
        answer: 'Yes. When a new listing matches a saved search, you get a notification in the app and, where enabled, an email.',
    },
    {
        category: 'Listings',
        question: 'How do I list a book, and can a photo fill in the details?',
        answer: 'Select Sell and complete four steps: book details, module details, listing details and photos. Upload a photo of the cover and the app can pre-fill the title, author and ISBN and suggest a crop you can adjust by dragging the corners. You always confirm before submitting, and you can enter everything manually if the photo cannot be read.',
    },
    {
        category: 'Listings',
        question: 'Can I edit a listing after submitting it?',
        answer: 'You can edit a listing while it is Pending or Rejected. Editing a rejected listing sends it back to Pending for review. Approved listings cannot be edited.',
    },
    {
        category: 'Listings',
        question: 'How do I mark a listing as reserved or sold?',
        answer: 'Once a sale is agreed, update the status from the conversation with the buyer or from My Listings. Mark it Reserved while you arrange the meetup, and Sold once the exchange is done.',
    },
    {
        category: 'Auctions',
        question: 'How do I start an auction and place a bid?',
        answer: 'Sellers can start an auction from an approved listing. To bid, open the auction and enter at least the current bid plus the minimum increment. Bids are final and sellers cannot bid on their own auctions.',
    },
    {
        category: 'Auctions',
        question: 'Why was my bid rejected, or why did the timer extend?',
        answer: 'A bid is rejected with a reason if it is below the minimum increment, the auction has ended, or another bid was accepted at almost the same moment. A bid in the closing moments extends the end time so others can respond.',
    },
    {
        category: 'Auctions',
        question: 'What happens when an auction ends?',
        answer: 'If the reserve was met, the highest bidder wins. The winner and seller are notified and the listing moves to Reserved. Arrange the meetup in messaging.',
    },
    {
        category: 'Notifications',
        question: 'Where do I see my notifications?',
        answer: 'The bell icon shows your unread count and latest notifications, and "View all" opens the full page. You are notified about listing approvals and rejections, messages, saved-search matches, wishlist changes, auction results, reports, bans and appeal decisions.',
    },
    {
        category: 'Account & Safety',
        question: 'How do I report a listing?',
        answer: 'Use the report button on the listing page and choose a reason. An admin reviews it and can dismiss it or take action.',
    },
    {
        category: 'Account & Safety',
        question: 'I have been banned. What can I do?',
        answer: 'When you sign in you will see how to appeal. Submit an appeal and an admin will review the case, then uphold the ban or reinstate your account. You are notified of the decision.',
    },
]

export default function HelpPage() {
    const [activeCategory, setActiveCategory] = useState<FaqCategory>('General')
    const visibleFaqs = HIERARCHY_FAQS.filter((item) => item.category === activeCategory)

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
            <section className="py-20 bg-slate-50/50 dark:bg-gray-950">
                <div className="container-content">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-14">

                            <h2 className="text-2xl font-extrabold text-[#000f2b] dark:text-white tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-slate-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">
                                Everything you need to know about navigating the campus trade platform.
                            </p>
                        </div>
                        <div role="tablist" aria-label="FAQ categories" className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
                            {FAQ_CATEGORIES.map((category) => {
                                const count = HIERARCHY_FAQS.filter((item) => item.category === category).length
                                const isActive = activeCategory === category

                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActiveCategory(category)}
                                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${isActive
                                            ? 'border-[#00B4D8] text-[#006D8A] dark:text-[#00B4D8]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {category}
                                        <span className={`rounded-full px-1.5 py-0.5 text-xs ${isActive
                                            ? 'bg-[#00B4D8] text-white'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="space-y-4">
                            {visibleFaqs.map((item) => (
                                <div key={item.question} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
                                    <details className="group">
                                        <summary className="flex items-center justify-between w-full px-6 py-5 cursor-pointer list-none select-none">
                                            <span className="font-bold text-[#000f2b] dark:text-white text-lg tracking-tight">
                                                {item.question}
                                            </span>
                                            <span className="text-[#00B4D8] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </span>
                                        </summary>

                                        <div className="px-6 pb-5 text-slate-600 dark:text-gray-300 text-sm leading-relaxed border-t border-slate-50 dark:border-gray-800 pt-4 font-normal">
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

            <section className="py-20 bg-[#EEEEEE] dark:bg-gray-900">

                <div className="container-content">
                    <div className="max-w-xl mx-auto text-center">
                        <div className="w-14 h-14 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mx-auto mb-5">
                            <MessageCircle size={24} className="text-[#00B4D8]" />

                        </div>
                        <h3 className="text-lg font-bold text-[#000f2b] dark:text-white tracking-tight">Still Stuck?</h3>
                        <p className="text-slate-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">
                            If you are facing an activation issue or listing bug, reach out directly. Our student admin team will review your ticket within 24 hours.
                        </p>
                        <a href="mailto:nexusdev.cos301@gmail.com"
                        className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#00B4D8] text-[#000f2b] text-xs font-bold rounded-lg hover:bg-[#0096B4] transition-colors no-underline shadow-sm">
                            <Mail size={24} />
                            Contact Support
                        </a>
                    </div>

                </div>
            </section>
            <Footer />
        </>
    )
}
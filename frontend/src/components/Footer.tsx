'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mail, MapPin } from 'lucide-react'


const SOCIAL_ICONS = [
  { name: 'Facebook', href: '#', icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
  )},
  { name: 'Instagram', href: '#', icon: (props: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
    )
  },
  { name: 'GitHub', href:'https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace',
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    )
  },
]

const FOOTER_DIVISIONS = [

  {
    title: 'Product',
    links: [
      { label: 'Browse Listing', href: '/auth/login'},
      { label: 'Sell a Textbook', href: '/auth/login'},
      { label: 'My Listings', href: '/auth/login'},
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help & FAQs', href: '/help' },
      { label: 'Contact Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  {
    title: 'University',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Our Partners', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },

]

export default function Footer() {
  return (
    <footer className="bg=[#000f2b] text-white">
      <div className="container-content pt-16 pb-8">


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Panel */}

          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 no-underline mb-4">
              <BookOpen size={28} className="text-[#00B4D8]" />
              <div className="leading-tight">
                <span className="block text-xs font-semibold text-[#00B4D8] tracking-widest uppercase">Uni Textbook</span>
                <span className="block text-lg font-bold text-[#000f2b] leading-none">Marketplace</span>

              </div>
            </Link>
            <p className="text-gray-400 text-lg font-medium">Built in partnership with</p>
            <div className="mt-4">
              <Image src="/Agile_bridge_logo_.png"
                alt="Agile Bridge Logo"
                width={180}
                height={60}
              />
            </div>
            <div className="flex gap-3 mt-6">
              {SOCIAL_ICONS.map((item, idx) => {
                const Icon = item.icon;
                return(
                  <a key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#00B4D8] transition-colors flex items-center
                      justify-center text-gray-400 hover:text-[#000f2b]"
                    aria-label={item.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
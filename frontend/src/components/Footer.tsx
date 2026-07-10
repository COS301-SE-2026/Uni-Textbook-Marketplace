'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mail, MapPin, Facebook, Instagram, Github } from 'lucide-react'


const SOCIAL_ICONS = [
  { icon: Facebook, href: '#' },
  { icon: Instagram, href: '#' },
  { icon: Github, href: 'https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace' },
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
                <span className="block text-xs font-bold text-[#00B4D8] tracking-widest uppercase">Uni Textbook</span>
                <span className="block text-lg font-extrabold text-white leading-none">Marketplace</span>

              </div>
            </Link>
            <p className="text-gray-400 text-xs font-medium">Built in partnership with</p>
            <div className="mt-3">
              <Image src="/"
                alt="Agile Bridge Logo"
                width={160}
                height={50}
              />
            </div>
            <div className="flex gap-3 mt-6">
              {SOCIAL_ICONS.map(({ icon: Icon, href }, idx) => (
                <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#00B4D8] transition-colors flex items-center justify-center text-gray-400 hover:text-[#000f2b]">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
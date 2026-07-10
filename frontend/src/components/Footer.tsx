'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mail, MapPin } from 'lucide-react'

const FOOTER_DIVISIONS = [
  {
    title: 'Support',
    links: [
      { label: 'Help & FAQs', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'University',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Partners', href: '/partners' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
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
          </div>
        </div>
      </div>
    </footer>
  )
}
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Mail, MapPin } from 'lucide-react'

const SOCIAL_ICONS = [
  {
    name: 'GitHub',
    href: 'https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
]

const FOOTER_DIVISIONS = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Listings', href: '/listings' },
      { label: 'Sell a Textbook', href: '/listings/create' },
      { label: 'My Listings', href: '/listings/mine' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help & FAQs', href: '/help' },
    ],
  },
  {
    title: 'University',
    links: [
      { label: 'Brand Style Guide', href: '/brand' },
      {
        label: 'Our Collaborators',
        href: 'https://www2.agilebridge.co.za/our-company/',
        target: '_blank',
      },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-background text-foreground border-t border-border">

      <div className="container-content pt-16 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">

          {/* Brand panel */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 no-underline mb-5">
              <BookOpen size={28} className="text-[#00B4D8] shrink-0" />
              <div className="leading-tight">
                <span className="block text-xs font-semibold text-[#00B4D8] tracking-widest uppercase">
                  Uni Textbook
                </span>
                <span className="block text-lg font-bold text-foreground leading-none">
                  Marketplace
                </span>
              </div>
            </Link>

            <p className="text-muted-foreground text-sm font-medium">
              Developed in collaboration with
            </p>

            <div className="mt-3">
              <Image
                src="/Agile_bridge_logo_.png"
                alt="Agile Bridge Logo"
                width={180}
                height={60}
                className="w-auto h-12"
              />
            </div>

            <div className="flex gap-4 mt-6">
              {SOCIAL_ICONS.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-[#00B4D8] transition-colors flex items-center justify-center text-muted-foreground hover:text-[#000f2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4D8]"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_DIVISIONS.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="font-bold text-sm mb-4 tracking-wide text-foreground uppercase">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={'target' in link ? link.target : undefined}
                      rel={'target' in link && link.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className="text-muted-foreground hover:text-[#00B4D8] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm mb-4 tracking-wide text-foreground uppercase">
              Contact
            </h4>
            <div className="space-y-3">
              <a
                href="mailto:nexusdev.cos301@gmail.com"
                className="flex items-start gap-2 text-muted-foreground hover:text-[#00B4D8] text-sm transition-colors"
              >
                <Mail className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
                <span className="break-all">nexusdev.cos301@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-[#00B4D8] shrink-0" />
                <span>University of Pretoria</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-6">
          <p className="text-muted-foreground text-xs text-center">
            © {new Date().getFullYear()} Uni-Textbook Marketplace. All rights reserved.
          </p>
        </div>

      </div>

    </footer>
  )
}
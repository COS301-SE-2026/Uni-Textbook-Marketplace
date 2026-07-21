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

      { label: 'Browse Listing', href: '/listings'},
      { label: 'Sell a Textbook', href: '/listings/create'},

      { label: 'My Listings', href: '/auth/login'},
    ],
  },
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
      { label: 'Brand Style Guide', href: '/brand' },

      { label: 'About Us', href: '/about' },
      { label: 'Our Collaborators', href: '/https://www2.agilebridge.co.za/our-company/' },
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
            <p className="text-gray-400 text-lg font-medium">Developed in collaboration with</p>

            <div className="mt-4">

              <Image src="/Agile_bridge_logo_.png"
                alt="Agile Bridge Logo"
                width={180}
                height={60}
                className="w-auto h-auto"
              />
            </div>

            <div className="flex gap-9 mt-6">

              {SOCIAL_ICONS.map((item, idx) => {
                const Icon = item.icon;
                return(

                  <a key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#00B4D8] transition-colors flex items-center
                      justify-center text-gray-400 hover:text-[#000f2b]"
                    aria-label={item.name}
                    >
                      <Icon className="w-8 h-8" />
                    </a>

                );
              })}
            </div>

          </div>

          {/* Footer */}
          {FOOTER_DIVISIONS.map((section) => (


            <div key={section.title}>


              <h4 className="font-bold text-sm mb-4 tracking-wide text-[#333333]/90">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (


                    <li key={link.href}>
                      <Link href={link.href} className="text-gray-400 hover:text-[#00B4D8] text-sm transition-colors no underline">

                        {link.label}

                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>

              <h4 className="font bold text-sm mb-4 tracking-wide text-[#333333]/90">Contact</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-gray-400 text-xs">
                  <Mail className="w-6 h-6 text-[#00B4D8] flex-shrink-0 mt-0.5" />

                  <span className="break-all">nexusdev.cos301@gmail.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">

                  <MapPin className="w-6 h-6 text-[#00B4D8] flex-shrink-0" />
                  <span>University of Pretoria</span>
                </div>


              </div>
            </div>
        </div>

        
        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-12 pt-6">

            <p className="text-gray-500 text-xs text-center max-w-4xl mx-auto">© {new Date().getFullYear()} Uni-Textbook Marketplace. All rights reserved.</p>

        </div>
        
      </div>


    </footer>
  )
}
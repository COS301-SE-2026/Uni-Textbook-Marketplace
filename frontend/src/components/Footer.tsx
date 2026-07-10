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

export default function Footer() {}
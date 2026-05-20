import Link from 'next/link'
import { Search, CheckCircle, Shield, DollarSign } from 'lucide-react'
import Card from '@/components/ui/Card'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <>
      {/* Hero section with background image */}
      <section className="relative min-h-[500px] bg-[#000f2b] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Students on campus"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient overlay: darker on left for text, lighter on right to reveal image */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000f2b]/90 via-[#000f2b]/40 to-transparent" />

        <div className="container-content relative z-20 py-16 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12">

            {/* LEFT — text + buttons */}
            <div className="max-w-lg">
              <h1 className="text-white font-bold leading-tight">
                Made for Students,{' '}
                <span className="text-[#00B4D8]">by Students</span>
              </h1>
              <p className="text-white/80 text-lg mt-4">
                Buy, sell or swap textbooks with students from your university
              </p>
              <div className="flex gap-3 mt-8">
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
                <Link
                  href="/listings"
                  className="px-7 py-3 text-sm font-semibold text-white border-2 
                       border-white/40 rounded hover:border-white 
                       transition-all duration-200 no-underline"
                >
                  Browse Listings
                </Link>
              </div>
            </div>

            {/* RIGHT — feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:max-w-lg">
              <Card variant="glass" className="flex flex-col items-center text-center gap-2">
                <CheckCircle size={24} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Verified Students</p>
                <p className="text-white/60 text-xs">University email verification</p>
              </Card>

              <Card variant="glass" className="flex flex-col items-center text-center gap-2">
                <Shield size={24} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Safe & Private</p>
                <p className="text-white/60 text-xs">In-app messaging keeps you safe</p>
              </Card>

              <Card variant="glass" className="flex flex-col items-center text-center gap-2">
                <DollarSign size={24} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Save Money</p>
                <p className="text-white/60 text-xs">Affordable textbooks from fellow students</p>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="bg-white py-6 border-b border-[#dddddd]">
        <div className="container-content">
          <div className="flex items-center gap-0 max-w-3xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 border-2 
                            border-[#dddddd] rounded-l-md bg-white">
              <Search size={18} className="text-[#4B4F58]" />
              <input
                type="text"
                placeholder="Search by title, author, ISBN, or module code..."
                className="flex-1 text-sm text-[#3a3a3a] placeholder-[#4B4F58] 
                           border-none outline-none bg-transparent"
              />
            </div>
            <button className="btn-primary rounded-l-none rounded-r-md px-8 py-3 text-sm">
              SEARCH
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
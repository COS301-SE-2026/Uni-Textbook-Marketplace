import Link from 'next/link'
import { Search, CheckCircle, Shield, DollarSign } from 'lucide-react'
import Card from '@/components/ui/Card'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <>
      {/* Hero section with background image */}
      <section className="relative h-screen w-full bg-[#000f2b] flex items-center overflow-hidden -mt-[70px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Books on campus"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient overlay: darker on left for text, lighter on right to reveal image */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000f2b]/90 via-[#000f2b]/40 to-transparent" />

        <div className="container-content relative z-20 py-16 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 min-h-[80vh]">

            {/* LEFT — text + buttons */}
            <div className="max-w-lg">
              <h1 className="text-white font-bold leading-tight text-4xl md:text-5xl lg:text-6xl">
                Made for Students,{' '}
                <span className="text-[#00B4D8]">by Students</span>
              </h1>
              <p className="text-white/80 text-xl md:text-2xl mt-4">
                Buy, sell or swap textbooks with students from your university
              </p>
              <div className="flex gap-3 mt-8">
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="px-7 py-3 text-sm font-semibold text-white border-2 
                       border-white/40 rounded hover:border-white 
                       transition-all duration-200 no-underline"
                >
                  Buy
                </Link>
                <Link href="/auth/login"
                  className="px-7 py-3 text-sm font-semibold text-white border-2
                      border-white/40 rounded hover:border-white
                      transition-all duration-200 no-underline">
                        Sell
                      </Link>
              </div>
            </div>

            {/* RIGHT — feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:max-w-xl">
              <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                <CheckCircle size={28} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Verified Students</p>
                <p className="text-white/60 text-xs">University email verification</p>
              </Card>

              <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                <Shield size={28} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Safe & Private</p>
                <p className="text-white/60 text-xs">In-app messaging keeps you safe</p>
              </Card>

              <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                <DollarSign size={28} className="text-[#00B4D8]" />
                <p className="text-white text-xs font-semibold">Save Money</p>
                <p className="text-white/60 text-xs">Affordable textbooks from fellow students</p>
              </Card>
            </div>

          </div>
          {/* Search bar*/}
            <div className="flex justify-center mt-8">
              <div className="flex items-center w-full max-w-2xl bg-white rounded-full overflow-hidden shadow-lg">
                <div className="flex-1 flex items-center gap-2 px-4 py-2">
                  <Search size={18} className="text-[#4B4F58] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by title, author, ISBN, or module..."
                    className="w-full text-sm text-[#3a3a3a] placeholder-[#4B4F58] 
                              border-none outline-none bg-transparent py-1.5"
                  />
                </div>
                <button className="bg-[#00B4D8] text-[#000f2b] font-semibold text-sm px-6 py-2.5 hover:bg-[#0096B4] transition-colors h-full">
                  SEARCH
                </button>
              </div>
            </div>
        </div>
      </section>

      
    </>
  )
}
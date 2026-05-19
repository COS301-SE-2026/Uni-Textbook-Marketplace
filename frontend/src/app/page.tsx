import Link from 'next/link'
import { Search } from 'lucide-react'

export default function LandingPage() {
  return (
    <>
      {/* Hero section */}
      <section className="relative min-h-[500px] bg-[#000f2b] flex items-center overflow-hidden">
        {/* Background overlay — I'll replace with real image later */}
        <div className="absolute inset-0 bg-gradien
        t-to-r from-[#000f2b] via-[#000f2b]/80 to-transparent z-10" />

        <div className="container-content relative z-20 py-16">
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight max-w-lg">
            Made for Students,{' '}
            <span className="text-[#00B4D8]">by Students</span>
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-md">
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
import Link from 'next/link'
import { Search, CheckCircle, Shield, DollarSign, BookOpen, Laptop, Briefcase, Scale, Stethoscope } from 'lucide-react'
import Card from '@/components/ui/Card'
import Image from 'next/image'


const UNIVERSITY_FACULTIES = [
  { name: 'EBIT (Engineering & IT)', icon: <Laptop className="w-6 h-6 text-[#00B4D8]" />},
  { name: 'Economic & Management Sciences', icon: <Briefcase className="w-6 h-6 text-[#00B4D8]"/>},
  { name: 'Law', icon: <Scale className="w-6 h-6 text-[#00B4D8]"/>},
  { name: 'Health Sciences', icon: <Stethoscope className="w-6 h-6 text-[#00B4D8]" />},
  { name: 'Humanities', icon: <BookOpen className="w-6 h-6 text-[#00B4D8]" />},
]

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
            <div className="flex flex-col items-center gap-6 md:max-w-xl w-full">

              {/* Partnership */}
              <div className="flex items-center gap-5 mt-4">
                <span className="text-white text-xl uppercase tracking-wider">
                  In partership with
                </span>

                <Image
                  src="/Agile-Bridge-logo-white-2.png"
                  alt="Agile Bridge"
                  width={250}
                  height={200}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                  <CheckCircle size={28} className="text-[#00B4D8]" />
                  <p className="text-white text-sm font-semibold">Verified Students</p>
                  <p className="text-white/60 text-xs">Requires university email verification</p>
                </Card>

                <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                  <Shield size={28} className="text-[#00B4D8]" />
                  <p className="text-white text-sm font-semibold">Safe Swaps</p>
                  <p className="text-white/60 text-xs">In-app messaging keeps your details secure</p>
                </Card>

                <Card variant="glass" className="flex flex-col items-center text-center gap-2 p-5">
                  <DollarSign size={28} className="text-[#00B4D8]" />
                  <p className="text-white text-sm font-semibold">Save Money</p>
                  <p className="text-white/60 text-xs">Affordable textbooks from fellow students</p>
                </Card>
            </div>
          </div>

        </div>
          {/* Search bar
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
            </div>*/}
        </div>
      </section>

      {/* Section 2: Find a variety of textbooks */}
      <section className="py-16 bg-white">
        <div className="container-content">
            <div className="text-center mb-12">
              
              <h2 className="text-3xl md:text-4xl fint-extrabold text-[#000f2b] tracking tight">
                FIND TEXTBOOKS FOR YOUR EXACT MODULES
              </h2>

              <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                Search by title, author, ISBN or even directly for your faculty module codes.
              </p>

              {/* Hexagon Shapes */}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {UNIVERSITY_FACULTIES.map((fac, idx) => (
                  <Link key = {idx}
                        href={`/listings?faculty=${encodeURIComponent(fac.name)}`}
                        
                        className="group flex flex-col items-center justify-center mb-3 group-hover:bg-[#00B4D8]/20 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mb-3 group-hover:bg-[#00B4D8]/20 transition-colors">
                      {fac.icon}
                    </div>
                  </Link>
                ))}
              </div>

            </div>
        </div>
      </section>

      
    </>
  )
}
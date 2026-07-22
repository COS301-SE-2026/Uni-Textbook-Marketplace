import Link from 'next/link'
import {
  Search, CheckCircle, Shield, DollarSign, BookOpen, Laptop, Briefcase, Scale, Stethoscope, UserPlus, Search as SearchIcon,
  MessageCircle, Microscope, MessageSquare, Mail
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Image from 'next/image'
import ListingCard, { Listing } from '@/components/listings/listingCard'
import ScrollAnimation from '@/components/ScrollAnimation'
import Footer from '@/components/Footer'

const UNIVERSITY_FACULTIES = [
  { name: 'EBIT (Engineering, Built-Environment & IT)', icon: <Laptop className="w-6 h-6 text-[#00B4D8]" /> },
  { name: 'Economic & Management Sciences', icon: <Briefcase className="w-6 h-6 text-[#00B4D8]" /> },
  { name: 'Law', icon: <Scale className="w-6 h-6 text-[#00B4D8]" /> },
  { name: 'Health Sciences', icon: <Stethoscope className="w-6 h-6 text-[#00B4D8]" /> },
  { name: 'Humanities', icon: <BookOpen className="w-6 h-6 text-[#00B4D8]" /> },
  { name: 'NAS (Natural & Agricultural Sciences)', icon: <Microscope className="w-6 h-6 text-[#00B4D8]" /> }
];


const PLATFORM_STEPS = [
  {
    num: '01',
    icon: <UserPlus className="w-6 h-6 text-[#00B4D8]" />,
    title: 'Create an Account',
    desc: 'Register using your university email. We check this to make sure only actual students are trading on the platform.',

  },
  {
    num: '02',
    icon: <SearchIcon className="w-6 h-6 text-[#00B4D8]" />,
    title: 'Find or Post Books',
    desc: 'Search for textbooks by module code (e.g., COS 132) or list your own extra module books for sale in under 2 minutes.',
  },
  {
    num: '03',
    icon: <MessageCircle className="w-6 h-6 text-[#00B4D8]" />,
    title: 'Meet up on campus',
    desc: 'Chat directly with sellers inside the app. Arrange to meet safely on campus to inspect the book and finalize the transaction.',
  },
];

const CAMPUS_SECURITY = [
  {
    icon: <Mail className="w-5 h-5 text-white" />,
    title: 'University Email Verification',
    desc: 'You can only register with a student email address, which locks out scammers and external commericial spammers.',
  },
  {
    icon: <MessageSquare className="w-h h-5 text-white" />,
    title: 'In-app Handshakes',
    desc: 'Chat safely directly inside our system so you do not have to share personal phone number or WhatsApp out to strangers.',

  },
];

const MOCK_FEATURED_BOOKS: Listing[] = [
  {
    id: '1',
    title: 'Introduction to Algorithms',
    price: 450,
    condition: 'good',
    annotation_level: 'light',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/cormen-algorithms.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 3,
      author: 'Thomas H. Cormen',
      isbn: '978-026033848',
      title: 'Introduction to Algorithms',
      publiser: ''
    },
    module: {
      code: 'COS212',
      name: "Data Structure's and algorithm",
      semester: 2,
      faculty: {
        name: 'EBIT'
      }
    },
    seller: {
      first_name: 'John',
      last_name: 'Vasques',
      is_verified: true,
      university: {
        name: 'UP'
      }
    },
  },
  {
    id: '2',
    title: 'Clean code: A Handbook of Agile Software Craftsmanship',
    price: 350,
    condition: 'new',
    annotation_level: 'none',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/clean-code.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 1,
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      title: 'Clean Code',
      publiser: '',
    },
    module: {
      code: 'COS301',
      name: 'Agile Craftsmanship',
      semester: 2,
    },
    seller: {
      first_name: 'Sarah',
      last_name: 'Smith',
      is_verified: true,
      university: {
        name: ''
      }
    },
  },
  {
    id: '3',
    title: 'Database System Concepts',
    price: 550,
    condition: 'good',
    annotation_level: 'heavy',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/database-systems.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 6,
      author: 'Abraham Silberschatz',
      isbn: '978-0078022159',
      title: 'Database System Concepts',
      publiser: ''
    },
    module: {
      code: 'COS221',
      name: '',
      semester: 2
    },
    seller: {
      first_name: 'Rethabile',
      last_name: 'Zwide',
      is_verified: true,
      university: {name: ''}
    },
  },
  {
    id: '4',
    title: 'Calculus Early Transcendentals',
    price: 600,
    condition: 'good',
    annotation_level: 'light',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/calculus.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 8,
      author: 'James Stewart',
      isbn: '978-1119456339',
      title: 'Calculus Early Transcendentals',
      publiser: '',
    },
    module: {
      code: 'WTW258',
      name: 'Natural Sciences',
      semester: 2,
    },
    seller: {
      first_name: 'Emily',
      last_name: 'Brown',
      is_verified: true,
      university: {name: ''}
    },
  },
  {
    id: '5',
    title: 'The C Programming Language',
    price: 280,
    condition: 'fair',
    annotation_level: 'heavy',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/c-programming.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 2,
      author: 'Brian W. Kernighan',
      isbn: '978-0131103627',
      title: 'The C Programming Language',
      publiser: ''
    },
    module: {
      code: 'COS132',
      name: 'EBIT',
      semester: 1,
    },
    seller: {
      first_name: 'David',
      last_name: 'Wilson',
      is_verified: true,
      university: {name: ''}
    },
  },
  {
    id: '6',
    title: 'Computer Networking: A Top-Down Approach',
    price: 490,
    condition: 'new',
    annotation_level: 'none',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/networking.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 7,
      author: 'James F. Kurose',
      isbn: '978-0133594140',
      title: 'Computer Networking: A Top-Down Approach',
      publiser: ''
    },
    module: {
      code: 'COS216',
      name: 'EBIT',
      semester: 1
    },
    seller: {
      first_name: 'Novuka',
      last_name: 'Mtembu',
      is_verified: true,
      university: { name: ''}
    },
  },
  {
    id: '7',
    title: 'Designing Data-Intensive Applications',
    price: 520,
    condition: 'good',
    annotation_level: 'light',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/data-intensive.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 1,
      author: 'Martin Kleppmann',
      isbn: '978-1492056355',
      title: 'Designing Data-Intensive Applications',
      publiser: ''
    },
    module: {
      code: 'COS341',
      name: 'EBIT',
      semester: 2,
    },
    seller: {
      first_name: 'Teboho',
      last_name: 'Modise',
      is_verified: true,
      university: {name: ''}
    },
  },
  {
    id: '8',
    title: 'Introduction to Probability',
    price: 380,
    condition: 'good',
    annotation_level: 'heavy',
    status: 'APPROVED',
    listing_status: 'AVAILABLE',
    photo_urls: ['/books/probability.jpg'],
    created_at: new Date().toISOString(),
    description: '',
    book: {
      edition: 2,
      author: 'Dimitri Bertsekas',
      isbn: '978-0199535569',
      title: 'Introduction to Probability',
      publiser: '',
    },
    module: {
      code: 'WTW152',
      name: 'Natural Sciences',
      semester: 2,
    },
    seller: {
      first_name: 'Chuku',
      last_name: 'Obioha',
      is_verified: true,
      university: {name: ''}
    },
  },

];

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

        {/* Gradient overlay*/}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000f2b]/90 via-[#000f2b]/40 to-transparent" />

        <div className="container-content relative z-20 py-16 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 min-h-[80vh]">

            {/* LEFT text + buttons */}
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

            {/* RIGHT feature cards */}
            <div className="flex flex-col items-center gap-6 md:max-w-xl w-full">

              {/* Partnership */}
              <div className="flex items-center gap-5 mt-4">
                <span className="text-white text-xl uppercase tracking-wider">
                  In collaboration with
                </span>

                <Image
                  src="/Agile-Bridge-logo-white-2.png"
                  alt="Agile Bridge"
                  width={250}
                  height={200}
                  className="w-auto h-auto"
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
                  <p className="text-white text-sm font-semibold">Secure & Private</p>
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

      {/* Section 2: How it works */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container-content">

          <div className="text-center mb-16">

            <span className="text-[#00B4D8] font-bold text-xl tracking-wider uppercase bg-[#00B4D8]/10 px-5 py-3 rounded-full">
              How it works
            </span>

            <p className="text-slate-500 mt-4 max-w-xl mx-auto text-xl leading-relaxed">
              Buy and sell used textbooks with other students on campus in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-100" />

              {PLATFORM_STEPS.map((item, idx) => (
                <ScrollAnimation key={idx} delay={idx * 650}>

                <div className="relative flex flex-col items-center text-center px-4">
                  <div className="relative z-15 w-20 h-20 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-5 shadow-sm">

                  {item.icon}
                  <span className="absolute -top-2 -right-6 w-10 h-10 rounded-full bg-[#00B4D8] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                    {item.num}

                  </span>
                </div>
                {/* Content */}
                <h3 className="text-base font-bold text-[#000f2b] mb-2 tracking-tight">
                  {item.title}
                </h3>

                <p className="text-slate-500 text-lg max-w-[240px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              </ScrollAnimation>
              ))}
            </div>

          </div>
      </section>
      

      {/* Section 3: Find a variety of textbooks */}
      <ScrollAnimation delay={550}>
      <section className="py-20 bg-white">

        <div className="container-content">
            <div className="text-center mb-14">
              
              <h2 className="text-3xl md:text-4xl fint-extrabold text-[#000f2b] tracking tight">
                FIND TEXTBOOKS FOR YOUR EXACT MODULES
              </h2>

              <p className="text-gray-500 mt-2 max-w-md mx-auto text-lg">
                Search by title, author, ISBN or even directly for your faculty module codes.
              </p>

            </div>
              {/* Faculty Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
                {UNIVERSITY_FACULTIES.map((fac, idx) => (
                  <ScrollAnimation key={idx} delay={idx * 500}>
                  <div key = {idx}
                        
                    className="flex flex-col items-center justify-center p-6 bg-slate-50/80 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mb-4">
                      {fac.icon}
                    </div>
                    <span className="text-xs font-bold text-[#000f2b] text-center px-2">
                      {fac.name}
                    </span>
                  </div>
                  </ScrollAnimation>
                ))}
              </div>
            </div>
      </section>
      </ScrollAnimation>

      {/* Section 4: Trust & Safety */}
      <ScrollAnimation delay={700}>
      <section className="py-20 bg-[#00B4D8]">
        <div className="container-content">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div>
                  <span className="text-white font-bold text-lg tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full inline-block mb-4">
                      Campus Safety
                  </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                        Built for Safe, On-Campus Exchanges
                    </h2>
                    <p className="text-white/90 text-sm mt-3 max-w-md leading-relaxed">
                        This platform is built specifically to handle face-to-face transactions around campus. We prioritize internal student verification to keep the trading pool trusted.
                    </p>
                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      {CAMPUS_SECURITY.map((item, idx) => (
                        <ScrollAnimation key={idx} delay={idx * 650}>
                        <div key={idx} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">
                              {item.title}
                            </h4>
                            <p className="text-white font-bold text-sm">
                              {item.desc}
                            </p>
                          </div>

                        </div>
                        </ScrollAnimation>
                  ))}
              </div>

            </div>
            <div className="relative w-full h-80 lg:h-[480px] rounded-2xl overflow-hidden shadow-xl bg-slate-100">
              <video src="/in-app-chat.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/students-sitting.jpg"
              />
            </div>
          </div>

        </div>
      </section>
      </ScrollAnimation>

      {/* Featured Books */}
      <ScrollAnimation delay={400}>
      <section className="py-16 bg-white">
        <div className="container-content">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#000f2b] tracking-wide">
              A SAMPLE OF OUR INTERFACE
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {MOCK_FEATURED_BOOKS.map((listing, index) => (
              <ListingCard key={index} listing={listing} removeClick={true}/>
            ))}
          </div>

        </div>
      </section>
      </ScrollAnimation>

      {/* Call To Action */}
      <ScrollAnimation delay={450}>
      <section className="py-24 bg-slate-50">
        
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

             <div className="relative w-full h-80 lg:h-[480px] rounded-2xl overflow-hidden shadow-xl bg-slate-100">
              <video src="/Woman_Reading.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/students-sitting-2.jpg"
              />

             </div>

             <div className="px-2">
              <span className="text-[#00B4D8] font-bold text-xs tracking-wider uppercase bg-[#00B4D8]/10 px-3 py-1 rounded-full inline-block mb-4">
                Get Started
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#000f2b] tracking-tight leading-tight">
                Ready to find your textbooks or sell a few?
              </h2>

              <Link href='/auth/register'
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#00B4D8] text-lg font-extrabold text-[#000f2b] rounded-lg hover:bg-[#0096B4] transition-all duration-200 shadow-sm uppercase tracking-wider">
                  <UserPlus size={15} />
                  REGISTER
                </Link>
             </div>
          </div>


        </div>
      </section>
      </ScrollAnimation>
      <Footer />
    </>
  )
}
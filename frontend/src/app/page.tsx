import Link from 'next/link'
import {
  CheckCircle, Shield, DollarSign, BookOpen, Laptop, Briefcase, Scale, Stethoscope, UserPlus, Search as SearchIcon,
  MessageCircle, Microscope, MessageSquare, Mail, ChevronDown, ScanLine, Gavel, Boxes, ArrowRight
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

const WOW_FACTORS = [
  {
    key: 'scan',
    icon: <ScanLine className="w-5 h-5 text-[#006D8A] dark:text-[#00B4D8]" />,
    title: 'Snap the cover, skip the typing',
    desc: 'Photograph a textbook and our AI reads the title, author and ISBN. Crop and clean up the photo before you post.',
    preview: (
      <div className="relative h-full w-full bg-[#000f2b] flex items-center justify-center gap-6 overflow-hidden">
        <div className="relative w-24 h-32 rounded bg-white/10 border border-white/20 p-3 flex flex-col gap-2">
          <div className="h-2 w-3/4 rounded bg-white/40" />
          <div className="h-2 w-1/2 rounded bg-white/25" />
          <div className="mt-auto h-2 w-2/3 rounded bg-[#00B4D8]/60" />
          <div className="nx-scan absolute inset-x-[-10px] h-0.5 bg-[#00B4D8] shadow-[0_0_14px_#00B4D8]" />
        </div>
        <div className="flex flex-col gap-2 text-xs font-semibold">
          {['Title', 'Author', 'ISBN'].map((f, i) => (
            <span
              key={f}
              className="nx-field rounded-full bg-[#00B4D8] px-3 py-1 text-[#000f2b]"
              style={{ '--d': `${i * 0.35}s` } as React.CSSProperties}
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'auction',
    icon: <Gavel className="w-5 h-5 text-[#006D8A] dark:text-[#00B4D8]" />,
    title: 'Bid on books in real time',
    desc: 'Sellers can list a book as a live auction. Watch bids come in and win the book you need at a price you set.',
    preview: (
      <div className="relative h-full w-full bg-[#000f2b] flex flex-col items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          <span className="nx-pulse h-2 w-2 rounded-full bg-emerald-400" />
          Live auction
        </span>
        <span className="relative h-12 w-32 text-center text-4xl font-extrabold text-[#00B4D8]">
          {['R480', 'R500', 'R520'].map((v, i) => (
            <span
              key={v}
              className="nx-tick absolute inset-0"
              style={{ '--d': `${i * 1.5}s` } as React.CSSProperties}
            >
              {v}
            </span>
          ))}
        </span>
        <span className="text-white/70 text-xs">Highest bid</span>
        <span className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/15">
          <span className="nx-drain block h-full w-full bg-[#00B4D8]" />
        </span>
      </div>
    ),
  },
  {
    key: 'bundle',
    icon: <Boxes className="w-5 h-5 text-[#006D8A] dark:text-[#00B4D8]" />,
    title: 'Build your whole semester list',
    desc: 'Add every book on your module list and we work out the cheapest way to buy them together.',
    preview: (
      <div className="relative h-full w-full bg-[#000f2b] flex flex-col items-center justify-end gap-3 pb-8 overflow-hidden">
        <div className="flex items-end gap-2">
          {[
            ['bg-[#00B4D8]', 'h-24'],
            ['bg-white/85', 'h-28'],
            ['bg-[#006D8A]', 'h-20'],
            ['bg-white/50', 'h-24'],
          ].map(([c, h], i) => (
            <div
              key={i}
              className={`nx-spine w-9 rounded-sm ${c} ${h}`}
              style={{ '--i': i } as React.CSSProperties}
            />
          ))}
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          Best combined price
        </span>
      </div>
    ),
  },
];

const CAMPUS_SECURITY = [
  {
    icon: <Mail className="w-5 h-5 text-white" />,
    title: 'University Email Verification',
    desc: 'You can only register with a student email address, which locks out scammers and external commericial spammers.',
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-white" />,
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
      publisher: ''
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
      publisher: '',
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
      publisher: ''
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
      university: { name: '' }
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
      publisher: '',
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
      university: { name: '' }
    },
  },

];

const NX_CSS = `
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
#how-it-works { scroll-margin-top: 4rem; }

@keyframes nx-word   { from { opacity: 0; transform: translateY(28px) scale(.97); filter: blur(9px); } to { opacity: 1; transform: none; filter: blur(0); } }
@keyframes nx-fade   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes nx-rise   { from { opacity: 0; transform: translateY(20px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes nx-glow   { 0%, 100% { opacity: .35; transform: scale(1); } 50% { opacity: .65; transform: scale(1.15); } }
@keyframes nx-cue    { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, 8px); } }
@keyframes nx-cue-ring { 0% { transform: translate(-50%, 0) scale(1); opacity: .7; } 100% { transform: translate(-50%, 0) scale(1.6); opacity: 0; } }
@keyframes nx-wheel  { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(14px); } }
@keyframes nx-march  { to { background-position: 16px 0; } }
@keyframes nx-ring   { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.75); opacity: 0; } }
@keyframes nx-shine  { 0% { transform: translateX(-160%) skewX(-20deg); } 60%, 100% { transform: translateX(420%) skewX(-20deg); } }
@keyframes nx-scan   { 0%, 100% { top: 10%; } 50% { top: 86%; } }
@keyframes nx-field  { 0%, 15% { opacity: .25; } 35%, 80% { opacity: 1; } 100% { opacity: .25; } }
@keyframes nx-tick   { 0%, 30% { opacity: 1; } 33.4%, 100% { opacity: 0; } }
@keyframes nx-drain  { from { transform: scaleX(1); } to { transform: scaleX(0); } }
@keyframes nx-spine  { 0% { transform: translateY(70px); opacity: 0; } 20%, 80% { transform: none; opacity: 1; } 100% { transform: translateY(-8px); opacity: 0; } }
@keyframes nx-pulse  { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(1.6); } }

.nx-word  { display: inline-block; animation: nx-word .9s cubic-bezier(.2,.7,.2,1) both; animation-delay: calc(var(--i) * .1s + .15s); }
.nx-fade  { animation: nx-fade .8s cubic-bezier(.2,.7,.2,1) both; animation-delay: var(--d, 0s); }
.nx-glow  { animation: nx-glow 7s ease-in-out infinite; }
.nx-cue   { animation: nx-cue 2.2s ease-in-out infinite; }
.nx-cue:hover { animation-play-state: paused; }
.nx-cue-ring { position: absolute; left: 50%; bottom: 0; width: 44px; height: 44px; border-radius: 9999px; border: 2px solid #00B4D8; pointer-events: none; animation: nx-cue-ring 2.4s ease-out infinite; }
.nx-cue-ring.delay { animation-delay: 1.2s; }
.nx-wheel { animation: nx-wheel 1.8s ease-in-out infinite; }
.nx-march { height: 2px; background-image: repeating-linear-gradient(90deg, #00B4D8 0 8px, transparent 8px 16px); background-size: 16px 2px; animation: nx-march 1s linear infinite; }
.nx-ring  { animation: nx-ring 2.4s ease-out infinite; animation-delay: var(--d, 0s); }
.nx-shine { position: relative; overflow: hidden; }
.nx-shine::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 35%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: nx-shine 3.6s ease-in-out infinite; }

.nx-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.nx-card:hover { transform: translateY(-6px); border-color: #00B4D8; box-shadow: 0 16px 40px -14px rgba(0, 180, 216, .5); }

.nx-scan  { animation: nx-scan 3.2s ease-in-out infinite; }
.nx-field { animation: nx-field 3.2s ease-in-out infinite; animation-delay: var(--d, 0s); }
.nx-tick  { opacity: 0; animation: nx-tick 4.5s linear infinite; animation-delay: var(--d, 0s); }
.nx-drain { transform-origin: left; animation: nx-drain 4.5s linear infinite; }
.nx-spine { animation: nx-spine 5s ease-in-out infinite; animation-delay: calc(var(--i) * .3s); }
.nx-pulse { animation: nx-pulse 1.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .nx-word, .nx-fade, .nx-glow, .nx-cue, .nx-cue-ring, .nx-wheel, .nx-march, .nx-ring, .nx-shine::after,
  .nx-scan, .nx-field, .nx-drain, .nx-spine, .nx-pulse { animation: none; }
  .nx-tick:first-child { opacity: 1; }
  .nx-card:hover { transform: none; }
}
`

export default function LandingPage() {
  return (
    <>
      <style>{NX_CSS}</style>

      {/* Hero section */}
      <section className="relative min-h-[100svh] md:min-h-screen w-full bg-[#000f2b] flex items-center overflow-hidden pt-[40px]">
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


        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#000f2b]/90 via-[#000f2b]/40 to-transparent" />

        <div className="container-content relative z-20 w-full py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-12">

            {/* LEFT text + buttons */}
            <div className="max-w-lg">
              <h1 className="text-white font-bold leading-tight text-4xl md:text-5xl lg:text-6xl">
                {'Made for Students, '.split(' ').map((word, i) => (
                  <span key={i} className="nx-word" style={{ '--i': i } as React.CSSProperties}>
                    {word}{' '}
                  </span>
                ))}
                <span className="text-[#00B4D8]">
                  {'by Students'.split(' ').map((word, i) => (
                    <span key={i} className="nx-word" style={{ '--i': i + 4 } as React.CSSProperties}>
                      {word}{i === 0 ? ' ' : ''}
                    </span>
                  ))}
                </span>
              </h1>
              <p className="nx-fade text-white/80 text-xl md:text-2xl mt-4" style={{ '--d': '.65s' } as React.CSSProperties}>
                Buy or sell textbooks with students from your university
              </p>
              <div className="nx-fade flex gap-3 mt-8" style={{ '--d': '.85s' } as React.CSSProperties}>
                <Link href="/auth/register" className="btn-primary nx-shine">
                  Get Started
                </Link>
                <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 py-3.5 rounded border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors">
                  Log in
                </Link>
              </div>
            </div>

            {/* RIGHT feature cards */}
            <div className="flex flex-col items-center gap-6 md:max-w-xl w-full">

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

        </div>

        
        <a
          href="#how-it-works"
          aria-label="Scroll down to how it works"
          className="nx-cue absolute bottom-8 left-1/2 z-30 flex flex-col items-center gap-2 text-white/85 hover:text-white transition-colors"
        >
          <span className="text-xs font-semibold tracking-wider uppercase">Scroll to explore</span>
          <span className="relative flex h-11 w-7 justify-center rounded-full border-2 border-white/60 pt-2">
            <span className="nx-wheel h-2 w-1 rounded-full bg-[#00B4D8]" />
          </span>
          <ChevronDown size={16} className="text-[#00B4D8]" />
          <span className="nx-cue-ring" aria-hidden="true" />
          <span className="nx-cue-ring delay" aria-hidden="true" />
        </a>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-background border-b border-border">
        <div className="container-content">

          <div className="text-center mb-16">

            <span className="text-[#006D8A] dark:text-[#00B4D8] font-bold text-xl tracking-wider uppercase bg-[#00B4D8]/10 px-5 py-3 rounded-full">
              How it works
            </span>

            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-xl leading-relaxed">
              Buy and sell used textbooks with other students on campus in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="nx-march hidden md:block absolute top-12 left-[15%] right-[15%]" />

            {PLATFORM_STEPS.map((item, idx) => (
              <ScrollAnimation key={idx} delay={idx * 650}>

                <div className="relative flex flex-col items-center text-center px-4">
                  <div className="relative z-15 w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center mb-5 shadow-sm">

                    <span className="nx-ring absolute inset-0 rounded-full border-2 border-[#00B4D8]" style={{ '--d': `${idx * 0.6}s` } as React.CSSProperties} aria-hidden="true" />
                    {item.icon}
                    <span className="absolute -top-2 -right-6 w-10 h-10 rounded-full bg-[#00B4D8] text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-background shadow-sm">
                      {item.num}

                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground text-lg max-w-[240px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>

        </div>
      </section>


      {/* Find a variety of textbooks */}
      <ScrollAnimation delay={550}>
        <section className="py-20 bg-background">

          <div className="container-content">
            <div className="text-center mb-14">

              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                FIND TEXTBOOKS FOR YOUR EXACT MODULES
              </h2>

              <p className="text-muted-foreground mt-2 max-w-md mx-auto text-lg">
                Search by title, author, ISBN or even directly for your faculty module codes.
              </p>

            </div>
            {/* Faculty Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-2">
              {UNIVERSITY_FACULTIES.map((fac, idx) => (
                <ScrollAnimation key={idx} delay={idx * 500}>
                  <div key={idx}

                    className="nx-card flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-[#00B4D8]/10 flex items-center justify-center mb-4">
                      {fac.icon}
                    </div>
                    <span className="text-xs font-bold text-foreground text-center px-2">
                      {fac.name}
                    </span>
                  </div>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      
      <ScrollAnimation delay={600}>
        <section className="py-24 bg-muted">
          <div className="container-content">
            <div className="text-center mb-14">
              <span className="text-[#006D8A] dark:text-[#00B4D8] font-bold text-sm tracking-wider uppercase bg-[#00B4D8]/10 px-4 py-2 rounded-full inline-block">
                More than a notice board
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mt-4">
                Smart tools built into the platform
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-lg leading-relaxed">
                Whether you are listing one book or buying a whole semester worth, these features save you time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {WOW_FACTORS.map((factor, idx) => (
                <ScrollAnimation key={factor.key} delay={idx * 400}>
                  <article className="nx-card h-full flex flex-col rounded-2xl bg-card border border-border overflow-hidden">
                    <div className="relative h-48" aria-hidden="true">
                      {factor.preview}
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-[#00B4D8]/10 flex items-center justify-center shrink-0">
                          {factor.icon}
                        </span>
                        <h3 className="text-lg font-bold text-foreground leading-tight">
                          {factor.title}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm flex-1">
                        {factor.desc}
                      </p>
                      <Link
                        href="/listings"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006D8A] dark:text-[#5CD5EE] hover:underline underline-offset-4 mt-1"
                      >
                        See it in action <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      </ScrollAnimation>

      {/* Trust & Safety */}
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
                          <p className="text-white/85 text-sm mt-1">
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

      
      <ScrollAnimation delay={400}>
        <section className="py-16 bg-background">
          <div className="container-content">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-wide">
                A SAMPLE OF OUR INTERFACE
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {MOCK_FEATURED_BOOKS.map((listing, index) => (
                <ListingCard key={index} listing={listing} removeClick={true} />
              ))}
            </div>

          </div>
        </section>
      </ScrollAnimation>

      {/* Call To Action */}
      <ScrollAnimation delay={450}>
        <section className="py-24 bg-muted">

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
                <span className="text-[#006D8A] dark:text-[#00B4D8] font-bold text-xs tracking-wider uppercase bg-[#00B4D8]/10 px-3 py-1 rounded-full inline-block mb-4">
                  Get Started
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
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
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Bell, ChevronDown, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'



function getInitials(firstName: string, lastName: string): string {
  if (!firstName || !lastName) return '??';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const authNavLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'Sell', href: '/listings/create' },
  { label: 'Messages', href: '/messages' },
  { label: 'Favourites', href: '/wishlist' },
]

const adminNavLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'Messages', href: '/messages' },
  { label: 'Moderate', href: '/admin/review' },
  { label: 'Audit Logs', href: '/admin/log' }
]


export default function NavBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname()

  const isLandingPage = pathname === '/'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)


  const [mounted, setMounted] = useState(false);
  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
      const id = requestAnimationFrame(() => {
          setMounted(true);
      });

      return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => setScrolled (window.scrollY > 50);

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, [isLandingPage]);

  const isTransparent = isLandingPage && !scrolled;

if (!mounted) return null;

  if (isLoading) {
    return (


      <nav className={`w-full sticky top-0 z-50 transition-colors duration-300 ${
        isTransparent ? 'bg-transparent border-b border-transparent' : 'bg-white border-b border-[var(--nav-border)]'
      }`}>
        <div className="container-content">
          <div className="flex items-center justify-between h-[70px]">


            <Link href="/" className="flex items-center gap-2 no-underline">
              <BookOpen size={24} className={isTransparent ? 'text-white' : 'text-[#00B4D8]'} aria-hidden="true" />
              <div className="leading-tight">
                <span className={`block text-xs font-semibold tracking-widest uppercase ${isTransparent ? 'text-white' : 'text-[#00B4D8]'}`}>
                  Uni Textbook
                </span>

                <span className={`block text-lg font-bold leading-none ${isTransparent ? 'text-white': 'text-[#000f2b]'}`}>
                  Marketplace
                </span>
              </div>


            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const initials = user ? getInitials(user.first_name, user.last_name) : '';
  const isAdmin = user?.role === 'admin';
  const navLinks = isAdmin ? adminNavLinks : authNavLinks;

  return (
    <nav className={`w-full sticky top-0 z-50 transition-colors duration-300 ${
      isTransparent ? 'bg-transparent border-b border-transparent' : 'bg-[var(--nav-bg)] border-b border-[var(--nav-border)]'
    }`}>
      <div className="container-content">
        <div className="flex items-center justify-between h-[70px]">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <BookOpen size={24} className={isTransparent ? 'text-white' : 'text-[#00B4D8]'} aria-hidden="true" />
            <div className="leading-tight">
              <span className={`block text-xs font-semibold tracking-widest uppercase ${isTransparent ? 'text-white' : 'text-[#00B4D8]'}`}>
                Uni Textbook
              </span>
              <span className={`block text-lg font-bold leading-none ${isTransparent ? 'text-white' : 'text-[var(--foreground)]'}`}>
                Marketplace
              </span>


            </div>
          </Link>

          {/* MIDDLE: Nav links (desktop only) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 no-underline tracking-wide hover:text-[#00B4D8]
                  ${pathname === link.href
                      ? 'text-[#00B4D8] border-b-2 border-[#00B4D8] pb-1'
                      : isTransparent ? 'text-white' : 'text-[var(--foreground)]'
                    }`}
                >


                  {link.label.toUpperCase()}
                </Link>
              ))}
            </div>
          )}

          {/* RIGHT: Actions (desktop only) */}
          <div className="hidden md:flex items-center gap-3">


            {isAuthenticated && <ThemeToggle /> }
            {isAuthenticated && user ? (
              <>

                {/* Notification bell */}
                <button
                  aria-label="Notifications"
                  className="relative p-2 text-[var(--foreground)] hover:text-[#00B4D8] transition-colors duration-200 rounded-full hover:bg-[#F5F5F5] dark:hover:bg-gray-800"
                >
                  <Bell size={20} />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full
                               hover:bg-[#F5F5F5] dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#00B4D8] flex items-center
                                    justify-center text-[#000f2b] dark:text-white text-sm font-bold">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {user.first_name}
                    </span>

                    <ChevronDown
                      size={16}
                      className={`text-[#4B4F58] dark:text-gray-400 transition-transform duration-200
                                  ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md shadow-md overflow-hidden z-50">
                      {isAdmin && (
                        <>
                          <Link
                            href="/admin/review"
                            className="block px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[#F5F5F5] dark:hover:bg-gray-800 hover:text-[#00B4D8] no-underline transition-colors duration-150"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                          <div className="border-t border-[var(--card-border)]" />
                        </>
                      )}
                      {!isAdmin && (
                        <Link
                          href="/listings/mine"
                          className="block px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[#F5F5F5] dark:hover:bg-gray-800 hover:text-[#00B4D8]
                                    no-underline transition-colors duration-150"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Listings
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[#F5F5F5] dark:hover:bg-gray-800 hover:text-[#00B4D8]
                                   no-underline transition-colors duration-150"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <div className="border-t border-[var(--card-border)]" />
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[#b91c1c]
                                   dark:text-[#ef4444] hover:bg-[#FDE8E8] dark:hover:bg-[#3b1a1a] 
                                   transition-colors duration-150"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className={`px-5 py-2 text-sm font-semibold rounded no-underline transition-colors duration-200 ${
                    isTransparent ? 'text-white border-2 border-white hover:bg-white hover:text-[#000f2b]'
                    : 'text-[#00B4D8] border-2 border-[#00B4D8] hover:bg-[#00B4D8] hover:text-[#000f2b]'}`
                  }>
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className={`text-sm px-5 py-2 rounded transition-colors duration-200 ${
                    isTransparent ? 'bg-white text-[#000f2b] hover:bg-white/90' : 'btn-primary'}`
                  }
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* HAMBURGER: Mobile only */}
          <button
            className={`md:hidden p-2 transition-colors duration-200 ${
              isTransparent ? 'text-white' : 'text-[#3a3a3a] dark:text-gray-300 hover:text-[#00B4D8]'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>


        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--nav-border)] bg-[var(--nav-bg)]">
          <div className="container-content py-4 flex flex-col gap-1">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 py-3 border-b border-[var(--nav-border)] mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#00B4D8] flex items-center
                                  justify-center text-[#000f2b] dark:text-white text-sm font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {user.first_name} {user.last_name}
                  </span>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`py-3 text-sm font-medium no-underline
                               border-b border-[var(--card-border)] transition-colors
                               ${pathname === link.href
                                 ? 'text-[#00B4D8]!'
                                 : 'text-[var(--foreground)] hover:text-[#00B4D8]'
                               }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {!isAdmin && (
                    <Link
                    href="/listings/mine"
                    className="py-3 text-sm text-[var(--foreground)] hover:text-[#00B4D8]
                              no-underline border-b border-[var(--card-border)] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Listings
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="py-3 text-sm text-[var(--foreground)] hover:text-[#00B4D8]
                             no-underline border-b border-[var(--card-border)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>


                <button
                  className="py-3 text-left text-sm text-[#b91c1c] dark:text-[#ef4444]
                             hover:text-[#7F1D1D] transition-colors"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="py-3 text-sm font-medium text-[#3a3a3a]
                             dark:text-gray-300
                             hover:text-[#00B4D8] no-underline
                             border-b border-[var(--card-border)] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>


                <Link
                  href="/auth/login"
                  className="py-3 text-sm font-medium text-[#3a3a3a]
                             dark:text-gray-300
                             hover:text-[#00B4D8] no-underline transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            )}
          </div>

          
        </div>
      )}
    </nav>
  )
}
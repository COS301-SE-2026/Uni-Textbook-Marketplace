'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Bell, ChevronDown, BookOpen } from 'lucide-react'

// Replace this with real auth context in Sprint 2
// For now I'll simulate auth state with a prop for testing
interface NavBarProps {
  isAuthenticated?: boolean
  user?: {
    firstName: string
    lastName: string
  }
}

// HELPER — get initials from name
function getInitials(firstName: string, lastName: string): string {
return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// NAV LINKS — authenticated users will see these

const authNavLinks = [
  { label: 'Browse', href: '/listings' },
  { label: 'Sell', href: '/listings/create' },
  { label: 'Messages', href: '/messages' },
  { label: 'Favourites', href: '/favourites' },
]


export default function NavBar({
  isAuthenticated = false,
  user = { firstName: 'Tiego', lastName: 'Mokwena' },
}: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const initials = getInitials(user.firstName, user.lastName)

  return (
    <nav className="w-full bg-white border-b border-[#dddddd] sticky top-0 z-50">
      <div className="container-content">
        <div className="flex items-center justify-between h-[70px]">

          {/*  LEFT: Logo  */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <BookOpen
              size={24}
              className="text-[#00B4D8]"
              aria-hidden="true"
            />
            <div className="leading-tight">
              <span className="block text-xs font-semibold text-[#00B4D8] tracking-widest uppercase">
                Uni Textbook
              </span>
              <span className="block text-lg font-bold text-[#000f2b] leading-none">
                Marketplace
              </span>
            </div>
          </Link>

          {/*  MIDDLE: Nav links (I created this for desktop only) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              {authNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-[#3a3a3a] hover:text-[#00B4D8] 
                             transition-colors duration-200 no-underline tracking-wide"
                >
                  {link.label.toUpperCase()}
                </Link>
              ))}
            </div>
          )}

          {/*  RIGHT: Actions (desktop only)  */}
          <div className="hidden md:flex items-center gap-3">

            {/* Theme toggle slot — Omphemetse, you'll fills this in */}
            {/* <ThemeToggle /> */}

            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <button
                  aria-label="Notifications"
                  className="relative p-2 text-[#3a3a3a] hover:text-[#00B4D8] 
                             transition-colors duration-200 rounded-full 
                             hover:bg-[#F5F5F5]"
                >
                  <Bell size={20} />
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full 
                               hover:bg-[#F5F5F5] transition-colors duration-200"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    {/* Avatar circle with initials */}
                    <div className="w-9 h-9 rounded-full bg-[#00B4D8] flex items-center 
                                    justify-center text-[#000f2b] text-sm font-bold">
                      {initials}
                    </div>
                    <span className="text-sm font-medium text-[#3a3a3a]">
                      {user.firstName}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[#4B4F58] transition-transform duration-200 
                                  ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white 
                                    border border-[#dddddd] rounded-md shadow-md 
                                    overflow-hidden z-50">
                      <Link
                        href="/listings/mine"
                        className="block px-4 py-3 text-sm text-[#3a3a3a] 
                                   hover:bg-[#F5F5F5] hover:text-[#00B4D8] 
                                   no-underline transition-colors duration-150"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-3 text-sm text-[#3a3a3a] 
                                   hover:bg-[#F5F5F5] hover:text-[#00B4D8] 
                                   no-underline transition-colors duration-150"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      <div className="border-t border-[#dddddd]" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          // Wire to auth logout in Sprint 2
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-[#b91c1c] 
                                   hover:bg-[#FDE8E8] transition-colors duration-150"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated: Register + Login buttons */}
                <Link
                  href="/auth/register"
                  className="px-5 py-2 text-sm font-semibold text-[#00B4D8] 
                             border-2 border-[#00B4D8] rounded no-underline 
                             hover:bg-[#00B4D8] hover:text-[#000f2b] 
                             transition-all duration-200"
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-primary text-sm px-5 py-2"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/*  HAMBURGER: Mobile only */}
          <button
            className="md:hidden p-2 text-[#3a3a3a] hover:text-[#00B4D8] 
                       transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/*  MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#dddddd] bg-white">
          <div className="container-content py-4 flex flex-col gap-1">

            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 py-3 border-b border-[#dddddd] mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#00B4D8] flex items-center 
                                  justify-center text-[#000f2b] text-sm font-bold">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-[#3a3a3a]">
                    {user.firstName} {user.lastName}
                  </span>
                </div>

                {/* Nav links */}
                {authNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="py-3 text-sm font-medium text-[#3a3a3a] 
                               hover:text-[#00B4D8] no-underline 
                               border-b border-[#F5F5F5] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/listings/mine"
                  className="py-3 text-sm text-[#3a3a3a] hover:text-[#00B4D8] 
                             no-underline border-b border-[#F5F5F5] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Listings
                </Link>
                <Link
                  href="/settings"
                  className="py-3 text-sm text-[#3a3a3a] hover:text-[#00B4D8] 
                             no-underline border-b border-[#F5F5F5] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="py-3 text-left text-sm text-[#b91c1c] 
                             hover:text-[#7F1D1D] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="py-3 text-sm font-medium text-[#3a3a3a] 
                             hover:text-[#00B4D8] no-underline 
                             border-b border-[#F5F5F5] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="py-3 text-sm font-medium text-[#3a3a3a] 
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
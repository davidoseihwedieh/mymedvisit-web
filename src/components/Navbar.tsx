'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/technology', label: 'Technology' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="MyMedVisit home">
          <Image
            src="/mmv_website_images/mymedvisit-logo.png"
            alt="MyMedVisit"
            width={2009}
            height={783}
            unoptimized
            priority
            className="hidden h-auto w-[148px] md:block md:w-[176px]"
          />
          <Image
            src="/mmv-icon.png"
            alt="MyMedVisit"
            width={512}
            height={512}
            unoptimized
            priority
            className="h-10 w-10 md:hidden"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-[var(--teal)]/10 text-[var(--teal-dark)]'
                  : 'text-[rgba(13,27,42,0.6)] hover:bg-[rgba(13,27,42,0.05)] hover:text-[var(--ink)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="ml-3 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow)] transition-all hover:shadow-lg"
          >
            Get Early Access
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(13,27,42,0.05)] md:hidden"
          aria-label="Toggle navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {mobileOpen ? (
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[rgba(13,27,42,0.05)] bg-white/95 px-6 pb-6 pt-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[var(--teal)]/10 text-[var(--teal-dark)]'
                    : 'text-[rgba(13,27,42,0.6)] hover:bg-[rgba(13,27,42,0.05)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full bg-[var(--ink)] px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

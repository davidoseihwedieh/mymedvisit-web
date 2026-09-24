'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const navLinks = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/technology', label: 'Technology' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const MOBILE_MENU_ID = 'mobile-nav-menu'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)

  function closeMobileMenu() {
    setMobileOpen(false)
    toggleButtonRef.current?.focus()
  }

  // Escape closes the menu and returns focus to the toggle button, and Tab
  // is kept cycling within the open menu rather than escaping into the page
  // content it's currently overlaying/pushing down.
  useEffect(() => {
    if (!mobileOpen) return

    const container = mobileMenuRef.current
    if (container === null) return

    const getFocusableItems = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ),
      )

    const focusable = getFocusableItems()
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileMenu()
        return
      }

      if (event.key !== 'Tab') return
      const active = document.activeElement

      if (!container || !container.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first)?.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          aria-label="MyMedVisit home"
        >
          <Image
            src="/mmv_website_images/mymedvisit-logo-optimized.png"
            alt="MyMedVisit"
            width={480}
            height={187}
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
                  : 'text-ink-muted hover:bg-[rgba(13,27,42,0.05)] hover:text-[var(--ink)]'
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
          ref={toggleButtonRef}
          onClick={() => {
            if (mobileOpen) {
              closeMobileMenu()
            } else {
              setMobileOpen(true)
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[rgba(13,27,42,0.05)] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          aria-controls={MOBILE_MENU_ID}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                <path
                  d="M3 6H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3 10H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M3 14H17"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id={MOBILE_MENU_ID}
          ref={mobileMenuRef}
          className="border-t border-[rgba(13,27,42,0.05)] bg-white/95 px-6 pb-6 pt-4 backdrop-blur-xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-[var(--teal)]/10 text-[var(--teal-dark)]'
                    : 'text-ink-muted hover:bg-[rgba(13,27,42,0.05)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={closeMobileMenu}
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

import Link from 'next/link'

const footerLinks = {
  product: [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/technology', label: 'Technology' },
    { href: '/contact', label: 'Get Early Access' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms & Conditions' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[rgba(13,27,42,0.05)] bg-white/40 px-6 pb-10 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] text-sm font-bold text-white">
                MV
              </span>
              <span className="text-[15px] font-semibold tracking-wide">MyMedVisit</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-[rgba(13,27,42,0.5)]">
              Your health, remembered by voice. Capture every visit, share with those who care.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(13,27,42,0.4)]">Product</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.product.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-[rgba(13,27,42,0.6)] transition-colors hover:text-[var(--teal)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(13,27,42,0.4)]">Company</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-sm text-[rgba(13,27,42,0.6)] transition-colors hover:text-[var(--teal)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(13,27,42,0.4)]">Legal</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[rgba(13,27,42,0.6)] transition-colors hover:text-[var(--teal)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(13,27,42,0.05)] pt-8">
          <p className="text-xs text-[rgba(13,27,42,0.4)]">
            &copy; {new Date().getFullYear()} MyMedVisit. All rights reserved.
          </p>
          <p className="text-xs text-[rgba(13,27,42,0.3)]">
            Voice-first health intelligence
          </p>
        </div>
      </div>
    </footer>
  )
}

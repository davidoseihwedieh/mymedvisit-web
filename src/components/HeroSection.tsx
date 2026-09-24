import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Longitudinal clinical context
            </p>

            <h1 className="reveal stagger-1 font-[var(--font-fraunces)] text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.14] tracking-tight text-[var(--ink)] [text-wrap:balance]">
              Turn life between visits into information your care team can act
              on.
            </h1>

            <p className="reveal stagger-2 max-w-xl text-lg leading-relaxed text-ink-muted">
              MyMedVisit captures patient and caregiver observations by voice,
              identifies meaningful change over time, and helps connect emerging
              concerns with the appropriate care workflow.
            </p>

            <div className="reveal stagger-3 flex flex-col gap-4 pt-2 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--teal)] px-6 py-3.5 text-base font-semibold text-white shadow-[var(--shadow)] transition-colors hover:bg-[var(--teal-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--teal-dark)]"
                href="/contact"
              >
                Get Early Access
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[rgba(13,27,42,0.16)] px-6 py-3.5 text-base font-semibold text-[var(--ink)] transition-colors hover:bg-[rgba(13,27,42,0.05)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--teal-dark)]"
                href="/how-it-works"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="reveal stagger-2 relative">
            <div className="glass-card flex items-center justify-center rounded-[28px] p-6 sm:p-8">
              <Image
                alt="Illustration of a clinician and a person seated together in conversation, with a phone between them representing a captured visit"
                className="mx-auto h-auto w-full max-w-[360px] object-contain"
                height={1024}
                priority
                src="/mmv_website_images/illustration-hero-voice-capture.png"
                unoptimized
                width={1024}
              />
            </div>
            <p className="mt-3 text-center text-xs text-ink-muted">
              Illustrative example · not a real patient encounter
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

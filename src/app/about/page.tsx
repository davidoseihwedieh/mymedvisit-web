import Link from 'next/link'
import { SectionHeader } from '@/components/SectionHeader'

const values = [
  {
    title: 'Voice-first always',
    description: 'Technology should adapt to people, not the other way around. The most natural interface is the one you were born with.',
  },
  {
    title: 'Privacy as a foundation',
    description: 'Health data is deeply personal. We don\'t treat privacy as a feature — it\'s the bedrock of every design decision.',
  },
  {
    title: 'Clarity over complexity',
    description: 'Healthcare is complicated enough. Every screen, every summary, every interaction is designed to reduce cognitive load.',
  },
  {
    title: 'Families matter',
    description: 'Health is rarely a solo journey. We build for the entire care circle — patients, children, caregivers, and providers.',
  },
]

const milestones = [
  {
    phase: 'Origin',
    title: 'Born from real need',
    description: 'MyMedVisit started when a family member\'s critical post-visit instructions were lost in translation. If a 30-minute doctor visit can be forgotten in 30 seconds, something is broken.',
  },
  {
    phase: 'Research',
    title: 'Understanding the gap',
    description: 'We spent months talking to seniors, caregivers, adult children, and physicians. Everyone wanted better communication, but no one had the tools to make it effortless.',
  },
  {
    phase: 'Development',
    title: 'Building the intelligence',
    description: 'We assembled a pipeline of proprietary voice, language, and medical intelligence systems — each tuned for the unique challenges of clinical speech and health data.',
  },
  {
    phase: 'Today',
    title: 'Early access and growing',
    description: 'MyMedVisit is in early access, serving real families and refining our platform with every visit summarized. We\'re building the future of family health.',
  },
]

export default function About() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16">
        <div className="absolute inset-0 hero-sheen" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              About MyMedVisit
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              Every health conversation{' '}
              <span className="text-gradient">deserves to be remembered</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              No one should leave a doctor&apos;s office wondering what just happened —
              and no family member should have to guess.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal glass-card rounded-[32px] p-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">Our mission</p>
              <h2 className="mt-4 font-[var(--font-fraunces)] text-3xl leading-snug md:text-4xl">
                Make health information effortless to capture, understand, and share — so families can focus on care.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="reveal">
              <SectionHeader tag="The problem" title="Healthcare communication is broken." />
              <div className="mt-6 space-y-4 leading-relaxed text-[rgba(13,27,42,0.6)]">
                <p>
                  The average doctor visit lasts 18 minutes. Within an hour, patients forget
                  40–80% of what was discussed. For seniors managing multiple conditions, lost
                  information means missed medications, duplicated tests, and families left in the dark.
                </p>
                <p>
                  Existing solutions demand typing, navigating complex apps, or rely on patient portals
                  that most seniors never use.
                </p>
              </div>
            </div>
            <div className="reveal stagger-1">
              <div className="rounded-[28px] bg-[var(--ink)] p-10 text-white shadow-[var(--shadow)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">The difference</p>
                <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl text-[var(--sky)]">We start with voice because voice is universal.</h3>
                <p className="mt-5 leading-relaxed text-white/55">
                  No forms. No typing. Just speak naturally — the same way you&apos;d tell a friend
                  what happened at the doctor. Our intelligence handles everything else.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader tag="Our values" title="What guides everything we build." centered />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`reveal rounded-[24px] bg-white/85 p-8 shadow-sm ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.6)]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader tag="Our journey" title="From personal need to platform." />
          <div className="mt-12 space-y-6">
            {milestones.map((m, index) => (
              <div
                key={m.phase}
                className={`reveal grid gap-6 lg:grid-cols-[180px_1fr] ${index % 2 === 1 ? 'stagger-1' : ''}`}
              >
                <div className="flex lg:justify-end">
                  <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]" style={{ background: 'rgba(10,126,164,0.1)' }}>
                    {m.phase}
                  </span>
                </div>
                <div className="rounded-[24px] border border-[rgba(13,27,42,0.08)] bg-white/80 p-8">
                  <h3 className="text-xl font-semibold">{m.title}</h3>
                  <p className="mt-3 leading-relaxed text-[rgba(13,27,42,0.6)]">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal glass-card rounded-[32px] p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">Our vision</p>
                <h2 className="mt-4 font-[var(--font-fraunces)] text-3xl leading-snug md:text-4xl">
                  Health information that flows as naturally as conversation.
                </h2>
              </div>
              <div className="space-y-4 leading-relaxed text-[rgba(13,27,42,0.6)]">
                <p>
                  We envision a future where every health interaction is automatically captured,
                  understood, and shared with the right people at the right time.
                </p>
                <p>
                  Where continuous monitoring from wearables weaves into your health narrative,
                  creating a living document that helps families and providers make better decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="reveal font-[var(--font-fraunces)] text-4xl">Join us in building the future of family health.</h2>
          <p className="reveal stagger-1 mt-4 text-[rgba(13,27,42,0.5)]">
            We&apos;re looking for early adopters, healthcare professionals, and families
            who want to help shape what comes next.
          </p>
          <div className="reveal stagger-2 mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
            >
              Get Early Access
            </Link>
            <Link
              href="/technology"
              className="rounded-full border border-[rgba(13,27,42,0.15)] px-8 py-4 text-sm font-semibold text-[var(--ink)]"
            >
              Explore Our Technology
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

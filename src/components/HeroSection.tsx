export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              LONGITUDINAL CLINICAL CONTEXT
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Turn life between visits into information your care team can act
              on.
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-slate-300">
              MyMedVisit captures patient and caregiver observations by voice,
              identifies meaningful change over time, and helps connect emerging
              concerns with the appropriate care workflow.
            </p>

            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-lg border border-transparent bg-emerald-400 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
                href="/contact"
              >
                Get Early Access
              </a>
              <a
                className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3.5 text-base font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
                href="/how-it-works"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="relative">
            <img
              alt="Illustrative MyMedVisit platform interface"
              className="mx-auto h-[420px] w-full max-w-[420px] rounded-xl border border-slate-800 object-contain shadow-2xl sm:h-[500px] lg:h-[560px]"
              src="/mmv_website_images/dashboardscreen.png"
            />
            <p className="mt-3 text-center text-xs text-slate-400">
              Illustrative platform view · synthetic example
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

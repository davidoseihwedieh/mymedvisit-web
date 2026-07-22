import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Column */}
          <div className="space-y-6">
            <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
              BEYOND INFORMATION — CONTEXT
            </p>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Your doctor visits, <br className="hidden sm:inline" />
              <span className="text-emerald-400">remembered & understood.</span>
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Capture your appointment naturally. MyMedVisit transforms clinical conversations into clear, searchable notes you can query in plain English and share securely with family.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg"
              >
                Get Early Access
              </a>
              <a
                href="/how-it-works"
                className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-700 text-base font-semibold rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                HIPAA-Compliant Architecture
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                AES-256 Encrypted
              </span>
              <span className="text-slate-500">•</span>
              <span>No credit card required</span>
            </div>

            {/* Cited Clinical Evidence */}
            <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 italic leading-relaxed">
              &ldquo;Studies show 40–80% of medical information provided by practitioners is forgotten immediately.&rdquo;
              <a 
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC539473/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-1.5 text-emerald-400 hover:underline not-italic font-medium"
              >
                (Journal of the Royal Society of Medicine)
              </a>
            </div>
          </div>

          {/* Visual Column */}
          <div className="relative">
            <img
              src="/mmv_website_images/dashboardscreen.png"
              alt="MyMedVisit clinical note summary dashboard interface"
              className="rounded-xl shadow-2xl border border-slate-800 w-full object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}

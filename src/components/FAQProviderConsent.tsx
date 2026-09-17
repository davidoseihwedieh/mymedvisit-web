import React from 'react'

export default function FAQProviderConsent() {
  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-4">
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
          />
        </svg>
        How should I ask before recording a healthcare visit?
      </h3>
      <div className="text-slate-700 text-sm leading-relaxed space-y-3">
        <p>
          Ask the people involved for permission before recording. Also follow
          the healthcare organization’s policies and the laws that apply where
          you are. If permission is not clear, do not record.
        </p>
        <blockquote className="pl-4 border-l-4 border-emerald-500 italic text-slate-800 bg-white py-2 pr-3 rounded-r">
          &ldquo;Would it be okay for me to record this conversation for my
          personal reference?&rdquo;
        </blockquote>
        <p>
          <strong>Tip:</strong> Respect a request not to record, and do not
          assume that permission to record also permits sharing the recording or
          its contents with someone else.
        </p>
      </div>
    </div>
  )
}

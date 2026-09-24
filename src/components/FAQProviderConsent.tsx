import React from 'react'

export default function FAQProviderConsent() {
  return (
    <div className="mt-6 rounded-[20px] border border-[rgba(13,27,42,0.1)] bg-white/85 p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--ink)]">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-[var(--teal-dark)]"
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
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-muted">
        <p>
          Ask the people involved for permission before recording. Also follow
          the healthcare organization’s policies and the laws that apply where
          you are. If permission is not clear, do not record.
        </p>
        <blockquote className="rounded-r border-l-4 border-[var(--teal)] bg-[rgba(13,27,42,0.03)] py-2 pl-4 pr-3 italic text-[var(--ink)]">
          &ldquo;Would it be okay for me to record this conversation for my
          personal reference?&rdquo;
        </blockquote>
        <p>
          <strong className="text-[var(--ink)]">Tip:</strong> Respect a request
          not to record, and do not assume that permission to record also
          permits sharing the recording or its contents with someone else.
        </p>
      </div>
    </div>
  )
}

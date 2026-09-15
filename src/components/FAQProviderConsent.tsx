import React from 'react';

export default function FAQProviderConsent() {
  return (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-4">
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        How do I ask my doctor for permission to record our visit?
      </h3>
      <div className="text-slate-700 text-sm leading-relaxed space-y-3">
        <p>
          Most healthcare providers love when patients take active control of their care plans. We recommend opening the conversation naturally before your appointment begins:
        </p>
        <blockquote className="pl-4 border-l-4 border-emerald-500 italic text-slate-800 bg-white py-2 pr-3 rounded-r">
          &ldquo;Doctor, you share a lot of important details during our visits and I want to make sure I follow your instructions accurately. Do you mind if I record our conversation on my health app to generate a summary for myself and my family?&rdquo;
        </blockquote>
        <p>
          <strong>Tip:</strong> Reassure your physician that MyMedVisit is a personal health journal designed specifically to capture key clinical directions, diagnoses, and medication details so nothing gets lost in translation.
        </p>
      </div>
    </div>
  );
}

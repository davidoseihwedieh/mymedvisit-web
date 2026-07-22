import React from 'react';

export default function SchemaMarkup() {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://mymedvisit.app/#application",
        "name": "MyMedVisit",
        "operatingSystem": "iOS, Android, Web",
        "applicationCategory": "HealthApplication",
        "description": "Voice-first health intelligence app that captures doctor appointments, generates searchable clinical notes, and allows plain-English AI Q&A.",
        "url": "https://mymedvisit.app",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "MedicalWebPage",
        "@id": "https://mymedvisit.app/#webpage",
        "url": "https://mymedvisit.app",
        "name": "MyMedVisit | Voice-First Health Intelligence",
        "description": "Summarize doctor appointments, generate searchable clinical notes, and share updates securely with family.",
        "aspect": ["Overview", "Patient Education"]
      },
      {
        "@type": "FAQPage",
        "@id": "https://mymedvisit.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Will MyMedVisit actually understand medical terminology?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Our system is trained specifically on clinical conversations. It understands complex medical terminology, extracts relevant diagnoses and medications, and filters out casual small talk."
            }
          },
          {
            "@type": "Question",
            "name": "Can I really query my visit notes with AI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Subscriber users can ask questions like 'Why did my doctor recommend this medication?' or 'What does this diagnosis mean for my daily life?' Our AI uses medical evidence grounded in your specific visit note to provide clear explanations."
            }
          },
          {
            "@type": "Question",
            "name": "How should I ask my doctor for permission to record our visit?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Simply say: 'Doctor, you cover a lot of important information today and I want to make sure I follow your instructions perfectly. Do you mind if I tap record on my health app to generate a quick summary for myself and my family?' Most providers strongly support patients keeping accurate records."
            }
          },
          {
            "@type": "Question",
            "name": "What happens if I log a dangerous symptom?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "MyMedVisit correlates your logged symptoms with your active conditions. If you log a symptom that indicates a medical emergency relative to your diagnoses (e.g., severe hypertension combined with sudden vision changes), the app issues an immediate alert to seek emergency care."
            }
          },
          {
            "@type": "Question",
            "name": "Can my family really understand medical records?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Family members receive clean clinical summaries and can ask questions in plain English, allowing adult children and remote caregivers to stay informed without needing a medical degree."
            }
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

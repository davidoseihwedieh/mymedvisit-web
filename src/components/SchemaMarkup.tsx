const questions = [
  {
    name: 'Does MyMedVisit diagnose conditions or replace clinical judgment?',
    acceptedAnswer:
      'No. MyMedVisit is designed to organize patient and caregiver observations and support appropriate review. It does not replace advice, diagnosis, or decisions from a qualified healthcare professional.',
  },
  {
    name: 'What should I do if I have a dangerous or rapidly worsening symptom?',
    acceptedAnswer:
      'Do not wait for an app to identify or respond to an urgent problem. If symptoms are severe or rapidly worsening, contact emergency services or a qualified healthcare professional. MyMedVisit is intended to support information organization and care-team review; it does not diagnose or guarantee detection of every urgent concern.',
  },
  {
    name: 'Can a caregiver contribute observations?',
    acceptedAnswer:
      'Patient and caregiver observations can offer different or complementary perspectives. Any sharing of information with another person should be intentional and permission-based; family members do not automatically receive clinical information.',
  },
  {
    name: 'How is my information shared?',
    acceptedAnswer:
      'Sharing should happen only through options you choose and authorize. Review the available controls before sharing information, and share only with people you intend to include.',
  },
  {
    name: 'How should I ask before recording a healthcare visit?',
    acceptedAnswer:
      'Ask the people involved for permission before recording. Also follow the healthcare organization’s policies and the laws that apply where you are. If permission is not clear, do not record.',
  },
]

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mymedvisit.app/#website',
      name: 'MyMedVisit',
      url: 'https://mymedvisit.app',
      description:
        'Patient and caregiver observations organized into longitudinal context to support care-team workflows.',
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://mymedvisit.app/#faq',
      mainEntity: questions.map((question) => ({
        '@type': 'Question',
        name: question.name,
        acceptedAnswer: {
          '@type': 'Answer',
          text: question.acceptedAnswer,
        },
      })),
    },
  ],
}

export default function SchemaMarkup() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}

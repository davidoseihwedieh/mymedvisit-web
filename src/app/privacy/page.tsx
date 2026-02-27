import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1b2a] via-[#1b263b] to-[#0d1b2a]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link 
          href="/" 
          className="inline-flex items-center text-[#1aa99a] hover:text-[#15887c] transition-colors mb-8"
        >
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-8">Last Updated: February 13, 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
            <p>
              Your privacy is fundamental to us at MyMedVisit. This Privacy Policy describes how we collect, 
              use, protect, and handle your information when you use our voice-first health companion mobile application.
            </p>
            <p className="mt-4">
              By using MyMedVisit, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Phone number</strong> – Used for account authentication and verification</li>
              <li><strong>Name and demographic information</strong> – To personalize your experience</li>
              <li><strong>Profile information</strong> – Any additional details you choose to provide</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Health Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Voice recordings</strong> – Temporarily processed to understand your health queries (not permanently stored)</li>
              <li><strong>Health journal entries</strong> – Symptoms, concerns, and notes you record</li>
              <li><strong>Medication information</strong> – Prescriptions and supplements you track</li>
              <li><strong>Health insights</strong> – AI-generated recommendations based on your queries</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Technical Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Device data</strong> – Device type, operating system version, unique device identifiers</li>
              <li><strong>Usage analytics</strong> – Features you use, session duration, interaction patterns</li>
              <li><strong>Performance data</strong> – Crash reports, error logs, and diagnostic information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Provide our core services</strong> – Process voice queries, generate health insights, and maintain your health journal</li>
              <li><strong>Personalize your experience</strong> – Tailor recommendations and reminders to your needs</li>
              <li><strong>Secure your account</strong> – Verify your identity and prevent unauthorized access</li>
              <li><strong>Improve our services</strong> – Analyze usage patterns and enhance AI accuracy</li>
              <li><strong>Communicate with you</strong> – Send health reminders, app updates, and important notifications</li>
              <li><strong>Ensure compliance</strong> – Meet legal and regulatory requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Voice Data Processing</h2>
            <p className="mb-4">Your voice recordings are:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Processed in real-time to convert speech to text</li>
              <li>Sent to OpenAI's API for natural language understanding</li>
              <li>Not permanently stored after processing is complete</li>
              <li>Used only to answer your specific health query</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="mb-4">
              We employ robust security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Encryption</strong> – All sensitive data is encrypted in transit (TLS) and at rest (AES-256)</li>
              <li><strong>HIPAA compliance</strong> – We follow HIPAA guidelines for handling protected health information</li>
              <li><strong>Secure infrastructure</strong> – Data stored on Firebase with enterprise-grade security</li>
              <li><strong>Access controls</strong> – Strict authentication and role-based access limitations</li>
              <li><strong>Regular audits</strong> – Ongoing security assessments and penetration testing</li>
              <li><strong>Incident response</strong> – Established protocols for detecting and responding to breaches</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="mb-4">
              We work with trusted service providers who help us deliver our services:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white/5 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-white/10">
                    <th className="text-left p-4 font-semibold text-white">Service Provider</th>
                    <th className="text-left p-4 font-semibold text-white">Purpose</th>
                    <th className="text-left p-4 font-semibold text-white">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/10">
                    <td className="p-4">OpenAI</td>
                    <td className="p-4">AI processing and natural language understanding</td>
                    <td className="p-4">Voice transcripts, health queries</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-4">Twilio</td>
                    <td className="p-4">SMS authentication and notifications</td>
                    <td className="p-4">Phone number, verification codes</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="p-4">Firebase (Google)</td>
                    <td className="p-4">Cloud storage and authentication</td>
                    <td className="p-4">User data, health journals</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              All third-party providers are bound by strict confidentiality agreements and process data only as directed by us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Disclosure</h2>
            <p className="mb-4 font-semibold text-[#1aa99a]">
              We do not sell, rent, or trade your personal or health information.
            </p>
            <p className="mb-4">
              We may disclose your information only in these limited circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>With your explicit consent</strong> – When you authorize sharing with your healthcare provider</li>
              <li><strong>Legal obligations</strong> – To comply with court orders, subpoenas, or applicable laws</li>
              <li><strong>Safety and security</strong> – To protect against fraud, abuse, or threats to safety</li>
              <li><strong>Business transfers</strong> – In the event of a merger or acquisition (with advance notice to you)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Your Privacy Rights</h2>
            <p className="mb-4">You have the following rights regarding your data:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access</strong> – Request a copy of all personal data we hold about you</li>
              <li><strong>Correction</strong> – Update inaccurate or incomplete information</li>
              <li><strong>Deletion</strong> – Request complete removal of your account and associated data</li>
              <li><strong>Export</strong> – Download your health journal and personal data in a portable format</li>
              <li><strong>Opt-out</strong> – Disable notifications, analytics, or specific features</li>
              <li><strong>Withdraw consent</strong> – Revoke permissions you've previously granted</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, visit Settings &gt; Privacy in the app or contact us at{' '}
              <a href="mailto:privacy@mymedvisit.app" className="text-[#1aa99a] hover:underline">privacy@mymedvisit.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Active accounts</strong> – We retain your data for as long as your account remains active</li>
              <li><strong>Deleted accounts</strong> – Data is permanently deleted within 30 days of account deletion request</li>
              <li><strong>Legal retention</strong> – Certain data may be retained longer when required by law or for legitimate business purposes (e.g., fraud prevention, dispute resolution)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy 
              and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="mb-4">
              MyMedVisit is not intended for individuals under 18 years of age. We do not knowingly collect 
              personal information from minors. If you are a parent or guardian and believe your child has 
              provided us with personal information, please contact us immediately at{' '}
              <a href="mailto:privacy@mymedvisit.app" className="text-[#1aa99a] hover:underline">privacy@mymedvisit.app</a>, 
              and we will delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal 
              requirements. When we make material changes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We will update the "Last Updated" date at the top</li>
              <li>We will notify you via in-app notification or email</li>
              <li>Continued use of the app after changes constitutes acceptance of the updated policy</li>
            </ul>
            <p className="mt-4">
              We encourage you to review this policy regularly to stay informed about how we protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices:
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@mymedvisit.app" className="text-[#1aa99a] hover:underline">privacy@mymedvisit.app</a>
            </p>
            <p className="mt-2">
              <strong>Response time:</strong> We aim to respond within 48 hours
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

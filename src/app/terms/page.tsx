import Link from 'next/link'

export default function TermsAndConditions() {
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
          Terms and Conditions
        </h1>
        <p className="text-gray-400 mb-8">Last updated: February 13, 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using MyMedVisit ("the App"), you agree to be bound by these Terms and 
              Conditions. If you disagree with any part of these terms, you may not access the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Medical Disclaimer</h2>
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6 mb-4">
              <p className="font-semibold text-yellow-400 mb-2">IMPORTANT:</p>
              <p>
                MyMedVisit is NOT a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your physician or other qualified health provider with any 
                questions you may have regarding a medical condition. Never disregard professional medical 
                advice or delay seeking it because of information obtained through MyMedVisit.
              </p>
            </div>
            <p className="mt-4">
              The App provides general health information and insights based on AI processing. This 
              information is for educational and informational purposes only and should not be considered 
              medical advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Use License</h2>
            <p className="mb-4">
              We grant you a personal, non-exclusive, non-transferable, limited license to use the App 
              subject to these Terms. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Modify or copy the App materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software in the App</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">User Responsibilities</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Account Security</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You must be at least 13 years old to use the App</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">Acceptable Use</h3>
            <p className="mb-2">You agree not to use the App to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Upload or transmit malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the App or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Emergency Situations</h2>
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-6">
              <p className="font-semibold text-red-400 mb-2">IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY:</p>
              <p>
                DO NOT USE THIS APP. Call 911 (or your local emergency number) immediately. MyMedVisit 
                is not designed for emergency situations and should never be used as a substitute for 
                emergency medical services.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Health Information Accuracy</h2>
            <p>
              While we strive to provide accurate and up-to-date health information, we make no 
              representations or warranties of any kind about the completeness, accuracy, reliability, 
              or availability of the information provided through the App.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data</h2>
            <p>
              Your use of the App is also governed by our Privacy Policy. By using the App, you consent 
              to the collection, use, and sharing of your information as described in our{' '}
              <Link href="/privacy" className="text-[#1aa99a] hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p>
              The App and its original content, features, and functionality are owned by MyMedVisit and 
              are protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="mb-4">
              The App uses third-party services including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>OpenAI for AI-powered health insights</li>
              <li>Twilio for SMS authentication</li>
              <li>Firebase for data storage and authentication</li>
            </ul>
            <p className="mt-4">
              These services have their own terms and conditions, and we are not responsible for their 
              practices or content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, MyMedVisit shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other 
              intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Your use or inability to use the App</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information</li>
              <li>Any interruption or cessation of transmission to or from the App</li>
              <li>Any bugs, viruses, or the like that may be transmitted through the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MyMedVisit and its officers, directors, employees, 
              and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) 
              arising out of your use of the App or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
            <p>
              We may terminate or suspend your account and access to the App immediately, without prior 
              notice or liability, for any reason, including breach of these Terms. Upon termination, 
              your right to use the App will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will provide at least 30 days' notice prior to any new terms taking effect. Your continued 
              use of the App after changes become effective constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the United 
              States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="mt-4">
              Email: <a href="mailto:legal@mymedvisit.app" className="text-[#1aa99a] hover:underline">legal@mymedvisit.app</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

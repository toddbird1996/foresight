'use client';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-red-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">Terms of Service</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-gray prose-sm">
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>

        <h2>1. About Foresight</h2>
        <p>Foresight is an educational platform that provides information and tools to help parents navigate custody and family court proceedings in Canada. By using Foresight, you agree to these terms.</p>

        <h2>2. Not Legal Advice</h2>
        <p><strong>Foresight does not provide legal advice.</strong> All information, AI responses, filing guides, court form descriptions, and rights information are for educational purposes only. They do not constitute legal advice and should not be relied upon as a substitute for professional legal counsel. We strongly recommend consulting a lawyer for your specific situation.</p>

        <h2>3. Accounts</h2>
        <p>You must be 18 or older to create an account. You are responsible for maintaining the security of your account credentials. You agree to provide accurate information during registration and keep it up to date.</p>

        <h2>4. Subscription Plans</h2>
        <p>We offer free (Bronze) and paid (Silver, Gold) subscription plans. Features and usage limits vary by plan. Prices are in Canadian dollars (CAD) and are subject to change with 30 days' notice. Paid subscriptions can be cancelled at any time.</p>

        <h2>5. AI Features</h2>
        <p>AI-generated content is provided for informational purposes. It may contain errors or outdated information. AI responses do not create an attorney-client relationship. You are solely responsible for decisions made based on AI-generated content.</p>

        <h2>6. Co-Parent Messenger</h2>
        <p>Messages are permanent and cannot be edited or deleted after sending. Both parties can export the full conversation. By using this feature, you consent to your messages being stored and potentially used in legal proceedings by either party.</p>

        <h2>7. User Content</h2>
        <p>You retain ownership of all documents, notes, and content you upload. You grant Foresight a limited license to store and process your content solely for the purpose of providing our services. We will not share your content with third parties except as required by law.</p>

        <h2>8. Acceptable Use</h2>
        <p>You agree not to use Foresight to harass, threaten, or intimidate any person, upload illegal content, misrepresent your identity, or attempt to access other users' data.</p>

        <h2>9. Limitation of Liability</h2>
        <p>Foresight is provided "as is" without warranties. We are not liable for any decisions made based on information provided through our platform. Our total liability is limited to the amount you've paid in subscription fees in the preceding 12 months.</p>

        <h2>10. Changes</h2>
        <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>

        <h2>11. Contact</h2>
        <p>Questions about these terms? Contact us at <strong>legal@foresight.com</strong>.</p>
      </main>
    </div>
  );
}

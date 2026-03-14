'use client';
import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-red-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">Legal Disclaimer</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-gray prose-sm">
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 not-prose mb-6">
          <h3 className="font-bold text-red-800 text-base mb-2">⚠️ Important: Foresight Is Not a Law Firm</h3>
          <p className="text-sm text-red-700 leading-relaxed">Foresight is an educational technology platform. We are not lawyers, and we do not provide legal advice. No information provided through this platform — including AI responses, filing guides, rights information, court form descriptions, or community content — should be interpreted as legal advice.</p>
        </div>

        <h2>Educational Purpose</h2>
        <p>All content on Foresight is provided for educational and informational purposes only. Our goal is to help self-represented parents understand the custody court process, find relevant forms and resources, and organize their case information. This information is not a substitute for legal advice from a qualified lawyer.</p>

        <h2>AI Disclaimer</h2>
        <p>Our AI assistant provides general legal information based on publicly available laws, regulations, and procedures. AI responses may be inaccurate, incomplete, or outdated. The AI does not know the specific facts of your case, and its responses should not be relied upon as legal guidance. Always verify AI-generated information independently.</p>

        <h2>No Attorney-Client Relationship</h2>
        <p>Using Foresight does not create an attorney-client relationship, a solicitor-client relationship, or any form of professional legal relationship. Foresight's founders, employees, and AI systems are not licensed to practice law.</p>

        <h2>Accuracy of Information</h2>
        <p>While we strive to keep all information current and accurate, laws, court procedures, and government forms change frequently. We cannot guarantee that all information on the platform is current at any given time. Court forms, filing procedures, and legal rights may have changed since the information was last updated.</p>

        <h2>Your Responsibility</h2>
        <p>You are solely responsible for verifying the accuracy of any information before relying on it, making your own legal decisions, consulting a lawyer when needed, and ensuring your court filings comply with current requirements.</p>

        <h2>Jurisdiction</h2>
        <p>Foresight focuses on Canadian family law. Laws vary significantly between provinces and territories. Information about one province may not apply to another. If your situation involves multiple jurisdictions, consult a lawyer.</p>

        <h2>Seek Legal Help</h2>
        <p>If you are involved in a custody dispute, we strongly recommend consulting with a family lawyer. If you cannot afford a lawyer, contact Legal Aid in your province or visit the Programs section of Foresight to find free legal resources in your area.</p>
      </main>
    </div>
  );
}

'use client';
import Link from 'next/link';
import Header from '../components/Header';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Disclaimer</h1>
            <p className="text-sm text-gray-500">Last updated: January 2025</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Not Legal Advice</p>
            <p className="text-sm text-amber-800">Foresight provides legal information, not legal advice. There is an important difference. Legal information explains the law generally. Legal advice applies the law to your specific situation. Only a licensed lawyer can provide legal advice.</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">What Foresight Is</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Foresight is a self-help platform that provides general legal information, procedural guides, court form resources, and tools to help self-represented parents understand and navigate the family law system in Canada. Our content is based on publicly available legislation, court rules, and government publications.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">What Foresight Is Not</h2>
            <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
              <li>• Foresight is not a law firm and does not provide legal representation</li>
              <li>• The AI assistant does not provide legal advice — it provides general legal information only</li>
              <li>• Nothing in this platform creates a lawyer-client relationship</li>
              <li>• Information on this platform is not a substitute for advice from a qualified lawyer</li>
              <li>• Court procedures, legislation, and forms change frequently — always verify current requirements with the court or a lawyer</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Saskatchewan-Specific Notice</h2>
            <p className="text-sm text-gray-700 leading-relaxed">While Foresight is currently focused on Saskatchewan family law, the laws and procedures vary significantly between provinces and territories. Always confirm that the information applies to your specific jurisdiction and that the forms, timelines, and procedures are current.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">AI-Generated Content</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Foresight uses artificial intelligence to help answer questions and analyze documents. AI responses may contain errors, omissions, or outdated information. Never rely solely on AI-generated content for important legal decisions. Always verify information with a qualified professional.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">When You Need a Lawyer</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">We strongly recommend consulting a lawyer if:</p>
            <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
              <li>• There are safety concerns for you or your children</li>
              <li>• Child protection services (CPS) is involved</li>
              <li>• There are complex property or support issues</li>
              <li>• The other party has legal representation</li>
              <li>• You are unsure about any step in the process</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">Legal Aid Saskatchewan: <a href="tel:18006673764" className="text-red-600 hover:underline">1-800-667-3764</a> (free if eligible)</p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <Link href="/dashboard" className="text-red-600 text-sm font-medium hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

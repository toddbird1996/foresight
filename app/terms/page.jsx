'use client';
import Link from 'next/link';
import Header from '../components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500">Last updated: January 2025</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">By using Foresight, you agree to these terms. Please read them carefully. If you disagree, do not use the service.</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">1. What Foresight Provides</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Foresight is a self-help platform providing general legal information, procedural guides, document tools, and AI-powered assistance for parents navigating family law in Canada. We are not a law firm. Use of this platform does not create a lawyer-client relationship.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">2. Acceptable Use</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-2">You agree to use Foresight only for lawful purposes. You must not:</p>
            <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
              <li>• Use the platform to harass, intimidate, or harm any person</li>
              <li>• Share your account with others</li>
              <li>• Attempt to circumvent security measures</li>
              <li>• Upload content that is illegal, harmful, or violates others rights</li>
              <li>• Use the AI assistant to obtain advice for harming children or other parties</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">3. Subscriptions and Billing</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Free accounts (Bronze) include limited trial access to AI features. Paid plans (Silver: $9.99/month CAD, Gold: $19.99/month CAD) are billed monthly and may be cancelled at any time. We do not offer refunds for partial months. Pricing may change with 30 days notice.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">4. Limitation of Liability</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Foresight is provided as-is without warranty. We are not responsible for outcomes in your legal proceedings, errors in AI-generated content, or decisions you make based on information from this platform. Your use of this service is at your own risk.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">5. Termination</h2>
            <p className="text-sm text-gray-700 leading-relaxed">We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">6. Governing Law</h2>
            <p className="text-sm text-gray-700 leading-relaxed">These terms are governed by the laws of Saskatchewan, Canada. Any disputes will be resolved in the courts of Saskatchewan.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">7. Contact</h2>
            <p className="text-sm text-gray-700">Questions: <a href="mailto:info@foresight-app.ca" className="text-red-600 hover:underline">info@foresight-app.ca</a></p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <Link href="/dashboard" className="text-red-600 text-sm font-medium hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

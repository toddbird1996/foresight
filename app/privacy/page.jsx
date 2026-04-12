'use client';
import Link from 'next/link';
import Header from '../components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: January 2025</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Information We Collect</h2>
            <p className="text-sm text-gray-700 leading-relaxed">We collect information you provide when creating an account (name, email), completing onboarding (jurisdiction, case type, family situation), and using the app (case files, documents, messages, incident log entries, and calendar events). We also collect usage data to improve the service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">How We Use Your Information</h2>
            <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
              <li>• To provide and personalize the Foresight service</li>
              <li>• To give the AI assistant context about your case</li>
              <li>• To send deadline reminders and notifications you have enabled</li>
              <li>• To improve the platform based on usage patterns</li>
              <li>• We never sell your personal information to third parties</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Your Data and Legal Proceedings</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-800 leading-relaxed">Your incident log, case notes, and documents are private and visible only to you. We do not share this information with courts, the other party in your case, or any third party without your explicit consent or a valid legal order requiring us to do so.</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Data Storage</h2>
            <p className="text-sm text-gray-700 leading-relaxed">Your data is stored on Supabase servers in Canada (ca-central-1). We use industry-standard security practices including row-level security to ensure only you can access your data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Your Rights</h2>
            <p className="text-sm text-gray-700 leading-relaxed">You have the right to access, correct, or delete your data at any time. To request deletion of your account and all associated data, contact us at the email below. We will process requests within 30 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            <p className="text-sm text-gray-700">Questions about this policy: <a href="mailto:info@foresight-app.ca" className="text-red-600 hover:underline">info@foresight-app.ca</a></p>
          </section>

          <div className="pt-4 border-t border-gray-100">
            <Link href="/dashboard" className="text-red-600 text-sm font-medium hover:underline">← Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-red-600">←</Link>
          <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-gray prose-sm">
        <p className="text-gray-500 text-sm">Last updated: March 2026</p>

        <h2>1. Information We Collect</h2>
        <p>When you create an account, we collect your name, email address, and province. When you use the platform, we store your case information, uploaded documents, AI chat history, co-parent messages, and filing progress. We do not sell, share, or distribute your personal information to third parties.</p>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used solely to provide and improve Foresight's services, including personalized filing guides, AI responses, and case management. Your case data is private and only accessible to you.</p>

        <h2>3. Data Storage & Security</h2>
        <p>All data is stored securely on Supabase infrastructure in Canada (Central region). Documents are stored in encrypted storage buckets. We use Row Level Security (RLS) to ensure users can only access their own data. All connections use HTTPS encryption.</p>

        <h2>4. Co-Parent Messenger</h2>
        <p>Messages sent through the Co-Parent Messenger are permanent, timestamped, and cannot be edited or deleted. Both parties in a conversation can view all messages. Messages may be exported as court-ready documents by either party.</p>

        <h2>5. AI Features</h2>
        <p>When you use AI features, your questions and context are sent to our AI provider (Anthropic) for processing. AI responses are generated based on your input and publicly available legal information. We do not use your data to train AI models.</p>

        <h2>6. Your Rights</h2>
        <p>You can request to download or delete your account data at any time by contacting us. Deleting your account will remove your profile, cases, documents, and AI chat history. Co-parent messages are retained as they constitute a shared record.</p>

        <h2>7. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>

        <h2>8. Contact</h2>
        <p>For privacy questions, contact us at <strong>privacy@foresight.com</strong>.</p>
      </main>
    </div>
  );
}

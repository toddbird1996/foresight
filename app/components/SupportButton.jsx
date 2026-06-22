'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SupportButton({ user, tier }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const isBronze = tier === 'bronze';

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          subject,
          message,
          tier
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send. Please email us directly.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Email us at Foresightcustodysupport@gmail.com');
    }
    setSending(false);
  };

  if (isBronze) {
    // Bronze — show locked badge with upgrade prompt
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
        <span className="text-sm">🔒</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-700">Priority Support</p>
          <p className="text-[10px] text-gray-400">Available on Silver & Gold</p>
        </div>
        <Link href="/pricing" className="text-[10px] font-bold text-red-600 hover:underline">Upgrade →</Link>
      </div>
    );
  }

  return (
    <>
      {/* Support Button */}
      <button
        onClick={() => { setOpen(true); setSent(false); setError(''); setSubject(''); setMessage(''); }}
        className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-colors group w-full"
      >
        <span className="text-sm">🎯</span>
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold text-red-700">Priority Support</p>
          <p className="text-[10px] text-red-400">We respond within 24 hours</p>
        </div>
        <span className="text-red-400 text-xs group-hover:translate-x-0.5 transition-transform">→</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Priority Support</p>
                <p className="text-red-200 text-[10px]">We respond within 24 hours · {tier === 'gold' ? 'Gold' : 'Silver'} member</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg font-bold">✕</button>
            </div>

            {sent ? (
              <div className="p-6 text-center space-y-3">
                <div className="text-4xl">✅</div>
                <p className="font-bold text-gray-900">Ticket Submitted!</p>
                <p className="text-sm text-gray-500">We received your message and will respond to <strong>{user?.email}</strong> within 24 hours.</p>
                <p className="text-xs text-gray-400">You can also reach us at Foresightcustodysupport@gmail.com</p>
                <button onClick={() => setOpen(false)} className="mt-2 w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700">
                  Done
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Issue with document scan"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {sending ? 'Sending...' : 'Submit Ticket'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

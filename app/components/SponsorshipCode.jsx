'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SponsorshipCodeInput({ userId, currentTier, onSuccess }) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) return;
    setValidating(true);
    setError('');
    setPreview(null);

    try {
      const res = await fetch(`/api/redeem?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.valid) {
        setPreview(data);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setValidating(false);
  };

  const handleRedeem = async () => {
    if (!preview || !userId) return;
    setRedeeming(true);
    setError('');

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: code.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data);
        if (onSuccess) onSuccess(data);
      } else {
        setError(data.error || 'Failed to redeem code');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setRedeeming(false);
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 overflow-hidden">
        <div className="bg-green-600 px-4 py-3 flex items-center gap-2">
          <span className="text-xl">✅</span>
          <p className="text-white font-bold text-sm">Sponsored Access Activated!</p>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-sm text-gray-700">
            <strong>{success.organization}</strong> has sponsored your{' '}
            <strong className="capitalize">{success.tier}</strong> access.
          </p>
          <p className="text-xs text-gray-500">
            Active for <strong>{success.duration_days} days</strong> — expires{' '}
            {new Date(success.sponsored_until).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xs text-green-600 font-medium">You now have full AI access — no charge to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-800">Have a sponsorship code?</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Organizations like FLIC, Ranch Ehrlo, and band offices can sponsor your access
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => {
              setCode(e.target.value.toUpperCase());
              setPreview(null);
              setError('');
            }}
            placeholder="Enter your code (e.g. FLIC2026)"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-red-400"
            maxLength={20}
          />
          <button
            onClick={handleValidate}
            disabled={!code.trim() || validating}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            {validating ? '...' : 'Check'}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}

        {preview && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-sm font-bold text-green-800">Valid code!</p>
                <p className="text-xs text-green-600">Sponsored by {preview.organization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Access level</p>
                <p className="text-sm font-bold text-gray-800 capitalize">{preview.tier}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-bold text-gray-800">{preview.duration_days} days</p>
              </div>
            </div>
            <p className="text-[10px] text-green-700 text-center">
              {preview.uses_remaining} sponsored spots remaining
            </p>
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              {redeeming ? 'Activating...' : 'Activate Sponsored Access →'}
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-400 text-center">
          Codes are provided by partner organizations — free to you, sponsored by them
        </p>
      </div>
    </div>
  );
}

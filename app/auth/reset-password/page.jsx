'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the token exchange automatically when the page loads
    // via the URL hash fragment. We just need to wait for the session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
      if (event === 'SIGNED_IN') setReady(true);
    });
    // Also check if already in recovery state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async () => {
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true); setLoading(false);
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔑</div>
          <h1 className="text-xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a new password for your account</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-bold text-gray-900 mb-2">Password Updated</h2>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </div>
        ) : !ready ? (
          <div className="text-center py-6">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Verifying your reset link...</p>
            <p className="text-xs text-gray-400 mt-2">If this takes too long, the link may have expired. <Link href="/auth/login" className="text-red-600">Request a new one</Link></p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                placeholder="Type it again" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
            </div>
            <button onClick={handleReset} disabled={loading || !password || !confirm}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

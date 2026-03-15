'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push('/dashboard'); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address first'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) { setError(error.message); }
    else { setResetSent(true); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">F</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue your case</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>}

            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><span className="text-green-600 text-xl">✓</span></div>
                <h3 className="font-semibold text-gray-900 mb-1">Check your email</h3>
                <p className="text-sm text-gray-500 mb-4">We sent a password reset link to <strong>{email}</strong></p>
                <button onClick={() => { setShowReset(false); setResetSent(false); }} className="text-sm text-red-600">Back to login</button>
              </div>
            ) : showReset ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-gray-500">Back to login</button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <button type="button" onClick={() => setShowReset(true)} className="text-xs text-red-600 hover:underline">Forgot password?</button>
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account? <Link href="/auth/signup" className="text-red-600 font-medium hover:underline">Sign up free</Link>
          </p>
          <p className="text-center text-[11px] text-gray-400 mt-3">Foresight provides educational guidance, not legal advice.</p>
        </div>
      </main>
    </div>
  );
}

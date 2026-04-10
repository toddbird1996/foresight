'use client';
import { useState, Suspense } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) { setError(signUpError.message); setLoading(false); return; }

    if (data.user) {
      // Create user profile row
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        tier: 'bronze',
        jurisdiction: 'saskatchewan',
        referred_by: null, // will be set below if ref code found
      });

      if (profileError && profileError.code !== '23505') {
        console.warn('Profile creation warning:', profileError.message);
      }

      // Handle referral code
      if (refCode) {
        const { data: referrer } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', refCode)
          .single();

        if (referrer) {
          // Link referred_by on the new user
          await supabase.from('users')
            .update({ referred_by: referrer.id })
            .eq('id', data.user.id);

          // Create referral record
          await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referral_code: refCode,
            referred_email: email,
            referred_user_id: data.user.id,
            status: 'signed_up',
          });
        }
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-600">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 mb-2">We sent a confirmation link to</p>
          <p className="font-semibold text-gray-900 mb-6">{email}</p>
          <p className="text-sm text-gray-400 mb-6">Click the link in that email to activate your account. Check your spam folder if you don't see it within a few minutes.</p>
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">F</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Start navigating your custody case today</p>
          </div>

          {refCode && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 text-sm text-green-700 text-center">
              🤝 You were referred by a Foresight member
            </div>
          )}

          <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="text-green-600">✓</span> Free to start</span>
            <span className="flex items-center gap-1"><span className="text-green-600">✓</span> No credit card</span>
            <span className="flex items-center gap-1"><span className="text-green-600">✓</span> Cancel anytime</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">{error}</div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-red-400 text-gray-900" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50">
                {loading ? 'Creating account...' : 'Create Free Account'}
              </button>
            </form>

            <p className="text-[11px] text-gray-400 mt-4 text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-red-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" /></div>}>
      <SignupForm />
    </Suspense>
  );
}

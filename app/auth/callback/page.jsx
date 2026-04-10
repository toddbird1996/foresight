'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically processes the token from the URL hash/query params.
      // We just need to listen for the resulting auth event.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setStatus('success');
          // Small delay so user sees the success state
          setTimeout(() => router.push('/dashboard'), 1000);
          subscription.unsubscribe();
        } else if (event === 'PASSWORD_RECOVERY') {
          // Redirect to reset password page - session is already set
          router.push('/auth/reset-password');
          subscription.unsubscribe();
        }
      });

      // Also check if a session already exists (e.g. link already clicked)
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setStatus('error');
        setErrorMsg(error.message);
        return;
      }
      if (session) {
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 1000);
      }

      // Timeout fallback — if nothing happens in 8s, something went wrong
      setTimeout(() => {
        setStatus(prev => {
          if (prev === 'verifying') {
            setErrorMsg('The confirmation link may have expired. Please request a new one.');
            return 'error';
          }
          return prev;
        });
      }, 8000);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm text-center">
        {status === 'verifying' && (
          <>
            <div className="w-12 h-12 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="font-bold text-gray-900 mb-1">Confirming your account</h2>
            <p className="text-sm text-gray-500">Just a moment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <h2 className="font-bold text-gray-900 mb-1">Email confirmed!</h2>
            <p className="text-sm text-gray-500">Taking you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="font-bold text-gray-900 mb-2">Confirmation failed</h2>
            <p className="text-sm text-gray-500 mb-5">{errorMsg}</p>
            <a href="/auth/login" className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

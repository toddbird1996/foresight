'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

export default function ReferPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);

      // Get or create referral code
      const { data: profile } = await supabase.from('users').select('referral_code').eq('id', user.id).single();
      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      } else {
        const code = 'FS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase.from('users').update({ referral_code: code }).eq('id', user.id);
        setReferralCode(code);
      }

      // Fetch referrals
      const { data: refs } = await supabase.from('referrals').select('*').eq('referrer_id', user.id).order('created_at', { ascending: false });
      setReferrals(refs || []);
      setLoading(false);
    };
    init();
  }, []);

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${referralCode}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Foresight - Navigate Custody with Confidence',
          text: 'I\'m using Foresight to navigate my custody case. It has filing guides, court forms, and AI assistance for all 13 Canadian provinces. Join free:',
          url: referralLink,
        });
      } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  };

  const signedUp = referrals.filter(r => r.status === 'signed_up' || r.status === 'active').length;
  const pending = referrals.filter(r => r.status === 'pending').length;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white text-center mb-6">
          <div className="text-4xl mb-3">🤝</div>
          <h1 className="text-xl font-bold mb-2">Help Another Parent</h1>
          <p className="text-sm text-red-100 mb-4">Know someone going through a custody battle? Share Foresight — it's free to start and could change their case.</p>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-4">
            <div className="text-xs text-red-200 mb-1">Your referral link</div>
            <div className="text-sm font-mono break-all">{referralLink}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={shareLink} className="flex-1 py-3 bg-white text-red-600 rounded-xl font-semibold text-sm">
              📤 Share
            </button>
            <button onClick={copyLink} className="flex-1 py-3 bg-white/20 text-white rounded-xl font-semibold text-sm">
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{referrals.length}</div>
            <div className="text-xs text-gray-500">Invited</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{signedUp}</div>
            <div className="text-xs text-gray-500">Signed Up</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Share Options */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Share via</h3>
          <div className="space-y-2">
            <a href={`sms:?body=I'm using Foresight to navigate my custody case. Free filing guides, court forms, and AI assistance for all Canadian provinces. Check it out: ${referralLink}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-xl">💬</span>
              <span className="text-sm text-gray-700">Text Message</span>
            </a>
            <a href={`mailto:?subject=Foresight - Free Custody Help&body=Hey, I wanted to share this app with you. Foresight helps parents navigate custody battles with step-by-step filing guides, court forms, and AI assistance. It covers all 13 Canadian provinces. You can sign up free here: ${referralLink}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-xl">📧</span>
              <span className="text-sm text-gray-700">Email</span>
            </a>
            <a href={`https://wa.me/?text=I'm using Foresight to navigate my custody case. Free filing guides, court forms, and AI for all Canadian provinces. Check it out: ${encodeURIComponent(referralLink)}`}
              target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-xl">📱</span>
              <span className="text-sm text-gray-700">WhatsApp</span>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
              target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-xl">📘</span>
              <span className="text-sm text-gray-700">Facebook</span>
            </a>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Your Referral Code</h3>
          <p className="text-sm text-gray-500 mb-3">Friends can enter this code when signing up.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-red-600 tracking-wider">{referralCode}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

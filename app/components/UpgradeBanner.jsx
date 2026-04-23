'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { track, EVENTS } from '../lib/analytics';

// Shown when Bronze user is running low or hits a limit
export function UpgradeBanner({ type = 'soft', remaining = null, feature = 'AI' }) {
  useEffect(() => {
    track(EVENTS.UPGRADE_BANNER_SEEN, { type, feature });
  }, []);
  if (type === 'hard') {
    // Hit the wall — full block with emotional urgency
    return (
      <div className="mx-4 my-3 rounded-2xl overflow-hidden border border-red-200 shadow-sm">
        <div className="bg-red-600 px-4 py-3 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <p className="text-white font-bold text-sm">You've reached your free limit</p>
        </div>
        <div className="bg-white px-4 py-4 space-y-3">
          <p className="text-gray-800 text-sm leading-relaxed">
            Your free {feature} access has been used up. Your case doesn't stop — but your tools just did.
          </p>
          <p className="text-gray-600 text-xs leading-relaxed">
            Family court doesn't pause. Missing a deadline, misreading a document, or filing incorrectly can cost you months — or worse, affect your parenting time.
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700">Silver</span>
                <span className="text-xs font-bold text-red-600">$19.99/mo</span>
              </div>
              <p className="text-[11px] text-gray-500">500 AI questions/month · 5 document scans · Full analysis</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 border border-red-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-700">Gold</span>
                <span className="text-xs font-bold text-red-600">$29.99/mo</span>
              </div>
              <p className="text-[11px] text-gray-500">2,000 AI questions/month · 20 document scans · Priority support</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 text-center">One hour with a lawyer costs $300–$500. Foresight costs less than $1 a day.</p>
          <Link href="/pricing"
            onClick={() => track(EVENTS.UPGRADE_CLICKED, { source: 'hard_limit_banner', type })}
            className="block w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl text-center transition-colors">
            Upgrade Now — Stay in Control
          </Link>
        </div>
      </div>
    );
  }

  if (type === 'low') {
    // Running low — soft nudge with urgency
    return (
      <div className="mx-4 my-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
        <span className="text-lg mt-0.5">⏳</span>
        <div className="flex-1">
          <p className="text-amber-900 text-xs font-bold">
            {remaining === 1 ? 'Last free question remaining' : `Only ${remaining} free question${remaining !== 1 ? 's' : ''} left`}
          </p>
          <p className="text-amber-700 text-[11px] mt-0.5 leading-relaxed">
            Your case needs more than {remaining} answer{remaining !== 1 ? 's' : ''}. Upgrade to Silver for 500/month.
          </p>
          <Link href="/pricing" className="inline-block mt-1.5 text-[11px] font-bold text-red-600 hover:underline">
            Upgrade before you run out →
          </Link>
        </div>
      </div>
    );
  }

  // Default: dashboard passive upsell banner for Bronze users
  return (
    <div className="mx-4 my-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔓</span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">You're on the Free plan</p>
          <p className="text-red-100 text-xs mt-1 leading-relaxed">
            You have <strong className="text-white">5 AI questions</strong> and <strong className="text-white">1 document scan</strong> total.
            Your case will need more than that.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'AI Questions', free: '5 total', paid: '500/month' },
              { label: 'Document Scans', free: '1 total', paid: '5/month' },
              { label: 'Court Doc Analysis', free: '❌ Locked', paid: '✅ Included' },
              { label: 'Priority Support', free: '❌ Locked', paid: '✅ Included' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-lg px-2.5 py-2">
                <p className="text-[10px] text-red-200 font-medium">{item.label}</p>
                <p className="text-[11px] text-white/60 line-through">{item.free}</p>
                <p className="text-[11px] text-white font-bold">{item.paid}</p>
              </div>
            ))}
          </div>
          <p className="text-red-100 text-[10px] mt-2 text-center">
            Less than $1/day. One lawyer hour costs $300–$500.
          </p>
          <Link href="/pricing"
            onClick={() => track(EVENTS.UPGRADE_CLICKED, { source: 'dashboard_default_banner', type })}
            className="mt-3 block w-full bg-white text-red-600 font-bold text-xs py-2.5 rounded-xl text-center hover:bg-red-50 transition-colors">
            See Plans & Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline lock badge for locked features
export function LockedFeatureBadge({ feature, plan = 'Silver' }) {
  return (
    <Link href="/pricing" className="inline-flex items-center gap-1 bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full px-2 py-0.5 transition-colors group">
      <span className="text-[10px]">🔒</span>
      <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-medium">{plan}+</span>
    </Link>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const PROVINCE_NAMES = {
  saskatchewan: 'Saskatchewan', alberta: 'Alberta', ontario: 'Ontario',
  british_columbia: 'British Columbia', manitoba: 'Manitoba', quebec: 'Quebec',
  nova_scotia: 'Nova Scotia', new_brunswick: 'New Brunswick',
  newfoundland: 'Newfoundland & Labrador', pei: 'Prince Edward Island',
  northwest_territories: 'Northwest Territories', yukon: 'Yukon', nunavut: 'Nunavut',
};

const CASE_STATUS_LABELS = {
  no_case: 'Gathering information', preparing: 'Preparing to file',
  filed: 'Application filed', waiting_hearing: 'Waiting for hearing',
  mediation: 'In mediation', responding: 'Responding to papers',
  cps: 'CPS / child protection', modification: 'Modifying existing order',
};

const CASE_TYPE_LABELS = {
  custody: '👶 Custody / Parenting', divorce: '💔 Divorce',
  support: '💰 Child Support', protection: '🛡️ Child Protection',
  variation: '📝 Variation of Order',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [stats, setStats] = useState({ cases: 0, documents: 0, deadlines: 0, posts: 0, referrals: 0 });
  const [saved, setSaved] = useState(false);

  // Edit state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jurisdiction, setJurisdiction] = useState('saskatchewan');
  const [caseStatus, setCaseStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [numChildren, setNumChildren] = useState('');
  const [childrenAges, setChildrenAges] = useState('');
  const [custodySituation, setCustodySituation] = useState('');
  const [emailReminders, setEmailReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);

  // Password change
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);

      const { data: p } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (p) {
        setProfile(p);
        setFullName(p.full_name || '');
        setPhone(p.phone || '');
        setJurisdiction(p.jurisdiction || 'saskatchewan');
        setCaseStatus(p.case_status || '');
        setCaseType(p.case_type || 'custody');
        setNumChildren(p.num_children?.toString() || '');
        setChildrenAges(p.children_ages || '');
        setCustodySituation(p.custody_situation || '');
        setEmailReminders(p.email_reminders !== false);
        setReminderDays(p.reminder_days_before || 3);
      }

      // Fetch activity stats
      const uid = user.id;
      const [cases, docs, deadlines, posts, referrals] = await Promise.all([
        supabase.from('cases').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('case_documents').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('deadlines').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('community_posts').select('id', { count: 'exact' }).eq('user_id', uid),
        supabase.from('referrals').select('id', { count: 'exact' }).eq('referrer_id', uid),
      ]);
      setStats({
        cases: cases.count || 0,
        documents: docs.count || 0,
        deadlines: deadlines.count || 0,
        posts: posts.count || 0,
        referrals: referrals.count || 0,
      });
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('users').update({
      full_name: fullName,
      phone,
      jurisdiction,
      case_status: caseStatus,
      case_type: caseType,
      num_children: parseInt(numChildren) || null,
      children_ages: childrenAges,
      custody_situation: custodySituation,
      email_reminders: emailReminders,
      reminder_days_before: reminderDays,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    if (!error) {
      setProfile(p => ({ ...p, full_name: fullName, phone, jurisdiction, case_status: caseStatus, case_type: caseType }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPass !== confirmPass) { setPassMsg('Passwords do not match'); return; }
    if (newPass.length < 6) { setPassMsg('Password must be at least 6 characters'); return; }
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPassMsg(error ? error.message : '✅ Password updated successfully');
    if (!error) { setCurrentPass(''); setNewPass(''); setConfirmPass(''); }
    setChangingPass(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const copyReferral = () => {
    const url = `${window.location.origin}/auth/signup?ref=${profile?.referral_code}`;
    navigator.clipboard?.writeText(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  const tier = profile?.tier || 'bronze';
  const tierColors = { gold: 'text-amber-600 bg-amber-50 border-amber-200', silver: 'text-gray-600 bg-gray-50 border-gray-200', bronze: 'text-orange-600 bg-orange-50 border-orange-200' };
  const tierEmoji = { gold: '🥇', silver: '🥈', bronze: '🥉' };
  const maxAI = tier === 'gold' ? 2000 : tier === 'silver' ? 500 : 5;
  const aiUsed = profile?.monthly_ai_used || 0;
  const aiPct = Math.min(100, Math.round((aiUsed / maxAI) * 100));
  const maxPDF = tier === 'gold' ? 20 : tier === 'silver' ? 5 : 1;
  const pdfUsed = profile?.monthly_pdf_scans_used || 0;
  const pdfPct = Math.min(100, Math.round((pdfUsed / maxPDF) * 100));
  const initials = (fullName || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const TABS = [
    { id: 'account', label: '👤 Account', icon: '👤' },
    { id: 'case', label: '⚖️ My Case', icon: '⚖️' },
    { id: 'subscription', label: '⭐ Plan', icon: '⭐' },
    { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
    { id: 'referral', label: '🤝 Referrals', icon: '🤝' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="My Profile" subtitle="Account & settings" icon="👤" />

      <main className="max-w-3xl mx-auto px-4 py-6">

        {/* Profile Hero */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{fullName || 'No name set'}</h2>
              <p className="text-gray-500 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tierColors[tier]}`}>
                  {tierEmoji[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
                <span className="text-xs text-gray-400">Member since {memberSince}</span>
                {profile?.jurisdiction && (
                  <span className="text-xs text-gray-400">📍 {PROVINCE_NAMES[profile.jurisdiction] || profile.jurisdiction}</span>
                )}
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-5 gap-3 mt-5 pt-5 border-t border-gray-100">
            {[
              { label: 'Cases', value: stats.cases, icon: '💼', href: '/cases' },
              { label: 'Docs', value: stats.documents, icon: '📄', href: '/cases' },
              { label: 'Deadlines', value: stats.deadlines, icon: '📅', href: '/deadlines' },
              { label: 'Posts', value: stats.posts, icon: '💬', href: '/community' },
              { label: 'Referrals', value: stats.referrals, icon: '🤝', href: '/refer' },
            ].map(s => (
              <Link key={s.label} href={s.href} className="text-center hover:bg-gray-50 rounded-xl p-2 transition-colors">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className="text-lg font-bold text-gray-900">{s.value}</div>
                <div className="text-[10px] text-gray-400 font-medium">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto bg-white border border-gray-200 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {t.icon} {t.label.split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>

        {/* Save banner */}
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium flex items-center gap-2">
            ✅ Saved successfully
          </div>
        )}

        {/* ── ACCOUNT TAB ── */}
        {activeTab === 'account' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">Personal Information</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Phone (optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (306) 555-0000"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Province / Jurisdiction</label>
              <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors">
                {Object.entries(PROVINCE_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        )}

        {/* ── CASE TAB ── */}
        {activeTab === 'case' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-2">Case Details</h3>
            <p className="text-xs text-gray-500 -mt-2">This information personalizes your experience — filing guides, AI responses, and action plans are tailored to your situation.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Where are you in the process?</label>
              <select value={caseStatus} onChange={e => setCaseStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400">
                <option value="">Not set</option>
                {Object.entries(CASE_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Case Type</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CASE_TYPE_LABELS).map(([val, label]) => (
                  <button key={val} onClick={() => setCaseType(val)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${caseType === val ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-red-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Number of Children</label>
                <input type="number" min="0" max="12" value={numChildren} onChange={e => setNumChildren(e.target.value)} placeholder="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Ages (e.g. 4, 7, 12)</label>
                <input type="text" value={childrenAges} onChange={e => setChildrenAges(e.target.value)} placeholder="4, 7, 12"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Custody Situation</label>
              <select value={custodySituation} onChange={e => setCustodySituation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400">
                <option value="">Not set</option>
                <option value="no_agreement">No agreement yet</option>
                <option value="informal">Informal agreement</option>
                <option value="consent_order">Consent order in place</option>
                <option value="court_order">Court order in place</option>
                <option value="seeking_primary">Seeking primary custody</option>
                <option value="seeking_shared">Seeking shared custody</option>
                <option value="denied_access">Being denied access</option>
                <option value="high_conflict">High conflict situation</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 leading-relaxed">
              <strong>📍 Your province:</strong> {PROVINCE_NAMES[jurisdiction] || jurisdiction} — all guides, forms, and AI responses are tailored to your jurisdiction.
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
              {saving ? '⏳ Saving...' : '💾 Save Case Info'}
            </button>
          </div>
        )}

        {/* ── SUBSCRIPTION TAB ── */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{tierEmoji[tier]} {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{tier === 'bronze' ? 'Free tier — limited usage' : tier === 'silver' ? '$19.99/month CAD' : '$29.99/month CAD'}</p>
                </div>
                <Link href="/pricing" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                  {tier === 'bronze' ? 'Upgrade ↑' : 'Manage'}
                </Link>
              </div>

              {/* AI Usage bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">🤖 AI Queries</span>
                  <span className="text-sm text-gray-500">{aiUsed} / {maxAI} used</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${aiPct >= 90 ? 'bg-red-500' : aiPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${aiPct}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>{aiPct}% used</span>
                  <span>{maxAI - aiUsed} remaining</span>
                </div>
              </div>

              {/* PDF Usage bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">📄 PDF Scans</span>
                  <span className="text-sm text-gray-500">{pdfUsed} / {maxPDF} used</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pdfPct >= 90 ? 'bg-red-500' : pdfPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${pdfPct}%` }} />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>{pdfPct}% used</span>
                  <span>{maxPDF - pdfUsed} remaining</span>
                </div>
              </div>

              {/* Reset info */}
              {profile?.monthly_ai_reset_at && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
                  Usage resets on {new Date(profile.monthly_ai_reset_at).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Plan comparison */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">Plan Comparison</h4>
              <div className="space-y-2">
                {[
                  { feature: 'AI Queries/month', bronze: '5 (trial)', silver: '500', gold: '2,000' },
                  { feature: 'PDF Scans/month', bronze: '1 (trial)', silver: '5', gold: '20' },
                  { feature: 'Document Storage', bronze: '50 MB', silver: '500 MB', gold: '5 GB' },
                  { feature: 'Filing Guide', bronze: '✅', silver: '✅', gold: '✅' },
                  { feature: 'Court Forms', bronze: '✅', silver: '✅', gold: '✅' },
                  { feature: 'Community Access', bronze: '✅', silver: '✅', gold: '✅' },
                  { feature: 'Mentor Access', bronze: '✅', silver: '✅', gold: '✅' },
                ].map(row => (
                  <div key={row.feature} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-gray-50">
                    <span className="text-gray-700 font-medium col-span-1 text-xs">{row.feature}</span>
                    {['bronze', 'silver', 'gold'].map(t => (
                      <span key={t} className={`text-center text-xs ${tier === t ? 'font-bold text-red-600' : 'text-gray-500'}`}>{row[t]}</span>
                    ))}
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-2 text-xs pt-1">
                  <span />
                  {['Free', '$19.99/mo CAD', '$29.99/mo CAD'].map(p => (
                    <span key={p} className="text-center text-gray-400 font-medium">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base">Notification Preferences</h3>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <div className="font-semibold text-gray-900 text-sm">📧 Email Reminders</div>
                <div className="text-xs text-gray-500 mt-0.5">Receive deadline reminders by email</div>
              </div>
              <button onClick={() => setEmailReminders(v => !v)}
                className={`w-12 h-6 rounded-full relative transition-colors ${emailReminders ? 'bg-red-600' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${emailReminders ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            {emailReminders && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Remind me how many days before?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 7].map(d => (
                    <button key={d} onClick={() => setReminderDays(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${reminderDays === d ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 leading-relaxed">
              💡 Email reminders require the <strong>RESEND_API_KEY</strong> to be configured. Contact your admin to enable this feature.
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
              {saving ? '⏳ Saving...' : '💾 Save Preferences'}
            </button>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-4">🔒 Change Password</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">New Password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="At least 6 characters"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Repeat new password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
                {passMsg && (
                  <div className={`text-sm px-4 py-3 rounded-xl ${passMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {passMsg}
                  </div>
                )}
                <button onClick={handlePasswordChange} disabled={changingPass || !newPass || !confirmPass}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
                  {changingPass ? '⏳ Updating...' : '🔐 Update Password'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-2">Account Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">User ID</span>
                  <span className="font-mono text-xs text-gray-400 truncate max-w-[200px]">{user?.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Account created</span>
                  <span>{new Date(profile?.created_at || Date.now()).toLocaleDateString('en-CA')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Last active</span>
                  <span>{profile?.last_seen_at ? new Date(profile.last_seen_at).toLocaleDateString('en-CA') : 'Today'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Role</span>
                  <span className="capitalize font-medium">{profile?.role || 'user'}</span>
                </div>
              </div>
            </div>

            <button onClick={handleSignOut}
              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-50 transition-colors">
              🚪 Sign Out
            </button>
          </div>
        )}

        {/* ── REFERRAL TAB ── */}
        {activeTab === 'referral' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base mb-1">🤝 Invite a Parent</h3>
              <p className="text-sm text-gray-500 mb-5">Share Foresight with parents who could use support. Every referral helps someone navigate the system.</p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Your Referral Code</div>
                <div className="font-mono text-xl font-bold text-red-600 tracking-widest">{profile?.referral_code || 'N/A'}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Your Invite Link</div>
                <div className="text-sm text-gray-700 break-all font-mono">
                  {typeof window !== 'undefined' ? `${window.location.origin}/auth/signup?ref=${profile?.referral_code}` : `foresight-eta-three.vercel.app/auth/signup?ref=${profile?.referral_code}`}
                </div>
              </div>

              <button onClick={copyReferral}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                📋 Copy Invite Link
              </button>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">People you've referred</div>
                    <div className="text-xs text-gray-500 mt-0.5">Parents who signed up with your link</div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{stats.referrals}</div>
                </div>
              </div>
            </div>

            <Link href="/refer" className="block bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-5 text-white shadow-md hover:from-red-700 hover:to-red-800 transition-all">
              <div className="text-2xl mb-2">🎁</div>
              <div className="font-bold text-lg">Full Referral Page</div>
              <div className="text-red-200 text-sm mt-0.5">See all your referrals and share options →</div>
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}

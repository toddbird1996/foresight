'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    email_reminders: true,
    reminder_days_before: 3,
    weekly_digest: true,
    community_notifications: true,
    show_online_status: true,
    dark_mode: false,
    compact_view: false,
    auto_save_drafts: true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users').select('email_reminders, reminder_days_before, weekly_digest').eq('id', user.id).single();
      if (profile) {
        setSettings(prev => ({
          ...prev,
          email_reminders: profile.email_reminders !== false,
          reminder_days_before: profile.reminder_days_before || 3,
          weekly_digest: profile.weekly_digest !== false,
        }));
      }
    };
    init();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    await supabase.from('users').update({
      email_reminders: settings.email_reminders,
      reminder_days_before: settings.reminder_days_before,
      weekly_digest: settings.weekly_digest,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    if (newPassword.length < 6) { setPasswordMsg('Password must be at least 6 characters'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordMsg(error.message); }
    else { setPasswordMsg('Password updated successfully!'); setNewPassword(''); setTimeout(() => { setPasswordMsg(''); setShowPasswordChange(false); }, 2000); }
  };

  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {desc && <div className="text-xs text-gray-500">{desc}</div>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-red-600' : 'bg-gray-200'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <PageTitle title="Settings" subtitle="Customize your experience" icon="⚙️" />

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Notifications</h3>
          <p className="text-xs text-gray-400 mb-2">Control how Foresight reminds you</p>
          <div className="divide-y divide-gray-100">
            <Toggle label="Email Reminders" desc="Get emails before upcoming deadlines" value={settings.email_reminders} onChange={v => setSettings(p => ({ ...p, email_reminders: v }))} />
            {settings.email_reminders && (
              <div className="py-3">
                <div className="text-sm font-medium text-gray-900 mb-2">Remind me before deadlines</div>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 7].map(d => (
                    <button key={d} onClick={() => setSettings(p => ({ ...p, reminder_days_before: d }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${settings.reminder_days_before === d ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{d} day{d > 1 ? 's' : ''}</button>
                  ))}
                </div>
              </div>
            )}
            <Toggle label="Weekly Digest" desc="Summary of your case activity each week" value={settings.weekly_digest} onChange={v => setSettings(p => ({ ...p, weekly_digest: v }))} />
            <Toggle label="Community Notifications" desc="New replies to your posts" value={settings.community_notifications} onChange={v => setSettings(p => ({ ...p, community_notifications: v }))} />
          </div>
        </div>

        {/* Display */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Display</h3>
          <div className="divide-y divide-gray-100">
            <Toggle label="Compact View" desc="Show more content with less spacing" value={settings.compact_view} onChange={v => setSettings(p => ({ ...p, compact_view: v }))} />
            <Toggle label="Auto-Save Drafts" desc="Save your work automatically" value={settings.auto_save_drafts} onChange={v => setSettings(p => ({ ...p, auto_save_drafts: v }))} />
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">Privacy</h3>
          <div className="divide-y divide-gray-100">
            <Toggle label="Show Online Status" desc="Let others see when you're active in community" value={settings.show_online_status} onChange={v => setSettings(p => ({ ...p, show_online_status: v }))} />
          </div>
        </div>

        {/* Account */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Account</h3>
          <div className="space-y-2">
            <button onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100">🔑 Change Password</button>
            {showPasswordChange && (
              <div className="px-4 py-3 bg-gray-50 rounded-xl space-y-2">
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-red-400" />
                <button onClick={changePassword} className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">Update Password</button>
                {passwordMsg && <p className={`text-xs ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{passwordMsg}</p>}
              </div>
            )}
            <button onClick={() => router.push('/pricing')} className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 hover:bg-gray-100">⭐ Manage Subscription</button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full text-left px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600 hover:bg-red-100">🗑 Delete Account</button>
            {showDeleteConfirm && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-800 mb-2">This will permanently delete your account and all data. This cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-white rounded-xl text-sm text-gray-600">Cancel</button>
                  <button onClick={async () => { await supabase.from('users').delete().eq('id', user.id); await supabase.auth.signOut(); router.push('/'); }}
                    className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">Delete Forever</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={saveSettings} disabled={saving}
          className={`w-full py-3 rounded-xl font-medium text-sm ${saved ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </button>
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('../components/AdminDashboard').then(m => ({ default: m.AdminDashboard || m.default })), { ssr: false });
const AdminUsers = dynamic(() => import('../components/AdminDashboard').then(m => ({ default: m.AdminUsers })), { ssr: false });
const AdminPilot = dynamic(() => import('../components/AdminDashboard').then(m => ({ default: m.AdminPilot })), { ssr: false });

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'pilot', label: '🧪 Pilot Monitor' },
  { id: 'users', label: '👥 Users' },
];

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: profile } = await supabase.from('users')
        .select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        setAuthorized(true);
      } else {
        router.push('/dashboard');
      }
      setChecking(false);
    };
    check();
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Admin header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
          <span className="font-bold text-white">Foresight Admin</span>
          <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-800 rounded-full">Pilot v1</span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg">
          ← Back to App
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-6">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && <AdminDashboard />}
        {activeTab === 'pilot' && <AdminPilot />}
        {activeTab === 'users' && <AdminUsers />}
      </div>
    </div>
  );
}

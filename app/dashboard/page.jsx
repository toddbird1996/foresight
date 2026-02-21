'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Dashboard Layout with Navigation
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth - in production, use your auth hook
    const checkAuth = async () => {
      // Simulated auth check
      setLoading(false);
      setUser({ name: 'User', jurisdiction: 'Saskatchewan', tier: 'bronze' });
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              👁️
            </div>
            <span className="font-bold text-orange-400">Foresight</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/ai" className="text-slate-400 hover:text-white">AI</Link>
            <Link href="/filing" className="text-slate-400 hover:text-white">Guide</Link>
            <Link href="/community" className="text-slate-400 hover:text-white">Community</Link>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.[0] || 'U'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-slate-400">Here's your custody case overview.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Filing Progress" value="45%" color="orange" />
          <StatCard icon="📅" label="Upcoming Deadlines" value="3" color="red" />
          <StatCard icon="💬" label="Community Posts" value="12" color="blue" />
          <StatCard icon="📄" label="Documents" value="2" color="green" />
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <QuickAction href="/ai" icon="🤖" label="Ask AI" premium />
          <QuickAction href="/filing" icon="📋" label="Filing Guide" />
          <QuickAction href="/documents" icon="📄" label="Documents" />
          <QuickAction href="/calendar" icon="📅" label="Calendar" />
          <QuickAction href="/community" icon="👥" label="Community" />
          <QuickAction href="/mentors" icon="🤝" label="Mentors" />
          <QuickAction href="/forms" icon="📝" label="Court Forms" />
          <QuickAction href="/pricing" icon="⭐" label="Upgrade" />
        </div>

        {/* Recent Activity */}
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <ActivityItem 
            icon="✅" 
            text="Completed: Gather Financial Documents" 
            time="2 hours ago" 
          />
          <ActivityItem 
            icon="🤖" 
            text="AI answered: How to file Form 70A" 
            time="Yesterday" 
          />
          <ActivityItem 
            icon="📅" 
            text="Added deadline: JCC Hearing - March 15" 
            time="2 days ago" 
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function QuickAction({ href, icon, label, premium }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-2 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-orange-500/50 transition-colors"
    >
      {premium && (
        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-xs font-bold rounded-full">
          PRO
        </span>
      )}
      <span className="text-3xl">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

function ActivityItem({ icon, text, time }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="text-sm">{text}</div>
        <div className="text-xs text-slate-500">{time}</div>
      </div>
    </div>
  );
}

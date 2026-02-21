'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    jurisdiction: 'Saskatchewan',
    tier: 'bronze',
    joinedDate: 'February 2026'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold">
              {user.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full capitalize">
                  {user.tier}
                </span>
                <span className="text-xs text-slate-500">Member since {user.joinedDate}</span>
              </div>
            </div>
          </div>
          <button className="w-full py-2 border border-slate-700 rounded-lg text-sm hover:bg-slate-800">
            Edit Profile
          </button>
        </div>

        {/* Jurisdiction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">📍 Jurisdiction</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇨🇦</span>
              <span>{user.jurisdiction}</span>
            </div>
            <button className="text-orange-400 text-sm">Change</button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">⭐ Subscription</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium capitalize">{user.tier} Plan</div>
              <div className="text-sm text-slate-400">10 AI queries/day, 1 doc/month</div>
            </div>
            <Link 
              href="/pricing"
              className="px-4 py-2 bg-orange-500 rounded-lg text-sm font-medium"
            >
              Upgrade
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">🔔 Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Reminders</div>
                <div className="text-sm text-slate-400">Deadline reminders via email</div>
              </div>
              <button className="w-12 h-6 bg-orange-500 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Digest</div>
                <div className="text-sm text-slate-400">Progress summary every Monday</div>
              </div>
              <button className="w-12 h-6 bg-orange-500 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button className="w-full py-3 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10">
          Sign Out
        </button>
      </main>
    </div>
  );
}

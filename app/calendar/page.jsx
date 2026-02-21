'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function CalendarPage() {
  const deadlines = [
    { id: 1, title: 'File Response', date: '2026-02-25', priority: 'high', type: 'filing' },
    { id: 2, title: 'JCC Hearing', date: '2026-03-15', priority: 'high', type: 'hearing' },
    { id: 3, title: 'Submit Financial Statement', date: '2026-03-01', priority: 'medium', type: 'filing' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
            <h1 className="text-xl font-bold">Calendar</h1>
          </div>
          <button className="px-4 py-2 bg-orange-500 rounded-lg font-medium">
            + Add Deadline
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="font-semibold mb-4">Upcoming Deadlines</h2>
        
        <div className="space-y-3">
          {deadlines.map(deadline => (
            <div 
              key={deadline.id} 
              className={`bg-slate-900 border rounded-xl p-4 ${
                deadline.priority === 'high' 
                  ? 'border-red-500/50 bg-red-500/5' 
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  deadline.type === 'hearing' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  {deadline.type === 'hearing' ? '⚖️' : '📋'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{deadline.title}</div>
                  <div className="text-sm text-slate-400">
                    {new Date(deadline.date).toLocaleDateString('en-CA', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  deadline.priority === 'high' 
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {deadline.priority}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reminder Settings */}
        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="font-semibold mb-3">⏰ Reminder Settings</h3>
          <p className="text-sm text-slate-400 mb-3">
            You'll receive email reminders 7, 3, and 1 day before each deadline.
          </p>
          <Link href="/profile" className="text-orange-400 text-sm hover:underline">
            Manage notification settings →
          </Link>
        </div>
      </main>
    </div>
  );
}

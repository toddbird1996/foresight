'use client';
import React from 'react';
import Link from 'next/link';

export default function MentorsPage() {
  const mentors = [
    { id: 1, name: 'Sarah M.', specialty: 'High-conflict custody', rating: 4.9, reviews: 23, available: true },
    { id: 2, name: 'David K.', specialty: 'Self-representation', rating: 4.8, reviews: 31, available: true },
    { id: 3, name: 'Michelle T.', specialty: 'Parenting plans', rating: 4.7, reviews: 18, available: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
          <h1 className="text-xl font-bold">Find a Mentor</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <p className="text-slate-400 mb-6">
          Connect with parents who have successfully navigated their custody cases.
        </p>

        {mentors.map(mentor => (
          <div key={mentor.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-xl font-bold">
                {mentor.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{mentor.name}</h3>
                  {mentor.available ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Available</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">Busy</span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{mentor.specialty}</p>
                <div className="text-sm text-yellow-400">
                  ⭐ {mentor.rating} ({mentor.reviews} reviews)
                </div>
              </div>
              <button 
                disabled={!mentor.available}
                className="px-4 py-2 bg-purple-500 rounded-lg font-medium disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

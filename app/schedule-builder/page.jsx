'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKS = ['Week 1', 'Week 2'];

const PARENTS = {
  A: { label: 'Parent A (You)', color: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
  B: { label: 'Parent B', color: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  SHARED: { label: 'Shared / Split Day', color: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
};

const PRESETS = [
  {
    name: '7/7 Alternating Weeks',
    desc: 'Children alternate full weeks between parents',
    schedule: { 'Week 1': ['A','A','A','A','A','A','A'], 'Week 2': ['B','B','B','B','B','B','B'] }
  },
  {
    name: '5/2/2/5',
    desc: 'Mon-Fri with one parent, weekend with other, then reverses',
    schedule: { 'Week 1': ['A','A','A','A','A','B','B'], 'Week 2': ['B','B','B','B','B','A','A'] }
  },
  {
    name: '2/2/3',
    desc: '2 days each then 3 days alternating, repeating',
    schedule: { 'Week 1': ['A','A','B','B','A','A','A'], 'Week 2': ['B','B','A','A','B','B','B'] }
  },
  {
    name: 'Every Other Weekend',
    desc: 'Primary with Parent A, every other weekend with Parent B',
    schedule: { 'Week 1': ['A','A','A','A','A','A','A'], 'Week 2': ['A','A','A','A','A','B','B'] }
  },
  {
    name: 'Wednesday Overnight + Every Other Weekend',
    desc: 'Parent B has Wed overnight + every other weekend',
    schedule: { 'Week 1': ['A','A','B','A','A','B','B'], 'Week 2': ['A','A','B','A','A','A','A'] }
  },
];

function calcStats(schedule) {
  const all = Object.values(schedule).flat();
  const total = all.length;
  const aCount = all.filter(d => d === 'A').length;
  const bCount = all.filter(d => d === 'B').length;
  const shCount = all.filter(d => d === 'SHARED').length;
  return {
    total,
    aPct: Math.round((aCount + shCount * 0.5) / total * 100),
    bPct: Math.round((bCount + shCount * 0.5) / total * 100),
    aCount, bCount, shCount,
  };
}

export default function ScheduleBuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parentAName, setParentAName] = useState('Parent A (You)');
  const [parentBName, setParentBName] = useState('Parent B');
  const [activeParent, setActiveParent] = useState('A');
  const [schedule, setSchedule] = useState({
    'Week 1': Array(7).fill('A'),
    'Week 2': Array(7).fill('A'),
  });
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState('');
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
    });
  }, []);

  const toggleDay = (week, dayIdx) => {
    setSchedule(prev => {
      const newWeek = [...prev[week]];
      newWeek[dayIdx] = activeParent;
      return { ...prev, [week]: newWeek };
    });
  };

  const applyPreset = (preset) => {
    setSchedule(preset.schedule);
  };

  const stats = calcStats(schedule);

  const exportText = () => {
    const aName = parentAName || 'Parent A';
    const bName = parentBName || 'Parent B';

    let text = `PARENTING SCHEDULE\nCreated: ${new Date().toLocaleDateString('en-CA')}\n\n`;
    text += `${aName}: ${stats.aPct}% of time (${stats.aCount + stats.shCount * 0.5} days per 2-week cycle)\n`;
    text += `${bName}: ${stats.bPct}% of time (${stats.bCount + stats.shCount * 0.5} days per 2-week cycle)\n\n`;

    WEEKS.forEach(week => {
      text += `${week.toUpperCase()}:\n`;
      schedule[week].forEach((who, i) => {
        const name = who === 'A' ? aName : who === 'B' ? bName : 'Both (split day)';
        text += `  ${DAY_LABELS[i]}: ${name}\n`;
      });
      text += '\n';
    });

    if (notes) text += `ADDITIONAL NOTES:\n${notes}\n`;

    text += `\nThis schedule repeats on a 2-week rotating cycle.\n`;
    text += `This document was created using Foresight — foresight-eta-three.vercel.app\n`;
    text += `\nIMPORTANT: This is a planning tool only. A binding parenting schedule must be incorporated into a court order or separation agreement signed by both parties.\n`;

    return text;
  };

  const download = () => {
    const text = exportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parenting-schedule-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Schedule Builder" subtitle="Design and visualize your parenting schedule" icon="📅" />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800">
            <strong>Planning tool only.</strong> A binding parenting schedule must be incorporated into a court order or separation agreement. Use this to visualize and communicate your proposed schedule.
          </p>
        </div>

        {/* Parent name inputs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customize Labels</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Parent A (your name)</label>
              <input value={parentAName} onChange={e => setParentAName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Parent B (their name)</label>
              <input value={parentBName} onChange={e => setParentBName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            </div>
          </div>
        </div>

        {/* Quick presets */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Presets</p>
          <div className="space-y-2">
            {PRESETS.map((preset, i) => (
              <button key={i} onClick={() => applyPreset(preset)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-transparent rounded-xl text-left transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                  <p className="text-xs text-gray-500">{preset.desc}</p>
                </div>
                <span className="text-xs text-red-600 font-medium flex-shrink-0 ml-2">Apply →</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active paint brush */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Paint Mode — tap days to assign</p>
          <div className="flex gap-2">
            {[
              { id: 'A', label: parentAName || 'Parent A', color: 'bg-red-500' },
              { id: 'B', label: parentBName || 'Parent B', color: 'bg-blue-500' },
              { id: 'SHARED', label: 'Shared', color: 'bg-purple-500' },
            ].map(p => (
              <button key={p.id} onClick={() => setActiveParent(p.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold ${
                  activeParent === p.id ? 'border-gray-900 shadow-sm' : 'border-gray-200'
                }`}>
                <span className={`w-3 h-3 rounded-full ${p.color}`} />
                <span className="text-gray-800 truncate text-xs">{p.label.split(' ')[0]}</span>
                {activeParent === p.id && <span className="text-gray-500 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule grid */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
            <div className="p-3 text-xs font-semibold text-gray-400" />
            {DAYS.map(d => (
              <div key={d} className="p-3 text-center text-xs font-semibold text-gray-600">{d}</div>
            ))}
          </div>

          {/* Week rows */}
          {WEEKS.map((week, wi) => (
            <div key={week} className={`grid grid-cols-8 ${wi < WEEKS.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <div className="p-3 flex items-center">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{week}</span>
              </div>
              {schedule[week].map((who, di) => {
                const p = PARENTS[who];
                return (
                  <button
                    key={di}
                    onClick={() => toggleDay(week, di)}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseEnter={() => isDragging && toggleDay(week, di)}
                    className={`m-1 rounded-lg p-1 flex flex-col items-center justify-center min-h-[52px] transition-all hover:opacity-80 active:scale-95 ${p.light} ${p.border} border`}>
                    <span className={`w-3 h-3 rounded-full ${p.color} mb-1`} />
                    <span className={`text-[9px] font-bold ${p.text} text-center leading-tight`}>
                      {who === 'A' ? (parentAName || 'A').split(' ')[0].substring(0, 4) :
                       who === 'B' ? (parentBName || 'B').split(' ')[0].substring(0, 4) : 'Both'}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Time Distribution (per 2-week cycle)</p>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-red-600">{stats.aPct}%</div>
              <div className="text-xs text-red-700 font-medium">{(parentAName || 'Parent A').split(' ')[0]}</div>
              <div className="text-xs text-gray-400">{stats.aCount + stats.shCount * 0.5} days</div>
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-blue-600">{stats.bPct}%</div>
              <div className="text-xs text-blue-700 font-medium">{(parentBName || 'Parent B').split(' ')[0]}</div>
              <div className="text-xs text-gray-400">{stats.bCount + stats.shCount * 0.5} days</div>
            </div>
          </div>
          {/* Bar */}
          <div className="h-3 bg-blue-200 rounded-full overflow-hidden flex">
            <div className="bg-red-500 h-full rounded-l-full transition-all duration-300" style={{ width: `${stats.aPct}%` }} />
            {stats.shCount > 0 && <div className="bg-purple-500 h-full" style={{ width: `${Math.round(stats.shCount / stats.total * 100)}%` }} />}
          </div>
          {stats.aPct >= 60 && <p className="text-xs text-gray-500 mt-2">⚖️ Note: Courts consider arrangements where one parent has 40%+ as shared parenting for support purposes.</p>}
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder="Holiday exceptions, pickup/dropoff details, school breaks, special circumstances..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 leading-relaxed" />
        </div>

        {/* Export */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="font-semibold text-gray-900 text-sm mb-1">Export your schedule</p>
          <p className="text-xs text-gray-500 mb-4">Download as a text document to include in your parenting plan or share with a lawyer or mediator.</p>
          <button onClick={download}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
            📥 Download Schedule
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">💡 Schedule Tips</p>
          <p className="text-xs text-blue-800 leading-relaxed">Courts look at consistency and predictability. A schedule that gives children a clear routine they can count on is viewed more favourably than one that changes frequently.</p>
          <p className="text-xs text-blue-800 leading-relaxed">If you and the other parent cannot agree on a schedule, come to court with a specific proposal — not just a general idea. Judges prefer parents who have thought through the details.</p>
          <p className="text-xs text-blue-800 leading-relaxed">Consider holidays, birthdays, and school breaks separately from the regular schedule. The most common disputes involve Christmas, summer, and the children's birthdays.</p>
        </div>

        <Footer />
      </main>
    </div>
  );
}

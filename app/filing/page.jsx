'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

const SITUATIONS = [
  {
    id: 'divorce',
    label: 'Divorce & Custody',
    icon: '⚖️',
    desc: 'Married and need a divorce. Covers parenting, support, and property.',
    kit: 'Divorce Kit',
  },
  {
    id: 'parenting',
    label: 'Parenting Only',
    icon: '👨‍👩‍👧',
    desc: 'Not married, or married but no divorce needed. Parenting time, decision-making, and support.',
    kit: 'Parenting & Support Kit',
  },
  {
    id: 'variation',
    label: 'Change an Existing Order',
    icon: '🔄',
    desc: 'Already have a court order and need to change it due to new circumstances.',
    kit: 'Variation Kit',
  },
];

const KIT_INFO = {
  saskatchewan: {
    phone: '1-888-218-2822',
    email: 'familylaw@gov.sk.ca',
    label: 'Family Law Information Centre',
    wizard: 'https://familylaw.plea.org/',
  },
  manitoba: {
    phone: '204-945-0332',
    email: 'courts@gov.mb.ca',
    label: 'Court of King\'s Bench Registry',
    wizard: 'https://www.gov.mb.ca/familylaw/',
  },
};


// ─── What Happens Next ────────────────────────────────────────────────────────
const WHAT_NEXT = {
  divorce: {
    'Phase 1: Preparation': { time: '1–2 weeks', next: 'Once you have your kit and documents ready, you will complete your Petition and Affidavit. The self-help kit includes step-by-step instructions for each form.' },
    'Phase 2: Filing': { time: '1 day', next: 'After filing, the court assigns your file number. You then have 30 days to serve the other party through a third person — not yourself.' },
    'Phase 3: Service': { time: '1–7 days', next: 'Once served, file your Affidavit of Service with the court. The response period clock starts from the date of service.' },
    'Phase 4: Response Period': { time: '30 days', next: 'If the other party files an Answer, you will receive a copy. If not, after 30 days you can apply to note them in default and proceed.' },
    'Phase 5: Case Conference': { time: '4–8 weeks to schedule', next: 'If you reach an agreement at the JCC, a consent order can be drafted on the spot. If not, a hearing date will be set.' },
    'Phase 6: Resolution': { time: 'Varies', next: 'A consent order is signed by both parties and approved by the judge — usually within a few weeks. A trial can take 6–18 months to schedule.' },
  },
  parenting: {
    'Phase 1: Preparation': { time: '1–2 weeks', next: 'Complete the For Kids Sake course first — you cannot file without the certificate. Then request your kit from the Family Law Information Centre.' },
    'Phase 2: File Your Application': { time: '1 day', next: 'After filing, you will receive a court file number. You must serve the other parent within a reasonable time — 30 days is the response deadline.' },
    'Phase 3: Serve the Other Parent': { time: '1–7 days', next: 'File proof of service immediately after. The other parent has 30 days from the service date to file their Answer.' },
    'Phase 4: Response Period': { time: '30 days', next: 'Review their Answer carefully. Note every point of disagreement — these become the issues for your JCC. You can file a Reply if needed.' },
    'Phase 5: Case Conference': { time: '4–8 weeks to schedule', next: 'Most parenting cases settle at or after the JCC. Come prepared with a specific parenting schedule proposal and financial disclosure.' },
    'Phase 6: Resolution': { time: 'Varies', next: 'A consent order is legally binding once a judge signs it. Keep copies accessible — schools, employers, and enforcement agencies may need to see it.' },
  },
  variation: {
    'Phase 1: Confirm Grounds to Vary': { time: '1 day', next: 'If you confirm grounds exist, your next step is the Variation Kit — the forms are different from a new application. Do not use the wrong forms.' },
    'Phase 2: Get the Kit and Prepare': { time: '3–5 days', next: 'Complete the Application to Vary and your Affidavit of Changed Circumstances. Both must be sworn before a Commissioner for Oaths before filing.' },
    'Phase 3: File Your Variation Application': { time: '1 day', next: 'After filing, you must serve the other party. The 30-day response clock starts from service, same as a new application.' },
    'Phase 4: Serve and Wait': { time: '30 days', next: 'If they agree to the variation, you can file a consent variation order without a hearing. If they oppose, a JCC will be scheduled.' },
    'Phase 5: Case Conference and New Order': { time: '4–8 weeks to schedule', next: 'The new order supersedes the old one on the issues it addresses. Notify the Maintenance Enforcement Office if child support is changing.' },
  },
};

function WhatHappensNext({ phases, situation }) {
  const [open, setOpen] = useState(false);
  if (!phases.length) return null;

  // Find current phase - last one with any progress, or first incomplete
  const nextData = WHAT_NEXT[situation] || {};

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-blue-100/50 transition-colors">
        <span className="text-xl flex-shrink-0">🗺️</span>
        <div className="flex-1">
          <p className="font-semibold text-blue-900 text-sm">What Happens at Each Phase</p>
          <p className="text-xs text-blue-700">Timeline and what to expect after each step</p>
        </div>
        <span className="text-blue-600 text-sm flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-blue-200 divide-y divide-blue-100">
          {phases.map((phase, i) => {
            const info = nextData[phase.name];
            if (!info) return null;
            return (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900">{phase.name}</p>
                    <p className="text-[11px] text-blue-600 mb-1">⏱ Typical duration: {info.time}</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{info.next}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilingGuidePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [situation, setSituation] = useState('divorce');
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await fetchJurisdictions();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedJurisdiction) {
      fetchFilingGuide(selectedJurisdiction.id, situation);
      if (user) fetchUserProgress(user.id);
      setExpandedStep(null);
    }
  }, [selectedJurisdiction, situation]);

  const fetchJurisdictions = async () => {
    const { data, error } = await supabase.from('jurisdictions').select('*').order('display_order');
    if (error) { console.error(error); return; }
    setJurisdictions(data || []);
    const sk = data?.find(j => j.id === 'saskatchewan');
    if (sk) setSelectedJurisdiction(sk);
    else if (data?.length > 0) setSelectedJurisdiction(data[0]);
  };

  const fetchFilingGuide = async (jurisdictionId, sit) => {
    const { data: phasesData, error: phasesError } = await supabase
      .from('filing_phases')
      .select('*')
      .eq('jurisdiction_id', jurisdictionId)
      .eq('situation', sit)
      .order('display_order');
    if (phasesError) { console.error(phasesError); return; }

    const phaseIds = (phasesData || []).map(p => p.id);
    if (phaseIds.length === 0) { setPhases([]); return; }

    const { data: stepsData, error: stepsError } = await supabase
      .from('filing_steps')
      .select('*')
      .in('phase_id', phaseIds)
      .order('display_order');
    if (stepsError) { console.error(stepsError); return; }

    setPhases((phasesData || []).map(phase => ({
      ...phase,
      steps: (stepsData || []).filter(s => s.phase_id === phase.id),
    })));
  };

  const fetchUserProgress = async (userId) => {
    const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userId);
    if (error) { console.error(error); return; }
    const map = {};
    data.forEach(p => { map[p.step_id] = p.completed; });
    setProgress(map);
  };

  const autoDeadline = async (stepTitle) => {
    let cfg = null;
    const t = stepTitle.toLowerCase();
    if (t.includes('swear your affidavit and file') || t.includes('file at the court')) {
      cfg = { title: 'Response deadline — other party has 30 days to file an Answer', days: 30, event_type: 'deadline', priority: 'high' };
    } else if (t.includes('file proof of service') || t.includes('complete and file the affidavit of service')) {
      cfg = { title: 'Check that proof of service is on file with the court', days: 2, event_type: 'task', priority: 'medium' };
    } else if (t.includes('request a judicial case conference')) {
      cfg = { title: 'Follow up on JCC date if not received within 2 weeks', days: 14, event_type: 'task', priority: 'medium' };
    }
    if (!cfg) return;
    const dueDate = new Date(Date.now() + cfg.days * 86400000).toISOString().split('T')[0];
    await supabase.from('deadlines').insert({ user_id: user.id, title: cfg.title, due_date: dueDate, event_type: cfg.event_type, priority: cfg.priority, completed: false });
  };

  const toggleStep = async (stepId) => {
    const isCompleted = !progress[stepId];
    setProgress(prev => ({ ...prev, [stepId]: isCompleted }));
    const { data: existing } = await supabase.from('user_progress').select('id')
      .eq('user_id', user.id).eq('step_id', stepId).single();
    if (existing) {
      await supabase.from('user_progress')
        .update({ completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress')
        .insert({ user_id: user.id, step_id: stepId, completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null });
    }
    // Auto-create deadline for key steps
    if (isCompleted) {
      const step = phases.flatMap(p => p.steps || []).find(s => s.id === stepId);
      if (step?.title) await autoDeadline(step.title);
    }
  };

  const totalSteps = phases.flatMap(p => p.steps || []).length;
  const completedSteps = phases.flatMap(p => p.steps || []).filter(s => progress[s.id]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');
  const kitInfo = KIT_INFO[selectedJurisdiction?.id];
  const currentSituation = SITUATIONS.find(s => s.id === situation);
  const hasKit = !!kitInfo;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading filing guide...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Filing Guide" subtitle="Step-by-step walkthrough for your situation" icon="📋" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* ── Province selector ─────────────────────────────────────────────── */}
        <select
          value={selectedJurisdiction?.id || ''}
          onChange={e => { const j = jurisdictions.find(j => j.id === e.target.value); if (j) setSelectedJurisdiction(j); }}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-red-400"
        >
          <optgroup label="🇨🇦 Canada">
            {canadianJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </optgroup>
          {usJurisdictions.length > 0 && (
            <optgroup label="🇺🇸 United States">
              {usJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </optgroup>
          )}
        </select>

        {/* ── Situation selector ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">What is your situation?</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {SITUATIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSituation(s.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  situation === s.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-red-300'
                }`}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className={`font-semibold text-sm mb-1 ${situation === s.id ? 'text-red-700' : 'text-gray-900'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Self-help kit callout (SK + MB) ──────────────────────────────── */}
        {hasKit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-amber-900 text-sm">
                  📦 You need the <span className="underline">{currentSituation?.kit}</span>
                </p>
                <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                  {selectedJurisdiction?.name} provides this as a free self-help kit — all forms plus written instructions bundled together.
                  Contact the {kitInfo.label} to request yours before starting Step 1.
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs">
                  <a href={`tel:${kitInfo.phone}`} className="text-red-600 font-medium">📞 {kitInfo.phone}</a>
                  <a href={`mailto:${kitInfo.email}`} className="text-red-600 font-medium">✉️ {kitInfo.email}</a>
                  <a href={kitInfo.wizard} target="_blank" rel="noopener noreferrer" className="text-red-600 font-medium">🌐 Online form wizard →</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Progress bar ─────────────────────────────────────────────────── */}
        {totalSteps > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {currentSituation?.icon} {currentSituation?.label} — Your Progress
              </span>
              <span className="text-sm font-bold text-red-600">{completedSteps} / {totalSteps} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <p className="text-green-700 text-sm font-medium mt-2">🎉 All steps complete!</p>
            )}
          </div>
        )}

        {phases.length > 0 && <WhatHappensNext phases={phases} situation={situation} />}

        {/* ── Phases and steps ─────────────────────────────────────────────── */}
        {phases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-1">
              Guide for {currentSituation?.label} in {selectedJurisdiction?.name} is coming soon.
            </p>
            <p className="text-sm text-gray-400">
              Saskatchewan and Manitoba have complete guides. Other provinces will be added.
            </p>
          </div>
        ) : (
          phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Phase header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {phaseIndex + 1}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{phase.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{phase.description}</p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="divide-y divide-gray-100">
                {(phase.steps || []).map(step => {
                  const isExpanded = expandedStep === step.id;
                  const isDone = progress[step.id];
                  const hasTips = step.tips && step.tips.length > 0;
                  const hasForms = step.forms && step.forms.length > 0;
                  const hasExtra = hasTips || hasForms;

                  return (
                    <div key={step.id} className={isDone ? 'bg-green-50' : 'bg-white'}>
                      <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleStep(step.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                            isDone ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-red-500'
                          }`}
                        >
                          {isDone && <span className="text-xs">✓</span>}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {step.title}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>

                          {hasExtra && (
                            <button
                              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                              className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1 hover:text-red-700"
                            >
                              {isExpanded
                                ? '▲ Hide'
                                : `▼ Tips${hasForms ? ' & forms' : ''}`}
                            </button>
                          )}
                        </div>

                        {step.estimated_time_days && (
                          <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5 whitespace-nowrap">
                            ~{step.estimated_time_days}d
                          </span>
                        )}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && hasExtra && (
                        <div className="px-4 pb-4 ml-9 space-y-3">
                          {hasTips && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-800 mb-2">💡 Tips</p>
                              <ul className="space-y-1.5">
                                {step.tips.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                                    <span className="flex-shrink-0 mt-0.5">•</span>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {hasForms && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-amber-800 mb-2">📋 Forms for this step</p>
                              <ul className="space-y-1">
                                {step.forms.map((form, i) => (
                                  <li key={i} className="flex items-center gap-2 text-xs text-amber-800">
                                    <span>📄</span>
                                    <span>{form}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* ── Link to court forms ──────────────────────────────────────────── */}
        {phases.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">Need the actual forms?</p>
              <p className="text-xs text-gray-500 mt-0.5">Download official court forms and get your self-help kit on the Court Forms page.</p>
            </div>
            <Link
              href="/court-forms"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0 whitespace-nowrap"
            >
              Court Forms →
            </Link>
          </div>
        )}

        {/* ── AI help ─────────────────────────────────────────────────────── */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-1">💡 Need Help With a Step?</h3>
          <p className="text-sm text-red-700 mb-3">
            Ask the AI assistant to explain any step in plain language, or help you figure out what to do next.
          </p>
          <Link
            href="/ai"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Ask AI Assistant →
          </Link>
        </div>

        <Footer />
      </main>
    </div>
  );
}

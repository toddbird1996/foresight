'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

export default function FilingGuidePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      await fetchJurisdictions();
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedJurisdiction) {
      fetchFilingGuide(selectedJurisdiction.id);
      if (user) fetchUserProgress(user.id);
    }
  }, [selectedJurisdiction]);

  const fetchJurisdictions = async () => {
    const { data, error } = await supabase.from("jurisdictions").select("*").order("display_order");
    if (error) { console.error(error); return; }
    setJurisdictions(data || []);
    const sk = data?.find(j => j.id === 'saskatchewan');
    if (sk) setSelectedJurisdiction(sk);
    else if (data?.length > 0) setSelectedJurisdiction(data[0]);
  };

  const fetchFilingGuide = async (jurisdictionId) => {
    const { data: phasesData, error: phasesError } = await supabase
      .from("filing_phases").select("*").eq("jurisdiction_id", jurisdictionId).order("display_order");
    if (phasesError) { console.error(phasesError); return; }

    const { data: stepsData, error: stepsError } = await supabase
      .from("filing_steps").select("*").order("display_order");
    if (stepsError) { console.error(stepsError); return; }

    const phasesWithSteps = phasesData.map(phase => ({
      ...phase,
      steps: stepsData.filter(step => step.phase_id === phase.id)
    }));
    setPhases(phasesWithSteps);
  };

  const fetchUserProgress = async (userId) => {
    const { data, error } = await supabase.from("user_progress").select("*").eq("user_id", userId);
    if (error) { console.error(error); return; }
    const progressMap = {};
    data.forEach(p => { progressMap[p.step_id] = p.completed; });
    setProgress(progressMap);
  };

  const toggleStep = async (stepId) => {
    const isCompleted = !progress[stepId];
    setProgress(prev => ({ ...prev, [stepId]: isCompleted }));
    const { data: existing } = await supabase.from("user_progress").select("id")
      .eq("user_id", user.id).eq("step_id", stepId).single();
    if (existing) {
      await supabase.from("user_progress")
        .update({ completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_progress")
        .insert({ user_id: user.id, step_id: stepId, completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null });
    }
  };

  const totalSteps = phases.flatMap(p => p.steps || []).length;
  const completedSteps = phases.flatMap(p => p.steps || []).filter(s => progress[s.id]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');

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
      <PageTitle title="Filing Guide" subtitle="Step-by-step filing process" icon="📋" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Jurisdiction selector */}
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

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
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

        {/* Phases and steps */}
        {phases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-2">Filing guide for {selectedJurisdiction?.name} is coming soon.</p>
            <p className="text-sm text-gray-500">Currently Saskatchewan has a complete step-by-step guide.</p>
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
                {phase.steps && phase.steps.map((step) => {
                  const isExpanded = expandedStep === step.id;
                  const isDone = progress[step.id];
                  const hasTips = step.tips && step.tips.length > 0;
                  const hasForms = step.forms && step.forms.length > 0;
                  const hasExtra = hasTips || hasForms;

                  return (
                    <div key={step.id} className={isDone ? 'bg-green-50' : 'bg-white'}>
                      {/* Step row */}
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

                        {/* Step content */}
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isDone ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {step.title}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>

                          {/* Expand button */}
                          {hasExtra && (
                            <button
                              onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                              className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1 hover:text-red-700"
                            >
                              {isExpanded ? '▲ Hide tips' : `▼ Show tips${hasForms ? ' & forms' : ''}`}
                            </button>
                          )}
                        </div>

                        {/* Est. time badge */}
                        {step.estimated_time_days && (
                          <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                            ~{step.estimated_time_days}d
                          </span>
                        )}
                      </div>

                      {/* Expanded tips & forms */}
                      {isExpanded && hasExtra && (
                        <div className="px-4 pb-4 ml-9 space-y-3">

                          {/* Tips */}
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

                          {/* Forms needed */}
                          {hasForms && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-amber-800 mb-2">📋 Forms needed</p>
                              <ul className="space-y-1">
                                {step.forms.map((form, i) => (
                                  <li key={i} className="text-xs text-amber-800 flex items-center gap-2">
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

        {/* Help card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-1">💡 Need Help With a Step?</h3>
          <p className="text-sm text-red-700 mb-3">
            Ask the AI assistant to explain any step in plain language or help you figure out what to do next.
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

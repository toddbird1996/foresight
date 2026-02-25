'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function FilingGuidePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      setUser(user);
      await fetchJurisdictions();
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedJurisdiction) {
      fetchFilingGuide(selectedJurisdiction.id);
      if (user) {
        fetchUserProgress(user.id);
      }
    }
  }, [selectedJurisdiction]);

  const fetchJurisdictions = async () => {
    const { data, error } = await supabase
      .from("jurisdictions")
      .select("*")
      .order("display_order");

    if (error) {
      console.error("Error fetching jurisdictions:", error);
      return;
    }

    setJurisdictions(data || []);
    
    // Default to Saskatchewan
    const sk = data?.find(j => j.id === 'saskatchewan');
    if (sk) {
      setSelectedJurisdiction(sk);
    } else if (data && data.length > 0) {
      setSelectedJurisdiction(data[0]);
    }
  };

  const fetchFilingGuide = async (jurisdictionId) => {
    const { data: phasesData, error: phasesError } = await supabase
      .from("filing_phases")
      .select("*")
      .eq("jurisdiction_id", jurisdictionId)
      .order("display_order");

    if (phasesError) {
      console.error("Error fetching phases:", phasesError);
      return;
    }

    const { data: stepsData, error: stepsError } = await supabase
      .from("filing_steps")
      .select("*")
      .order("display_order");

    if (stepsError) {
      console.error("Error fetching steps:", stepsError);
      return;
    }

    const phasesWithSteps = phasesData.map(phase => ({
      ...phase,
      steps: stepsData.filter(step => step.phase_id === phase.id)
    }));

    setPhases(phasesWithSteps);
  };

  const fetchUserProgress = async (userId) => {
    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching progress:", error);
      return;
    }

    const progressMap = {};
    data.forEach(p => {
      progressMap[p.step_id] = p.completed;
    });
    setProgress(progressMap);
  };

  const toggleStep = async (stepId) => {
    const isCompleted = !progress[stepId];

    setProgress(prev => ({ ...prev, [stepId]: isCompleted }));

    const { data: existing } = await supabase
      .from("user_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("step_id", stepId)
      .single();

    if (existing) {
      await supabase
        .from("user_progress")
        .update({ completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("user_progress")
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading filing guide...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
              <h1 className="text-xl font-bold">Filing Guide</h1>
            </div>
          </div>

          {/* Jurisdiction Selector */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">Select Your Jurisdiction</label>
            <select
              value={selectedJurisdiction?.id || ''}
              onChange={(e) => {
                const j = jurisdictions.find(j => j.id === e.target.value);
                setSelectedJurisdiction(j);
              }}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <optgroup label="🇨🇦 Canada">
                {canadianJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
              <optgroup label="🇺🇸 United States">
                {usJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Jurisdiction Info */}
          {selectedJurisdiction && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span>{selectedJurisdiction.flag}</span>
                <span className="font-semibold">{selectedJurisdiction.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  selectedJurisdiction.status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedJurisdiction.status === 'live' ? 'Full Support' : 'Beta'}
                </span>
              </div>
              <p className="text-sm text-slate-400">{selectedJurisdiction.court_name}</p>
            </div>
          )}
          
          {/* Progress Bar */}
          {phases.length > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span className="text-orange-400">{completedSteps}/{totalSteps} steps ({progressPercent}%)</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {phases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 mb-4">
              Filing guide for {selectedJurisdiction?.name} is coming soon!
            </p>
            <p className="text-sm text-slate-500">
              Currently, only Saskatchewan has a complete step-by-step guide. More jurisdictions will be added soon.
            </p>
          </div>
        ) : (
          phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                    {phaseIndex + 1}
                  </div>
                  <div>
                    <h2 className="font-semibold">{phase.name}</h2>
                    <p className="text-sm text-slate-400">{phase.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {phase.steps && phase.steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      progress[step.id] ? 'bg-green-500/10' : 'bg-slate-800/50'
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        progress[step.id]
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-600 hover:border-green-500'
                      }`}
                    >
                      {progress[step.id] && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${progress[step.id] ? 'text-slate-400 line-through' : ''}`}>
                        {step.title}
                      </div>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Help Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">💡 Need Help?</h3>
          <p className="text-sm text-slate-400 mb-3">
            Ask our AI assistant for detailed guidance on any step.
          </p>
          <Link 
            href="/ai"
            className="inline-block px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium"
          >
            Ask AI Assistant →
          </Link>
        </div>
      </main>
    </div>
  );
                      }

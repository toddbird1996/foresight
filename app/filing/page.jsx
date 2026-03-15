'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageTitle from '../../components/PageTitle';

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
    console.log("Fetching jurisdictions...");
    
    const { data, error } = await supabase
      .from("jurisdictions")
      .select("*")
      .order("display_order");

    if (error) {
      console.error("Error fetching jurisdictions:", error);
      return;
    }

    console.log("Jurisdictions fetched:", data);

    setJurisdictions(data || []);
    
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading filing guide...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
        <PageTitle title="Filing Guide" subtitle="Step-by-step filing process" icon="📋" />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {phases.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-4">
              Filing guide for {selectedJurisdiction?.name} is coming soon!
            </p>
            <p className="text-sm text-gray-500">
              Currently, only Saskatchewan, Ontario, Alberta, Texas, and California have complete step-by-step guides.
            </p>
          </div>
        ) : (
          phases.map((phase, phaseIndex) => (
            <div key={phase.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                    {phaseIndex + 1}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{phase.name}</h2>
                    <p className="text-sm text-gray-600">{phase.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {phase.steps && phase.steps.map((step) => (
                  <div 
                    key={step.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      progress[step.id] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleStep(step.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        progress[step.id]
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-400 hover:border-red-500'
                      }`}
                    >
                      {progress[step.id] && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className={`font-medium ${progress[step.id] ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {step.title}
                      </div>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Help Card */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">💡 Need Help?</h3>
          <p className="text-sm text-red-700 mb-3">
            Ask our AI assistant for detailed guidance on any step.
          </p>
          <Link 
            href="/cases"
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Ask AI Assistant →
          </Link>
        <Footer />
      </div>
      </main>
    </div>
  );
}

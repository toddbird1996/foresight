'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const SAMPLE_PHASES = [
  {
    id: 'pre-filing',
    name: 'Pre-Filing Requirements',
    steps: [
      { id: 1, title: 'Complete Family Dispute Resolution (FDR)', completed: true, required: true },
      { id: 2, title: 'Take "For Kids\' Sake" Parenting Course', completed: true, required: true },
      { id: 3, title: 'Gather Financial Documents', completed: false, required: true },
    ]
  },
  {
    id: 'filing',
    name: 'Initial Filing',
    steps: [
      { id: 4, title: 'Prepare Petition (Form 70A)', completed: false, required: true },
      { id: 5, title: 'Complete Financial Statement (Form 70D)', completed: false, required: true },
      { id: 6, title: 'Prepare Supporting Affidavit', completed: false, required: true },
      { id: 7, title: 'File Documents with Court', completed: false, required: true },
    ]
  },
  {
    id: 'service',
    name: 'Service',
    steps: [
      { id: 8, title: 'Serve the Respondent', completed: false, required: true },
      { id: 9, title: 'File Proof of Service', completed: false, required: true },
    ]
  },
];

export default function FilingGuidePage() {
  const [phases, setPhases] = useState(SAMPLE_PHASES);
  
  const totalSteps = phases.flatMap(p => p.steps).length;
  const completedSteps = phases.flatMap(p => p.steps).filter(s => s.completed).length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  const toggleStep = (phaseId, stepId) => {
    setPhases(phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          steps: phase.steps.map(step => 
            step.id === stepId ? { ...step, completed: !step.completed } : step
          )
        };
      }
      return phase;
    }));
  };

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
            <span className="text-sm text-slate-400">Saskatchewan</span>
          </div>
          
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span className="text-orange-400">{completedSteps}/{totalSteps} steps ({progress}%)</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {phases.map((phase, phaseIndex) => (
          <div key={phase.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                  {phaseIndex + 1}
                </div>
                <h2 className="font-semibold">{phase.name}</h2>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {phase.steps.map((step) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    step.completed ? 'bg-green-500/10' : 'bg-slate-800/50'
                  }`}
                >
                  <button
                    onClick={() => toggleStep(phase.id, step.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      step.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-slate-600 hover:border-green-500'
                    }`}
                  >
                    {step.completed && '✓'}
                  </button>
                  <div className="flex-1">
                    <div className={step.completed ? 'text-slate-400 line-through' : ''}>
                      {step.title}
                    </div>
                  </div>
                  {step.required && (
                    <span className="text-xs text-orange-400">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

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

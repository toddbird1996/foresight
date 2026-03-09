'use client';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const JURISDICTIONS = [
  { id: 'saskatchewan', name: 'Saskatchewan' },
  { id: 'alberta', name: 'Alberta' },
  { id: 'ontario', name: 'Ontario' },
  { id: 'british_columbia', name: 'British Columbia' },
  { id: 'manitoba', name: 'Manitoba' },
  { id: 'quebec', name: 'Quebec' },
  { id: 'nova_scotia', name: 'Nova Scotia' },
  { id: 'new_brunswick', name: 'New Brunswick' },
  { id: 'newfoundland', name: 'Newfoundland & Labrador' },
  { id: 'pei', name: 'Prince Edward Island' },
  { id: 'northwest_territories', name: 'Northwest Territories' },
  { id: 'yukon', name: 'Yukon' },
  { id: 'nunavut', name: 'Nunavut' },
];

const SITUATIONS = [
  { id: 'starting', label: 'Just starting', icon: '🚀', desc: "Haven't filed yet" },
  { id: 'filed', label: 'Already filed', icon: '📋', desc: 'Case is in progress' },
  { id: 'responding', label: 'Responding', icon: '📩', desc: 'Other parent filed first' },
  { id: 'modifying', label: 'Modifying an order', icon: '🔄', desc: 'Changing current arrangement' },
  { id: 'enforcement', label: 'Enforcement', icon: '⚖️', desc: 'Order not being followed' },
  { id: 'exploring', label: 'Exploring options', icon: '🔍', desc: 'Learning about the process' },
];

const CASE_TYPES = [
  { id: 'custody', label: 'Custody / Parenting', icon: '👨‍👧‍👦' },
  { id: 'divorce', label: 'Divorce', icon: '📑' },
  { id: 'support', label: 'Child Support', icon: '💰' },
  { id: 'protection', label: 'Child Protection (CPS)', icon: '🛡️' },
  { id: 'variation', label: 'Variation of Order', icon: '🔄' },
];

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    fullName: '',
    jurisdiction: '',
    situation: '',
    caseType: 'custody',
    caseName: '',
  });

  const totalSteps = 5;
  const pct = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return data.fullName.trim() && data.jurisdiction;
    if (step === 2) return data.situation;
    if (step === 3) return data.caseType;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase.from('users').update({
        full_name: data.fullName.trim(),
        jurisdiction: data.jurisdiction,
        onboarding_completed: true,
        onboarding_data: {
          situation: data.situation,
          case_type: data.caseType,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id);

      const caseName = data.caseName.trim() || 'My Case';
      await supabase.from('cases').insert({
        user_id: user.id,
        name: caseName,
        jurisdiction_id: data.jurisdiction,
        case_type: data.caseType,
        status: 'active',
      });

      onComplete();
    } catch (err) {
      console.error('Onboarding save error:', err);
      onComplete();
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {step > 0 && step < totalSteps - 1 && (
        <div className="text-right px-6 pt-4">
          <button onClick={onComplete} className="text-sm text-gray-400 hover:text-gray-600">Skip for now</button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-4xl">F</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Foresight</h1>
              <p className="text-gray-500 mb-2">You don't need a lawyer to fight for your kids.</p>
              <p className="text-gray-500 mb-8">Let's set up your account in under 2 minutes.</p>
              <button onClick={() => setStep(1)}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-colors">
                Let's Get Started →
              </button>
              <p className="text-xs text-gray-400 mt-4">Filing guides • AI assistant • Community support • 100% free to start</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">About You</h1>
              <p className="text-gray-500 text-center mb-6">We'll customize everything for your province.</p>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
              <input type="text" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })}
                placeholder="First and last name" autoFocus
                className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />

              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Province</label>
              <div className="grid grid-cols-2 gap-2 mb-6 max-h-[280px] overflow-y-auto pr-1">
                {JURISDICTIONS.map(j => (
                  <button key={j.id} onClick={() => setData({ ...data, jurisdiction: j.id })}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      data.jurisdiction === j.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                    }`}>
                    🇨🇦 {j.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="px-4 py-3 text-gray-500 text-sm">← Back</button>
                <button onClick={() => setStep(2)} disabled={!canProceed()}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Your Situation</h1>
              <p className="text-gray-500 text-center mb-6">This helps us show you the right starting point.</p>

              <div className="space-y-2 mb-6">
                {SITUATIONS.map(s => (
                  <button key={s.id} onClick={() => setData({ ...data, situation: s.id })}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      data.situation === s.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                    }`}>
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{s.label}</div>
                      <div className={`text-xs ${data.situation === s.id ? 'text-red-100' : 'text-gray-400'}`}>{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-4 py-3 text-gray-500 text-sm">← Back</button>
                <button onClick={() => setStep(3)} disabled={!canProceed()}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Set Up Your Case</h1>
              <p className="text-gray-500 text-center mb-6">We'll create your first case to keep everything organized.</p>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">What type of case?</label>
              <div className="space-y-2 mb-4">
                {CASE_TYPES.map(ct => (
                  <button key={ct.id} onClick={() => setData({ ...data, caseType: ct.id })}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      data.caseType === ct.id
                        ? 'bg-red-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                    }`}>
                    <span className="text-xl">{ct.icon}</span>
                    <span className="font-medium text-sm">{ct.label}</span>
                  </button>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">Give your case a name (optional)</label>
              <input type="text" value={data.caseName} onChange={e => setData({ ...data, caseName: e.target.value })}
                placeholder="e.g., Custody of my kids"
                className="w-full mb-6 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-4 py-3 text-gray-500 text-sm">← Back</button>
                <button onClick={() => setStep(4)} disabled={!canProceed()}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're All Set{data.fullName ? `, ${data.fullName.split(' ')[0]}` : ''}!</h1>
              <p className="text-gray-500 mb-8">Here's what's ready for you:</p>

              <div className="space-y-3 mb-8 text-left">
                {[
                  { icon: '📁', title: 'Your case is ready', desc: 'Upload documents, track progress, and chat with AI' },
                  { icon: '📋', title: `Filing guide for ${JURISDICTIONS.find(j => j.id === data.jurisdiction)?.name || 'your province'}`, desc: 'Step-by-step instructions customized to your province' },
                  { icon: '📄', title: 'Court forms ready to download', desc: 'Official forms for your jurisdiction' },
                  { icon: '💬', title: 'Community of parents like you', desc: 'Support, advice, and shared experiences' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-lg">{item.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-50">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your case...
                  </span>
                ) : 'Go to My Dashboard →'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

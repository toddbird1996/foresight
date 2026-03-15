'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

const GUIDE_STEPS = [
  {
    id: 0,
    title: 'Welcome to Foresight',
    desc: 'We\'re going to walk you through your custody case step by step. Each time you complete a step, come back here and we\'ll tell you what to do next.',
    action: 'Let\'s Begin',
    actionType: 'next',
    icon: '👋',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 1,
    title: 'Step 1: Know Your Rights',
    desc: 'Before you do anything, you need to understand what the law says about your situation. Read through the rights for your province — focus on custody rights, CPS rights if applicable, and child support rights.',
    hint: 'Pay attention to the specific legislation referenced (e.g. The Children\'s Law Act in Saskatchewan). Knowing the name of the law that protects you makes you credible in court.',
    action: 'Read My Rights',
    link: '/rights',
    icon: '⚖️',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 2,
    title: 'Step 2: Read the Filing Guide',
    desc: 'Now that you know your rights, learn the step-by-step filing process for your province. This tells you exactly which forms to file, in what order, what fees to expect, and what happens at each phase.',
    hint: 'Take notes on deadlines. Many provinces require you to serve the other party within a certain number of days. Missing a deadline can delay your case by months.',
    action: 'Read Filing Guide',
    link: '/filing',
    icon: '📋',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 3,
    title: 'Step 3: Download Your Court Forms',
    desc: 'Get the actual forms you need to file. Select your province and download the Petition, Financial Statement, and Affidavit of Service at minimum. Print 3 copies of everything.',
    hint: 'The Petition (or Application, depending on your province) is the document that officially starts your case. The Financial Statement is required whenever child support is involved. Don\'t skip either one.',
    action: 'Get Court Forms',
    link: '/court-forms',
    icon: '📄',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 4,
    title: 'Step 4: Set Up Your Case',
    desc: 'Create your case in Foresight so you can track documents, deadlines, and AI conversations in one place. Give it a clear name like "Custody of [Child\'s Name]".',
    hint: 'Upload any documents you already have — separation agreements, existing court orders, text messages, emails. Having everything in one place will save you hours later.',
    action: 'Create My Case',
    link: '/cases',
    icon: '📁',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 5,
    title: 'Step 5: Set Your Deadlines',
    desc: 'Add important dates to your calendar — filing deadlines, court hearing dates, parenting course dates, response deadlines. The calendar will remind you before each one.',
    hint: 'If you don\'t have a hearing date yet, set a deadline for when you plan to FILE your application. Having a target date keeps you accountable and moving forward.',
    action: 'Set Deadlines',
    link: '/deadlines',
    icon: '📅',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 6,
    title: 'Step 6: Calculate Child Support',
    desc: 'Use the child support calculator to estimate what support amounts might look like in your case. This helps you know what to expect and what to ask for.',
    hint: 'Child support in Canada follows the Federal Child Support Guidelines. The amount is based on the paying parent\'s income and the number of children. If you have shared custody (40%+), the calculation changes.',
    action: 'Calculate Support',
    link: '/calculator',
    icon: '🧮',
    color: 'from-teal-500 to-teal-600',
  },
  {
    id: 7,
    title: 'Step 7: Prepare for Court',
    desc: 'Read the Judge Insight tips before your hearing. How you present yourself, what you say, and how you organize your documents can make or break your case.',
    hint: 'The single most important thing: bring evidence for every claim you make. If you accuse the other parent of something and can\'t prove it, the judge will dismiss it AND question your credibility on everything else.',
    action: 'Court Preparation Tips',
    link: '/judge-insight',
    icon: '🏛️',
    color: 'from-rose-500 to-rose-600',
  },
  {
    id: 8,
    title: 'Step 8: Connect With Support',
    desc: 'You don\'t have to do this alone. Join the community to connect with other parents going through the same process. Find a mentor who\'s been through it. Check the programs directory for free services in your province.',
    hint: 'If you\'re in Saskatchewan, programs like Ranch Ehrlo, Legal Aid Saskatchewan, and the Family Law Information Centre (FLIC) can provide direct support. Check the Programs page for your province.',
    action: 'Join Community',
    link: '/community',
    icon: '🤝',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    id: 9,
    title: 'Step 9: File Your Application',
    desc: 'You\'ve done the research, gathered your forms, and prepared your evidence. It\'s time to file. Take your documents to the courthouse, pay the filing fee, and officially start your case.',
    hint: 'Bring 3 copies of everything: one for the court, one for the other party, one for you. Bring the filing fee in the form accepted by your courthouse (usually debit, cash, or money order — many don\'t accept credit cards). Ask the clerk to stamp your copy.',
    action: 'Review Filing Guide Again',
    link: '/filing',
    icon: '✅',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 10,
    title: 'You\'re on Your Way',
    desc: 'You\'ve completed the guided walkthrough. Keep using Foresight to track your case, manage deadlines, communicate with your co-parent, and prepare for court. You can revisit any step from the dashboard.',
    action: 'Go to Dashboard',
    actionType: 'finish',
    icon: '🎉',
    color: 'from-red-500 to-red-600',
  },
];

export default function CaseGuide({ userId, currentStep = 0, dismissed = false, onUpdate }) {
  const [step, setStep] = useState(currentStep);
  const [showHint, setShowHint] = useState(false);
  const [isDismissed, setIsDismissed] = useState(dismissed);
  const [minimized, setMinimized] = useState(false);

  const current = GUIDE_STEPS[step] || GUIDE_STEPS[0];
  const progress = Math.round((step / (GUIDE_STEPS.length - 1)) * 100);

  const goNext = async () => {
    const next = Math.min(step + 1, GUIDE_STEPS.length - 1);
    setStep(next);
    setShowHint(false);
    await supabase.from('users').update({ case_guide_step: next }).eq('id', userId);
    if (onUpdate) onUpdate(next);
  };

  const goBack = async () => {
    const prev = Math.max(step - 1, 0);
    setStep(prev);
    setShowHint(false);
    await supabase.from('users').update({ case_guide_step: prev }).eq('id', userId);
    if (onUpdate) onUpdate(prev);
  };

  const dismiss = async () => {
    setIsDismissed(true);
    await supabase.from('users').update({ guide_dismissed: true }).eq('id', userId);
  };

  const restore = async () => {
    setIsDismissed(false);
    setMinimized(false);
    await supabase.from('users').update({ guide_dismissed: false }).eq('id', userId);
  };

  // Show small restore button if dismissed
  if (isDismissed) {
    return (
      <button onClick={restore}
        className="mb-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2">
        🧭 Resume Case Guide
      </button>
    );
  }

  // Minimized bar
  if (minimized) {
    return (
      <div className="mb-4 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{current.icon}</span>
          <div>
            <div className="font-medium text-sm text-gray-900">{current.title}</div>
            <div className="h-1.5 w-32 bg-gray-100 rounded-full mt-1"><div className="h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMinimized(false)} className="text-xs text-red-600 font-medium">Expand</button>
          <button onClick={dismiss} className="text-xs text-gray-400">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className={`bg-gradient-to-r ${current.color} rounded-2xl p-5 text-white relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <div className="font-bold text-lg">{current.title}</div>
              <div className="text-white/70 text-xs">Step {step} of {GUIDE_STEPS.length - 1}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMinimized(true)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/20 text-xs">─</button>
            <button onClick={dismiss} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/20 text-xs">✕</button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 rounded-full mb-4 relative z-10">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm leading-relaxed relative z-10 mb-4">{current.desc}</p>

        {/* Hint toggle */}
        {current.hint && (
          <div className="relative z-10 mb-4">
            <button onClick={() => setShowHint(!showHint)} className="text-xs text-white/60 hover:text-white flex items-center gap-1.5">
              <span className={`transition-transform ${showHint ? 'rotate-90' : ''}`}>▸</span>
              {showHint ? 'Hide tip' : '💡 Show helpful tip'}
            </button>
            {showHint && (
              <div className="mt-2 bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white/85 leading-relaxed">
                💡 {current.hint}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 relative z-10">
          {step > 0 && (
            <button onClick={goBack} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium">← Back</button>
          )}

          {current.link ? (
            <div className="flex gap-2 flex-1">
              <Link href={current.link} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">
                {current.action} →
              </Link>
              <button onClick={goNext} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium">
                I've Done This ✓
              </button>
            </div>
          ) : current.actionType === 'next' ? (
            <button onClick={goNext} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">
              {current.action} →
            </button>
          ) : (
            <button onClick={dismiss} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">
              {current.action} 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

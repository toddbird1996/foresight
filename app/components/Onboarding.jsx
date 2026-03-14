'use client';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const PROVINCES = [
  { id: 'saskatchewan', name: 'Saskatchewan' }, { id: 'alberta', name: 'Alberta' },
  { id: 'ontario', name: 'Ontario' }, { id: 'british_columbia', name: 'British Columbia' },
  { id: 'manitoba', name: 'Manitoba' }, { id: 'quebec', name: 'Quebec' },
  { id: 'nova_scotia', name: 'Nova Scotia' }, { id: 'new_brunswick', name: 'New Brunswick' },
  { id: 'newfoundland', name: 'Newfoundland & Labrador' }, { id: 'pei', name: 'Prince Edward Island' },
  { id: 'northwest_territories', name: 'Northwest Territories' }, { id: 'yukon', name: 'Yukon' },
  { id: 'nunavut', name: 'Nunavut' },
];

const CASE_STATUSES = [
  { id: 'no_case', label: 'No case yet', icon: '🔍', desc: 'Seeking custody — haven\'t started' },
  { id: 'preparing', label: 'Preparing to file', icon: '📝', desc: 'Gathering documents and info' },
  { id: 'filed', label: 'Case already filed', icon: '📋', desc: 'Filed and waiting for next steps' },
  { id: 'waiting_hearing', label: 'Waiting for court hearing', icon: '⏳', desc: 'Hearing date set or pending' },
  { id: 'mediation', label: 'In mediation', icon: '🤝', desc: 'Currently in mediation process' },
  { id: 'responding', label: 'Responding to papers', icon: '📩', desc: 'Other parent filed first' },
  { id: 'cps', label: 'CPS involved', icon: '🛡️', desc: 'Child protection services are involved' },
  { id: 'modification', label: 'Modifying existing order', icon: '🔄', desc: 'Changing a current custody order' },
];

const CASE_TYPES = [
  { id: 'custody', label: 'Custody / Parenting', icon: '👨‍👧‍👦' },
  { id: 'divorce', label: 'Divorce', icon: '📑' },
  { id: 'support', label: 'Child Support', icon: '💰' },
  { id: 'protection', label: 'Child Protection (CPS)', icon: '🛡️' },
  { id: 'variation', label: 'Variation of Order', icon: '🔄' },
];

const CUSTODY_SITUATIONS = [
  { id: 'one_parent', label: 'Child lives primarily with one parent', icon: '🏠' },
  { id: 'shared', label: 'Shared custody arrangement', icon: '🔄' },
  { id: 'informal', label: 'Informal arrangement (no court order)', icon: '🤷' },
  { id: 'court_ordered', label: 'Court-ordered custody in place', icon: '⚖️' },
  { id: 'no_agreement', label: 'No current agreement', icon: '❌' },
  { id: 'supervised', label: 'Supervised access / visitation', icon: '👁️' },
];

const LEGAL_SUPPORT = [
  { id: 'no_lawyer', label: 'No lawyer — self-representing', icon: '🙋' },
  { id: 'consulting', label: 'Consulting a lawyer', icon: '💬' },
  { id: 'represented', label: 'Currently have a lawyer', icon: '👨‍⚖️' },
  { id: 'mediator', label: 'Working with a mediator', icon: '🤝' },
  { id: 'legal_aid', label: 'Applied for / using Legal Aid', icon: '📋' },
];

function generateActionPlan(data) {
  const steps = [];
  const { caseStatus, caseType, legalSupport } = data;

  // Always start with understanding rights
  steps.push({ step: 1, title: 'Understand your rights', desc: 'Review the Know Your Rights section for your province.', link: '/rights', icon: '⚖️' });

  if (caseStatus === 'no_case' || caseStatus === 'preparing') {
    steps.push({ step: 2, title: 'Review the filing guide', desc: 'Follow the step-by-step guide for your jurisdiction.', link: '/filing', icon: '📋' });
    steps.push({ step: 3, title: 'Download required court forms', desc: 'Get the official forms you need to file.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'Gather evidence & documentation', desc: 'Upload documents to your case for organization.', link: '/cases', icon: '📁' });
    steps.push({ step: 5, title: 'Prepare your parenting proposal', desc: 'Draft a parenting plan showing your proposed arrangement.', link: '/cases', icon: '👶' });
    if (caseType === 'custody' || caseType === 'divorce') {
      steps.push({ step: 6, title: 'Complete your financial statement', desc: 'Required if you\'re claiming child or spousal support.', link: '/court-forms', icon: '💰' });
    }
  } else if (caseStatus === 'filed' || caseStatus === 'waiting_hearing') {
    steps.push({ step: 2, title: 'Prepare for your hearing', desc: 'Review the Judge Insight page for courtroom preparation.', link: '/judge-insight', icon: '🏛️' });
    steps.push({ step: 3, title: 'Organize your documents', desc: 'Upload and organize all case documents.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Track your deadlines', desc: 'Make sure you don\'t miss any filing dates.', link: '/deadlines', icon: '⏰' });
    steps.push({ step: 5, title: 'Use the AI assistant', desc: 'Ask questions about what to expect at your hearing.', link: '/cases', icon: '🤖' });
  } else if (caseStatus === 'responding') {
    steps.push({ step: 2, title: 'File your response immediately', desc: 'You have 30 days to respond. Check your filing guide.', link: '/filing', icon: '⚠️' });
    steps.push({ step: 3, title: 'Download the Answer form', desc: 'Get the correct response form for your province.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'Prepare your affidavit', desc: 'Write your sworn statement of facts.', link: '/cases', icon: '📝' });
    steps.push({ step: 5, title: 'Complete your financial statement', desc: 'Required for all support-related claims.', link: '/court-forms', icon: '💰' });
  } else if (caseStatus === 'cps') {
    steps.push({ step: 2, title: 'Know your CPS rights', desc: 'Review investigation, apprehension, and court rights.', link: '/rights', icon: '🛡️' });
    steps.push({ step: 3, title: 'Document everything', desc: 'Keep detailed records of all interactions with CPS.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Find legal support', desc: 'Check programs for free legal assistance in your area.', link: '/programs', icon: '📞' });
    steps.push({ step: 5, title: 'Prepare for court', desc: 'CPS cases often move to court quickly. Be ready.', link: '/judge-insight', icon: '🏛️' });
  } else if (caseStatus === 'mediation') {
    steps.push({ step: 2, title: 'Prepare your parenting proposal', desc: 'Have a clear plan ready for mediation discussions.', link: '/cases', icon: '👶' });
    steps.push({ step: 3, title: 'Organize your documents', desc: 'Bring financial statements and relevant evidence.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Use the co-parent messenger', desc: 'Keep all communication documented and court-ready.', link: '/coparent', icon: '💬' });
  } else if (caseStatus === 'modification') {
    steps.push({ step: 2, title: 'Document the change in circumstances', desc: 'Courts need to see what has changed since the last order.', link: '/cases', icon: '📝' });
    steps.push({ step: 3, title: 'Download variation forms', desc: 'Get the correct forms for modifying an order.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'File your variation application', desc: 'Follow the filing guide for your province.', link: '/filing', icon: '📋' });
  }

  // Everyone gets community
  steps.push({ step: steps.length + 1, title: 'Join the community', desc: 'Connect with other parents navigating similar situations.', link: '/community', icon: '💬' });

  if (legalSupport === 'no_lawyer' || legalSupport === 'legal_aid') {
    steps.push({ step: steps.length + 1, title: 'Explore support programs', desc: 'Find legal aid, counselling, and financial assistance.', link: '/programs', icon: '🛡️' });
  }

  return steps;
}

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    fullName: '', jurisdiction: '', caseStatus: '', caseType: 'custody',
    numChildren: '', childrenAges: '', custodySituation: '', legalSupport: '', caseName: '',
  });
  const [actionPlan, setActionPlan] = useState(null);

  const totalSteps = 8;
  const pct = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return data.fullName.trim() && data.jurisdiction;
    if (step === 2) return data.caseStatus;
    if (step === 3) return data.caseType;
    if (step === 4) return data.numChildren;
    if (step === 5) return data.custodySituation;
    if (step === 6) return data.legalSupport;
    return true;
  };

  const goToActionPlan = () => {
    const plan = generateActionPlan(data);
    setActionPlan(plan);
    setStep(7);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const plan = actionPlan || generateActionPlan(data);
      await supabase.from('users').update({
        full_name: data.fullName.trim(),
        jurisdiction: data.jurisdiction,
        case_status: data.caseStatus,
        legal_support: data.legalSupport,
        num_children: parseInt(data.numChildren) || null,
        children_ages: data.childrenAges,
        custody_situation: data.custodySituation,
        onboarding_completed: true,
        action_plan: plan,
        onboarding_data: {
          case_type: data.caseType,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id);

      const caseName = data.caseName.trim() || 'My Case';
      await supabase.from('cases').insert({
        user_id: user.id, name: caseName,
        jurisdiction_id: data.jurisdiction, case_type: data.caseType, status: 'active',
      });

      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      onComplete();
    }
    setSaving(false);
  };

  const Option = ({ selected, onClick, icon, label, desc }) => (
    <button onClick={onClick} className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selected ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'}`}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        {desc && <div className={`text-xs ${selected ? 'text-red-100' : 'text-gray-400'}`}>{desc}</div>}
      </div>
    </button>
  );

  const NavButtons = ({ backStep, nextAction, nextDisabled, nextLabel }) => (
    <div className="flex gap-3 mt-6">
      {backStep !== undefined && <button onClick={() => setStep(backStep)} className="px-4 py-3 text-gray-500 text-sm">← Back</button>}
      <button onClick={nextAction} disabled={nextDisabled} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">{nextLabel || 'Continue →'}</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-1.5 bg-gray-200"><div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
      {step > 0 && step < 7 && (
        <div className="flex justify-between px-6 pt-3">
          <span className="text-xs text-gray-400">Step {step} of 7</span>
          <button onClick={onComplete} className="text-xs text-gray-400 hover:text-gray-600">Skip for now</button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* STEP 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-4xl">F</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Foresight</h1>
              <p className="text-gray-500 mb-2">Let's set up your case in under 3 minutes.</p>
              <p className="text-gray-400 text-sm mb-8">We'll personalize everything based on your situation — forms, guides, and a custom action plan.</p>
              <button onClick={() => setStep(1)} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-colors">Let's Get Started →</button>
              <p className="text-xs text-gray-400 mt-4">Free to use • No credit card required</p>
            </div>
          )}

          {/* STEP 1: Name & Province */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">About You</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">We'll customize forms and guides for your province.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
              <input type="text" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })} placeholder="First and last name" autoFocus className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Province</label>
              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {PROVINCES.map(j => (
                  <button key={j.id} onClick={() => setData({ ...data, jurisdiction: j.id })} className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${data.jurisdiction === j.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'}`}>🇨🇦 {j.name}</button>
                ))}
              </div>
              <NavButtons backStep={0} nextAction={() => setStep(2)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 2: Case Status */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Where Are You in the Process?</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">This helps us show you the right starting point.</p>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {CASE_STATUSES.map(s => (<Option key={s.id} selected={data.caseStatus === s.id} onClick={() => setData({ ...data, caseStatus: s.id })} {...s} />))}
              </div>
              <NavButtons backStep={1} nextAction={() => setStep(3)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 3: Case Type */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What Type of Case?</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Select the primary type of your family law matter.</p>
              <div className="space-y-2">
                {CASE_TYPES.map(ct => (<Option key={ct.id} selected={data.caseType === ct.id} onClick={() => setData({ ...data, caseType: ct.id })} icon={ct.icon} label={ct.label} />))}
              </div>
              <NavButtons backStep={2} nextAction={() => setStep(4)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 4: Children */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">About Your Children</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Basic info helps us tailor your guidance.</p>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">How many children are involved?</label>
              <div className="flex gap-2 mb-4">
                {['1', '2', '3', '4', '5+'].map(n => (
                  <button key={n} onClick={() => setData({ ...data, numChildren: n })} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${data.numChildren === n ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'}`}>{n}</button>
                ))}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Children's ages (approximate)</label>
              <input type="text" value={data.childrenAges} onChange={e => setData({ ...data, childrenAges: e.target.value })} placeholder="e.g., 4 and 7" className="w-full mb-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <p className="text-xs text-gray-400 mb-2">This is private and only used to personalize your experience.</p>
              <NavButtons backStep={3} nextAction={() => setStep(5)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 5: Current Custody Situation */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Current Custody Situation</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">What does the current arrangement look like?</p>
              <div className="space-y-2">
                {CUSTODY_SITUATIONS.map(cs => (<Option key={cs.id} selected={data.custodySituation === cs.id} onClick={() => setData({ ...data, custodySituation: cs.id })} icon={cs.icon} label={cs.label} />))}
              </div>
              <NavButtons backStep={4} nextAction={() => setStep(6)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 6: Legal Support + Case Name */}
          {step === 6 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Your Legal Support</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Do you currently have legal representation?</p>
              <div className="space-y-2 mb-5">
                {LEGAL_SUPPORT.map(ls => (<Option key={ls.id} selected={data.legalSupport === ls.id} onClick={() => setData({ ...data, legalSupport: ls.id })} icon={ls.icon} label={ls.label} />))}
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Give your case a name (optional)</label>
              <input type="text" value={data.caseName} onChange={e => setData({ ...data, caseName: e.target.value })} placeholder="e.g., Custody of Emma & Jake" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <NavButtons backStep={5} nextAction={goToActionPlan} nextDisabled={!canProceed()} nextLabel="See My Action Plan →" />
            </div>
          )}

          {/* STEP 7: Action Plan + Done */}
          {step === 7 && actionPlan && (
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎯</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Custom Action Plan</h1>
                <p className="text-gray-500 text-sm">Based on your answers, here's your recommended path forward.</p>
              </div>

              <div className="space-y-2 mb-6 max-h-[340px] overflow-y-auto pr-1">
                {actionPlan.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{item.step}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-green-700">✅ Your case will be created automatically. You can access your action plan anytime from your dashboard.</p>
              </div>

              <button onClick={handleFinish} disabled={saving} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-lg transition-colors disabled:opacity-50">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your case...
                  </span>
                ) : 'Go to My Dashboard →'}
              </button>
              <button onClick={() => setStep(6)} className="w-full mt-2 py-2 text-gray-500 text-sm">← Go back and change answers</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

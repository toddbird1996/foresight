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

// Step 2: What best describes your situation RIGHT NOW
// Covers all real entry points — not just "haven't started"
const SITUATIONS = [
  {
    id: 'starting_fresh',
    icon: '🔍',
    label: 'Starting fresh — no case yet',
    desc: 'No court involvement. Haven\'t filed anything.',
  },
  {
    id: 'preparing_to_file',
    icon: '📝',
    label: 'Preparing to file',
    desc: 'Gathering info and documents before filing.',
  },
  {
    id: 'have_informal_arrangement',
    icon: '🤝',
    label: 'Have an informal arrangement',
    desc: 'Custody or support is settled informally — no court order.',
  },
  {
    id: 'have_support_no_custody',
    icon: '💰',
    label: 'Child support exists — no custody agreement',
    desc: 'Support is in place but custody hasn\'t been formally settled.',
  },
  {
    id: 'have_custody_no_support',
    icon: '👶',
    label: 'Custody settled — no support agreement',
    desc: 'Living arrangement decided but support hasn\'t been formalized.',
  },
  {
    id: 'responding',
    icon: '📩',
    label: 'Responding to papers served',
    desc: 'Other parent filed. I need to respond.',
  },
  {
    id: 'filed_waiting',
    icon: '📋',
    label: 'Filed — waiting for hearing',
    desc: 'Case is active. Hearing date set or pending.',
  },
  {
    id: 'in_mediation',
    icon: '🕊️',
    label: 'In mediation or negotiation',
    desc: 'Working toward an agreement with or without lawyers.',
  },
  {
    id: 'have_order_want_change',
    icon: '🔄',
    label: 'Have a court order — want to change it',
    desc: 'Existing order needs to be varied or updated.',
  },
  {
    id: 'have_order_not_followed',
    icon: '⚠️',
    label: 'Have a court order — not being followed',
    desc: 'Other parent is not complying with the order.',
  },
  {
    id: 'cps_involved',
    icon: '🛡️',
    label: 'CPS / child protection involved',
    desc: 'Child services have opened a file or intervened.',
  },
  {
    id: 'high_conflict',
    icon: '🔥',
    label: 'High conflict — complex situation',
    desc: 'Involving alienation, DV, substance issues, or other complications.',
  },
];

// Step 3: What are you primarily trying to accomplish?
// Now also accounts for existing order situations
const GOALS = {
  starting_fresh: [
    { id: 'get_custody', label: 'Get a custody / parenting order', icon: '👨‍👧‍👦' },
    { id: 'get_support', label: 'Get child support ordered', icon: '💰' },
    { id: 'get_both', label: 'Get custody and support settled', icon: '⚖️' },
    { id: 'file_divorce', label: 'File for divorce', icon: '📑' },
    { id: 'understand_options', label: 'Understand my options first', icon: '🔍' },
  ],
  preparing_to_file: [
    { id: 'get_custody', label: 'File for custody / parenting order', icon: '👨‍👧‍👦' },
    { id: 'get_support', label: 'File for child support', icon: '💰' },
    { id: 'get_both', label: 'File for custody and support', icon: '⚖️' },
    { id: 'file_divorce', label: 'File for divorce', icon: '📑' },
    { id: 'get_emergency_order', label: 'Get an emergency protection order', icon: '🚨' },
  ],
  have_informal_arrangement: [
    { id: 'formalize_custody', label: 'Formalize custody into a court order', icon: '⚖️' },
    { id: 'formalize_support', label: 'Formalize child support', icon: '💰' },
    { id: 'formalize_both', label: 'Formalize both custody and support', icon: '📋' },
    { id: 'get_consent_order', label: 'Get a consent order both parties agree to', icon: '🤝' },
    { id: 'modify_informal', label: 'Change the current informal arrangement', icon: '🔄' },
  ],
  have_support_no_custody: [
    { id: 'get_custody', label: 'Get a formal custody order', icon: '👨‍👧‍👦' },
    { id: 'get_parenting_schedule', label: 'Get a parenting schedule formalized', icon: '📅' },
    { id: 'combine_into_order', label: 'Combine support and custody into one order', icon: '📋' },
    { id: 'modify_support', label: 'Modify the existing support amount', icon: '💰' },
    { id: 'enforce_support', label: 'Enforce support that isn\'t being paid', icon: '⚠️' },
  ],
  have_custody_no_support: [
    { id: 'get_support_ordered', label: 'Get child support ordered', icon: '💰' },
    { id: 'get_retroactive_support', label: 'Get retroactive (back-dated) support', icon: '📅' },
    { id: 'modify_custody', label: 'Modify the current custody arrangement', icon: '🔄' },
    { id: 'get_consent_order', label: 'Get a consent order for both', icon: '🤝' },
  ],
  responding: [
    { id: 'respond_custody', label: 'Respond to custody application', icon: '👨‍👧‍👦' },
    { id: 'respond_support', label: 'Respond to support claim', icon: '💰' },
    { id: 'respond_both', label: 'Respond to custody and support claims', icon: '📋' },
    { id: 'respond_divorce', label: 'Respond to divorce application', icon: '📑' },
    { id: 'counter_claim', label: 'File a counter-claim', icon: '⚖️' },
  ],
  filed_waiting: [
    { id: 'prepare_for_hearing', label: 'Prepare for upcoming court hearing', icon: '🏛️' },
    { id: 'reach_consent_order', label: 'Reach a consent order before trial', icon: '🤝' },
    { id: 'interim_order', label: 'Get an interim order in place', icon: '⏳' },
    { id: 'understand_process', label: 'Understand what happens next', icon: '🔍' },
  ],
  in_mediation: [
    { id: 'reach_parenting_agreement', label: 'Reach a parenting agreement', icon: '👨‍👧‍👦' },
    { id: 'reach_support_agreement', label: 'Reach a support agreement', icon: '💰' },
    { id: 'reach_full_settlement', label: 'Reach a full settlement', icon: '✅' },
    { id: 'convert_to_order', label: 'Convert agreement to a court order', icon: '⚖️' },
  ],
  have_order_want_change: [
    { id: 'vary_custody', label: 'Vary the custody / parenting order', icon: '👨‍👧‍👦' },
    { id: 'vary_support', label: 'Vary the support order', icon: '💰' },
    { id: 'vary_both', label: 'Vary both custody and support', icon: '📋' },
    { id: 'relocate', label: 'Relocate with the children', icon: '✈️' },
    { id: 'change_schedule', label: 'Change the parenting schedule only', icon: '📅' },
  ],
  have_order_not_followed: [
    { id: 'enforce_custody', label: 'Enforce parenting time / access', icon: '👨‍👧‍👦' },
    { id: 'enforce_support', label: 'Enforce support payments', icon: '💰' },
    { id: 'contempt', label: 'File for contempt of court', icon: '⚠️' },
    { id: 'vary_and_enforce', label: 'Vary the order and enforce it', icon: '⚖️' },
  ],
  cps_involved: [
    { id: 'understand_cps_rights', label: 'Understand my rights in the CPS process', icon: '🛡️' },
    { id: 'contest_apprehension', label: 'Contest a child apprehension', icon: '⚠️' },
    { id: 'work_with_cps', label: 'Work with CPS to get children home', icon: '🏠' },
    { id: 'get_legal_help', label: 'Find legal help urgently', icon: '📞' },
  ],
  high_conflict: [
    { id: 'get_protection_order', label: 'Get an emergency protection order', icon: '🚨' },
    { id: 'deal_with_alienation', label: 'Deal with parental alienation', icon: '💔' },
    { id: 'document_situation', label: 'Document the situation properly', icon: '📁' },
    { id: 'get_custody_in_conflict', label: 'Get a formal custody order', icon: '⚖️' },
    { id: 'find_support', label: 'Find support and resources', icon: '🤝' },
  ],
};

// Map situation to a case_status value for DB storage
const SITUATION_TO_STATUS = {
  starting_fresh: 'no_case',
  preparing_to_file: 'preparing',
  have_informal_arrangement: 'no_case',
  have_support_no_custody: 'no_case',
  have_custody_no_support: 'no_case',
  responding: 'responding',
  filed_waiting: 'waiting_hearing',
  in_mediation: 'mediation',
  have_order_want_change: 'modification',
  have_order_not_followed: 'modification',
  cps_involved: 'cps',
  high_conflict: 'preparing',
};

// Map situation+goal to case_type
const goalToCaseType = (goal) => {
  if (!goal) return 'custody';
  if (goal.includes('support') && !goal.includes('custody') && !goal.includes('both') && !goal.includes('full')) return 'support';
  if (goal.includes('divorce')) return 'divorce';
  if (goal.includes('cps') || goal.includes('apprehension') || goal.includes('protection')) return 'protection';
  if (goal.includes('vary') || goal.includes('change') || goal.includes('modify')) return 'variation';
  return 'custody';
};

function generateActionPlan(data) {
  const steps = [];
  const { situation, goal, legalSupport } = data;

  // Step 1 is always rights
  steps.push({ step: 1, title: 'Understand your rights', desc: 'Review the Know Your Rights section for your province.', link: '/rights', icon: '⚖️' });

  // Branch based on situation
  if (situation === 'starting_fresh' || situation === 'preparing_to_file') {
    steps.push({ step: 2, title: 'Read the filing guide', desc: 'Step-by-step process for your province.', link: '/filing', icon: '📋' });
    steps.push({ step: 3, title: 'Download required court forms', desc: 'Get the official forms you need to file.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'Gather evidence & documentation', desc: 'Upload documents to your case for organization.', link: '/cases', icon: '📁' });
    steps.push({ step: 5, title: 'Prepare your parenting proposal', desc: 'Draft a parenting plan showing your proposed arrangement.', link: '/cases', icon: '👶' });
    if (goal === 'get_support' || goal === 'get_both' || goal === 'file_divorce') {
      steps.push({ step: 6, title: 'Complete your financial statement', desc: 'Required if you\'re claiming child or spousal support.', link: '/court-forms', icon: '💰' });
    }
    if (goal === 'get_emergency_order') {
      steps.push({ step: 2, title: 'File for emergency protection order immediately', desc: 'Emergency orders can be granted same-day. See the filing guide.', link: '/filing', icon: '🚨' });
    }
  } else if (situation === 'have_informal_arrangement' || situation === 'have_support_no_custody' || situation === 'have_custody_no_support') {
    steps.push({ step: 2, title: 'Review your current arrangement', desc: 'Document what\'s currently in place — written or verbal.', link: '/cases', icon: '📁' });
    if (goal === 'get_consent_order' || goal === 'formalize_both' || goal === 'combine_into_order') {
      steps.push({ step: 3, title: 'Work toward a consent order', desc: 'Both parties must agree. A consent order is faster and cheaper.', link: '/filing', icon: '🤝' });
      steps.push({ step: 4, title: 'Download consent order forms', desc: 'Get the correct forms for a consent order in your province.', link: '/court-forms', icon: '📄' });
    } else {
      steps.push({ step: 3, title: 'Read the filing guide', desc: 'Understand the formal process for your province.', link: '/filing', icon: '📋' });
      steps.push({ step: 4, title: 'Get the correct court forms', desc: 'File to formalize the arrangement through court.', link: '/court-forms', icon: '📄' });
    }
    if (goal === 'enforce_support' || goal === 'modify_support') {
      steps.push({ step: 5, title: 'Complete a financial statement', desc: 'Required to calculate or adjust support amounts.', link: '/court-forms', icon: '💰' });
    }
  } else if (situation === 'responding') {
    steps.push({ step: 2, title: '⚠️ File your response immediately', desc: 'You have 30 days to respond. Don\'t miss the deadline.', link: '/filing', icon: '⚠️' });
    steps.push({ step: 3, title: 'Download the Answer form', desc: 'Get the correct response form for your province.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'Prepare your affidavit', desc: 'Your sworn statement of facts — what you want the court to know.', link: '/cases', icon: '📝' });
    if (goal === 'respond_support' || goal === 'respond_both' || goal === 'counter_claim') {
      steps.push({ step: 5, title: 'Complete your financial statement', desc: 'Required for all support-related claims.', link: '/court-forms', icon: '💰' });
    }
    if (goal === 'counter_claim') {
      steps.push({ step: 6, title: 'File a counter-application', desc: 'You can make your own claims at the same time as responding.', link: '/filing', icon: '⚖️' });
    }
  } else if (situation === 'filed_waiting') {
    steps.push({ step: 2, title: 'Prepare for your hearing', desc: 'Review the Court Tips page for what to expect.', link: '/judge-insight', icon: '🏛️' });
    steps.push({ step: 3, title: 'Organize your documents', desc: 'Upload and organize all case documents.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Track your deadlines', desc: 'Don\'t miss any filing dates or disclosure deadlines.', link: '/deadlines', icon: '⏰' });
    if (goal === 'reach_consent_order') {
      steps.push({ step: 5, title: 'Negotiate a consent order', desc: 'Settling before trial saves time and cost for both parties.', link: '/filing', icon: '🤝' });
    }
  } else if (situation === 'in_mediation') {
    steps.push({ step: 2, title: 'Prepare your parenting proposal', desc: 'Have a clear plan ready for mediation discussions.', link: '/cases', icon: '👶' });
    steps.push({ step: 3, title: 'Organize your financial documents', desc: 'Bring financial statements and relevant evidence.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Use the co-parent messenger', desc: 'Keep all communication documented and court-ready.', link: '/coparent', icon: '💬' });
    if (goal === 'convert_to_order') {
      steps.push({ step: 5, title: 'Convert your agreement to a consent order', desc: 'A consent order is legally binding — get it formalized.', link: '/court-forms', icon: '⚖️' });
    }
  } else if (situation === 'have_order_want_change') {
    steps.push({ step: 2, title: 'Document the change in circumstances', desc: 'Courts need to see what has materially changed since the last order.', link: '/cases', icon: '📝' });
    steps.push({ step: 3, title: 'Download variation forms', desc: 'Get the correct forms for varying an existing order.', link: '/court-forms', icon: '📄' });
    steps.push({ step: 4, title: 'File your variation application', desc: 'Follow the variation section of the filing guide.', link: '/filing', icon: '📋' });
    if (goal === 'relocate') {
      steps.push({ step: 5, title: 'Review relocation rules', desc: 'There are strict rules about relocating with children. Know them before moving.', link: '/rights', icon: '✈️' });
    }
  } else if (situation === 'have_order_not_followed') {
    steps.push({ step: 2, title: 'Document every violation', desc: 'Keep dated records of every missed visit, late payment, or breach.', link: '/cases', icon: '📁' });
    if (goal === 'enforce_support') {
      steps.push({ step: 3, title: 'Register with MEP / SEP', desc: 'The Maintenance Enforcement Program enforces support automatically.', link: '/programs', icon: '💰' });
    }
    steps.push({ step: 3, title: 'File for enforcement / contempt', desc: 'Courts can impose fines, suspended sentences, or access changes for breaches.', link: '/filing', icon: '⚠️' });
    steps.push({ step: 4, title: 'Consider variation if circumstances changed', desc: 'If the situation has changed significantly, you may want to vary the order.', link: '/filing', icon: '🔄' });
  } else if (situation === 'cps_involved') {
    steps.push({ step: 2, title: 'Know your CPS rights immediately', desc: 'You have rights during investigations, apprehensions, and court proceedings.', link: '/rights', icon: '🛡️' });
    steps.push({ step: 3, title: 'Document everything', desc: 'Keep detailed records of all interactions with CPS workers.', link: '/cases', icon: '📁' });
    steps.push({ step: 4, title: 'Find legal support urgently', desc: 'CPS cases move fast. Free legal help is available.', link: '/programs', icon: '📞' });
    steps.push({ step: 5, title: 'Prepare for court', desc: 'CPS cases often escalate to court quickly. Be ready.', link: '/judge-insight', icon: '🏛️' });
  } else if (situation === 'high_conflict') {
    if (goal === 'get_protection_order') {
      steps.push({ step: 2, title: 'File for an emergency protection order', desc: 'Can be granted same-day. See the filing guide immediately.', link: '/filing', icon: '🚨' });
    }
    steps.push({ step: 2, title: 'Document everything thoroughly', desc: 'Evidence is critical in high-conflict cases. Document all incidents.', link: '/cases', icon: '📁' });
    steps.push({ step: 3, title: 'Use the incident log', desc: 'Keep a timestamped record of all concerning incidents.', link: '/incident-log', icon: '📋' });
    steps.push({ step: 4, title: 'Use the co-parent messenger', desc: 'Written communication creates a court-ready paper trail.', link: '/coparent', icon: '💬' });
    steps.push({ step: 5, title: 'Find specialized support', desc: 'High-conflict programs and counselling services are available.', link: '/programs', icon: '🤝' });
  }

  // Everyone gets community
  steps.push({ step: steps.length + 1, title: 'Join the community', desc: 'Connect with parents who\'ve navigated similar situations.', link: '/community', icon: '💬' });

  if (legalSupport === 'no_lawyer' || legalSupport === 'legal_aid') {
    steps.push({ step: steps.length + 1, title: 'Explore support programs', desc: 'Find legal aid, counselling, and financial assistance.', link: '/programs', icon: '🛡️' });
  }

  // Re-number steps
  return steps.map((s, i) => ({ ...s, step: i + 1 }));
}

const LEGAL_SUPPORT = [
  { id: 'no_lawyer', label: 'No lawyer — self-representing', icon: '🙋' },
  { id: 'consulting', label: 'Consulting a lawyer', icon: '💬' },
  { id: 'represented', label: 'Currently have a lawyer', icon: '👨‍⚖️' },
  { id: 'mediator', label: 'Working with a mediator', icon: '🤝' },
  { id: 'legal_aid', label: 'Applied for / using Legal Aid', icon: '📋' },
];

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    fullName: '', jurisdiction: '', situation: '', goal: '',
    numChildren: '', childrenAges: '', legalSupport: '', caseName: '',
  });
  const [actionPlan, setActionPlan] = useState(null);

  const totalSteps = 8;
  const pct = ((step) / (totalSteps - 1)) * 100;

  const canProceed = () => {
    if (step === 1) return data.fullName.trim() && data.jurisdiction;
    if (step === 2) return data.situation;
    if (step === 3) return data.goal;
    if (step === 4) return data.numChildren;
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
      const caseStatus = SITUATION_TO_STATUS[data.situation] || 'no_case';
      const caseType = goalToCaseType(data.goal);

      await supabase.from('users').update({
        full_name: data.fullName.trim(),
        jurisdiction: data.jurisdiction,
        case_status: caseStatus,
        case_type: caseType,
        legal_support: data.legalSupport,
        num_children: parseInt(data.numChildren) || null,
        children_ages: data.childrenAges,
        custody_situation: data.situation,
        onboarding_completed: true,
        action_plan: plan,
        onboarding_data: {
          situation: data.situation,
          goal: data.goal,
          case_type: caseType,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id);

      const caseName = data.caseName.trim() || 'My Case';
      await supabase.from('cases').insert({
        user_id: user.id, name: caseName,
        jurisdiction_id: data.jurisdiction, case_type: caseType, status: 'active',
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
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        {desc && <div className={`text-xs mt-0.5 leading-snug ${selected ? 'text-red-100' : 'text-gray-400'}`}>{desc}</div>}
      </div>
    </button>
  );

  const NavButtons = ({ backStep, nextAction, nextDisabled, nextLabel }) => (
    <div className="flex gap-3 mt-6">
      {backStep !== undefined && <button onClick={() => setStep(backStep)} className="px-4 py-3 text-gray-500 text-sm">← Back</button>}
      <button onClick={nextAction} disabled={nextDisabled} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40 transition-colors">{nextLabel || 'Continue →'}</button>
    </div>
  );

  // Goals for current situation
  const currentGoals = GOALS[data.situation] || [];

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

          {/* STEP 2: Situation */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What's Your Situation?</h1>
              <p className="text-gray-500 text-center mb-5 text-sm">Pick the option that best describes where you are <strong>right now</strong>.</p>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {SITUATIONS.map(s => (
                  <Option key={s.id} selected={data.situation === s.id}
                    onClick={() => setData({ ...data, situation: s.id, goal: '' })}
                    icon={s.icon} label={s.label} desc={s.desc} />
                ))}
              </div>
              <NavButtons backStep={1} nextAction={() => setStep(3)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 3: Goal — dynamically based on situation */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What Are You Trying to Accomplish?</h1>
              <p className="text-gray-500 text-center mb-5 text-sm">This helps us build your action plan.</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {currentGoals.map(g => (
                  <Option key={g.id} selected={data.goal === g.id}
                    onClick={() => setData({ ...data, goal: g.id })}
                    icon={g.icon} label={g.label} />
                ))}
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
              <p className="text-xs text-gray-400">This is private and only used to personalize your experience.</p>
              <NavButtons backStep={3} nextAction={() => setStep(5)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* STEP 5: Existing orders — brief reality check */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Existing Orders or Agreements</h1>
              <p className="text-gray-500 text-center mb-5 text-sm">Check all that currently apply to your situation.</p>
              <div className="space-y-2 mb-6">
                {[
                  { id: 'court_order_custody', label: 'Court order for custody / parenting time', icon: '⚖️' },
                  { id: 'court_order_support', label: 'Court order for child support', icon: '💰' },
                  { id: 'consent_order', label: 'Consent order (agreed to by both parties)', icon: '🤝' },
                  { id: 'written_agreement', label: 'Written agreement (not filed in court)', icon: '📄' },
                  { id: 'registered_with_mep', label: 'Support registered with MEP / SEP', icon: '📋' },
                  { id: 'none', label: 'None of the above', icon: '❌' },
                ].map(opt => {
                  const selected = (data.existingOrders || []).includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => {
                      const current = data.existingOrders || [];
                      if (opt.id === 'none') {
                        setData({ ...data, existingOrders: ['none'] });
                      } else {
                        const without = current.filter(x => x !== 'none');
                        const updated = selected ? without.filter(x => x !== opt.id) : [...without, opt.id];
                        setData({ ...data, existingOrders: updated });
                      }
                    }}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selected ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'}`}>
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                      {selected && <span className="ml-auto text-white text-sm">✓</span>}
                    </button>
                  );
                })}
              </div>
              <NavButtons backStep={4} nextAction={() => setStep(6)} nextDisabled={false} />
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

          {/* STEP 7: Action Plan */}
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
                <p className="text-xs text-green-700">✅ Your case will be created automatically. Access your action plan anytime from your dashboard.</p>
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

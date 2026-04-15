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

// Step 2 — Primary goal / entry point
const PRIMARY_GOALS = [
  { id: 'get_custody',    icon: '👶', label: 'Get a custody or parenting order',    desc: 'No order exists yet — I need to establish one' },
  { id: 'get_support',    icon: '💰', label: 'Get or change child support',          desc: 'No formal support order, or I need to change the amount' },
  { id: 'enforce_order',  icon: '⚖️', label: 'Enforce an existing order',           desc: 'I have a court order but it\'s not being followed' },
  { id: 'change_order',   icon: '🔄', label: 'Change an existing order',            desc: 'I have a court order but circumstances have changed' },
  { id: 'responding',     icon: '📩', label: 'Respond to papers served on me',      desc: 'The other parent filed first — I need to respond' },
  { id: 'divorce',        icon: '📑', label: 'Divorce (with or without children)',  desc: 'Formally dissolving the marriage' },
  { id: 'cps',            icon: '🛡️', label: 'Deal with CPS / child protection',  desc: 'Child protective services are involved' },
  { id: 'agreement',      icon: '🤝', label: 'Reach an agreement without court',   desc: 'We want to settle through mediation or negotiation' },
];

// Step 3 — What currently exists (conditional on goal)
const EXISTING_ARRANGEMENTS = [
  { id: 'nothing',         icon: '❌', label: 'Nothing in place',                  desc: 'No order, no written agreement' },
  { id: 'informal_verbal', icon: '🗣️', label: 'Verbal / informal arrangement',   desc: 'We have an understanding but nothing written or court-ordered' },
  { id: 'written_agreement',icon: '📝', label: 'Written agreement (not filed)',   desc: 'We have a written agreement but it\'s not a court order' },
  { id: 'consent_order',   icon: '✅', label: 'Consent order or filed agreement', desc: 'We agreed and a judge signed it into a court order' },
  { id: 'court_order',     icon: '⚖️', label: 'Court-ordered (after a hearing)', desc: 'A judge decided after a contested hearing' },
  { id: 'temporary_order', icon: '⏳', label: 'Temporary / interim order',       desc: 'An order is in place but it\'s not final yet' },
];

// Step 4 — Sub-issues (multi-select)
const SUB_ISSUES = [
  { id: 'parenting_time',   icon: '🏠', label: 'Parenting time / access',        desc: 'How time with children is split' },
  { id: 'decision_making',  icon: '🧠', label: 'Decision-making authority',      desc: 'Who makes major decisions for the children' },
  { id: 'child_support',    icon: '💰', label: 'Child support amount',           desc: 'How much financial support is paid' },
  { id: 'spousal_support',  icon: '💑', label: 'Spousal support',               desc: 'Support between former partners' },
  { id: 'relocation',       icon: '✈️', label: 'Relocation / move',             desc: 'One parent wants to move away with the children' },
  { id: 'violation',        icon: '🚨', label: 'Order violations',              desc: 'The other party is not following the order' },
  { id: 'safety',           icon: '🛡️', label: 'Safety / abuse concerns',      desc: 'Domestic violence or risk to the children' },
  { id: 'communication',   icon: '💬', label: 'Communication with other parent', desc: 'Parental conflict or communication breakdown' },
];

// Step 5 — Where in the process
const PROCESS_STAGES = [
  { id: 'just_starting',   icon: '🔍', label: 'Just starting — researching options',  desc: 'Gathering information before taking any steps' },
  { id: 'preparing',       icon: '📝', label: 'Preparing to file or negotiate',       desc: 'Ready to act but haven\'t filed yet' },
  { id: 'filed',           icon: '📋', label: 'Application already filed',            desc: 'Filed — waiting for next steps or a hearing' },
  { id: 'waiting_hearing', icon: '⏳', label: 'Hearing or conference coming up',      desc: 'A court date or JCC has been scheduled' },
  { id: 'post_order',      icon: '✅', label: 'Order exists — dealing with aftermath', desc: 'Order is in place but issues continue' },
  { id: 'mediation',       icon: '🤝', label: 'In mediation or negotiation',          desc: 'Working with a mediator or negotiating directly' },
  { id: 'urgent',          icon: '🚨', label: 'Urgent / emergency situation',         desc: 'Safety concern or imminent deadline' },
];

// Step 6 — Legal support
const LEGAL_SUPPORT = [
  { id: 'no_lawyer',   icon: '🙋', label: 'No lawyer — self-representing',  desc: 'I\'m going through this on my own' },
  { id: 'consulting',  icon: '💬', label: 'Getting occasional legal advice', desc: 'I consult a lawyer for specific questions' },
  { id: 'represented', icon: '👨‍⚖️', label: 'I have a lawyer',             desc: 'Fully represented by legal counsel' },
  { id: 'mediator',    icon: '🤝', label: 'Working with a mediator',        desc: 'Using a neutral mediator to reach agreement' },
  { id: 'legal_aid',   icon: '📋', label: 'Legal Aid / duty counsel',       desc: 'Using publicly funded legal assistance' },
];

// ─── Action plan generator (much more situational) ───────────────────────────
function generateActionPlan(data) {
  const steps = [];
  const { primaryGoal, existingArrangement, subIssues = [], processStage, legalSupport } = data;

  const add = (title, desc, link, icon) => steps.push({ step: steps.length + 1, title, desc, link, icon });

  // Always: know your rights first
  add('Understand your legal rights', 'Review rights specific to your province and situation.', '/rights', '⚖️');

  // GOAL-SPECIFIC paths
  if (primaryGoal === 'get_custody') {
    if (processStage === 'just_starting' || processStage === 'preparing') {
      add('Read the filing guide', 'Step-by-step process for your province to establish a custody order.', '/filing', '📋');
      add('Download the required forms', 'Get the official court forms — Application, Financial Statement, and more.', '/court-forms', '📄');
      add('Prepare a parenting proposal', 'Draft your proposed parenting plan before you file.', '/cases', '👶');
      add('Gather supporting documents', 'Upload evidence of your parenting role and involvement.', '/cases', '📁');
    } else if (processStage === 'filed' || processStage === 'waiting_hearing') {
      add('Prepare for your hearing', 'Review what to expect in court and how to present your case.', '/judge-insight', '🏛️');
      add('Organize your documents', 'Make sure everything is filed and organized.', '/cases', '📁');
      add('Track your deadlines', 'Missing a filing date can cost you your position.', '/deadlines', '⏰');
    }
  }

  if (primaryGoal === 'get_support') {
    add('Use the child support calculator', 'Estimate what the Federal Guidelines say before you file.', '/calculator', '🧮');
    if (!existingArrangement || existingArrangement === 'nothing' || existingArrangement === 'informal_verbal') {
      add('Read the filing guide', 'Filing for child support follows a specific process in your province.', '/filing', '📋');
      add('Download the financial statement form', 'Required for all support claims.', '/court-forms', '📄');
    } else if (existingArrangement === 'consent_order' || existingArrangement === 'court_order') {
      add('Document the change in circumstances', 'To vary support, you must show income or situation has changed.', '/cases', '📝');
      add('Download variation forms', 'Get the correct forms to change an existing support order.', '/court-forms', '📄');
      add('Read the variation filing guide', 'The process for changing an order differs from filing fresh.', '/filing', '📋');
    }
  }

  if (primaryGoal === 'enforce_order') {
    add('Document every violation', 'Keep a detailed log of every time the order is not followed.', '/incident-log', '📓');
    add('Read enforcement options', 'Courts have several tools to enforce custody and support orders.', '/rights', '⚖️');
    add('Download the enforcement forms', 'File a motion to enforce or vary the existing order.', '/court-forms', '📄');
    add('Track all incidents', 'Use the incident log to build your case chronologically.', '/incident-log', '📋');
  }

  if (primaryGoal === 'change_order') {
    add('Document the change in circumstances', 'Courts need to see what has materially changed since the last order.', '/cases', '📝');
    add('Review variation requirements', 'Understand the legal threshold for changing an existing order.', '/rights', '⚖️');
    add('Download variation forms', 'Get the correct forms for your province.', '/court-forms', '📄');
    add('Read the variation filing guide', 'Step-by-step process for changing an existing order.', '/filing', '📋');
  }

  if (primaryGoal === 'responding') {
    add('File your response immediately', 'You typically have 30 days to respond. Do not miss this deadline.', '/filing', '⚠️');
    add('Download the Answer/Response form', 'Get the correct response form for your province.', '/court-forms', '📄');
    add('Prepare your affidavit', 'Your sworn statement of facts is critical to your response.', '/cases', '📝');
    add('Organize your documents', 'Gather evidence that supports your position.', '/cases', '📁');
  }

  if (primaryGoal === 'divorce') {
    add('Review the filing guide', 'Divorce in Canada follows a specific process — uncontested vs. contested.', '/filing', '📋');
    add('Download divorce forms', 'Get the Divorce Application and supporting forms.', '/court-forms', '📄');
    add('Calculate support amounts', 'Determine child and spousal support under the federal guidelines.', '/calculator', '🧮');
    add('Prepare a parenting plan', 'A parenting plan is required if children are involved.', '/cases', '👶');
  }

  if (primaryGoal === 'cps') {
    add('Know your CPS rights', 'Understand your rights during investigations, hearings, and apprehensions.', '/rights', '🛡️');
    add('Document everything immediately', 'Keep records of every interaction with CPS workers.', '/incident-log', '📓');
    add('Find legal support urgently', 'CPS cases move fast. Find legal aid or duty counsel now.', '/programs', '📞');
    add('Prepare for a protection hearing', 'CPS cases often go to court within days or weeks.', '/judge-insight', '🏛️');
  }

  if (primaryGoal === 'agreement') {
    add('Prepare a parenting proposal', 'Having a written proposal helps focus mediation discussions.', '/cases', '👶');
    add('Find a mediator', 'Family Justice Services in Saskatchewan offers free mediation.', '/programs', '🤝');
    add('Download a consent order template', 'Once you agree, file it as a consent order to make it enforceable.', '/court-forms', '📄');
    add('Use the co-parent messenger', 'Keep all communication documented and professional.', '/coparent', '💬');
  }

  // Sub-issue specific additions
  if (subIssues.includes('safety')) {
    steps.unshift({ step: 1, title: '🚨 Address safety concerns first', desc: 'If there is immediate risk, contact police or apply for an Emergency Protection Order.', link: '/emergency', icon: '🚨' });
    add('Document all safety incidents', 'Detailed records are critical for safety-related applications.', '/incident-log', '📓');
  }
  if (subIssues.includes('relocation')) {
    add('Understand relocation rules', 'Moving with children requires court approval in most cases.', '/rights', '✈️');
  }
  if (subIssues.includes('violation')) {
    add('Start an incident log now', 'Every violation documented is evidence for enforcement.', '/incident-log', '📓');
  }
  if (subIssues.includes('child_support') && primaryGoal !== 'get_support') {
    add('Review child support guidelines', 'Child support is set by federal formula based on income.', '/calculator', '💰');
  }

  // Urgent path override
  if (processStage === 'urgent') {
    steps.unshift({ step: 1, title: '🚨 Emergency resources', desc: 'If you or your children are in immediate danger, access emergency resources now.', link: '/emergency', icon: '🚨' });
  }

  // Legal support specific
  if (legalSupport === 'no_lawyer' || legalSupport === 'legal_aid') {
    add('Find programs and legal aid', 'Discover free and low-cost legal help in your area.', '/programs', '🛡️');
  }

  // Everyone gets community + AI
  add('Ask the AI assistant', 'Get answers to your specific questions 24/7.', '/ai', '🤖');
  add('Join the community', 'Connect with parents who understand what you\'re going through.', '/community', '💬');

  // Renumber
  return steps.map((s, i) => ({ ...s, step: i + 1 }));
}

export default function OnboardingFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    fullName: '', jurisdiction: '',
    primaryGoal: '', existingArrangement: '',
    subIssues: [], processStage: '',
    legalSupport: '', numChildren: '', childrenAges: '', caseName: '',
  });
  const [actionPlan, setActionPlan] = useState(null);

  const TOTAL_STEPS = 8;
  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  const toggleSubIssue = (id) => {
    setData(d => ({
      ...d,
      subIssues: d.subIssues.includes(id)
        ? d.subIssues.filter(x => x !== id)
        : [...d.subIssues, id]
    }));
  };

  const canProceed = () => {
    if (step === 1) return data.fullName.trim() && data.jurisdiction;
    if (step === 2) return data.primaryGoal;
    if (step === 3) return data.existingArrangement;
    if (step === 4) return true; // sub-issues optional
    if (step === 5) return data.processStage;
    if (step === 6) return data.numChildren;
    if (step === 7) return data.legalSupport;
    return true;
  };

  const goToActionPlan = () => {
    const plan = generateActionPlan(data);
    setActionPlan(plan);
    setStep(9);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const plan = actionPlan || generateActionPlan(data);
      await supabase.from('users').update({
        full_name: data.fullName.trim(),
        jurisdiction: data.jurisdiction,
        case_status: data.processStage || 'preparing',
        case_type: data.primaryGoal === 'get_support' ? 'support'
          : data.primaryGoal === 'divorce' ? 'divorce'
          : data.primaryGoal === 'cps' ? 'protection'
          : data.primaryGoal === 'change_order' ? 'variation'
          : 'custody',
        legal_support: data.legalSupport,
        num_children: parseInt(data.numChildren) || null,
        children_ages: data.childrenAges,
        custody_situation: data.existingArrangement,
        onboarding_completed: true,
        action_plan: plan,
        onboarding_data: {
          primary_goal: data.primaryGoal,
          existing_arrangement: data.existingArrangement,
          sub_issues: data.subIssues,
          process_stage: data.processStage,
          completed_at: new Date().toISOString(),
        },
      }).eq('id', user.id);

      const caseName = data.caseName.trim() || 'My Case';
      await supabase.from('cases').insert({
        user_id: user.id, name: caseName,
        jurisdiction_id: data.jurisdiction,
        case_type: data.primaryGoal === 'get_support' ? 'support'
          : data.primaryGoal === 'divorce' ? 'divorce'
          : data.primaryGoal === 'cps' ? 'protection'
          : 'custody',
        status: 'active',
      });

      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      onComplete();
    }
    setSaving(false);
  };

  const Option = ({ selected, onClick, icon, label, desc }) => (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
        selected ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:shadow-sm'
      }`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight">{label}</div>
        {desc && <div className={`text-xs mt-0.5 leading-snug ${selected ? 'text-red-100' : 'text-gray-400'}`}>{desc}</div>}
      </div>
      {selected && <span className="flex-shrink-0 text-white text-sm">✓</span>}
    </button>
  );

  const MultiOption = ({ selected, onClick, icon, label, desc }) => (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
        selected ? 'bg-red-50 text-red-900 border-red-400' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
      }`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight">{label}</div>
        {desc && <div className={`text-xs mt-0.5 ${selected ? 'text-red-600' : 'text-gray-400'}`}>{desc}</div>}
      </div>
      <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${selected ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
        {selected && <span className="text-white text-[10px] font-bold">✓</span>}
      </div>
    </button>
  );

  const NavButtons = ({ backStep, nextAction, nextDisabled, nextLabel }) => (
    <div className="flex gap-3 mt-6">
      {backStep !== undefined && (
        <button onClick={() => setStep(backStep)} className="px-4 py-3 text-gray-500 text-sm hover:text-gray-700">← Back</button>
      )}
      <button onClick={nextAction} disabled={nextDisabled}
        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-40 transition-colors">
        {nextLabel || 'Continue →'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-1.5 bg-gray-200">
        <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {step > 0 && step < 9 && (
        <div className="flex justify-between px-6 pt-3">
          <span className="text-xs text-gray-400">Step {step} of 8</span>
          <button onClick={onComplete} className="text-xs text-gray-400 hover:text-gray-600">Skip for now</button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-4xl">F</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Foresight</h1>
              <p className="text-gray-500 mb-2">Let's understand your situation and build your personal action plan.</p>
              <p className="text-gray-400 text-sm mb-8">Takes about 2 minutes. Your answers personalize everything — guides, forms, and next steps.</p>
              <button onClick={() => setStep(1)} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors shadow-md">
                Let's Get Started →
              </button>
              <p className="text-xs text-gray-400 mt-4">Free to use · Saskatchewan family law</p>
            </div>
          )}

          {/* ── STEP 1: Name & Province ── */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">About You</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">We'll customize everything for your province.</p>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
              <input type="text" value={data.fullName} onChange={e => setData({ ...data, fullName: e.target.value })}
                placeholder="First and last name" autoFocus
                className="w-full mb-5 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Province</label>
              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {PROVINCES.map(j => (
                  <button key={j.id} onClick={() => setData({ ...data, jurisdiction: j.id })}
                    className={`text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      data.jurisdiction === j.id ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                    }`}>
                    🇨🇦 {j.name}
                  </button>
                ))}
              </div>
              <NavButtons backStep={0} nextAction={() => setStep(2)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* ── STEP 2: Primary Goal (replaces "case type") ── */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What Are You Trying to Accomplish?</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Pick the one that best describes your main goal right now.</p>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {PRIMARY_GOALS.map(g => (
                  <Option key={g.id} selected={data.primaryGoal === g.id}
                    onClick={() => setData({ ...data, primaryGoal: g.id })} {...g} />
                ))}
              </div>
              <NavButtons backStep={1} nextAction={() => setStep(3)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* ── STEP 3: What currently exists ── */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What's Currently in Place?</h1>
              <p className="text-gray-500 text-center mb-2 text-sm">
                {data.primaryGoal === 'enforce_order' || data.primaryGoal === 'change_order'
                  ? 'Describe the order or agreement you\'re working with.'
                  : 'Do you have any existing arrangement or order?'}
              </p>
              {data.primaryGoal === 'get_support' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700">
                  💡 You can have a custody arrangement but no child support order — or vice versa. This is about support specifically.
                </div>
              )}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {EXISTING_ARRANGEMENTS.map(a => (
                  <Option key={a.id} selected={data.existingArrangement === a.id}
                    onClick={() => setData({ ...data, existingArrangement: a.id })} {...a} />
                ))}
              </div>
              <NavButtons backStep={2} nextAction={() => setStep(4)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* ── STEP 4: Sub-issues (multi-select, optional) ── */}
          {step === 4 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">What Issues Are Involved?</h1>
              <p className="text-gray-500 text-center mb-2 text-sm">Select all that apply — or skip if unsure.</p>
              <p className="text-xs text-gray-400 text-center mb-5">This helps us add the right steps to your action plan.</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {SUB_ISSUES.map(si => (
                  <MultiOption key={si.id} selected={data.subIssues.includes(si.id)}
                    onClick={() => toggleSubIssue(si.id)} {...si} />
                ))}
              </div>
              <NavButtons backStep={3} nextAction={() => setStep(5)} nextDisabled={false} nextLabel={data.subIssues.length > 0 ? `Continue with ${data.subIssues.length} selected →` : 'Skip →'} />
            </div>
          )}

          {/* ── STEP 5: Where in the process ── */}
          {step === 5 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Where Are You Right Now?</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Pick the stage that best describes your current situation.</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {PROCESS_STAGES.map(ps => (
                  <Option key={ps.id} selected={data.processStage === ps.id}
                    onClick={() => setData({ ...data, processStage: ps.id })} {...ps} />
                ))}
              </div>
              <NavButtons backStep={4} nextAction={() => setStep(6)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* ── STEP 6: Children ── */}
          {step === 6 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">About Your Children</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Used to personalize support calculations and guidance.</p>
              <label className="block text-sm font-semibold text-gray-700 mb-2">How many children are involved?</label>
              <div className="flex gap-2 mb-5">
                {['1', '2', '3', '4', '5+'].map(n => (
                  <button key={n} onClick={() => setData({ ...data, numChildren: n })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                      data.numChildren === n ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                    }`}>{n}</button>
                ))}
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Children's ages (approximate)</label>
              <input type="text" value={data.childrenAges} onChange={e => setData({ ...data, childrenAges: e.target.value })}
                placeholder="e.g., 4 and 7" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <p className="text-xs text-gray-400 mt-2">Private — only used to personalize your experience.</p>
              <NavButtons backStep={5} nextAction={() => setStep(7)} nextDisabled={!canProceed()} />
            </div>
          )}

          {/* ── STEP 7: Legal Support + Case Name ── */}
          {step === 7 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Your Legal Support</h1>
              <p className="text-gray-500 text-center mb-6 text-sm">Do you currently have legal representation?</p>
              <div className="space-y-2 mb-6">
                {LEGAL_SUPPORT.map(ls => (
                  <Option key={ls.id} selected={data.legalSupport === ls.id}
                    onClick={() => setData({ ...data, legalSupport: ls.id })} {...ls} />
                ))}
              </div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Give your case a name (optional)</label>
              <input type="text" value={data.caseName} onChange={e => setData({ ...data, caseName: e.target.value })}
                placeholder="e.g., Parenting of Emma & Jake"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:border-red-400" />
              <NavButtons backStep={6} nextAction={goToActionPlan} nextDisabled={!canProceed()} nextLabel="See My Action Plan →" />
            </div>
          )}

          {/* ── STEP 9 (8): Action Plan ── */}
          {step === 9 && actionPlan && (
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎯</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Custom Action Plan</h1>
                <p className="text-gray-500 text-sm">Based on your situation, here's your recommended path forward.</p>
              </div>

              {/* Summary of answers */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-1.5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Your Situation</div>
                {[
                  { label: 'Goal', value: PRIMARY_GOALS.find(g => g.id === data.primaryGoal)?.label },
                  { label: 'Currently in place', value: EXISTING_ARRANGEMENTS.find(a => a.id === data.existingArrangement)?.label },
                  { label: 'Stage', value: PROCESS_STAGES.find(s => s.id === data.processStage)?.label },
                  data.subIssues.length > 0 && { label: 'Issues', value: data.subIssues.map(id => SUB_ISSUES.find(s => s.id === id)?.label).filter(Boolean).join(', ') },
                ].filter(Boolean).map((item, i) => item && (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-gray-400 w-24 flex-shrink-0">{item.label}</span>
                    <span className="text-gray-700 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6 max-h-[320px] overflow-y-auto pr-1">
                {actionPlan.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{item.step}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
                <p className="text-xs text-green-700">✅ Your case will be created and this plan will be saved to your dashboard.</p>
              </div>

              <button onClick={handleFinish} disabled={saving}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 shadow-md">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up your case...
                  </span>
                ) : 'Go to My Dashboard →'}
              </button>
              <button onClick={() => setStep(7)} className="w-full mt-2 py-2 text-gray-400 text-sm hover:text-gray-600">← Go back and change answers</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

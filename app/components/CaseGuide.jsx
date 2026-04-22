'use client';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const CASE_STAGES = [
  {
    id: 'pre_fdr', title: 'Preparation', subtitle: 'Gather what you need before filing', icon: '📋', color: 'bg-blue-600',
    tasks: [
      { key: 'rights', label: 'Read your provincial rights', detail: 'Go to Know Your Rights, select your province. Read CPS rights, custody rights, child support rights. Write down the legislation name and 3-4 relevant section numbers for court.' },
      { key: 'filing_guide', label: 'Read the filing guide for your province', detail: 'Go to Filing Guide, select your province. Understand the order: FDR, File, Serve, Response, Conference, Hearing.' },
      { key: 'birth_cert', label: "Get your child's birth certificate", detail: "Certified copy from Vital Statistics. Can take 2-4 weeks to order if you don't have one." },
      { key: 'income_docs', label: 'Gather your income documents', detail: 'Last 3 years of T1 tax returns. Last 3 years of Notice of Assessments from CRA. Last 3 months of pay stubs. If self-employed: last 3 years of business financials.' },
      { key: 'existing_orders', label: 'Collect existing orders or agreements', detail: 'Any separation agreement, parenting plan, restraining order, or previous court order. Originals or certified copies.' },
      { key: 'evidence', label: 'Start your evidence folder', detail: 'Screenshot relevant texts and emails NOW. Save photos of your parental involvement. Collect school records, medical records, police reports.' },
      { key: 'binder', label: 'Buy a binder with tab dividers', detail: 'Tabs: Court Orders, Financial, Communication, School, Medical, Evidence, Notes. Chronological order. This goes to every court appearance.' },
    ],
  },
  {
    id: 'fdr', title: 'Family Dispute Resolution', subtitle: 'Required before filing in most provinces', icon: '🤝', color: 'bg-purple-600',
    tasks: [
      { key: 'fdr_check', label: 'Confirm if FDR is mandatory', detail: 'In SK, mandatory unless family violence. Skip it and the judge sends you back — losing months.' },
      { key: 'fdr_find', label: 'Find a mediator', detail: 'Check Programs page. SK: Dispute Resolution Office (306-787-5747), sliding-scale fees.' },
      { key: 'fdr_attend', label: 'Attend FDR session(s)', detail: 'Bring your evidence binder. Be calm and factual. The mediator reports whether you participated in good faith.' },
      { key: 'fdr_cert', label: 'Get Certificate of Compliance', detail: 'If unsuccessful, the professional issues this certificate. File it with the court as proof you attended. Without it, court won\'t proceed.' },
    ],
  },
  {
    id: 'filing', title: 'Filing Your Application', subtitle: 'Officially starting your court case', icon: '📄', color: 'bg-emerald-600',
    tasks: [
      { key: 'forms', label: 'Download required court forms', detail: 'Court Forms page. SK: Petition (Form 15-1), Financial Statement (Form 15-26), Affidavit (Form 15-39). Form numbers vary by province.' },
      { key: 'petition', label: 'Fill out the Petition', detail: 'Starts your case. Be factual, not emotional. State what you want (custody, support) and basic facts. Every word matters.' },
      { key: 'financial', label: 'Complete Financial Statement', detail: 'Attach: Last 3 years T1 returns, last 3 years NOAs, last 3 months pay stubs. List ALL income, expenses, assets, debts. Lying = perjury.' },
      { key: 'affidavit', label: 'Write your Affidavit', detail: 'Sworn facts. Use dates: "On [date], [what happened]." No opinions, no insults. Get it commissioned at courthouse or law office.' },
      { key: 'copies', label: 'Print 3 copies of everything', detail: 'Original for court, copy for other parent, copy for you. Some courthouses require 4 — call ahead.' },
      { key: 'fee', label: 'Prepare filing fee', detail: 'SK: $200 custody, $300 divorce. Debit, cash, or money order. Many courts don\'t take credit cards.' },
      { key: 'file', label: 'File at the Court Registry', detail: 'Courthouse nearest your child\'s residence. Clerk stamps with file number and date. KEEP YOUR STAMPED COPY.' },
    ],
  },
  {
    id: 'service', title: 'Serving the Other Party', subtitle: 'Legally notifying the other parent', icon: '📬', color: 'bg-amber-600',
    tasks: [
      { key: 'server', label: 'Arrange service of documents', detail: 'You may be able to serve the other party yourself in person, deliver to their known address, or in some cases by email if that address is on file with the court. Otherwise, a friend (18+), family member, or process server ($50-150) can serve on your behalf. Documents must be delivered directly to the other parent.' },
      { key: 'serve', label: 'Have documents served', detail: 'Server hands complete copy of filed documents to other parent. Note exact date, time, location.' },
      { key: 'aff_service', label: 'Get Affidavit of Service signed', detail: 'Server fills out Affidavit of Service (SK: Form 12-15). Must be sworn/commissioned. This is your proof.' },
      { key: 'file_service', label: 'File Affidavit of Service with court', detail: 'Without this filed, the judge has no proof the other parent was notified. Case cannot proceed.' },
      { key: 'deadline', label: 'Set response deadline in Calendar', detail: 'Other parent has 20-30 days to respond (varies by province). If no response, you may proceed by default.' },
    ],
  },
  {
    id: 'parenting_course', title: 'Parenting Course', subtitle: 'Mandatory before final order', icon: '👨‍👩‍👧', color: 'bg-indigo-600',
    tasks: [
      { key: 'register', label: 'Register for the course', detail: 'SK: "For the Children\'s Sake" (free). AB: "Parenting After Separation" (free). ON: "Mandatory Information Program."' },
      { key: 'complete', label: 'Complete the course', detail: '2-3 hours, online or in-person. Certificate required before court issues final order.' },
      { key: 'cert', label: 'Get Certificate of Attendance', detail: 'Keep original. Copy for binder. File with court when requesting final order.' },
    ],
  },
  {
    id: 'jcc', title: 'Judicial Case Conference', subtitle: 'First meeting with a judge', icon: '⚖️', color: 'bg-rose-600',
    tasks: [
      { key: 'jcc_req', label: 'Confirm if JCC is required', detail: 'SK: Mandatory in Saskatoon and Regina. Cannot proceed to hearing without it.' },
      { key: 'jcc_forms', label: 'Complete JCC forms', detail: 'SK: Form FAM-PD #7-5 (JCC Memo) from sasklawcourts.ca. Serve on other party at least 3 days before JCC.' },
      { key: 'jcc_financial', label: 'Update your Financial Statement', detail: 'Bring current: Last 3 years T1 returns. Last 3 years NOAs. Last 3 months pay stubs. Updated expenses. Judge may ask about finances.' },
      { key: 'jcc_plan', label: 'Prepare proposed parenting plan', detail: 'Which days, which holidays, exchange times/locations, decision-making. Be specific and reasonable.' },
      { key: 'jcc_serve', label: 'Serve JCC documents', detail: 'JCC Memo + supporting docs served on other party 3+ days before. Keep proof.' },
      { key: 'jcc_attend', label: 'Attend the JCC', detail: 'Dress professionally. Bring binder, financials, parenting plan. Judge discusses compliance, dispute resolution, scheduling. Judge CAN make procedural orders.' },
    ],
  },
  {
    id: 'hearing', title: 'Court Hearing', subtitle: 'Presenting your case', icon: '🏛️', color: 'bg-red-600',
    tasks: [
      { key: 'notice', label: 'File Notice of Application (if needed)', detail: 'For specific motions: SK Form 15-32 + supporting Affidavit.' },
      { key: 'evidence', label: 'Organize all evidence', detail: 'Binder with tabs. Every claim backed by a document. 3 copies of new evidence. Evidence index for the judge.' },
      { key: 'brief', label: 'Prepare argument outline', detail: 'Bullet points, not a script. Key arguments + evidence tab references + legislation sections + order requested. Under 2 pages.' },
      { key: 'dress', label: 'Plan court attire', detail: 'Business casual minimum. No jeans, hoodies, hats. Clean and professional.' },
      { key: 'arrive', label: 'Arrive 30 minutes early', detail: 'Security, find courtroom, check in with clerk, review notes.' },
      { key: 'present', label: 'Present your case', detail: '"Your Honour." Factual, calm, brief. Write notes when other side speaks. Address their points with evidence. Don\'t react emotionally.' },
    ],
  },
  {
    id: 'post_order', title: 'After Court Order', subtitle: 'Following through', icon: '✅', color: 'bg-green-600',
    tasks: [
      { key: 'get_order', label: 'Get certified copy of court order', detail: 'Request from Court Registry. Keep original safe.' },
      { key: 'follow', label: 'Follow the order exactly', detail: 'Even if you disagree. Document every violation by the other parent with dates and evidence.' },
      { key: 'register', label: 'Register support with enforcement', detail: 'SK: MEO. AB: MEP. ON: FRO. Ensures payments are tracked and enforced.' },
      { key: 'track', label: 'Track custody schedule', detail: 'Use Calendar for every exchange. Evidence if you need to go back to court.' },
    ],
  },
];

export default function CaseGuide({ userId, currentStep = 0, dismissed = false, caseStatus }) {
  const [stageIdx, setStageIdx] = useState(() => {
    const m = { 'no_case': 0, 'preparing': 0, 'filed': 3, 'waiting_hearing': 6, 'mediation': 1, 'responding': 3, 'cps': 0, 'modification': 2 };
    return currentStep || m[caseStatus] || 0;
  });
  const [checked, setChecked] = useState({});
  const [isOpen, setIsOpen] = useState(!dismissed);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const stage = CASE_STAGES[stageIdx];
  const done = stage.tasks.filter(t => checked[stage.id + '_' + t.key]).length;

  const toggle = (key) => setChecked(p => ({ ...p, [stage.id + '_' + key]: !p[stage.id + '_' + key] }));
  const advance = async () => { const n = Math.min(stageIdx + 1, CASE_STAGES.length - 1); setStageIdx(n); setShowAllTasks(false); setExpandedTask(null); await supabase.from('users').update({ case_guide_step: n }).eq('id', userId); };
  const back = async () => { const p = Math.max(stageIdx - 1, 0); setStageIdx(p); setShowAllTasks(false); setExpandedTask(null); await supabase.from('users').update({ case_guide_step: p }).eq('id', userId); };
  const dismiss = async () => { setIsOpen(false); await supabase.from('users').update({ guide_dismissed: true }).eq('id', userId); };
  const reopen = async () => { setIsOpen(true); await supabase.from('users').update({ guide_dismissed: false }).eq('id', userId); };

  if (!isOpen) {
    return (
      <button onClick={reopen} className="mb-4 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-red-300 transition-colors">
        <div className="flex items-center gap-2"><span>{stage.icon}</span><span className="text-sm font-medium text-gray-900">{stage.title}</span><span className="text-xs text-gray-400">{done}/{stage.tasks.length}</span></div>
        <span className="text-xs text-red-600 font-medium">Open Guide →</span>
      </button>
    );
  }

  const visibleTasks = showAllTasks ? stage.tasks : stage.tasks.slice(0, 4);

  return (
    <div className="mb-4">
      <div className={stage.color + ' rounded-2xl text-white overflow-hidden'}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg">{stage.icon}</span>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">{stage.title}</h3>
              <p className="text-white/50 text-[10px]">{stage.subtitle} — {done}/{stage.tasks.length} complete</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <select value={stageIdx} onChange={e => { setStageIdx(+e.target.value); setShowAllTasks(false); setExpandedTask(null); }}
              className="bg-white/15 text-white text-[10px] rounded-lg px-1.5 py-1 border border-white/20">
              {CASE_STAGES.map((s, i) => <option key={s.id} value={i} className="text-gray-900">{s.icon} {s.title}</option>)}
            </select>
            <button onClick={() => setIsOpen(false)} className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/20 text-[10px]">✕</button>
          </div>
        </div>
        <div className="px-4 pb-2"><div className="h-1 bg-white/15 rounded-full"><div className="h-full bg-white/80 rounded-full transition-all" style={{ width: stage.tasks.length > 0 ? (done / stage.tasks.length * 100) + '%' : '0%' }} /></div></div>
        <div className="px-3 pb-2 space-y-0.5 max-h-[45vh] overflow-y-auto">
          {visibleTasks.map(task => {
            const isDone = checked[stage.id + '_' + task.key];
            const isExp = expandedTask === task.key;
            return (
              <div key={task.key} className={'rounded-lg ' + (isDone ? 'bg-white/5' : 'bg-white/10')}>
                <div className="flex items-start gap-2 px-3 py-2 cursor-pointer" onClick={() => setExpandedTask(isExp ? null : task.key)}>
                  <button onClick={e => { e.stopPropagation(); toggle(task.key); }}
                    className={'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ' + (isDone ? 'bg-white text-green-600' : 'border-2 border-white/30')}>
                    {isDone && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                  <span className={'flex-1 text-[13px] ' + (isDone ? 'line-through text-white/40' : 'text-white font-medium')}>{task.label}</span>
                  <span className="text-white/25 text-[10px] mt-1">{isExp ? '▲' : '▼'}</span>
                </div>
                {isExp && <p className="px-10 pb-2.5 text-[11px] text-white/65 leading-relaxed">{task.detail}</p>}
              </div>
            );
          })}
          {stage.tasks.length > 4 && !showAllTasks && (
            <button onClick={() => setShowAllTasks(true)} className="w-full text-center text-[10px] text-white/30 hover:text-white/60 py-1">
              Show all {stage.tasks.length} tasks ▼
            </button>
          )}
        </div>
        <div className="px-4 pb-2 flex gap-2">
          {stageIdx > 0 && <button onClick={back} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[11px] font-medium">←</button>}
          {stageIdx < CASE_STAGES.length - 1 && (
            <button onClick={advance} className="flex-1 py-2 bg-white text-gray-900 rounded-xl text-[11px] font-bold text-center">
              Next: {CASE_STAGES[stageIdx + 1]?.title} →
            </button>
          )}
        </div>
        <button onClick={dismiss} className="w-full pb-2 text-center text-[9px] text-white/15 hover:text-white/30">Hide guide</button>
      </div>
    </div>
  );
}

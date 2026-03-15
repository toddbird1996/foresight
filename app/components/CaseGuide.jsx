'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

const GUIDE_STEPS = [
  {
    id: 0, phase: 'Getting Started', title: 'Let\'s Walk Through Your Case Together', icon: '👋', color: 'bg-red-600',
    body: `Right now you might be feeling overwhelmed. That's normal. The family court system is complicated, and most people who go through it for the first time have no idea where to start.\n\nThat's why we built this guide. Think of it as having someone who's been through the process sitting beside you, walking you through each step — explaining not just WHAT to do but WHY it matters and what happens if you skip it.\n\nThe court process is slow, stressful, and rewards preparation. The parent who shows up organized, calm, and informed almost always does better than the parent who shows up emotional and unprepared.\n\nWe'll go through this at your pace. Each step builds on the last. When you finish a step, come back and we'll tell you what to do next.`,
    actionLabel: 'I\'m Ready — Let\'s Start', actionType: 'next',
  },
  {
    id: 1, phase: 'Education', title: 'Understand Your Legal Rights', icon: '⚖️', color: 'bg-blue-600',
    body: `Before you fill out a single form or set foot in a courthouse, you need to understand what the law says about your situation. This is the foundation everything else is built on.\n\nEvery province has its own family law legislation. In Saskatchewan, it's The Children's Law Act. In Alberta, the Family Law Act. In Ontario, the Children's Law Reform Act. The law that applies depends on where your child lives — not where you live.\n\nRead through ALL the sections on the Rights page, but focus on:\n\n**Your CPS Rights** — If child protection is involved, know your rights about apprehension and court hearings.\n**Your Custody Rights** — Both parents start with equal rights. The court decides based on "best interests of the child."\n**Child Support Rights** — Follows the Federal Child Support Guidelines. Based on income, not who "deserves" it.\n**Relocation Rights** — Specific notice requirements if either parent wants to move with the child.\n\n**Why this matters:** When you reference specific legislation in court — "Your Honour, under Section 8 of The Children's Law Act..." — you immediately gain credibility as someone who takes this seriously.`,
    tip: `Write down the name of the law for your province and 3-4 relevant section numbers. Keep these in a notebook you'll bring to court. When someone contradicts the law, you can point to the specific section. That's powerful.`,
    link: '/rights', actionLabel: 'Read My Rights', completeLabel: 'I\'ve Read My Rights',
  },
  {
    id: 2, phase: 'Education', title: 'Learn the Filing Process', icon: '📋', color: 'bg-purple-600',
    body: `Now you need to understand how a custody case actually moves through the court system.\n\n**Phase 1: Family Dispute Resolution**\nMany provinces require you to attempt mediation BEFORE filing. In Saskatchewan, this is mandatory unless there's family violence. Skip it and the judge may send you back — costing months.\n\n**Phase 2: Filing Your Application**\nYou file a Petition with the court. Filing fee is usually $200-$300. You'll also need a Financial Statement and Affidavit.\n\n**Phase 3: Serving the Other Party**\nYou MUST serve the other parent with copies of everything. You cannot serve them yourself — a third party must do it. There are strict rules about how and when.\n\n**Phase 4: Response Period**\nThe other parent has a set number of days to respond. If they don't, you may proceed without them.\n\n**Phase 5: Case Conference**\nA judge holds an early meeting to check status and narrow issues.\n\n**Phase 6: Hearing or Trial**\nIf no agreement, the judge hears evidence and decides.\n\n**Take notes on every deadline.** Missing one can get your application thrown out.`,
    tip: `A contested custody case typically takes 6-18 months. Uncontested: 3-4 months. This is a marathon, not a sprint. Set realistic expectations now so you don't burn out.`,
    link: '/filing', actionLabel: 'Read Filing Guide', completeLabel: 'I Understand the Process',
  },
  {
    id: 3, phase: 'Preparation', title: 'Get Your Court Forms', icon: '📄', color: 'bg-emerald-600',
    body: `You're going to download the actual legal forms that you'll file with the court. Same forms lawyers use.\n\nAt minimum you need:\n\n**1. The Petition / Application** — THE document that starts your case. Every word matters. Be factual, not emotional. Don't exaggerate. The judge forms their first impression from this.\n\n**2. Financial Statement** — Required when child support is involved. Disclose income, expenses, assets, debts. Be honest — if the court finds you hid assets, you lose all credibility.\n\n**3. Affidavit** — Sworn statement of facts. Tell your story calmly: "On March 15, the respondent failed to return the child at the agreed time" is good. "He's always late and doesn't care" is bad.\n\n**4. Affidavit of Service** — After serving the other parent, the person who served them fills this out as proof.\n\n**Print 3 copies of everything.** One for the court, one for the other parent, one for you.`,
    tip: `Read the ENTIRE form before filling anything out. Then use pencil first or save frequently on computer. One mistake can cause rejection — meaning you redo it and refile. That costs time and possibly another filing fee.`,
    link: '/court-forms', actionLabel: 'Download Forms', completeLabel: 'I Have My Forms',
  },
  {
    id: 4, phase: 'Preparation', title: 'Organize Your Case File', icon: '📁', color: 'bg-amber-600',
    body: `A custody case generates a LOT of paperwork. If you don't organize from the start, you'll be scrambling in the courtroom.\n\n**Documents to gather now:**\n• Child's birth certificate\n• Any existing court orders or agreements\n• Other parent's tax return (or income estimate)\n• Relevant text messages and emails (screenshot them — phones break)\n• School report cards, IEPs, attendance records\n• Medical records, vaccinations, prescriptions\n• Police reports or incident reports\n• Photos documenting your parental involvement\n• Records of expenses paid for the child\n\n**Why this matters:** Judges decide based on EVIDENCE. Not feelings, not accusations — evidence. The parent who walks in with an organized binder wins over the parent who says "trust me." Every single time.\n\nCreate your case in Foresight and start uploading everything. Set deadline reminders for when documents are due.`,
    tip: `Buy a physical binder with tab dividers. Label: Court Orders, Financial, Communication, School, Medical, Evidence, Notes. Chronological order in each tab. When the judge asks "Do you have proof?" — flip to the right tab in under 10 seconds. That makes you look credible.`,
    link: '/cases', actionLabel: 'Set Up My Case', completeLabel: 'Case Is Organized',
  },
  {
    id: 5, phase: 'Preparation', title: 'Set Deadlines & Schedule', icon: '📅', color: 'bg-cyan-600',
    body: `The court system runs on deadlines. Missing one can get your application dismissed.\n\n**Set these immediately:**\n• Date you plan to FILE (give yourself a target)\n• Parenting course completion date (most provinces require this)\n• Response deadline after serving (usually 20-30 days)\n• Case conference / JCC date (once scheduled)\n• Hearing / trial date (once scheduled)\n\n**Track your custody schedule:**\n• Days child is with you (green)\n• Days with other parent (blue)\n• Exchange times and locations (purple)\n• School events, medical appointments\n\n**Why this matters:** A calendar showing every exchange, every school event, every doctor's appointment is powerful evidence you're an engaged parent. It also helps if the other parent later claims you "weren't around."`,
    tip: `Set reminders for 1 week, 3 days, and 1 day before every court deadline. One parent missed a response deadline by 2 days — the judge refused to extend it and the other parent's version went unchallenged. Don't let that be you.`,
    link: '/deadlines', actionLabel: 'Set Deadlines', completeLabel: 'Deadlines Are Set',
  },
  {
    id: 6, phase: 'Financial', title: 'Understand Child Support', icon: '🧮', color: 'bg-teal-600',
    body: `Child support in Canada is not optional. It follows the Federal Child Support Guidelines — the amount is based on the paying parent's income and number of children.\n\n**How it works:** Lookup tables. $50,000/year income with one child = ~$472/month. Two children = ~$755/month.\n\n**Shared custody (40%+ each):** Both incomes are considered. The lower amount is subtracted from the higher. 39% vs 40% custody time makes a dramatic difference in the math.\n\n**Special expenses (Section 7):** On top of table amounts, parents share childcare, uninsured medical/dental, extracurriculars, and education costs proportional to income.\n\n**Don't argue emotion in court.** The judge pulls out the Guidelines table, looks at income, applies the formula. Know your numbers before you walk in.`,
    tip: `Get the other parent's income info early. The Financial Statement requires disclosure — lying on it is perjury. If you suspect hidden income, look at their lifestyle: cars, vacations, housing. If it doesn't match declared income, point that out to the judge.`,
    link: '/calculator', actionLabel: 'Calculate Support', completeLabel: 'I Know My Numbers',
  },
  {
    id: 7, phase: 'Court Readiness', title: 'Prepare for Court', icon: '🏛️', color: 'bg-rose-600',
    body: `How you present yourself can make or break your case.\n\n**Dress professionally.** Job interview level. The judge evaluates you as a parent from the moment you walk in.\n\n**Control your emotions.** The other side WILL say things that anger you. They might lie. Do NOT react. Write it down and respond calmly when it's your turn. Eye rolls and sighs are noticed and held against you.\n\n**Never make accusations you can't prove.** If you say "they're neglectful" and can't back it up — no photos, no records, no witnesses — the accusation is dismissed AND the judge questions your credibility on everything else. Every claim needs documentation.\n\n**Speak to the judge.** "Your Honour." Don't talk to the other parent during proceedings. Answer questions directly. Don't ramble. Provide evidence. Stop talking.\n\n**Bring your binder.** Find any document the judge asks about in under 10 seconds.`,
    tip: `Practice at home. Mirror. "Your Honour, I'm asking for [order] because [factual reason]. I have documentation in Tab [X]." Practice staying calm hearing upsetting things. Practice pausing 3 seconds before responding. Those 3 seconds will save you.`,
    link: '/judge-insight', actionLabel: 'Court Prep Tips', completeLabel: 'I\'m Prepared',
  },
  {
    id: 8, phase: 'Support', title: 'Get Help & Support', icon: '🤝', color: 'bg-indigo-600',
    body: `You don't have to do this alone.\n\n**Legal help (even without money):**\n• Legal Aid — free for eligible families\n• Duty Counsel — free lawyers at the courthouse on hearing day\n• FLIC (Saskatchewan) — free forms help and process guidance\n• Pro bono clinics through law schools\n\n**Community:** Join your province's channel. Parents who've been through it share practical knowledge — which clerk is helpful, how long the JCC waitlist is, what to expect.\n\n**Mentors:** Parents who completed their journey and volunteer to guide you. Not lawyers, but they know what they wish they'd known.\n\n**Programs:** 235 free services across Canada — parenting courses, counselling, food banks, housing, Indigenous services, youth programs, addiction recovery. Check your province.`,
    tip: `Saskatchewan: Legal Aid (1-800-667-3764), FLIC (1-888-218-2822), PLEA (plea.org). FLIC can walk you through forms and catch mistakes before you file. Free. Could save you from a rejected application.`,
    link: '/community', actionLabel: 'Join Community', completeLabel: 'I\'m Connected',
  },
  {
    id: 9, phase: 'Action', title: 'File Your Application', icon: '✅', color: 'bg-green-600',
    body: `You've done the work. Time to file.\n\n**Filing day checklist:**\n\n1. **Double-check every form.** Every field filled. Names correct. Signed and dated.\n2. **3 copies of everything.** Some courthouses want 4. Call ahead.\n3. **Filing fee.** SK: $200 custody, $300 divorce. Debit, cash, money order. Many courts don't take credit cards.\n4. **Go to Court Registry.** Hand them originals + copies. They stamp with file number and date. Keep your stamped copy.\n5. **Arrange service.** You CANNOT serve them yourself. Friend, family member, or process server delivers the documents.\n6. **File Affidavit of Service.** Proves the other parent was properly notified.\n\nAfter filing, come back to Foresight. Track your deadlines, prepare for the response period, and keep building your case.\n\nYou're doing this. One step at a time.`,
    tip: `Call the courthouse first. Ask: "Filing hours? Payment methods? Anything special for family law applications?" Clerks can't give legal advice but CAN explain procedures and requirements. Be polite — they deal with self-represented parents daily.`,
    link: '/filing', actionLabel: 'Review Filing Guide', completeLabel: 'I\'ve Filed',
  },
  {
    id: 10, phase: 'Ongoing', title: 'You\'ve Taken the Biggest Step', icon: '🎉', color: 'bg-red-600',
    body: `Filing is the hardest part. Everything after is showing up prepared and following the process.\n\nKeep using Foresight to track deadlines, document exchanges, communicate with your co-parent (timestamped, exportable), ask the AI questions, and lean on your community.\n\nYou've done more preparation than most. Keep going.`,
    actionLabel: 'Close Guide', actionType: 'finish',
  },
];

export default function CaseGuide({ userId, currentStep = 0, dismissed = false }) {
  const [step, setStep] = useState(currentStep);
  const [showTip, setShowTip] = useState(false);
  const [isOpen, setIsOpen] = useState(!dismissed);
  const [expanded, setExpanded] = useState(false);

  const current = GUIDE_STEPS[step] || GUIDE_STEPS[0];
  const progress = Math.round((step / (GUIDE_STEPS.length - 1)) * 100);

  const saveStep = async (s) => { await supabase.from('users').update({ case_guide_step: s }).eq('id', userId); };

  const goNext = () => { const n = Math.min(step + 1, GUIDE_STEPS.length - 1); setStep(n); setShowTip(false); setExpanded(false); saveStep(n); };
  const goBack = () => { const p = Math.max(step - 1, 0); setStep(p); setShowTip(false); setExpanded(false); saveStep(p); };

  const closePopup = () => { setIsOpen(false); };
  const dismissGuide = async () => { setIsOpen(false); await supabase.from('users').update({ guide_dismissed: true }).eq('id', userId); };
  const reopenGuide = async () => { setIsOpen(true); await supabase.from('users').update({ guide_dismissed: false }).eq('id', userId); };

  const renderBody = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-2" />;
      const parts = line.split('**');
      const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : <span key={j}>{part}</span>);
      if (line.trim().startsWith('•')) return <div key={i} className="pl-2 flex gap-2 mt-0.5 text-white/80"><span className="text-white/40">•</span><span className="flex-1">{rendered}</span></div>;
      if (/^\d+\./.test(line.trim())) return <div key={i} className="pl-2 mt-1.5 text-white/80">{rendered}</div>;
      return <p key={i} className="mt-1 text-white/80">{rendered}</p>;
    });
  };

  // Closed state — show small prompt bar on dashboard
  if (!isOpen) {
    return (
      <button onClick={reopenGuide}
        className="mb-4 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-red-300 transition-colors group">
        <div className="flex items-center gap-3">
          <span className="text-lg">{current.icon}</span>
          <div className="text-left">
            <div className="text-xs text-gray-400">Your Case Guide — Step {step}/{GUIDE_STEPS.length - 1}</div>
            <div className="font-medium text-sm text-gray-900 group-hover:text-red-600">{current.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-20 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }} /></div>
          <span className="text-xs text-red-600 font-medium">Open →</span>
        </div>
      </button>
    );
  }

  // Open state — full modal popup
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closePopup}>
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={`${current.color} px-5 pt-5 pb-4 text-white flex-shrink-0`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl">{current.icon}</div>
              <div>
                <div className="text-white/50 text-[10px] font-medium tracking-wider uppercase">{current.phase} — Step {step}/{GUIDE_STEPS.length - 1}</div>
                <h3 className="font-bold text-[17px] leading-tight">{current.title}</h3>
              </div>
            </div>
            <button onClick={closePopup} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/20">✕</button>
          </div>
          {/* Progress */}
          <div className="h-1 bg-white/15 rounded-full">
            <div className="h-full bg-white/80 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={`${current.color} flex-1 overflow-y-auto px-5 pb-3`}>
          <div className={`text-[13px] leading-[1.8] ${!expanded && current.body.length > 500 ? 'max-h-48 overflow-hidden relative' : ''}`}>
            {renderBody(current.body)}
            {!expanded && current.body.length > 500 && <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-current to-transparent" />}
          </div>
          {current.body.length > 500 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-white/40 hover:text-white/70 mt-1">
              {expanded ? '▲ Show less' : '▼ Read full guidance'}
            </button>
          )}

          {/* Tip */}
          {current.tip && (
            <div className="mt-3">
              <button onClick={() => setShowTip(!showTip)} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5">
                💡 {showTip ? 'Hide tip' : 'Practical tip'}
              </button>
              {showTip && (
                <div className="mt-2 bg-white/10 border border-white/15 rounded-xl p-3 text-[13px] text-white/75 leading-[1.7]">
                  {renderBody(current.tip)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`${current.color} px-5 pb-5 pt-3 flex-shrink-0 border-t border-white/10`}>
          <div className="flex flex-wrap gap-2">
            {step > 0 && <button onClick={goBack} className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white font-medium">← Back</button>}

            {current.link ? (
              <>
                <Link href={current.link} onClick={closePopup} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90 min-w-[100px]">
                  {current.actionLabel} →
                </Link>
                <button onClick={goNext} className="px-3 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm text-white font-medium border border-white/20">
                  {current.completeLabel} ✓
                </button>
              </>
            ) : current.actionType === 'next' ? (
              <button onClick={goNext} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">
                {current.actionLabel} →
              </button>
            ) : (
              <button onClick={dismissGuide} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">
                {current.actionLabel}
              </button>
            )}
          </div>
          <button onClick={dismissGuide} className="w-full mt-2 text-center text-[11px] text-white/30 hover:text-white/50">
            Don't show this guide again
          </button>
        </div>
      </div>
    </div>
  );
}

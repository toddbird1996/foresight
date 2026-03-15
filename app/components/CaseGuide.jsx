'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

const GUIDE_STEPS = [
  {
    id: 0, phase: 'Getting Started', title: 'Let\'s Walk Through Your Case Together', icon: '👋', color: 'from-red-500 to-red-700', actionLabel: 'I\'m Ready — Let\'s Start', actionType: 'next',
    body: `Right now you might be feeling overwhelmed. That's normal. The family court system is complicated, and most people who go through it for the first time have no idea where to start.\n\nThat's why we built this guide. Think of it as having someone who's been through the process sitting beside you, walking you through each step, explaining not just WHAT to do but WHY it matters and what happens if you skip it.\n\nHere's what you need to know upfront: the court process is slow, it's stressful, and it rewards preparation. The parent who shows up organized, calm, and informed almost always does better than the parent who shows up emotional and unprepared. That's what we're going to help you become — prepared.\n\nWe'll go through this at your pace. Each step builds on the last. When you finish a step, come back here and tap "I've completed this step" to move on. You can always go back to review something.`,
  },
  {
    id: 1, phase: 'Education', title: 'Understand Your Legal Rights', icon: '⚖️', color: 'from-blue-600 to-blue-800', link: '/rights', actionLabel: 'Read My Rights', completeLabel: 'I\'ve Read Through My Rights',
    body: `Before you fill out a single form or set foot in a courthouse, you need to understand what the law actually says about your situation. This is the foundation everything else is built on.\n\nEvery province in Canada has its own family law legislation. In Saskatchewan, it's The Children's Law Act. In Alberta, it's the Family Law Act. In Ontario, it's the Children's Law Reform Act. The specific law that applies to you depends on where your child lives — not where you live.\n\nGo to the Know Your Rights page and select your province. Read through ALL the sections, but pay special attention to these:\n\n**Your CPS Rights** — If child protection services are involved, you have specific rights about apprehension, return of your child, and court hearings. Know them.\n**Your Custody Rights** — Both parents start with equal rights. The court decides based on "best interests of the child." Understand what that means.\n**Child Support Rights** — Support follows the Federal Child Support Guidelines. It's based on income, not on who "deserves" it.\n**Relocation Rights** — If the other parent wants to move with your child (or if you do), there are specific notice requirements and court procedures.\n\n**Why this matters:** When you're in court, the judge expects you to know the basics. If you reference specific legislation — "Your Honour, under Section 8 of The Children's Law Act..." — you immediately gain credibility as someone who takes this seriously.`,
    tip: `Write down the name of the law that applies to your province. Write down 3-4 section numbers that are directly relevant to your situation. Keep these in a notebook that you'll bring to court. When the judge or the other party's lawyer says something that contradicts the law, you can point to the specific section. That's powerful.`,
  },
  {
    id: 2, phase: 'Education', title: 'Learn the Filing Process Step by Step', icon: '📋', color: 'from-purple-600 to-purple-800', link: '/filing', actionLabel: 'Read the Filing Guide', completeLabel: 'I Understand the Process',
    body: `Now that you understand your rights, you need to understand the PROCESS. How does a custody case actually move through the court system? What happens first? What happens next? How long does it take?\n\nGo to the Filing Guide and select your province. Read through every phase carefully. Most custody cases follow this general flow:\n\n**Phase 1: Family Dispute Resolution (FDR)**\nMany provinces now require you to attempt mediation or another form of dispute resolution BEFORE you can file with the court. In Saskatchewan, this is mandatory unless there's family violence. If you skip this step and the judge finds out, they may send you back to do it — costing you months.\n\n**Phase 2: Filing Your Application**\nThis is where you officially start the court case. You file a Petition (or Application, depending on your province) with the court. There's a filing fee — usually $200-$300. You'll also need a Financial Statement and possibly an Affidavit.\n\n**Phase 3: Serving the Other Party**\nAfter you file, you MUST serve the other parent with copies of everything you filed. You cannot serve them yourself — it has to be done by a third party. This is called "service of process" and there are strict rules about how it's done.\n\n**Phase 4: Response Period**\nThe other parent has a set number of days to file a response. If they don't respond, you may be able to proceed without them. If they do respond, the case becomes contested.\n\n**Phase 5: Case Conference / JCC**\nA judge holds an early meeting to check on the status and try to narrow the issues.\n\n**Phase 6: Hearing or Trial**\nIf you can't reach an agreement, the judge hears evidence from both sides and makes a decision.\n\n**Take notes on every deadline.** Missing a deadline can mean your application gets thrown out and you have to start over.`,
    tip: `The single biggest mistake self-represented parents make is not understanding the timeline. A contested custody case in Canada typically takes 6-18 months. An uncontested one can be done in 3-4 months. Plan accordingly — this is a marathon, not a sprint. Set realistic expectations now so you don't burn out halfway through.`,
  },
  {
    id: 3, phase: 'Preparation', title: 'Get Your Court Forms Ready', icon: '📄', color: 'from-emerald-600 to-emerald-800', link: '/court-forms', actionLabel: 'Download My Forms', completeLabel: 'I Have My Forms',
    body: `This is where it gets real. You're going to download the actual legal forms that you'll file with the court. These are the same forms that lawyers use — and yes, you can fill them out yourself.\n\nGo to the Court Forms page, select your province, and download ALL of the forms listed. At minimum, you'll need:\n\n**1. The Petition / Application**\nThis is THE document that starts your case. It tells the court who you are, who the other parent is, what you're asking for (custody, support, etc.), and the basic facts. Every word in this document matters. Be factual, not emotional. Don't exaggerate. Don't lie. The judge will read this and form their first impression of you.\n\n**2. Financial Statement**\nRequired whenever child support or spousal support is involved. You'll need to disclose your income, expenses, assets, and debts. Be honest. If the court discovers you hid income or assets, you'll lose all credibility.\n\n**3. Affidavit**\nA sworn statement of facts that supports your petition. This is where you tell your story — but in a calm, factual way. "On March 15, 2025, the respondent failed to return the child at the agreed-upon time" is good. "He's always late and doesn't care about our kid" is bad.\n\n**4. Affidavit of Service**\nAfter you serve the other parent, the person who served them fills out this form to prove service was done properly.\n\n**Print 3 copies of everything.** One for the court, one for the other parent, one for you.`,
    tip: `Before you fill out any form, read the ENTIRE form first — front to back. Understand what every section is asking for. Then fill it out in pencil first if you're doing it by hand, or save frequently on a computer. One mistake on a form can cause it to be rejected, which means you have to redo it and refile. That costs time and potentially another filing fee.`,
  },
  {
    id: 4, phase: 'Preparation', title: 'Organize Everything in Your Case File', icon: '📁', color: 'from-amber-600 to-amber-800', link: '/cases', actionLabel: 'Set Up My Case', completeLabel: 'My Case Is Organized',
    body: `A custody case generates a LOT of paperwork. Court orders, financial statements, text message screenshots, school records, medical records, police reports, letters, emails, photos. If you don't organize this from the start, you'll be scrambling to find things when you need them most — in the courtroom.\n\nGo to the My Case page and create your case. Give it a clear name. Then start uploading everything you have:\n\n**Documents to gather now:**\n• Your child's birth certificate\n• Any existing court orders or agreements\n• The other parent's most recent tax return (or your best estimate of their income)\n• Text messages or emails that are relevant to custody (screenshot them — phones break, messages get deleted)\n• School report cards, IEPs, or attendance records\n• Medical records, vaccination records, prescription info\n• Police reports or incident reports (if any)\n• Photos that document your involvement as a parent\n• Records of expenses you've paid for the child\n\n**Why this matters in court:** Judges make decisions based on EVIDENCE. Not feelings, not accusations — evidence. The parent who walks in with an organized binder of documentation wins over the parent who says "trust me." Every single time.`,
    tip: `Buy a physical binder with tab dividers. Label the tabs: Court Orders, Financial, Communication, School, Medical, Evidence, Notes. Put everything in chronological order within each tab. When the judge asks "Do you have proof of that?" you want to flip to the right tab and hand it up in under 10 seconds. That level of organization makes you look credible and prepared.`,
  },
  {
    id: 5, phase: 'Preparation', title: 'Set Your Deadlines and Custody Schedule', icon: '📅', color: 'from-cyan-600 to-cyan-800', link: '/deadlines', actionLabel: 'Set My Deadlines', completeLabel: 'My Deadlines Are Set',
    body: `The court system runs on deadlines. Missing one doesn't just slow you down — it can get your application dismissed entirely. This step is about making sure that never happens.\n\nGo to the Calendar & Deadlines page and add every important date:\n\n**Deadlines to set immediately:**\n• The date you plan to FILE your application (give yourself a realistic target)\n• The date the parenting course must be completed (most provinces require this)\n• Response deadlines after you serve the other parent (usually 20-30 days)\n• Your case conference or JCC date (once scheduled)\n• Your hearing or trial date (once scheduled)\n\n**Custody schedule events:**\nIf you already have a custody arrangement (even informal), track it on the calendar:\n• Days the child is with you (green)\n• Days the child is with the other parent (blue)\n• Exchange times and locations (purple)\n• School events, medical appointments, activities\n\n**Why tracking the schedule matters:** If you're in a custody dispute, the court may ask you to demonstrate your involvement. A calendar that shows you've been tracking every exchange, every school event, every doctor's appointment is powerful evidence that you're an engaged parent.`,
    tip: `Set reminders for 1 week, 3 days, and 1 day before every court deadline. One parent we spoke with missed a response deadline by 2 days because they confused the dates — the judge refused to extend it, and the other parent's version of events went unchallenged. Don't let that be you.`,
  },
  {
    id: 6, phase: 'Financial', title: 'Understand Child Support Numbers', icon: '🧮', color: 'from-teal-600 to-teal-800', link: '/calculator', actionLabel: 'Calculate Support', completeLabel: 'I Know My Numbers',
    body: `Child support in Canada is not optional and it's not negotiable. It follows the Federal Child Support Guidelines, and the amount is determined primarily by the paying parent's income and the number of children.\n\nGo to the Support Calculator and run the numbers for your situation.\n\n**How it's calculated:**\nThe Federal Child Support Guidelines have lookup tables. If the paying parent earns $50,000/year with one child, the table amount is approximately $472/month. Two children, approximately $755/month. These are the starting point.\n\n**Shared custody changes things:**\nIf both parents have the child at least 40% of the time, the calculation changes. Both parents' incomes are considered, and the lower amount is subtracted from the higher. This is why tracking your custody schedule matters — if you have the child 39% of the time vs 40%, the math is dramatically different.\n\n**Special expenses (Section 7):**\nOn top of the table amount, parents share "special expenses" proportional to their incomes. This includes childcare, medical/dental not covered by insurance, extracurricular activities, and educational expenses.\n\n**Don't argue about support in court based on emotion.** The judge will pull out the Guidelines table, look at the income, and apply the formula. Know your numbers before you walk in.`,
    tip: `Get the other parent's income information as early as possible. If they won't disclose voluntarily, the Financial Statement form requires it — and lying on a sworn Financial Statement is perjury. If you suspect they're hiding income, look at their lifestyle: cars, vacations, housing. If the lifestyle doesn't match declared income, point that out to the judge.`,
  },
  {
    id: 7, phase: 'Court Readiness', title: 'Prepare for Your Court Appearance', icon: '🏛️', color: 'from-rose-600 to-rose-800', link: '/judge-insight', actionLabel: 'Read Court Preparation Tips', completeLabel: 'I\'m Prepared for Court',
    body: `This is the step most people underestimate. How you present yourself in the courtroom can be the difference between getting the order you want and losing.\n\nGo to the Judge Insight page and read EVERY tip. Here are the absolute non-negotiables:\n\n**Your appearance matters.** Dress like you're going to a job interview. No jeans, no hoodies, no hats. The judge is evaluating you as a parent from the moment you walk in.\n\n**Control your emotions.** This is the hardest part. The other parent or their lawyer WILL say things that make you angry. They might lie. They might exaggerate. Do NOT react. Write it down and respond calmly when it's your turn. Eye rolls, sighs, and head shakes are noticed by judges — and held against you.\n\n**Never make accusations you can't prove.** This is critical. If you tell the judge "The other parent is neglectful" and they deny it, the judge looks for evidence. If you don't have any — no photos, no records, no witnesses — the accusation gets dismissed on the spot. Worse, the judge may view YOU as the problem for making false accusations. Every claim must be backed by documentation.\n\n**Speak directly to the judge.** Address them as "Your Honour." Don't speak to the other parent during proceedings. Answer questions directly. Don't ramble. Answer the question, provide supporting evidence, and stop talking.\n\n**Bring your binder.** The organized binder from Step 4. When the judge asks about something, find it in under 10 seconds.`,
    tip: `Practice out loud at home. Stand in front of a mirror and say: "Your Honour, I'm asking for [specific order] because [specific factual reason]. I have documentation showing [specific evidence]. It's in Tab [X] of my binder." Practice staying calm when you hear something upsetting. Practice pausing for 3 seconds before responding. Those 3 seconds will save you from saying something you'll regret.`,
  },
  {
    id: 8, phase: 'Support', title: 'Connect With People Who Can Help', icon: '🤝', color: 'from-indigo-600 to-indigo-800', link: '/community', actionLabel: 'Join the Community', completeLabel: 'I\'ve Connected With Support',
    body: `You don't have to do this alone. And you shouldn't. The parents who do best in custody proceedings are the ones who build a support network.\n\n**Legal support:**\nEven if you can't afford a full-time lawyer, many provinces offer:\n• Legal Aid for low-income families (income-tested)\n• Duty Counsel at courthouses (free lawyers on your hearing day)\n• Family Law Information Centres (FLIC in SK) for forms help\n• Pro bono clinics through law schools and bar associations\n\n**Community support:**\nGo to the Community page. Join your province's channel. Other parents are going through the same thing. Some have already been through it. This isn't just emotional support — it's practical. Someone might know which clerk is most helpful at your courthouse, or how long the JCC waitlist is.\n\n**Mentor support:**\nCheck the Mentors tab. These are parents who completed their custody journey and volunteered to help. They're not lawyers, but they can tell you what they wish they'd known.\n\n**Programs directory:**\nCheck Programs for your province. Free services you might not know about — parenting courses, counselling, food banks, housing support, Indigenous family services, youth programs, addiction recovery, and more. Use every resource available.`,
    tip: `If you're in Saskatchewan, these three resources should be your first calls: Legal Aid Saskatchewan (1-800-667-3764), Family Law Information Centre / FLIC (1-888-218-2822), and PLEA Saskatchewan (plea.org). FLIC can walk you through the forms and tell you if you're missing anything before you file. It's free and could save you from a rejected application.`,
  },
  {
    id: 9, phase: 'Action', title: 'File Your Application', icon: '✅', color: 'from-green-600 to-green-800', link: '/filing', actionLabel: 'Review Filing Guide One More Time', completeLabel: 'I\'ve Filed My Application',
    body: `You've done the research. You've read your rights. You've learned the process. You've downloaded and filled out your forms. Your binder is organized. Your deadlines are set. Your support numbers are calculated. You've prepared for court.\n\nIt's time to file.\n\n**Here's what to do on filing day:**\n\n1. **Double-check your forms.** Read every page one more time. Make sure every field is filled in. Names spelled correctly. Signed and dated.\n\n2. **Make 3 copies of everything.** Original + 2 copies. Some courthouses want original + 3. Call ahead.\n\n3. **Bring the filing fee.** Saskatchewan: $200 custody, $300 divorce. Most courthouses accept debit, cash, or money order. Many do NOT accept credit cards. Call ahead.\n\n4. **Go to the Court Registry.** Hand them your original and copies. The clerk stamps them with the court file number and date. Keep your stamped copy.\n\n5. **Arrange service.** You CANNOT serve the other parent yourself. Ask a friend, family member, or process server to hand-deliver the documents. They then fill out the Affidavit of Service.\n\n6. **File the Affidavit of Service.** Proves to the judge the other party was properly notified.\n\nAfter filing, come back here. We'll track your deadlines and guide you through the next phases.\n\nYou're doing this. One step at a time.`,
    tip: `Call the courthouse before you go. Ask: "What are the filing hours? What forms of payment do you accept? Is there anything special I need to know about filing a family law application?" Clerks can't give legal advice, but they CAN tell you about procedures, fees, and requirements. Be polite and they'll point you in the right direction.`,
  },
  {
    id: 10, phase: 'Ongoing', title: 'You\'ve Taken the Biggest Step', icon: '🎉', color: 'from-red-500 to-red-700', actionLabel: 'Back to Dashboard', actionType: 'finish',
    body: `Filing your application is the hardest part. Everything after this is about showing up prepared and following the process.\n\nKeep using Foresight to:\n• Track your deadlines and never miss a date\n• Document custody exchanges on the calendar\n• Communicate with your co-parent through the messenger (timestamped and exportable)\n• Ask the AI assistant questions as they come up\n• Connect with your community and mentor for ongoing support\n\nYou're not alone in this. Thousands of parents have navigated the same system. You've already done more preparation than most. Keep going.`,
  },
];

export default function CaseGuide({ userId, currentStep = 0, dismissed = false }) {
  const [step, setStep] = useState(currentStep);
  const [showTip, setShowTip] = useState(false);
  const [isDismissed, setIsDismissed] = useState(dismissed);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const current = GUIDE_STEPS[step] || GUIDE_STEPS[0];
  const progress = Math.round((step / (GUIDE_STEPS.length - 1)) * 100);

  const saveStep = async (s) => { await supabase.from('users').update({ case_guide_step: s }).eq('id', userId); };
  const goNext = () => { const n = Math.min(step + 1, GUIDE_STEPS.length - 1); setStep(n); setShowTip(false); setExpanded(true); saveStep(n); };
  const goBack = () => { const p = Math.max(step - 1, 0); setStep(p); setShowTip(false); setExpanded(true); saveStep(p); };
  const dismiss = async () => { setIsDismissed(true); await supabase.from('users').update({ guide_dismissed: true }).eq('id', userId); };
  const restore = async () => { setIsDismissed(false); setMinimized(false); await supabase.from('users').update({ guide_dismissed: false }).eq('id', userId); };

  if (isDismissed) {
    return (
      <button onClick={restore} className="mb-4 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-2">
        🧭 Resume Your Case Guide <span className="text-gray-300">•</span> <span className="text-gray-400">Step {step}/{GUIDE_STEPS.length - 1}</span>
      </button>
    );
  }

  if (minimized) {
    return (
      <div className="mb-4 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{current.icon}</span>
          <div>
            <div className="text-[10px] text-gray-400 font-medium uppercase">{current.phase}</div>
            <div className="font-semibold text-sm text-gray-900">{current.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-500 rounded-full" style={{ width: `${progress}%` }} /></div>
            <span className="text-[10px] text-gray-400">{step}/{GUIDE_STEPS.length - 1}</span>
          </div>
          <button onClick={() => setMinimized(false)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium">Open</button>
          <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-xs">✕</button>
        </div>
      </div>
    );
  }

  const renderBody = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      // Bold markers
      const parts = line.split('**');
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : <span key={j}>{part}</span>
      );
      // Bullet points
      if (line.trim().startsWith('•')) return <div key={i} className="pl-3 flex gap-2 mt-1"><span className="text-white/50">•</span><span>{rendered}</span></div>;
      // Numbered items
      if (/^\d+\./.test(line.trim())) return <div key={i} className="pl-3 mt-2">{rendered}</div>;
      return <p key={i} className="mt-1">{rendered}</p>;
    });
  };

  return (
    <div className="mb-6">
      <div className={`bg-gradient-to-br ${current.color} rounded-2xl overflow-hidden text-white`}>
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{current.icon}</div>
            <div className="min-w-0">
              <div className="text-white/50 text-[10px] font-medium tracking-wider uppercase">{current.phase} — Step {step} of {GUIDE_STEPS.length - 1}</div>
              <h3 className="font-bold text-lg leading-tight mt-0.5 truncate">{current.title}</h3>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0 ml-2">
            <button onClick={() => setMinimized(true)} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/20 text-[10px]">━</button>
            <button onClick={dismiss} className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/50 hover:bg-white/20 text-xs">✕</button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 mb-4">
          <div className="h-1 bg-white/15 rounded-full"><div className="h-full bg-white/80 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} /></div>
        </div>

        {/* Body */}
        <div className="px-5 pb-3">
          <div className={`text-white/85 text-[13px] leading-[1.75] ${!expanded && current.body.length > 400 ? 'max-h-36 overflow-hidden relative' : ''}`}>
            {renderBody(current.body)}
            {!expanded && current.body.length > 400 && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900/80 to-transparent" />}
          </div>
          {current.body.length > 400 && (
            <button onClick={() => setExpanded(!expanded)} className="text-xs text-white/40 hover:text-white/70 mt-2 flex items-center gap-1">
              {expanded ? '▲ Show less' : '▼ Read full guidance'}
            </button>
          )}
        </div>

        {/* Tip */}
        {current.tip && (
          <div className="px-5 pb-3">
            <button onClick={() => setShowTip(!showTip)} className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 mb-1">
              💡 {showTip ? 'Hide practical tip' : 'Show practical tip'}
            </button>
            {showTip && (
              <div className="bg-white/10 border border-white/15 rounded-xl p-4 text-[13px] text-white/80 leading-[1.75]">
                {renderBody(current.tip)}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {step > 0 && <button onClick={goBack} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium">← Back</button>}
          {current.link ? (
            <>
              <Link href={current.link} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90 min-w-[120px]">{current.actionLabel} →</Link>
              <button onClick={goNext} className="px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium border border-white/20">{current.completeLabel} ✓</button>
            </>
          ) : current.actionType === 'next' ? (
            <button onClick={goNext} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">{current.actionLabel} →</button>
          ) : (
            <button onClick={dismiss} className="flex-1 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold text-center hover:bg-white/90">{current.actionLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}

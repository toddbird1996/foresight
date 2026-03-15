'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';

const SECTIONS = [
  {
    id: 'emotions',
    title: 'Control Your Emotions',
    icon: '😤',
    color: 'red',
    critical: true,
    tips: [
      {
        title: 'Never show anger, frustration, or hostility in front of the judge',
        detail: 'Even a sigh, eye roll, or shake of the head can be noticed and held against you. Judges are trained observers — they watch your reactions even when you\'re not speaking. Uncontrolled emotions signal instability.',
      },
      {
        title: 'Do not react when the other party lies or exaggerates',
        detail: 'This is one of the hardest things you\'ll face. Your lawyer (or you, if self-represented) will have the chance to respond. Reacting emotionally makes you look impulsive — exactly what the other side wants.',
      },
      {
        title: 'If you feel overwhelmed, ask for a brief recess',
        detail: 'It is completely acceptable to say, "Your Honour, may I have a moment?" Taking a pause shows maturity, not weakness. Judges prefer this over an emotional outburst.',
      },
      {
        title: 'Practice staying calm under pressure before court',
        detail: 'Rehearse your key points out loud. Have a friend play the opposing party and say things that upset you. The more you practice, the less likely you are to be caught off guard.',
      },
      {
        title: 'Crying is human, but sobbing can undermine your credibility',
        detail: 'A judge understands these are emotional situations. A few tears are fine. But extended sobbing can make it difficult for you to communicate your points and may lead a judge to question your emotional stability.',
      },
    ],
  },
  {
    id: 'preparation',
    title: 'Be Prepared & Organized',
    icon: '📋',
    color: 'blue',
    critical: true,
    tips: [
      {
        title: 'Arrive at least 30 minutes early',
        detail: 'Courthouses can be confusing. You may need to go through security, find the right courtroom, and check in with the clerk. Arriving early gives you time to settle your nerves and review your notes.',
      },
      {
        title: 'Bring all documents organized in a binder with tabs',
        detail: 'Have your affidavits, financial statements, court orders, and any exhibits tabbed and in chronological order. When the judge asks about something, you should be able to find it in seconds — not fumble through loose papers.',
      },
      {
        title: 'Have 3 copies of everything — one for you, one for the judge, one for the other party',
        detail: 'Courts expect this. If you hand up a document the judge hasn\'t seen, they\'ll want a copy. Being prepared with copies shows you\'re organized and respectful of the process.',
      },
      {
        title: 'Write a brief outline of what you want to say',
        detail: 'Don\'t read a script — judges dislike that. But have bullet points of your key arguments. When you\'re nervous, it\'s easy to forget important points. A simple outline keeps you on track.',
      },
      {
        title: 'Know the other party\'s likely arguments and have responses ready',
        detail: 'Think about what they\'ll say and prepare calm, factual rebuttals. The best courtroom responses are short, specific, and backed by evidence.',
      },
      {
        title: 'Bring a notepad and pen to take notes during proceedings',
        detail: 'When the other party is speaking, write down things you want to address rather than reacting. This keeps you calm and ensures you don\'t forget important points when it\'s your turn.',
      },
    ],
  },
  {
    id: 'appearance',
    title: 'Dress & Present Yourself Properly',
    icon: '👔',
    color: 'purple',
    critical: true,
    tips: [
      {
        title: 'Dress as if you\'re going to a job interview',
        detail: 'You don\'t need a suit, but you should be clean, pressed, and professional. No ripped jeans, no hats, no graphic t-shirts. Business casual at minimum. You are being judged — literally.',
      },
      {
        title: 'Remove hats and sunglasses before entering the courtroom',
        detail: 'This is a basic sign of respect. Some courthouses will actually ask you to remove them. Do it before anyone has to tell you.',
      },
      {
        title: 'Personal grooming matters more than you think',
        detail: 'Shower, brush your teeth, comb your hair. This isn\'t about vanity — it\'s about showing the judge you take this seriously. A parent who can\'t take care of their own appearance raises questions about their ability to care for children.',
      },
      {
        title: 'Keep body language open and respectful',
        detail: 'Stand when the judge enters and leaves. Don\'t slouch. Don\'t cross your arms. Don\'t lean on the table. Make eye contact when speaking to the judge. These small signals convey confidence and respect.',
      },
      {
        title: 'Turn off your phone completely — not just silent',
        detail: 'A ringing phone in a courtroom is one of the fastest ways to irritate a judge. Vibrations can be heard too. Turn it off completely or leave it in your vehicle.',
      },
    ],
  },
  {
    id: 'conduct',
    title: 'How to Behave in the Courtroom',
    icon: '⚖️',
    color: 'green',
    critical: false,
    tips: [
      {
        title: 'Always address the judge as "Your Honour"',
        detail: 'Not "sir," not "ma\'am," not "judge." It\'s "Your Honour" in Canadian courts. Using the correct form of address shows you understand and respect the court.',
      },
      {
        title: 'Speak to the judge, not to the other party',
        detail: 'Never turn to the other parent and argue directly. Everything goes through the judge. Even if the other party provokes you, address your response to "Your Honour." This shows you respect the process.',
      },
      {
        title: 'Wait your turn — never interrupt anyone',
        detail: 'Don\'t interrupt the judge, the other party, or their lawyer. If they say something incorrect, write it down and address it when it\'s your turn. Interrupting makes you look disrespectful and out of control.',
      },
      {
        title: 'Stand when speaking to the judge unless told otherwise',
        detail: 'In many Canadian courts, you stand when addressing the judge and sit when they\'re speaking or when the other party is presenting. Watch what others do and follow along.',
      },
      {
        title: 'Keep answers short and factual — don\'t ramble',
        detail: 'Judges hear dozens of cases. They appreciate brevity. Answer what was asked, provide the key facts, and stop. Long, winding answers lose the judge\'s attention and can hurt your case.',
      },
      {
        title: 'Say "I don\'t know" if you genuinely don\'t know',
        detail: 'Guessing or making something up under oath is perjury. It\'s far better to say, "I don\'t have that information with me, Your Honour, but I can provide it" than to guess and be proven wrong.',
      },
      {
        title: 'Never badmouth the other parent in front of the judge',
        detail: 'Focus on facts and your child\'s needs. Saying "he\'s a terrible father" means nothing. Saying "he has missed 8 of the last 12 scheduled pickups, as documented in Exhibit C" means everything.',
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Follow Court Orders — Even When They Don\'t',
    icon: '📜',
    color: 'amber',
    critical: true,
    tips: [
      {
        title: 'Follow every court order to the letter, even if the other party doesn\'t',
        detail: 'This is one of the most important things to understand. Judges are watching both of you. If you comply perfectly and the other party doesn\'t, you win credibility. If you both violate orders, you both look bad.',
      },
      {
        title: 'Document every time the other party violates an order',
        detail: 'Keep a log with dates, times, and what happened. Screenshot text messages. Save emails. When you go back to court, a detailed, factual log is far more persuasive than "they never follow the rules."',
      },
      {
        title: 'Never take matters into your own hands',
        detail: 'If the other parent isn\'t following the order, don\'t retaliate by withholding access or support. Go back to court. Self-help remedies almost always backfire — the judge will blame both parties.',
      },
      {
        title: 'If you can\'t comply with an order, go back to court to vary it',
        detail: 'Life changes. If a court order becomes impossible to follow (job loss, relocation), file a variation application. Don\'t just stop complying. A judge will respect you for seeking proper relief.',
      },
      {
        title: 'Being the "reasonable parent" wins cases',
        detail: 'Judges look for the parent who facilitates the relationship with the other parent, follows orders, communicates calmly, and puts the child first. Be that parent — even when it\'s hard.',
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication Before & After Court',
    icon: '💬',
    color: 'teal',
    critical: false,
    tips: [
      {
        title: 'Keep all communication with the other party in writing',
        detail: 'Text, email, or the Foresight Co-Parent Messenger. Written records can be presented as evidence. Phone calls can\'t — unless recorded, which may be illegal in your province without consent.',
      },
      {
        title: 'Write every message as if a judge will read it',
        detail: 'Because they might. Before hitting send, ask yourself: "Would I be comfortable if a judge read this?" If not, rewrite it. Use the Foresight AI tone checker to help.',
      },
      {
        title: 'Never discuss court strategy or legal matters with the other party',
        detail: 'Don\'t tell them what your lawyer said, what you\'re going to argue, or what evidence you have. Keep communication strictly about the children\'s logistics and wellbeing.',
      },
      {
        title: 'Don\'t post about your case on social media',
        detail: 'Anything you post — venting about the other parent, photos of a new lifestyle, complaints about the system — can and will be used against you. Assume the other party is watching everything.',
      },
      {
        title: 'Keep a parenting journal',
        detail: 'Document daily interactions with your children, pickup/dropoff times, any concerns. This creates a contemporaneous record that courts find very credible. It shows you\'re engaged and attentive.',
      },
    ],
  },
  {
    id: 'children',
    title: 'Putting Your Children First',
    icon: '👶',
    color: 'pink',
    critical: false,
    tips: [
      {
        title: 'Never put children in the middle of your dispute',
        detail: 'Don\'t ask them to carry messages, spy on the other parent, or choose sides. Judges look for this behavior specifically and view it as a serious red flag against the parent doing it.',
      },
      {
        title: 'Don\'t speak negatively about the other parent in front of children',
        detail: 'Children love both parents. Hearing one parent badmouth the other causes lasting psychological harm. Courts call this "parental alienation" and it can result in loss of custody.',
      },
      {
        title: 'Focus on what\'s best for your child, not what hurts the other parent',
        detail: 'When making decisions and arguments, always frame them around the child\'s wellbeing. "This schedule gives them stability for school" is stronger than "I should get more time because she doesn\'t deserve it."',
      },
      {
        title: 'Show that you support the child\'s relationship with both parents',
        detail: 'This is called the "friendly parent" principle and many courts consider it. The parent who encourages the child\'s relationship with the other parent often gains more credibility with the judge.',
      },
      {
        title: 'If your child has a therapist or counsellor, follow their recommendations',
        detail: 'Professional recommendations carry weight in court. If a therapist recommends certain arrangements, following those recommendations shows you prioritize your child\'s mental health.',
      },
    ],
  },
  {
    id: 'self-rep',
    title: 'Tips for Self-Represented Parents',
    icon: '🏛️',
    color: 'indigo',
    critical: false,
    tips: [
      {
        title: 'Don\'t apologize for not having a lawyer',
        detail: 'Many people represent themselves. Judges are used to it. You have every right to be there. Walk in with confidence, not apology.',
      },
      {
        title: 'Ask the judge to explain anything you don\'t understand',
        detail: '"Your Honour, I\'m self-represented and I want to make sure I understand. Could you explain what that means?" Judges generally appreciate honesty and will help.',
      },
      {
        title: 'Visit the courthouse before your hearing date',
        detail: 'Find the courtroom, observe other proceedings, learn the flow. Familiarity reduces anxiety. Most courtrooms are open to the public — you can sit in the gallery and watch.',
      },
      {
        title: 'Use the court\'s free resources',
        detail: 'Many courthouses have Family Law Information Centres, duty counsel (free lawyers for the day), and self-help guides. Use them. They exist specifically for people like you.',
      },
      {
        title: 'Don\'t try to be a lawyer — be a good parent',
        detail: 'You don\'t need to know every legal term. Speak plainly. Tell your story factually. Show that you\'re a good, stable, loving parent. That\'s what wins custody cases, not legal theatrics.',
      },
      {
        title: 'If the other party has a lawyer who is aggressive, stay calm',
        detail: 'Their lawyer\'s job is to rattle you. Don\'t take the bait. Pause before answering. Speak slowly. Address the judge, not the lawyer. Your composure is your strongest weapon.',
      },
    ],
  },
];

const COLOR_MAP = {
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-600' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', badge: 'bg-teal-600' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-600' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-600' },
};

export default function JudgeInsightPage() {
  const [expandedSection, setExpandedSection] = useState('emotions');
  const [expandedTip, setExpandedTip] = useState(null);

  const totalTips = SECTIONS.reduce((acc, s) => acc + s.tips.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
        <PageTitle title="Judge Insight" subtitle="How to present yourself in court" icon="🏛️" />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⚖️</span>
            <div>
              <h2 className="text-xl font-bold mb-2">Walking Into Court? Read This First.</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                How you present yourself in court can be as important as the facts of your case. 
                Judges are human — they notice your demeanour, preparation, and composure. 
                These {totalTips} tips come from real courtroom experience and will help you make the best impression when it matters most.
              </p>
              <div className="flex gap-4 mt-4 text-xs text-gray-400">
                <span>📖 {SECTIONS.length} sections</span>
                <span>💡 {totalTips} tips</span>
                <span>⏱️ 10 min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <div className="font-semibold text-red-800 text-sm">The #1 Rule</div>
              <p className="text-sm text-red-700 mt-1">
                You are being judged from the moment you walk into the courthouse — not just when you speak. 
                The judge, court staff, and even the security guard are forming impressions. 
                Be respectful to everyone, at all times.
              </p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SECTIONS.map(s => {
            const colors = COLOR_MAP[s.color];
            return (
              <button key={s.id} onClick={() => { setExpandedSection(s.id); setExpandedTip(null); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  expandedSection === s.id ? `${colors.badge} text-white` : `${colors.bg} ${colors.text} hover:opacity-80`
                }`}>
                {s.icon} {s.title}
                {s.critical && <span className="ml-1">⭐</span>}
              </button>
            );
          })}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTIONS.map(section => {
            const colors = COLOR_MAP[section.color];
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${isExpanded ? `${colors.border} shadow-sm` : 'border-gray-200'}`}>
                <button onClick={() => { setExpandedSection(isExpanded ? null : section.id); setExpandedTip(null); }}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{section.title}</div>
                    <div className="text-xs text-gray-500">{section.tips.length} tips</div>
                  </div>
                  {section.critical && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-medium rounded-full">Critical</span>}
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {section.tips.map((tip, i) => {
                      const tipId = `${section.id}-${i}`;
                      const tipExpanded = expandedTip === tipId;
                      return (
                        <div key={i} className={`rounded-lg border transition-all ${tipExpanded ? `${colors.bg} ${colors.border}` : 'border-gray-100 hover:border-gray-200'}`}>
                          <button onClick={() => setExpandedTip(tipExpanded ? null : tipId)}
                            className="w-full p-3 flex items-start gap-3 text-left">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${colors.badge}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">{tip.title}</div>
                              {tipExpanded && (
                                <p className={`text-sm mt-2 leading-relaxed ${colors.text}`}>{tip.detail}</p>
                              )}
                            </div>
                            <span className="text-gray-400 text-xs flex-shrink-0">{tipExpanded ? '−' : '+'}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 text-center">
          <span className="text-3xl block mb-3">💪</span>
          <h3 className="font-bold text-gray-900 text-lg mb-2">You've Got This</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            Walking into court as a self-represented parent takes real courage. 
            Preparation and composure will set you apart. The fact that you're reading this means you're already ahead.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cases" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Go to My Case</Link>
            <Link href="/filing" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Review Filing Guide</Link>
            <Link href="/coparent" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Co-Parent Messenger</Link>
          </div>
        <Footer />
      </div>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          This is general guidance based on common courtroom practices. It is not legal advice. Court procedures may vary by jurisdiction.
        </p>
      </main>
    </div>
  );
}

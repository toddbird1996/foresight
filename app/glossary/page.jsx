'use client';
import React, { useState } from 'react';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';
import Link from 'next/link';

const TERMS = [
  // A
  { term: 'Affidavit', letter: 'A', plain: 'A written statement of facts that you swear or affirm is true in front of a Commissioner for Oaths. It is your sworn evidence to the court. You must sign it in front of the Commissioner — not before.', example: 'Your affidavit might describe your current living situation, your relationship with your children, and why your proposed parenting plan is in their best interests.', related: ['Commissioner for Oaths', 'Commissioner for Oaths'] },
  { term: 'Affidavit of Service', letter: 'A', plain: 'A sworn statement completed by the person who delivered your court documents to the other party, confirming that service happened, when, where, and how.', example: 'After your friend hands the Notice of Application to the other parent, they fill out and swear this form to prove it was done properly.', related: ['Personal Service'] },
  { term: 'Answer', letter: 'A', plain: 'The court form filed by the respondent (the person who was served) to respond to the applicant\'s claims and make their own requests.', example: 'If the other parent filed a Petition asking for sole parenting time, you would file an Answer disagreeing and asking for shared parenting time instead.' },
  { term: 'Application', letter: 'A', plain: 'A formal request asking the court to make an order about something — parenting, support, property, or other family law matters.', example: 'A Notice of Application is how you start a court case without needing a full divorce.' },

  // B
  { term: 'Best Interests of the Child', letter: 'B', plain: 'The most important factor courts consider when making any decision about children. It includes 16 specific factors in Saskatchewan law, such as the child\'s safety, emotional wellbeing, and relationship with each parent.', example: 'Even if you and the other parent agree on a schedule, the judge will still check that it serves the best interests of the children.' },

  // C
  { term: 'Case Conference', letter: 'C', plain: 'An informal meeting with a judge (or master) to discuss the issues in your case, try to narrow the disputes, and sometimes reach a partial or full agreement without going to trial.', example: 'At a Case Conference, the judge might say, "Based on what I\'m hearing, this arrangement seems reasonable for parenting time." This is not a final order, but it guides the parties.' },
  { term: 'Child Support', letter: 'C', plain: 'Money paid by one parent to the other to help cover the costs of raising a child. The amount is calculated using the Federal Child Support Guidelines based on the paying parent\'s income.', example: 'If you earn $60,000/year and have 2 children in the other parent\'s primary care, the guidelines table says you would pay approximately $872/month.' },
  { term: 'Commissioner for Oaths', letter: 'C', plain: 'A person authorized by law to witness the signing of sworn documents like affidavits. They watch you sign, then stamp and sign the document themselves. Available at law offices, banks, and credit unions.', example: 'Before filing your affidavit, you bring it unsigned to a Commissioner for Oaths at a law office. They confirm your identity, watch you sign, and then stamp it.' },
  { term: 'Consent Order', letter: 'C', plain: 'A court order that both parties have agreed to and signed. A judge then approves it, making it legally binding. Much faster and cheaper than a contested hearing.', example: 'You and the other parent agree on a parenting schedule. You both sign a draft Consent Order and submit it to the court. The judge reviews and signs it without a hearing.' },

  // D
  { term: 'Decision-Making Responsibility', letter: 'D', plain: 'The right and responsibility to make major decisions about a child\'s life — education, healthcare, religion, and extracurricular activities. This replaced the old term "custody" in Saskatchewan law in 2020.', example: 'An order for joint decision-making responsibility means both parents must agree on which school the child attends.' },
  { term: 'Disclosure', letter: 'D', plain: 'The legal obligation to share relevant financial and other information with the other party and the court. Hiding information in family law proceedings is a serious violation.', example: 'Financial disclosure means sharing your tax returns, pay stubs, and bank statements so both parties and the court have accurate information about income and expenses.' },
  { term: 'Divorce Act', letter: 'D', plain: 'Federal legislation that governs divorce in Canada. It only applies to legally married couples. It was significantly updated in 2021 to use the language of "parenting time" and "decision-making responsibility."', example: 'If you were married, your divorce is governed by the Divorce Act. If you were common-law, your parenting matters are governed by Saskatchewan\'s Children\'s Law Act.' },

  // E
  { term: 'Emergency Protection Order (EPO)', letter: 'E', plain: 'An urgent court order that can be granted the same day, without notice to the other party, when there is an immediate risk of harm. It can restrict the other party\'s contact with you or the children.', example: 'If the other parent threatens to take the children out of province tonight, you can apply for an Emergency Protection Order at the Court of King\'s Bench immediately.' },
  { term: 'Ex Parte', letter: 'E', plain: 'A Latin term meaning "without the other party." An ex parte application is heard by a judge without the other side being present — only used in emergencies.', example: 'An ex parte order for emergency custody would be heard with only you present because there is no time to notify the other parent.' },

  // F
  { term: 'Family Dispute Resolution (FDR)', letter: 'F', plain: 'Any process that helps families resolve disputes without going to court — including mediation, negotiation, and collaborative law. Often required before filing a court application in Saskatchewan.', example: 'Family Justice Services in Saskatchewan offers free FDR. You call them first, and if you cannot agree, they confirm participation for your court file.' },
  { term: 'Family Law Act', letter: 'F', plain: 'Saskatchewan provincial legislation that governs support obligations for non-married couples and partners. Works alongside the Divorce Act for married couples in some situations.', example: 'If you were common-law and are separating, the Family Maintenance Act (Saskatchewan) governs child support and spousal support — not the Divorce Act.' },
  { term: 'Filing', letter: 'F', plain: 'The act of submitting your completed court documents to the court registry. The clerk stamps your documents, assigns a court file number, and keeps the originals.', example: 'Filing your Notice of Application at the Court of King\'s Bench in Regina costs approximately $200. You bring 3 copies and leave one with the court.' },
  { term: 'Financial Statement', letter: 'F', plain: 'A court form where you disclose all income, expenses, assets, and debts under oath. Required whenever support or property division is part of the case. Every number must be accurate.', example: 'Form 70D (Manitoba) or Form 15-26 (Saskatchewan) is the financial statement. You attach your tax returns, pay stubs, and bank statements to it.' },
  { term: 'For Kids\' Sake', letter: 'F', plain: 'A mandatory parenting course in Saskatchewan for separating parents with children. It must be completed before filing. Costs approximately $25 and takes a few hours online.', example: 'You register at saskatchewanforkidssake.ca, complete the online course, and receive a certificate. You must attach this certificate to your court application.' },

  // G
  { term: 'Guardian', letter: 'G', plain: 'A person who has the legal right and responsibility to care for a child and make decisions about the child\'s life. In Saskatchewan, both parents are generally guardians unless a court orders otherwise.', example: 'As a guardian, you have the right to be informed about your child\'s education, health, and welfare, regardless of the parenting time schedule.' },

  // I
  { term: 'Interim Order', letter: 'I', plain: 'A temporary court order made while the case is ongoing. It sets the rules until a final order is made — important because cases can take months or years to resolve.', example: 'An interim order might say the children live primarily with one parent during the week while the case proceeds, without that being the final decision.' },

  // J
  { term: 'Judicial Case Conference (JCC)', letter: 'J', plain: 'A meeting with a judge in Saskatchewan to discuss the issues in your case, explore settlement, and identify what still needs to be decided. Usually scheduled 4-8 weeks after filing.', example: 'At your JCC, the judge might say, "I\'d encourage the parties to consider a 7/7 schedule given the children\'s ages." This gives you a sense of how the judge views the case.' },
  { term: 'Jurisdiction', letter: 'J', plain: 'The legal authority of a court to hear a case, and the province or territory whose laws apply to your case. Generally the province where the children live.', example: 'If your children live in Saskatchewan, Saskatchewan courts have jurisdiction over parenting matters, even if the other parent lives in Alberta.' },

  // L
  { term: 'Legal Aid', letter: 'L', plain: 'Government-funded legal assistance for people who cannot afford a lawyer. In Saskatchewan, Legal Aid Saskatchewan provides services to qualifying individuals.', example: 'Legal Aid Saskatchewan can be reached at 1-800-667-3764. Eligibility is based on income. They may be able to help with your custody application.' },

  // M
  { term: 'Maintenance Enforcement Office (MEO)', letter: 'M', plain: 'A government agency in Saskatchewan that enforces child and spousal support orders. Once a support order is in place, the MEO collects payments from the paying parent and sends them to the receiving parent.', example: 'If child support payments stop, you contact the MEO at 1-888-218-2898 and they take enforcement action — including garnishing wages or suspending a driver\'s licence.' },
  { term: 'Mediation', letter: 'M', plain: 'A voluntary, confidential process where a neutral third party (mediator) helps both parents reach an agreement. Faster and cheaper than court. Free services are available through Family Justice Services in Saskatchewan.', example: 'You and the other parent meet with a family mediator three times over two weeks and reach an agreement on a parenting schedule. This agreement can then be filed as a consent order.' },

  // O
  { term: 'Order', letter: 'O', plain: 'A legally binding decision made by a judge. Once an order is signed, both parties must comply. Violating a court order can result in serious legal consequences.', example: 'If a court order says the children are to be picked up at 6pm on Fridays and the other parent consistently ignores it, you can bring the matter back to court.' },

  // P
  { term: 'Parenting Plan', letter: 'P', plain: 'A detailed written agreement between parents about how they will share time with and responsibilities for their children. Can be informal or incorporated into a court order.', example: 'A parenting plan might specify: who the children are with each day of the week, how holidays are divided, how communication between parents happens, and how major decisions are made.' },
  { term: 'Parenting Time', letter: 'P', plain: 'The time a child spends with each parent. Replaced the old term "access" in Saskatchewan and federal law in 2020-2021. Parenting time does not automatically determine who makes decisions.', example: 'An order might give one parent 60% parenting time and the other 40%, with joint decision-making responsibility for major decisions.' },
  { term: 'Personal Service', letter: 'P', plain: 'The method of delivering court documents directly to the other person by hand. You cannot serve your own documents — someone else 18+ must do it. Required for starting new court proceedings.', example: 'Your adult friend hands the Notice of Application directly to the other parent at their front door. This is personal service.' },
  { term: 'Petition', letter: 'P', plain: 'The main court form used to start a divorce or other family law proceeding in Saskatchewan (Form 15-1 or Form 70A in Manitoba). It sets out what orders you are asking the court to make.', example: 'Your Petition tells the court: who you are, who the other party is, what happened, what you are asking for, and why.' },

  // R
  { term: 'Relocation', letter: 'R', plain: 'Moving to a new location that would significantly affect the other parent\'s relationship with the children. Saskatchewan law requires advance notice and may require court approval.', example: 'If you want to move from Saskatoon to Vancouver with your children, you must give the other parent written notice and they have the right to object. A judge may need to decide.' },
  { term: 'Respondent', letter: 'R', plain: 'The person who did not initiate the court case — the one who was served with documents and must respond. The other person is the Applicant or Petitioner.', example: 'If the other parent filed the Petition, you are the Respondent. You have 30 days to file your Answer.' },

  // S
  { term: 'Section 7 Expenses', letter: 'S', plain: 'Special or extraordinary expenses for children that are shared by both parents in proportion to their income. Includes childcare, medical/dental costs not covered by insurance, educational expenses, and extracurricular activities.', example: 'Your child\'s braces cost $4,000. If your income is $60,000 and the other parent\'s is $40,000, you pay 60% ($2,400) and they pay 40% ($1,600) of the cost.' },
  { term: 'Service', letter: 'S', plain: 'The legal process of officially delivering court documents to the other party. Different methods are allowed in different situations. Personal service (in-hand delivery) is required to start a new case.', example: 'After you file your Petition, you must serve the other parent. A process server can be hired to do this for approximately $100-200.' },
  { term: 'Shared Parenting', letter: 'S', plain: 'An arrangement where the children spend at least 40% of their time with each parent. This can affect the child support calculation — both parents\' incomes are considered.', example: 'A 50/50 arrangement where children alternate weeks between homes is shared parenting. The parent with the higher income typically pays the difference between the two table amounts.' },
  { term: 'Spousal Support', letter: 'S', plain: 'Financial support paid from one spouse to the other after separation. The amount and duration depend on factors like income difference, length of relationship, and roles during the marriage.', example: 'If one spouse stayed home with children for 10 years while the other built a career, spousal support might be ordered to help the stay-at-home parent re-establish financially.' },

  // T
  { term: 'Trial', letter: 'T', plain: 'A formal court proceeding where both parties present evidence and witnesses, and a judge makes a final decision. Trials are rare in family law — most cases settle beforehand.', example: 'If the JCC and all other attempts at settlement fail, a trial date is set. You present your evidence, the other party presents theirs, and the judge decides.' },

  // V
  { term: 'Variation', letter: 'V', plain: 'The process of changing an existing court order. Requires showing a significant change in circumstances since the original order was made.', example: 'Your income dropped by 40% after losing your job. This is a significant change in circumstances that justifies applying to vary (reduce) your child support payments.' },

  // W
  { term: 'Without Notice Application', letter: 'W', plain: 'An urgent application heard by a judge without the other party being present or notified. Only granted in genuine emergencies where delay would cause serious harm.', example: 'If you have evidence the other parent plans to take the children out of Canada tonight, you can file a without notice application asking the court to prevent it immediately.' },
];

const LETTERS = [...new Set(TERMS.map(t => t.letter))].sort();

export default function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);

  const filtered = TERMS.filter(t => {
    const matchesSearch = !search || t.term.toLowerCase().includes(search.toLowerCase()) || t.plain.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = !activeLetter || t.letter === activeLetter;
    return matchesSearch && matchesLetter;
  });

  const grouped = {};
  filtered.forEach(t => {
    if (!grouped[t.letter]) grouped[t.letter] = [];
    grouped[t.letter].push(t);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Legal Glossary" subtitle="Plain language definitions for family law terms" icon="📖" />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
            placeholder="Search a term or keyword..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
          )}
        </div>

        {/* Alphabet nav */}
        {!search && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveLetter(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${!activeLetter ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
            >
              All
            </button>
            {LETTERS.map(l => (
              <button
                key={l}
                onClick={() => setActiveLetter(activeLetter === l ? null : l)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${activeLetter === l ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}
              >
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800">
            <strong>Educational only.</strong> These definitions are plain-language explanations to help you understand legal terms. They are not legal advice. Laws vary by province and may change. Consult a lawyer for advice specific to your situation.
          </p>
        </div>

        {/* Terms */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No terms found for "{search}"</p>
            <button onClick={() => setSearch('')} className="text-red-600 text-sm mt-2 hover:underline">Clear search</button>
          </div>
        ) : (
          Object.entries(grouped).map(([letter, terms]) => (
            <div key={letter}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{letter}</div>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <div className="space-y-2">
                {terms.map(term => {
                  const isOpen = expandedTerm === term.term;
                  return (
                    <div key={term.term} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedTerm(isOpen ? null : term.term)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{term.term}</span>
                        </div>
                        <span className="text-gray-400 text-sm ml-3 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-3">
                          {/* Plain definition */}
                          <p className="text-sm text-gray-700 leading-relaxed">{term.plain}</p>

                          {/* Example */}
                          {term.example && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-800 mb-1">📌 Example</p>
                              <p className="text-xs text-blue-800 leading-relaxed">{term.example}</p>
                            </div>
                          )}

                          {/* Ask AI button */}
                          <Link
                            href={`/ai?q=${encodeURIComponent(`Explain "${term.term}" in the context of my Saskatchewan custody case`)}`}
                            className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium hover:underline"
                          >
                            💬 Ask AI about this →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <Footer />
      </main>
    </div>
  );
}

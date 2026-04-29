'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

const sections = [
  {
    id: 'before',
    icon: '📋',
    title: 'Before You Go to Court',
    color: 'bg-blue-600',
    steps: [
      {
        title: 'Know your case type',
        detail: 'Understand what type of hearing you are attending — initial application, variation, JCC, or trial. Each has different rules and expectations. Ask the court registry if you are unsure.'
      },
      {
        title: 'Organize your evidence',
        detail: 'Gather all supporting documents — school records, medical records, communication logs, financial records, photos, and witness affidavits. Organize them chronologically and label each one clearly. Make three copies: one for the judge, one for the other party, one for yourself.'
      },
      {
        title: 'Know your forms',
        detail: 'Make sure all your filed documents are complete and correct. Bring copies of everything you have filed. Check the court registry website for your province to confirm which forms apply to your situation.'
      },
      {
        title: 'Prepare your opening statement',
        detail: 'Write a brief, clear statement of what you are asking for and why. Keep it factual. Focus on the best interests of the child — that is the standard every judge uses. Practice it out loud until it feels natural.'
      },
      {
        title: 'Know what the other side will argue',
        detail: 'Think about what the other parent is likely to say. Prepare your response to their strongest points. This is your shield — anticipate the arguments and have your answers ready.'
      },
      {
        title: 'Arrive early',
        detail: 'Arrive at least 30 minutes early. Find the courtroom, introduce yourself to the clerk, and let them know you are self-represented. Court staff cannot give legal advice but can answer procedural questions.'
      },
    ]
  },
  {
    id: 'courtroom',
    icon: '⚖️',
    title: 'In the Courtroom',
    color: 'bg-red-600',
    steps: [
      {
        title: 'How to address the judge',
        detail: 'Always say "Your Honour" when speaking to the judge. Never interrupt the judge. Stand when the judge enters or leaves the room. Speak clearly and directly to the judge — not to the other party.'
      },
      {
        title: 'How to present your case',
        detail: 'Start with your opening statement — what you are asking for and why. Then present your evidence in order. Refer to each document clearly: "Your Honour, I am marking this as Exhibit A — this is a school attendance record showing..." Hand copies to the clerk first.'
      },
      {
        title: 'How to introduce evidence',
        detail: 'Ask the clerk how evidence should be submitted before your hearing. Generally: hand three copies to the clerk, identify the document clearly for the record, and explain why it is relevant. Do not just hand documents to the judge without explanation.'
      },
      {
        title: 'How to question a witness',
        detail: 'If you have witnesses, ask them clear, open-ended questions. "Can you describe what you observed on that date?" Do not lead your own witness. When cross-examining the other side\'s witnesses, ask short, pointed questions and stop when you have what you need.'
      },
      {
        title: 'How to object',
        detail: 'You can object if the other party introduces irrelevant evidence or makes statements that are not based on firsthand knowledge. Stand and say "Objection, Your Honour — that is not relevant to the issue before the court." Keep objections simple and rare. The judge may overrule you and that is okay.'
      },
      {
        title: 'Stay calm and factual',
        detail: 'Never show anger or frustration — even if the other side says something untrue. Judges notice composure. Write down anything you disagree with and address it when it is your turn. Emotional outbursts hurt your case.'
      },
      {
        title: 'Your closing statement',
        detail: 'Summarize what you proved, why the judge should rule in your favour, and always bring it back to the best interests of the child. Keep it brief and factual. Thank the court.'
      },
    ]
  },
  {
    id: 'evidence',
    icon: '🗂️',
    title: 'Building Your Evidence Package',
    color: 'bg-green-600',
    steps: [
      {
        title: 'School records',
        detail: 'Request report cards, attendance records, teacher notes, and school correspondence. These show your involvement in your child\'s education and can demonstrate patterns of absence, missed appointments, or academic impact from the other parent\'s actions.'
      },
      {
        title: 'Medical records',
        detail: 'Request vaccination records, doctor visit summaries, and any specialist referrals. These show your role in health decisions and can document injuries, illnesses, or neglect if relevant.'
      },
      {
        title: 'Communication logs',
        detail: 'Print or screenshot all text messages, emails, and app messages with the other parent. Include the full thread — not just the parts that help you. Judges can tell when messages are selectively presented. Time-stamp everything.'
      },
      {
        title: 'Incident log',
        detail: 'Keep a dated written record of every significant event — missed pickups, violations of the order, concerning statements made in front of the child, anything relevant. Write it down the same day it happens with the date, time, location, and what was said or done. Use the Foresight incident log for this.'
      },
      {
        title: 'Financial records',
        detail: 'Bank statements, receipts, and expense records showing what you spend on the child. If there are support issues, these are critical.'
      },
      {
        title: 'Witness affidavits',
        detail: 'Identify people who have observed your parenting or relevant events — teachers, doctors, coaches, family friends. They must have firsthand knowledge. Help them write a clear, specific affidavit about what they personally witnessed. It must be sworn before a Commissioner of Oaths.'
      },
      {
        title: 'Photos and videos',
        detail: 'Visual evidence of living conditions, injuries, your involvement in the child\'s life, or violations. Make sure metadata shows the correct date and time. Do not stage photos.'
      },
    ]
  },
  {
    id: 'forms',
    icon: '📝',
    title: 'Finding the Right Forms',
    color: 'bg-purple-600',
    steps: [
      {
        title: 'Saskatchewan',
        detail: 'All family law forms are available at Saskatchewan Courts: https://www.sasklawcourts.ca. Key forms include: Form F — Application (General), Form FI — Financial Statement, Form FS — Statement of Income. Filing fees vary — ask the registry. Forms must be filed at the Court of King\'s Bench Family Law Division.'
      },
      {
        title: 'Alberta',
        detail: 'Forms available at Alberta Courts: https://www.albertacourts.ca. Key forms: Application (General) FL-10, Response to Application FL-12, Financial Statement FL-16. File at the Court of King\'s Bench. Some forms require a Commissioner of Oaths.'
      },
      {
        title: 'BC',
        detail: 'Forms available at BC Courts: https://www.bccourtforms.bc.ca. Key forms: Form F3 — Application About a Family Law Matter, Form F5 — Reply. File at the BC Supreme Court or Provincial Court depending on your matter.'
      },
      {
        title: 'Ontario',
        detail: 'Forms available at Ontario Courts: https://ontariocourtforms.on.ca. Key forms: Form 8 — Application (General), Form 13 — Financial Statement. File at the Ontario Superior Court of Justice — Family Branch.'
      },
      {
        title: 'All other provinces',
        detail: 'Search "[Your Province] family court forms" on your provincial government website. Look for the Ministry of Justice or Attorney General section. If you cannot find what you need, call the court registry directly — they can tell you exactly which forms apply to your situation. You can also use the Foresight Court Forms section for direct links.'
      },
      {
        title: 'Do you need a Commissioner of Oaths?',
        detail: 'Affidavits and sworn financial statements must be signed before a Commissioner of Oaths. You can find one at: the court registry (often free), most law offices (small fee), some banks and credit unions, some Service Canada or government offices. Bring valid photo ID.'
      },
    ]
  },
  {
    id: 'tips',
    icon: '💡',
    title: 'Self-Rep Tips That Matter',
    color: 'bg-amber-600',
    steps: [
      {
        title: 'Always focus on the best interests of the child',
        detail: 'Every judge in Canada applies the same standard — what is in the best interests of the child. Every argument you make should come back to this. Not what is fair to you. Not what the other parent did wrong. What is best for your child.'
      },
      {
        title: 'Do not badmouth the other parent',
        detail: 'Judges see it immediately and it almost always backfires. Courts want parents who can co-parent. If the other parent has done something serious, present the evidence and let the judge draw the conclusion.'
      },
      {
        title: 'Dress professionally',
        detail: 'You do not need a suit but dress as if you are going to a job interview. First impressions matter. It shows the court you take the proceedings seriously.'
      },
      {
        title: 'Bring everything in order',
        detail: 'Have your documents tabbed, labelled, and in order. Fumbling through papers wastes court time and makes you look unprepared. Three copies of everything.'
      },
      {
        title: 'Ask for clarification if you do not understand',
        detail: 'If the judge says something procedural you do not understand, it is okay to say: "I apologize Your Honour, I am self-represented and I want to make sure I understand — could you clarify?" Courts are generally patient with self-represented litigants.'
      },
      {
        title: 'Use Legal Aid or duty counsel if available',
        detail: 'Many courthouses have duty counsel — a lawyer available on the day of court to give brief advice to self-represented parties. Ask the registry if duty counsel is available for your hearing date. Use them. It is free and it could make a difference.'
      },
      {
        title: 'Keep records of everything',
        detail: 'Every filing, every response, every communication with the court or the other party. Date everything. Build a filing system. You will refer to these documents repeatedly throughout your case.'
      },
    ]
  },
];

export default function SelfRepPage() {
  const [openSection, setOpenSection] = useState('before');
  const [openStep, setOpenStep] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <PageTitle
          title="Represent Yourself"
          subtitle="A coach in your corner — every step of the way"
          icon="⚖️"
        />

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Legal information, not legal advice.</strong> This guide provides general information about self-representation in Canadian family court. Every case is different. Verify the specific rules for your province and consult a lawyer or Legal Aid when possible.
          </p>
        </div>

        {/* Saskatchewan.ca link — directly relevant to FLIC */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Saskatchewan Government Resource</p>
            <p className="text-xs text-gray-500">Official self-representation guide from Saskatchewan Courts</p>
          </div>
          <a
            href="https://www.saskatchewan.ca/residents/births-deaths-marriages-and-divorces/separation-or-divorce/represent-yourself-in-family-court"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-red-600 hover:underline whitespace-nowrap"
          >
            Visit →
          </a>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map(section => (
            <div key={section.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {/* Section header */}
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full flex items-center gap-3 px-4 py-4"
              >
                <div className={`${section.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{section.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900 text-sm">{section.title}</p>
                  <p className="text-xs text-gray-500">{section.steps.length} topics</p>
                </div>
                <span className="text-gray-400 text-sm">{openSection === section.id ? '▲' : '▼'}</span>
              </button>

              {/* Steps */}
              {openSection === section.id && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {section.steps.map((step, idx) => (
                    <div key={idx}>
                      <button
                        onClick={() => setOpenStep(openStep === `${section.id}-${idx}` ? null : `${section.id}-${idx}`)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-600">{idx + 1}</span>
                        </div>
                        <p className="flex-1 text-sm font-medium text-gray-800">{step.title}</p>
                        <span className="text-gray-400 text-xs">{openStep === `${section.id}-${idx}` ? '▲' : '▼'}</span>
                      </button>
                      {openStep === `${section.id}-${idx}` && (
                        <div className="px-4 pb-4 pt-1 bg-gray-50">
                          <p className="text-sm text-gray-600 leading-relaxed">{step.detail}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI CTA */}
        <div className="mt-6 bg-red-600 rounded-2xl p-5 text-center">
          <p className="text-white font-bold text-base mb-1">Have a specific question?</p>
          <p className="text-red-100 text-sm mb-4">Ask the Foresight AI — available 24/7, specific to your province</p>
          <Link
            href="/ai"
            className="inline-block bg-white text-red-600 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            Ask the AI →
          </Link>
        </div>

      </div>
    </div>
  );
}

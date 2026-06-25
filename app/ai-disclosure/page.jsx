'use client';

import { useState } from 'react';
import Link from 'next/link';

const SECTIONS = [
  {
    icon: '⚖️',
    title: 'FORESIGHT is legal information, not legal advice',
    content: `The AI in FORESIGHT provides educational guidance and legal information based on Saskatchewan family law. It does not provide legal advice. There is an important difference:

Legal information explains how the law works, what forms to use, and what processes look like. Legal advice applies the law to your specific situation and tells you what you should do. Only a licensed lawyer can give you legal advice.

FORESIGHT helps you understand and navigate the process. For decisions with serious consequences, consult a lawyer.`
  },
  {
    icon: '🏛️',
    title: 'Some courts require you to disclose AI use',
    content: `Canadian courts are increasingly requiring litigants to declare when AI has been used in preparing documents. While Saskatchewan's Court of King's Bench does not yet have a mandatory AI disclosure rule, this is changing rapidly.

As a best practice — and to protect yourself — if you use FORESIGHT's AI to help prepare any document you will file with the court, include a brief disclosure statement such as:

"I used an AI-assisted legal information tool (FORESIGHT) to help me understand the process and organize this document. I have reviewed all content for accuracy."

This is transparent, responsible, and protects you from potential cost awards.`
  },
  {
    icon: '🚨',
    title: 'AI can make mistakes — always verify',
    content: `AI tools, including FORESIGHT, can occasionally produce inaccurate information. The most serious risk is hallucinated case law — where an AI references a court case that does not exist or misquotes one that does.

Canadian courts have penalized self-represented litigants for submitting AI-generated materials containing fake case citations. In Quebec, one litigant was fined $5,000. In Alberta, a woman received cost orders after submitting three non-existent authorities.

Rules to protect yourself:
• Never cite a case in court documents unless you have verified it exists on CanLII (canlii.org)
• Never include a statute or rule number without checking the official source
• Always read what the AI gives you — do not copy and paste without understanding it
• When in doubt, call Legal Aid Saskatchewan or book a flat-rate consultation`
  },
  {
    icon: '✅',
    title: 'What FORESIGHT AI is good for',
    content: `FORESIGHT's AI is designed to help you understand — not to write your court documents for you. Use it to:

• Understand what a form is asking for
• Learn what a legal term means
• Find out what step comes next in your process
• Understand your rights and general obligations
• Prepare questions to ask a lawyer
• Organize your thinking before a mediation session
• Understand what a court document means after you receive it`
  },
  {
    icon: '🛡️',
    title: 'What FORESIGHT AI is not designed for',
    content: `Do not rely on FORESIGHT's AI to:

• Draft affidavits or sworn statements for court
• Provide specific legal strategy for your case
• Cite case law in court documents
• Replace a lawyer's advice on complex matters
• Make decisions about your children's wellbeing

If your matter involves allegations of abuse, urgent child safety concerns, or highly contested financial issues — get a lawyer. Legal Aid Saskatchewan, pro bono services, and flat-rate consultants like Evolve Family Law are more accessible than you may think.`
  },
  {
    icon: '🔒',
    title: 'Your privacy and your data',
    content: `Your profile and case information is stored securely and is never shared with third parties or used to train AI models. FORESIGHT uses your profile to personalize guidance — your information stays yours.

Do not enter highly sensitive information into any AI tool that you would not want stored digitally, including social insurance numbers, banking details, or detailed allegations about third parties.

For full details, see our Privacy Policy.`
  },
];

export default function AIDisclosurePage() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Using AI Responsibly</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Using AI Responsibly</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            FORESIGHT uses AI to help you navigate family law. Understanding what it can and cannot do
            protects you — and your case.
          </p>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-amber-900 font-semibold text-sm mb-1">Canadian courts are penalizing improper AI use</p>
              <p className="text-amber-800 text-xs leading-relaxed">
                Self-represented litigants have received cost orders and fines for submitting AI-generated
                documents with hallucinated case citations. Read this page before using AI in your case.
              </p>
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="space-y-3 mb-10">
          {SECTIONS.map((section, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{section.icon}</span>
                  <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
                </div>
                <span className="text-gray-400 text-lg flex-shrink-0">{open === idx ? '−' : '+'}</span>
              </button>
              {open === idx && (
                <div className="px-5 pb-5">
                  <div className="border-t border-gray-100 pt-4">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="text-gray-600 text-sm leading-relaxed mb-3 last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick reference card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Quick Reference — Before You File</h3>
          <div className="space-y-3">
            {[
              { check: 'Did you verify any case citations on CanLII?', link: 'https://www.canlii.org', linkLabel: 'Open CanLII' },
              { check: 'Did you read the full document before signing?', link: null },
              { check: 'Did you confirm form numbers against the official court website?', link: 'https://www.sasklawcourts.ca', linkLabel: 'SK Law Courts' },
              { check: 'Have you considered adding an AI disclosure statement?', link: null },
              { check: 'Is this matter complex enough to warrant a lawyer consultation?', link: 'https://www.legalaid.sk.ca', linkLabel: 'Legal Aid SK' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">☐</span>
                <div className="flex-1">
                  <p className="text-gray-700 text-sm">{item.check}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="text-red-600 text-xs font-medium mt-1 inline-block">
                      {item.linkLabel} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested disclosure statement */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8">
          <h3 className="font-bold text-blue-900 mb-2 text-sm">Suggested AI Disclosure Statement</h3>
          <p className="text-blue-800 text-xs leading-relaxed mb-3">
            Copy and add this to any court document you prepare with AI assistance:
          </p>
          <div className="bg-white border border-blue-200 rounded-xl p-4">
            <p className="text-gray-700 text-xs italic leading-relaxed">
              "I used an AI-assisted legal information tool (FORESIGHT, foresightcustody.ca) to help me understand
              the process and organize this document. I have reviewed all content for accuracy and take full
              responsibility for the information contained herein."
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="block w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-center transition-colors"
        >
          Back to Dashboard
        </Link>

      </div>
    </div>
  );
}

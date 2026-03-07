'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// ============================================
// CPS / CHILD WELFARE LEGISLATION DATABASE
// ============================================
const LEGISLATION_DB = {
  saskatchewan: {
    jurisdiction: 'Saskatchewan',
    flag: '🇨🇦',
    status: 'live',
    actName: 'The Child and Family Services Act (C-7.2)',
    agency: 'Ministry of Social Services',
    legislationUrl: 'https://www.canlii.org/en/sk/laws/stat/ss-1989-90-c-c-7.2/latest/ss-1989-90-c-c-7.2.html',
    pdfUrl: 'https://pubsaskdev.blob.core.windows.net/pubsask-prod/561/C7-2.pdf',
    regulationsUrl: 'https://www.canlii.org/en/sk/laws/regu/rrs-c-c-7.2-reg-1/',
    advocatePhone: '1-800-322-7221',
    advocateName: 'Saskatchewan Advocate for Children and Youth',
    legalAidPhone: '1-800-667-3764',
    emergencyLine: '911',
    sections: [
      {
        id: 'investigation',
        title: 'Your Rights During an Investigation',
        icon: '🔍',
        rights: [
          { right: 'You must be notified of the investigation', section: 'Section 14(1)(a)', detail: 'If an officer concludes your child is in need of protection, the officer must notify you in writing of their conclusion.' },
          { right: 'You have the right to consult a lawyer', section: 'Section 19(c)', detail: 'When your child is apprehended, the officer must inform you of the advisability of consulting legal counsel.' },
          { right: 'Officers must offer family services first', section: 'Section 14(1)(b)', detail: 'Before removing a child, the officer must offer family services to the parent. Removal is a last resort.' },
          { right: 'You can agree to voluntary services', section: 'Section 14(2)', detail: 'If you acknowledge the need for family services and agree, the director may enter into an agreement with you rather than proceeding to court.' },
          { right: 'Investigations must be based on specific grounds', section: 'Section 11', detail: 'Anyone who has reasonable grounds to believe a child is in need of protection must report it, but the investigation must be grounded in evidence, not speculation.' },
          { right: 'Officers need a warrant to enter your home (with exceptions)', section: 'Section 13', detail: 'An officer generally needs a warrant to enter your home. Without a warrant, entry is only permitted if there are reasonable grounds to believe the child is in immediate danger.' },
        ]
      },
      {
        id: 'apprehension',
        title: 'Your Rights During an Apprehension',
        icon: '⚠️',
        rights: [
          { right: 'You must be notified of the grounds for apprehension', section: 'Section 19(a)', detail: 'The officer must tell you the specific reasons why your child was apprehended.' },
          { right: 'You must receive the officer\'s contact information', section: 'Section 19(b)', detail: 'The officer must provide you with their office address and telephone number.' },
          { right: 'You must be told to get a lawyer', section: 'Section 19(c)', detail: 'The officer must inform you of the advisability of consulting legal counsel.' },
          { right: 'A protection hearing must occur within prescribed timelines', section: 'Section 22', detail: 'After apprehension, the matter must be brought before the court for a protection hearing within the timelines set by the Act.' },
          { right: 'Your child should be returned if grounds no longer exist', section: 'Section 17(3)', detail: 'If the officer determines the child is no longer in need of protection, the child must be returned.' },
          { right: 'Placement priority goes to family', section: 'Section 53(1)', detail: 'Priority must be given to placing the child with a parent, extended family member, or in an environment consistent with the child\'s cultural background.' },
        ]
      },
      {
        id: 'court',
        title: 'Your Rights in Court Proceedings',
        icon: '⚖️',
        rights: [
          { right: 'You have the right to legal representation', section: 'General', detail: 'You can hire a lawyer or apply for Legal Aid Saskatchewan (1-800-667-3764) if you cannot afford one.' },
          { right: 'Children have the right to counsel', section: 'Counsel for Children Program', detail: 'Children and youth involved in child protection proceedings can have a lawyer appointed through the Counsel for Children program.' },
          { right: 'The best interests of the child is the paramount consideration', section: 'Section 4', detail: 'All decisions must be based on the best interests of the child, considering physical, emotional, psychological needs and cultural heritage.' },
          { right: 'You can challenge the apprehension in court', section: 'Section 22', detail: 'You have the right to appear at the protection hearing and present your case for why your child should be returned.' },
          { right: 'You can appeal court decisions', section: 'General', detail: 'You have the right to appeal any order made under the Act to a higher court.' },
        ]
      },
      {
        id: 'access',
        title: 'Your Rights to Access & Visits',
        icon: '👨‍👩‍👧',
        rights: [
          { right: 'You may have access to your child while in care', section: 'Section 39', detail: 'The Act contains provisions regarding access by parents or guardians to children who are temporary or permanent wards.' },
          { right: 'Family services must be offered after return', section: 'Section 21', detail: 'If your child is returned, the officer must offer family services if the child continues to be in need of protection.' },
          { right: 'Agreements have time limits', section: 'Section 14', detail: 'Voluntary agreements for services cannot exceed 24 months total, unless the director determines it is in the child\'s best interests.' },
        ]
      },
      {
        id: 'indigenous',
        title: 'Indigenous Family Rights',
        icon: '🪶',
        rights: [
          { right: 'Cultural placement priority', section: 'Section 53(1)(c)', detail: 'Priority must be given to placing the child in an environment consistent with the child\'s cultural background.' },
          { right: 'Extended family and community connections', section: 'Section 53(1)(b)', detail: 'Priority must be given to placing the child with a member of the child\'s extended family.' },
          { right: 'Indigenous governing bodies may be involved', section: '2023 Amendments', detail: 'Recent amendments recognize the role of Indigenous governing bodies in child welfare decisions.' },
          { right: 'Right to cultural identity', section: 'Section 4', detail: 'The child\'s cultural, linguistic, and spiritual heritage must be considered in all decisions.' },
        ]
      },
      {
        id: 'complaints',
        title: 'How to File a Complaint',
        icon: '📋',
        rights: [
          { right: 'Contact the Saskatchewan Advocate for Children and Youth', section: 'The Advocate for Children and Youth Act', detail: 'The Advocate can investigate complaints about services provided under the Child and Family Services Act. Call 1-800-322-7221.' },
          { right: 'Request a review of decisions', section: 'General', detail: 'You can request a review of any decision made by the Ministry of Social Services regarding your child.' },
          { right: 'File a complaint with the Ministry', section: 'General', detail: 'Contact the Ministry of Social Services directly to file a formal complaint about a caseworker or agency.' },
        ]
      }
    ]
  },
};

// Jurisdictions coming soon
const COMING_SOON = {
  canada: [
    { id: 'alberta', name: 'Alberta', act: 'Child, Youth and Family Enhancement Act' },
    { id: 'ontario', name: 'Ontario', act: 'Child, Youth and Family Services Act' },
    { id: 'bc', name: 'British Columbia', act: 'Child, Family and Community Service Act' },
    { id: 'manitoba', name: 'Manitoba', act: 'Child and Family Services Act' },
    { id: 'quebec', name: 'Quebec', act: 'Youth Protection Act' },
    { id: 'nova_scotia', name: 'Nova Scotia', act: 'Children and Family Services Act' },
    { id: 'new_brunswick', name: 'New Brunswick', act: 'Family Services Act' },
    { id: 'newfoundland', name: 'Newfoundland & Labrador', act: 'Children, Youth and Families Act' },
    { id: 'pei', name: 'Prince Edward Island', act: 'Child Protection Act' },
    { id: 'northwest_territories', name: 'Northwest Territories', act: 'Child and Family Services Act' },
    { id: 'yukon', name: 'Yukon', act: 'Child and Family Services Act' },
    { id: 'nunavut', name: 'Nunavut', act: 'Child and Family Services Act' },
  ],
  usa: 'Coming Soon — All 50 States'
};

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function RightsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('saskatchewan');
  const [expandedSection, setExpandedSection] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const jurisdictionData = LEGISLATION_DB[selectedJurisdiction];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleAIQuery = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiLoading(true);

    try {
      const systemPrompt = `You are a legal information assistant for Foresight, specializing in child protection and family services law in ${jurisdictionData?.jurisdiction || 'Canada'}. 

Your knowledge base is ${jurisdictionData?.actName || 'child welfare legislation'}.

CRITICAL RULES:
1. You provide LEGAL INFORMATION, never legal advice. Always remind users to consult a lawyer.
2. Reference specific sections of the Act when possible.
3. Be empathetic — users are often in crisis situations involving their children.
4. If you don't know the answer, say so. Never make up legal information.
5. Focus on helping parents understand their rights and the process.
6. Keep responses concise but thorough.
7. Always suggest contacting Legal Aid (${jurisdictionData?.legalAidPhone || '1-800-667-3764'}) or the Advocate for Children and Youth (${jurisdictionData?.advocatePhone || ''}) when appropriate.

Key sections of the ${jurisdictionData?.actName || 'Act'}:
- Section 4: Best interests of the child
- Section 11: Duty to report
- Section 13: Warrant for access to child
- Section 14: Duty to offer family services
- Section 17: Apprehension
- Section 19: Notification requirements
- Section 21: Child returned
- Section 22: Protection hearings
- Section 37: Court orders
- Section 39: Access provisions
- Section 53: Priority of placement (family, extended family, cultural background)`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...aiMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg }
          ]
        })
      });

      const data = await response.json();
      const assistantMsg = data.content?.map(c => c.text || '').join('') || 'I apologize, I was unable to process that request. Please try again.';
      setAiMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }]);
    } catch (err) {
      console.error('AI error:', err);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, there was an error processing your request. Please try again, or contact Legal Aid Saskatchewan at 1-800-667-3764 for immediate assistance.' }]);
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Know Your Rights</h1>
              <p className="text-sm text-gray-500">CPS & Child Welfare — Simplified Codes & Regulations</p>
            </div>
          </div>

          {/* Jurisdiction Selector */}
          <select
            value={selectedJurisdiction}
            onChange={(e) => { setSelectedJurisdiction(e.target.value); setExpandedSection(null); }}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-gray-900 text-sm"
          >
            <optgroup label="🇨🇦 Canada — Available">
              {Object.keys(LEGISLATION_DB).map(id => (
                <option key={id} value={id}>{LEGISLATION_DB[id].flag} {LEGISLATION_DB[id].jurisdiction}</option>
              ))}
            </optgroup>
            <optgroup label="🇨🇦 Canada — Coming Soon">
              {COMING_SOON.canada.map(j => (
                <option key={j.id} value={j.id} disabled>{`🇨🇦 ${j.name} — Coming Soon`}</option>
              ))}
            </optgroup>
            <optgroup label="🇺🇸 United States">
              <option disabled>🇺🇸 All 50 States — Coming Soon</option>
            </optgroup>
          </select>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {jurisdictionData ? (
          <>
            {/* Legislation Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🛡️</div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900">{jurisdictionData.actName}</h2>
                  <p className="text-sm text-gray-500 mb-3">Administered by: {jurisdictionData.agency}</p>
                  <div className="flex flex-wrap gap-2">
                    <a href={jurisdictionData.legislationUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                      📖 Read Full Act
                    </a>
                    <a href={jurisdictionData.pdfUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                      📄 Download PDF
                    </a>
                    {jurisdictionData.regulationsUrl && (
                      <a href={jurisdictionData.regulationsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                        📋 Regulations
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-2">📞 Important Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <a href={`tel:${jurisdictionData.legalAidPhone?.replace(/[^0-9+]/g, '')}`}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">Legal Aid</div>
                  <div className="text-red-600">{jurisdictionData.legalAidPhone}</div>
                </a>
                <a href={`tel:${jurisdictionData.advocatePhone?.replace(/[^0-9+]/g, '')}`}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">{jurisdictionData.advocateName}</div>
                  <div className="text-red-600">{jurisdictionData.advocatePhone}</div>
                </a>
                <a href="tel:911"
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-400 transition-colors">
                  <div className="font-medium text-gray-900">Emergency</div>
                  <div className="text-red-600">911</div>
                </a>
              </div>
            </div>

            {/* Rights Sections */}
            {jurisdictionData.sections.map(section => (
              <div key={section.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-2xl">{section.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.rights.length} rights explained</p>
                  </div>
                  <span className="text-gray-400 text-lg">{expandedSection === section.id ? '▲' : '▼'}</span>
                </button>

                {expandedSection === section.id && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {section.rights.map((r, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 mt-0.5 font-bold flex-shrink-0">✓</span>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{r.right}</h4>
                            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded inline-block mb-2">{r.section}</span>
                            <p className="text-sm text-gray-600 leading-relaxed">{r.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* AI Assistant Toggle */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <button
                onClick={() => setShowAI(!showAI)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0">🤖</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Ask AI About Your Rights</h3>
                  <p className="text-sm text-gray-500">Get plain-language answers about {jurisdictionData.actName}</p>
                </div>
                <span className="text-gray-400">{showAI ? '▲' : '▼'}</span>
              </button>

              {showAI && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {/* Disclaimer */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-700">
                      <strong>⚠️ Important:</strong> This AI provides general legal information about {jurisdictionData.actName}, not legal advice. 
                      Always consult a lawyer for your specific situation. Contact Legal Aid at {jurisdictionData.legalAidPhone}.
                    </p>
                  </div>

                  {/* Suggested Questions */}
                  {aiMessages.length === 0 && (
                    <div className="mb-4 space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Suggested questions:</p>
                      {[
                        'Can CPS enter my home without a warrant?',
                        'What are my rights if my child is apprehended?',
                        'How long can they keep my child without a court hearing?',
                        'Can I refuse to let a caseworker interview my child?',
                        'What does "child in need of protection" actually mean?',
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => { setAiInput(q); }}
                          className="block w-full text-left text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-3 py-2 transition-colors"
                        >
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Messages */}
                  <div className="max-h-96 overflow-y-auto space-y-3 mb-3">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">AI</div>
                        )}
                        <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                          msg.role === 'user'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex gap-2.5">
                        <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">AI</div>
                        <div className="bg-gray-100 rounded-xl px-4 py-2.5">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* AI Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                      placeholder="Ask about your rights..."
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
                    />
                    <button
                      onClick={handleAIQuery}
                      disabled={!aiInput.trim() || aiLoading}
                      className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Coming Soon */
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <span className="text-4xl block mb-3">🔜</span>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              Rights information for this jurisdiction is being researched and will be added soon.
            </p>
            <p className="text-sm text-gray-500">
              Currently available: Saskatchewan
            </p>
          </div>
        )}

        {/* Coming Soon - Other Provinces */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">🇨🇦 Other Canadian Provinces — Coming Soon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COMING_SOON.canada.map(j => (
              <div key={j.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-400">🔜</span>
                <span className="text-gray-700 font-medium">{j.name}</span>
                <span className="text-gray-400 text-xs ml-auto hidden sm:block">{j.act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* USA Coming Soon */}
        <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
          <span className="text-3xl block mb-2">🇺🇸</span>
          <h3 className="font-bold text-gray-900 mb-2">United States — Coming Soon</h3>
          <p className="text-sm text-gray-600">
            CPS codes and regulations for all 50 US states are being researched and will be added in a future update.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-1">⚠️ Important Disclaimer</h4>
          <p className="text-sm text-amber-700">
            This page provides simplified summaries of child welfare legislation for educational purposes only. 
            It is not legal advice. Laws change frequently — always verify with the current official legislation 
            and consult a qualified lawyer for your specific situation. If your child has been apprehended, 
            contact a lawyer immediately.
          </p>
        </div>
      </main>
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';
import Link from 'next/link';

export default function LawyersPage() {
  const router = useRouter();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data } = await supabase.from('lawyer_directory')
        .select('*').eq('is_active', true).order('display_order');
      setLawyers(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const FILTERS = [
    { id: 'all', label: 'All Resources' },
    { id: 'free', label: '🆓 Free Services' },
    { id: 'legal_aid', label: '🏛️ Legal Aid' },
    { id: 'unbundled', label: '📦 Unbundled' },
    { id: 'consult', label: '💬 Flat-Fee Consult' },
  ];

  const filtered = lawyers.filter(l => {
    if (filter === 'all') return true;
    if (filter === 'free') return l.flat_fee_amount_cad === 0 || l.accepts_legal_aid;
    if (filter === 'legal_aid') return l.accepts_legal_aid;
    if (filter === 'unbundled') return l.offers_unbundled;
    if (filter === 'consult') return l.flat_fee_consult;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Legal Help Directory" subtitle="Saskatchewan lawyers, free services, and legal aid" icon="⚖️" />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Not a referral service.</strong> This directory is for informational purposes only. Foresight does not endorse any specific lawyer or service. Always verify current pricing and availability directly with the lawyer or organization. If you are in financial need, call Legal Aid first.
          </p>
        </div>

        {/* Emergency legal help */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-bold text-red-900 text-sm mb-1">🚨 Need help right now?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-800">
            <div><strong>Legal Aid SK:</strong> <a href="tel:18006673764" className="underline">1-800-667-3764</a></div>
            <div><strong>Family Law Info Centre:</strong> <a href="tel:18882182822" className="underline">1-888-218-2822</a></div>
            <div><strong>Pro Bono Law SK:</strong> <a href="tel:3065693100" className="underline">306-569-3100</a></div>
            <div><strong>SK Advocate for Children:</strong> <a href="tel:18003227221" className="underline">1-800-322-7221</a></div>
          </div>
        </div>

        {/* What kind of help do I need? */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="font-semibold text-gray-900 text-sm mb-3">Not sure where to start?</p>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-base flex-shrink-0">💰</span>
              <div><strong>Can't afford a lawyer →</strong> Call Legal Aid Saskatchewan first. If you don't qualify, call Pro Bono Law SK. Both are free.</div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-base flex-shrink-0">❓</span>
              <div><strong>Need to understand the process →</strong> Call the Family Law Information Centre (free). They explain forms, procedures, and next steps without legal advice.</div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-base flex-shrink-0">📝</span>
              <div><strong>Want a lawyer to review your documents only →</strong> Look for lawyers offering unbundled services. You pay for one specific task, not full representation.</div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-base flex-shrink-0">🤝</span>
              <div><strong>Want to avoid court entirely →</strong> Contact Family Justice Services (free). They provide mediation that can produce a legally binding consent order.</div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg">
              <span className="text-base flex-shrink-0">🛡️</span>
              <div><strong>CPS is involved →</strong> Call Legal Aid immediately and contact the SK Advocate for Children and Youth. Both are free and CPS cases are time-sensitive.</div>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === f.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lawyer cards */}
        <div className="space-y-3">
          {filtered.map(lawyer => {
            const isOpen = expanded === lawyer.id;
            const isFree = lawyer.flat_fee_amount_cad === 0;
            return (
              <div key={lawyer.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : lawyer.id)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">⚖️</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{lawyer.name}</p>
                        {lawyer.firm && lawyer.firm !== lawyer.name && <p className="text-xs text-gray-500">{lawyer.firm}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{lawyer.city}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 flex-shrink-0">
                        {isFree && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">FREE</span>}
                        {lawyer.accepts_legal_aid && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Legal Aid</span>}
                        {lawyer.offers_unbundled && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">Unbundled</span>}
                        {lawyer.flat_fee_consult && !isFree && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">${lawyer.flat_fee_amount_cad} Consult</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm flex-shrink-0 mt-1">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                    {lawyer.bio && <p className="text-sm text-gray-700 leading-relaxed">{lawyer.bio}</p>}

                    {lawyer.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specialties.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}

                    {lawyer.languages?.length > 1 && (
                      <p className="text-xs text-gray-500">🌐 Languages: {lawyer.languages.join(', ')}</p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      {lawyer.phone && (
                        <a href={`tel:${lawyer.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold">
                          📞 {lawyer.phone}
                        </a>
                      )}
                      {lawyer.email && (
                        <a href={`mailto:${lawyer.email}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-red-300 text-gray-700 rounded-xl text-xs font-medium">
                          ✉️ Email
                        </a>
                      )}
                      {lawyer.website && (
                        <a href={lawyer.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-red-300 text-gray-700 rounded-xl text-xs font-medium">
                          🌐 Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit a lawyer */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-1">Know a SK family lawyer who helps self-represented parents?</p>
          <a href="mailto:info@foresight-app.ca?subject=Lawyer Directory Submission"
            className="text-red-600 text-sm font-medium hover:underline">
            Suggest an addition →
          </a>
        </div>

        <Footer />
      </main>
    </div>
  );
}

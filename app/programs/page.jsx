'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';
import { supabase } from '../../lib/supabaseClient';

const CATEGORY_META = {
  financial: { label: 'Financial Assistance', icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  housing: { label: 'Housing Support', icon: '🏠', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  legal: { label: 'Legal Aid', icon: '⚖️', color: 'bg-red-50 text-red-700 border-red-200' },
  counseling: { label: 'Counselling', icon: '🧠', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  mental_health: { label: 'Mental Health', icon: '💙', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  support: { label: 'Support Services', icon: '🤝', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  crisis: { label: 'Crisis Services', icon: '🆘', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  parenting: { label: 'Parenting', icon: '👨‍👩‍👧', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  childcare: { label: 'Childcare', icon: '🧒', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  education: { label: 'Education', icon: '🎓', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  employment: { label: 'Employment', icon: '💼', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  indigenous: { label: 'Indigenous Services', icon: '🪶', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  food: { label: 'Food Security', icon: '🍎', color: 'bg-green-50 text-green-700 border-green-200' },
  addiction: { label: 'Addiction & Recovery', icon: '💪', color: 'bg-lime-50 text-lime-700 border-lime-200' },
  disability: { label: 'Disability Support', icon: '♿', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  mentorship: { label: 'Mentorship', icon: '⭐', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  youth: { label: 'Youth Services', icon: '🧑‍🎓', color: 'bg-pink-50 text-pink-700 border-pink-200' },
};

const TARGET_META = {
  parents: 'Parents',
  children: 'Children',
  both: 'Parents & Children',
  youth: 'Youth',
  indigenous: 'Indigenous',
  women: 'Women',
  men: 'Men',
  families: 'Families',
  seniors: 'Seniors',
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTarget, setSelectedTarget] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [userJurisdiction, setUserJurisdiction] = useState('saskatchewan');

  useEffect(() => {
    const init = async () => {
      // Get user's jurisdiction
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('jurisdiction').eq('id', user.id).single();
        if (profile?.jurisdiction) setUserJurisdiction(profile.jurisdiction);
      }
      await fetchPrograms();
    };
    init();
  }, []);

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (data) setPrograms(data);
    setLoading(false);
  };

  const categories = ['all', ...Object.keys(CATEGORY_META).filter(c =>
    programs.some(p => p.category === c)
  )];

  const targets = ['all', ...Object.keys(TARGET_META).filter(t =>
    programs.some(p => p.target_group === t)
  )];

  const filtered = programs.filter(p => {
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchTarget = selectedTarget === 'all' || p.target_group === selectedTarget;
    return matchSearch && matchCat && matchTarget;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Programs & Resources" subtitle="Support services for your family" icon="🤝" />

      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search programs, services, support..."
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 mb-4"
        />

        {/* Category filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              {cat === 'all' ? `All (${programs.length})` : `${CATEGORY_META[cat]?.icon} ${CATEGORY_META[cat]?.label}`}
            </button>
          ))}
        </div>

        {/* Target filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {targets.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTarget(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTarget === t
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {t === 'all' ? 'All groups' : TARGET_META[t]}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-500 mb-4">
          Showing {filtered.length} of {programs.length} programs
        </p>

        {/* Program list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-1">No programs found</h3>
            <p className="text-sm text-gray-500">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(program => {
              const meta = CATEGORY_META[program.category] || { label: program.category, icon: '📋', color: 'bg-gray-50 text-gray-700 border-gray-200' };
              const isExpanded = expanded === program.id;

              return (
                <div key={program.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                  <button
                    className="w-full text-left p-4"
                    onClick={() => setExpanded(isExpanded ? null : program.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                          {program.cost === 'Free' && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">Free</span>
                          )}
                          {program.target_group && program.target_group !== 'parents' && (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs">
                              {TARGET_META[program.target_group] || program.target_group}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">{program.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{program.description}</p>
                      </div>
                      <span className="text-gray-400 text-sm flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      {program.description && (
                        <p className="text-sm text-gray-700 mb-3">{program.description}</p>
                      )}

                      {program.eligibility?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Who Can Apply</h4>
                          <ul className="space-y-1">
                            {program.eligibility.map((e, i) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-green-500 mt-0.5">✓</span> {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {program.benefits?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">What You Get</h4>
                          <ul className="space-y-1">
                            {program.benefits.map((b, i) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className="text-blue-500 mt-0.5">•</span> {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {program.how_to_apply && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">How to Apply</h4>
                          <p className="text-xs text-gray-700">{program.how_to_apply}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {program.contact_phone && (
                          <a href={`tel:${program.contact_phone}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium text-green-700">
                            📞 {program.contact_phone}
                          </a>
                        )}
                        {program.contact_email && (
                          <a href={`mailto:${program.contact_email}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-700">
                            ✉️ Email
                          </a>
                        )}
                        {program.website && (
                          <a href={program.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                            🌐 Website →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

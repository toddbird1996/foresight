'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

const JOURNEY_MILESTONES = [
  { key: 'account_created', title: 'Created Account', desc: 'Signed up for Foresight', icon: '🎯', auto: true },
  { key: 'onboarding_done', title: 'Completed Questionnaire', desc: 'Set up your case profile', icon: '📋', auto: true },
  { key: 'case_created', title: 'Started a Case', desc: 'Created your first case file', icon: '📁', link: '/cases' },
  { key: 'read_rights', title: 'Reviewed Your Rights', desc: 'Learned about your legal protections', icon: '⚖️', link: '/rights' },
  { key: 'read_filing', title: 'Read the Filing Guide', desc: 'Understood the step-by-step process', icon: '📋', link: '/filing' },
  { key: 'downloaded_form', title: 'Downloaded a Court Form', desc: 'Got the forms you need', icon: '📄', link: '/court-forms' },
  { key: 'used_calculator', title: 'Calculated Child Support', desc: 'Estimated support amounts', icon: '🧮', link: '/calculator' },
  { key: 'created_template', title: 'Created a Document', desc: 'Used a template wizard', icon: '📝', link: '/templates' },
  { key: 'joined_community', title: 'Joined the Community', desc: 'Connected with other parents', icon: '💬', link: '/community' },
  { key: 'set_deadline', title: 'Set a Deadline', desc: 'Started tracking important dates', icon: '⏰', link: '/deadlines' },
  { key: 'uploaded_document', title: 'Uploaded a Document', desc: 'Added a document to your case', icon: '📎', link: '/cases' },
  { key: 'read_judge_tips', title: 'Reviewed Court Tips', desc: 'Prepared for your hearing', icon: '🏛️', link: '/judge-insight' },
  { key: 'filed_application', title: 'Filed Your Application', desc: 'Submitted to the court', icon: '✅' },
  { key: 'attended_hearing', title: 'Attended a Hearing', desc: 'Appeared before the court', icon: '🏛️' },
  { key: 'received_order', title: 'Received Court Order', desc: 'Got your custody order', icon: '🎉' },
];

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [stats, setStats] = useState({ cases: 0, documents: 0, messages: 0, filingSteps: 0, totalSteps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);

      const { data: prof } = await supabase.from('users').select('*').eq('id', user.id).single();
      setProfile(prof);

      // Fetch existing milestones
      const { data: ms } = await supabase.from('case_milestones').select('*').eq('user_id', user.id);
      const completedKeys = (ms || []).filter(m => m.completed).map(m => m.milestone_key);

      // Auto-detect milestones
      const autoDetected = [...completedKeys];
      autoDetected.push('account_created'); // always true
      if (prof?.onboarding_completed) autoDetected.push('onboarding_done');

      const { count: caseCount } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (caseCount > 0) autoDetected.push('case_created');

      const { count: docCount } = await supabase.from('case_documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (docCount > 0) autoDetected.push('uploaded_document');

      const { count: msgCount } = await supabase.from('case_ai_messages').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

      const { count: deadlineCount } = await supabase.from('deadlines').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if (deadlineCount > 0) autoDetected.push('set_deadline');

      const { count: progressCount } = await supabase.from('user_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id);

      // Save any new auto-detected milestones
      const unique = [...new Set(autoDetected)];
      for (const key of unique) {
        if (!completedKeys.includes(key)) {
          const milestone = JOURNEY_MILESTONES.find(m => m.key === key);
          if (milestone) {
            await supabase.from('case_milestones').upsert({
              user_id: user.id, milestone_key: key, title: milestone.title,
              completed: true, completed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,milestone_key', ignoreDuplicates: true });
          }
        }
      }

      setMilestones(unique);
      setStats({
        cases: caseCount || 0,
        documents: docCount || 0,
        messages: msgCount || 0,
        filingSteps: progressCount || 0,
        totalSteps: 310,
      });
      setLoading(false);
    };
    init();
  }, []);

  const toggleMilestone = async (key) => {
    const isCompleted = milestones.includes(key);
    if (isCompleted) {
      setMilestones(prev => prev.filter(k => k !== key));
      await supabase.from('case_milestones').delete().eq('user_id', user.id).eq('milestone_key', key);
    } else {
      setMilestones(prev => [...prev, key]);
      const milestone = JOURNEY_MILESTONES.find(m => m.key === key);
      await supabase.from('case_milestones').insert({
        user_id: user.id, milestone_key: key, title: milestone.title,
        completed: true, completed_at: new Date().toISOString(),
      });
    }
  };

  const completedCount = milestones.length;
  const totalCount = JOURNEY_MILESTONES.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  // Readiness phases
  const phases = [
    { title: 'Learn', desc: 'Understand the process', keys: ['account_created', 'onboarding_done', 'read_rights', 'read_filing', 'read_judge_tips'], color: 'blue' },
    { title: 'Prepare', desc: 'Gather your materials', keys: ['case_created', 'downloaded_form', 'used_calculator', 'created_template', 'uploaded_document', 'set_deadline'], color: 'amber' },
    { title: 'Act', desc: 'Take action', keys: ['filed_application', 'attended_hearing', 'received_order'], color: 'green' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Readiness Score */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Case Readiness</h1>
              <p className="text-red-100 text-sm mt-1">
                {progress >= 80 ? 'You\'re well prepared for court.' : progress >= 50 ? 'Solid progress — keep building your case.' : progress >= 25 ? 'You\'re learning the process.' : 'Let\'s get you started.'}
              </p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="white" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{progress}%</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-white/10 rounded-xl p-2 text-center"><div className="text-lg font-bold">{stats.cases}</div><div className="text-[10px] text-red-200">Cases</div></div>
            <div className="bg-white/10 rounded-xl p-2 text-center"><div className="text-lg font-bold">{stats.documents}</div><div className="text-[10px] text-red-200">Docs</div></div>
            <div className="bg-white/10 rounded-xl p-2 text-center"><div className="text-lg font-bold">{stats.filingSteps}/{stats.totalSteps}</div><div className="text-[10px] text-red-200">Steps</div></div>
            <div className="bg-white/10 rounded-xl p-2 text-center"><div className="text-lg font-bold">{stats.messages}</div><div className="text-[10px] text-red-200">AI Chats</div></div>
          </div>
        </div>

        {/* Phase Cards */}
        {phases.map(phase => {
          const phaseMs = JOURNEY_MILESTONES.filter(m => phase.keys.includes(m.key));
          const phaseDone = phaseMs.filter(m => milestones.includes(m.key)).length;
          const phaseTotal = phaseMs.length;
          const phasePercent = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          const colors = { blue: 'border-blue-200 bg-blue-50', amber: 'border-amber-200 bg-amber-50', green: 'border-green-200 bg-green-50' };
          const dotColors = { blue: 'bg-blue-500', amber: 'bg-amber-500', green: 'bg-green-500' };

          return (
            <div key={phase.title} className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColors[phase.color]}`} />
                    <h2 className="font-bold text-gray-900">{phase.title}</h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-[18px]">{phase.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{phaseDone}/{phaseTotal}</div>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1"><div className={`h-full ${dotColors[phase.color]} rounded-full`} style={{ width: `${phasePercent}%` }} /></div>
                </div>
              </div>
              <div className="border-t border-gray-100">
                {phaseMs.map(m => {
                  const done = milestones.includes(m.key);
                  const isAuto = m.auto;
                  return (
                    <div key={m.key} className={`px-5 py-3 flex items-center gap-3 border-b border-gray-50 last:border-0 ${done ? 'bg-gray-50/50' : ''}`}>
                      <button onClick={() => !isAuto && toggleMilestone(m.key)} disabled={isAuto}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          done ? 'bg-green-500 text-white' : 'border-2 border-gray-200'
                        } ${isAuto ? 'cursor-default' : 'cursor-pointer hover:border-gray-400'}`}>
                        {done ? '✓' : ''}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm ${done ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}`}>{m.title}</div>
                      </div>
                      {!done && m.link && (
                        <Link href={m.link} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium hover:bg-red-100 flex-shrink-0">
                          Go →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* What's Next */}
        {(() => {
          const next = JOURNEY_MILESTONES.find(m => !milestones.includes(m.key) && m.link);
          if (!next) return null;
          return (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">📍 Next Step</h3>
              <p className="text-sm text-gray-600 mb-3">{next.desc}</p>
              <Link href={next.link} className="inline-block px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">{next.title} →</Link>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

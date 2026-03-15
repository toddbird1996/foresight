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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Progress Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Journey</h1>
              <p className="text-sm text-gray-500">{completedCount} of {totalCount} milestones completed</p>
            </div>
            <div className="text-3xl font-bold text-red-600">{progress}%</div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{stats.cases}</div>
              <div className="text-[11px] text-gray-500">Cases</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{stats.documents}</div>
              <div className="text-[11px] text-gray-500">Documents</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{stats.filingSteps}</div>
              <div className="text-[11px] text-gray-500">Steps Done</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{stats.messages}</div>
              <div className="text-[11px] text-gray-500">AI Chats</div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="space-y-1">
          {JOURNEY_MILESTONES.map((m, i) => {
            const done = milestones.includes(m.key);
            const isAuto = m.auto;
            return (
              <div key={m.key} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center w-8 flex-shrink-0">
                  <button onClick={() => !isAuto && toggleMilestone(m.key)} disabled={isAuto}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                      done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                    } ${isAuto ? 'cursor-default' : 'cursor-pointer'}`}>
                    {done ? '✓' : m.icon}
                  </button>
                  {i < JOURNEY_MILESTONES.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[2rem] ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 ${done ? '' : 'opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium text-sm ${done ? 'text-gray-900' : 'text-gray-600'}`}>{m.title}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                    {!done && m.link && (
                      <Link href={m.link} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                        Do this →
                      </Link>
                    )}
                    {done && <span className="text-xs text-green-600 font-medium">Done ✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mt-6 text-center">
          <div className="text-2xl mb-2">{progress >= 80 ? '🏆' : progress >= 50 ? '💪' : progress >= 25 ? '🌟' : '🚀'}</div>
          <h3 className="font-semibold text-gray-900 mb-1">
            {progress >= 80 ? 'Almost there!' : progress >= 50 ? 'Great progress!' : progress >= 25 ? 'You\'re on your way!' : 'Just getting started!'}
          </h3>
          <p className="text-sm text-gray-600">
            {progress >= 80 ? 'You\'ve completed most of your journey. Keep going — you\'ve got this.' :
             progress >= 50 ? 'You\'re more than halfway through. Every step brings you closer.' :
             progress >= 25 ? 'You\'re building a solid foundation for your case.' :
             'Every journey starts with a single step. You\'ve already taken the hardest one — starting.'}
          </p>
        </div>
      </main>
    </div>
  );
}

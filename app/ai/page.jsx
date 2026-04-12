'use client';
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';

export default function AIPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users')
        .select('full_name, tier, jurisdiction, monthly_ai_used, ai_trial_used, daily_queries_used')
        .eq('id', user.id).single();
      setProfile(profile);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isBronze = profile?.tier === 'bronze';
  const trialUsed = profile?.ai_trial_used || 0;
  const dailyUsed = profile?.daily_queries_used || 0;
  const tierLimits = { silver: 500, gold: 2000 };
  const limit = isBronze ? 5 : (tierLimits[profile?.tier] || 500);
  const used = isBronze ? trialUsed : dailyUsed;
  const remaining = Math.max(0, limit - used);

  const SUGGESTED = [
    'What forms do I need to file for custody in ' + (profile?.jurisdiction || 'my province') + '?',
    'What is the difference between sole and joint custody?',
    'How does child support get calculated in Canada?',
    'What should I bring to my first court appearance?',
    'How do I respond to papers served by the other parent?',
    'What does "best interests of the child" mean legally?',
  ];

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;
    if (isBronze && used >= 5) {
      setError('You have used all 5 free AI questions. Upgrade to Silver or Gold for monthly credits.');
      return;
    }
    if (remaining <= 0) {
      setError('Monthly AI limit reached. Your credits reset on the 1st of next month.');
      return;
    }

    setInput('');
    setError('');
    const userMsg = { role: 'user', content, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          jurisdiction: profile?.jurisdiction || 'saskatchewan',
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.upgradeRequired) {
          setError('AI assistant requires a Silver or Gold plan. Upgrade to unlock unlimited questions.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content, id: Date.now() }]);
        // Update local usage count
        setProfile(prev => prev ? { ...prev, ai_trial_used: isBronze ? (prev.ai_trial_used || 0) + 1 : prev.ai_trial_used, daily_queries_used: !isBronze ? (prev.daily_queries_used || 0) + 1 : prev.daily_queries_used } : prev);
      }
    } catch (e) {
      setError('Network error. Please check your connection and try again.');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    }
    setSending(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4" style={{ height: 'calc(100vh - 3.5rem)' }}>

        {/* Header bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Foresight AI</h1>
            <p className="text-xs text-gray-500">Custody guidance for {profile?.jurisdiction?.replace(/_/g, ' ') || 'Canada'}</p>
          </div>
          <div className="text-right">
            {isBronze ? (
              <div className="text-xs">
                <span className="font-semibold text-gray-700">{remaining} / 5</span>
                <span className="text-gray-400 ml-1">free questions</span>
                <Link href="/pricing" className="block text-red-600 text-[10px] hover:underline">Upgrade for more →</Link>
              </div>
            ) : (
              <div className="text-xs">
                <span className="font-semibold text-gray-700">{remaining}</span>
                <span className="text-gray-400 ml-1">questions left</span>
                <div className="text-[10px] text-gray-400 capitalize">{profile?.tier} plan</div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-800">
          <strong>Educational guidance only.</strong> This is not legal advice. Consult a lawyer for advice specific to your situation.
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">

          {messages.length === 0 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚖️</span>
              </div>
              <h2 className="font-bold text-gray-900 mb-1">Ask anything about custody</h2>
              <p className="text-sm text-gray-500 mb-6">I can explain procedures, forms, deadlines, and your rights — specific to your province.</p>

              <div className="grid gap-2 max-w-lg mx-auto">
                {SUGGESTED.map((q, i) => (
                  <button key={i} onClick={() => send(q)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-red-300 hover:bg-red-50 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3 mt-1">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-md'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <div>
                {error}
                {error.includes('Upgrade') && (
                  <Link href="/pricing" className="block mt-1 text-red-600 font-medium hover:underline">View plans →</Link>
                )}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="pt-3 border-t border-gray-200">
          {(isBronze && remaining <= 0) ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-3">You have used all 5 free questions.</p>
              <Link href="/pricing" className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm">
                Upgrade to Silver — 500 questions/month
              </Link>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about custody procedures, forms, your rights..."
                rows={2}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 resize-none"
              />
              <button onClick={() => send()} disabled={!input.trim() || sending}
                className="w-11 h-11 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/>
                </svg>
              </button>
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>

      </div>
    </div>
  );
}

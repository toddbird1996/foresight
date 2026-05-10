'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Link from 'next/link';
import { UpgradeBanner } from '../components/UpgradeBanner';
import { track, EVENTS } from '../lib/analytics';

export default function AIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: prof } = await supabase.from('users').select('full_name, tier, ai_trial_used, daily_queries_used, jurisdiction, case_status, case_type').eq('id', user.id).single();
      setProfile(prof);
      await fetchConversations(user.id);

      // Pre-fill from URL query param
      const q = searchParams.get('q');
      if (q) setInput(q);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async (uid) => {
    const { data } = await supabase.from('ai_conversations')
      .select('*').eq('user_id', uid)
      .order('updated_at', { ascending: false }).limit(20);
    setConversations(data || []);
  };

  const fetchMessages = async (convId) => {
    const { data } = await supabase.from('ai_messages')
      .select('*').eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput('');
    setShowSidebar(false);
  };

  const openConversation = async (conv) => {
    setActiveConvId(conv.id);
    await fetchMessages(conv.id);
    setShowSidebar(false);
  };

  const deleteConversation = async (convId, e) => {
    e.stopPropagation();
    await supabase.from('ai_messages').delete().eq('conversation_id', convId);
    await supabase.from('ai_conversations').delete().eq('id', convId);
    if (activeConvId === convId) startNewConversation();
    setConversations(prev => prev.filter(c => c.id !== convId));
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || sending) return;
    setInput('');
    setSending(true);

    // Add user message optimistically
    const tempId = 'temp-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: q, created_at: new Date().toISOString() }]);

    try {
      let convId = activeConvId;

      // Create conversation if first message
      if (!convId) {
        const title = q.length > 60 ? q.substring(0, 57) + '...' : q;
        const { data: newConv } = await supabase.from('ai_conversations')
          .insert({ user_id: user.id, title }).select().single();
        convId = newConv.id;
        setActiveConvId(convId);
        setConversations(prev => [newConv, ...prev]);
      }

      // Save user message
      await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'user', content: q });

      // Call AI
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, userId: user.id, jurisdiction: profile?.jurisdiction || 'saskatchewan', history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();

      if (data.error && data.upgradeRequired) {
        const errMsg = data.content || 'Trial limit reached. Upgrade to continue.';
        setMessages(prev => [...prev.filter(m => m.id !== tempId),
          { id: 'ai-' + Date.now(), role: 'assistant', content: errMsg, created_at: new Date().toISOString(), isError: true }]);
        setSending(false);
        return;
      }

      const reply = data.content || 'Something went wrong. Please try again.';

      // Save AI message
      await supabase.from('ai_messages').insert({ conversation_id: convId, role: 'assistant', content: reply });

      // Update conversation timestamp
      await supabase.from('ai_conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);

      setMessages(prev => [...prev, { id: 'ai-' + Date.now(), role: 'assistant', content: reply, created_at: new Date().toISOString() }]);
      await fetchConversations(user.id);

    } catch (err) {
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: 'Connection error. Please try again.', created_at: new Date().toISOString(), isError: true }]);
    }
    setSending(false);
  };

  const isBronze = profile?.tier === 'bronze';
  const remaining = isBronze ? Math.max(0, 5 - (profile?.ai_trial_used || 0)) : null;

  const SUGGESTIONS = [
    'What should I bring to my JCC?',
    'How is child support calculated in Saskatchewan?',
    'What does parenting time mean?',
    'How do I respond to papers I was served?',
    'What is a Judicial Case Conference?',
    'What factors does a judge consider for parenting time?',
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full px-0 sm:px-4">

        {/* Sidebar - conversation history */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex flex-col w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto`}>
          <div className="p-3 border-b border-gray-100">
            <button onClick={startNewConversation}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
              + New Conversation
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <div key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${activeConvId === conv.id ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'}`}>
                  <span className="text-sm flex-shrink-0">💬</span>
                  <p className={`text-xs flex-1 truncate ${activeConvId === conv.id ? 'text-red-800 font-medium' : 'text-gray-700'}`}>
                    {conv.title || 'Conversation'}
                  </p>
                  <button onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs flex-shrink-0">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSidebar(v => !v)} className="sm:hidden w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                ☰
              </button>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Foresight AI</h1>
                <p className="text-xs text-gray-500">
                  {profile?.jurisdiction?.replace(/_/g, ' ') || 'Saskatchewan'} · {profile?.case_status?.replace(/_/g, ' ') || 'Family Law'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isBronze ? (
                <div className="text-right">
                  <span className={`text-xs font-bold ${remaining <= 1 ? 'text-red-600' : 'text-amber-600'}`}>{remaining} / 5 left</span>
                  <Link href="/pricing" className="block text-[10px] font-bold text-red-600 hover:underline">Upgrade →</Link>
                </div>
              ) : (
                <span className="text-xs text-gray-400 capitalize">{profile?.tier}</span>
              )}
              <button onClick={startNewConversation} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">
                New
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <p className="text-xs text-amber-700"><strong>Educational guidance only.</strong> Not legal advice. Consult a lawyer for advice specific to your situation.</p>
          </div>

          {/* Upgrade banners for Bronze */}
          {isBronze && remaining === 0 && (
            <div onClick={() => { try { track(EVENTS.UPGRADE_CLICKED, { source: 'ai_hard_limit' }); } catch {} }}>
              <UpgradeBanner type="hard" feature="AI" />
            </div>
          )}
          {isBronze && remaining > 0 && remaining <= 2 && (
            <UpgradeBanner type="low" remaining={remaining} feature="AI" />
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="py-6 space-y-4">
                {/* AI Greeting */}
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed bg-white border border-gray-200 text-gray-800">
                    <p className="font-semibold mb-1">Hi{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}. I'm here to help.</p>
                    <p className="text-gray-600 mb-2">
                      {profile?.jurisdiction === 'saskatchewan'
                        ? "I know Saskatchewan family law — forms, deadlines, court procedures, and what to do at every stage."
                        : "I know Canadian family law across every province — forms, deadlines, court procedures, and what to do at every stage."}
                    </p>
                    <p className="text-gray-600">What's going on with your case right now? You can ask me anything.</p>
                  </div>
                </div>

                {/* Suggestion prompts */}
                <div className="pl-11">
                  <p className="text-xs text-gray-400 mb-2">Common questions to get started:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => setInput(s)}
                        className="text-left text-xs bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 rounded-xl px-3 py-2.5 transition-colors">
                        💬 {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white rounded-tr-sm'
                    : msg.isError
                    ? 'bg-amber-50 border border-amber-200 text-amber-800'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                    {profile?.full_name?.[0] || 'U'}
                  </div>
                )}
              </div>
            ))}

            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-200 px-4 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything about your case — I'm here 24/7..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
              />
              <button onClick={sendMessage} disabled={!input.trim() || sending}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors">
                {sending ? '...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

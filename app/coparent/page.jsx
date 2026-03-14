'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'exchange', label: 'Exchange', icon: '🔄' },
  { id: 'school', label: 'School', icon: '🏫' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'schedule', label: 'Schedule', icon: '📅' },
];

export default function CoParentPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: casesData } = await supabase.from('cases').select('id, name').eq('user_id', user.id).order('updated_at', { ascending: false });
      setCases(casesData || []);
      await fetchConversations(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const fetchConversations = async (userId) => {
    const { data } = await supabase.from('coparent_conversations').select('*, cases(name)').or(`created_by.eq.${userId},coparent_user_id.eq.${userId}`).order('created_at', { ascending: false });
    setConversations(data || []);
  };

  const createConversation = async () => {
    if (!newEmail.trim() || !selectedCase) return;
    const { data, error } = await supabase.from('coparent_conversations').insert({
      case_id: selectedCase, created_by: user.id, coparent_email: newEmail.trim(), coparent_name: newName.trim() || newEmail.trim(),
    }).select('*, cases(name)').single();
    if (!error && data) {
      setConversations(prev => [data, ...prev]);
      setActiveConv(data);
      setShowNewConv(false);
      setNewEmail(''); setNewName('');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /><p className="text-gray-600">Loading...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeConv ? (
                <button onClick={() => setActiveConv(null)} className="text-gray-400 hover:text-red-600 text-lg md:hidden">←</button>
              ) : (
                <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
              )}
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {activeConv ? (activeConv.coparent_name || 'Co-Parent') : 'Co-Parent Messenger'}
                </h1>
                <p className="text-xs text-gray-500">
                  {activeConv ? (activeConv.cases?.name || 'Case') : 'Secure, court-ready communication'}
                </p>
              </div>
            </div>
            {!activeConv && (
              <button onClick={() => setShowNewConv(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">
                + New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Conversation List (shown when no active conversation, or always on desktop) */}
        {!activeConv ? (
          <div>
            {/* Info Card */}
            <div className="bg-white border border-blue-100 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔒</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">How it works</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">Messages are permanent, timestamped, and cannot be edited. Keep communication focused on your child. You can export the full conversation as a court-ready document at any time.</p>
                </div>
              </div>
            </div>

            {/* Conversations */}
            {conversations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <span className="text-5xl block mb-4">💬</span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Conversations Yet</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Start a secure conversation with your co-parent. Everything is documented and can be exported for court.</p>
                <button onClick={() => setShowNewConv(true)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">+ Start a Conversation</button>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Your Conversations</h2>
                {conversations.map(c => (
                  <button key={c.id} onClick={() => setActiveConv(c)}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:border-red-300 hover:shadow-sm transition-all text-left flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                      {(c.coparent_name || 'C')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{c.coparent_name || c.coparent_email}</div>
                      <div className="text-sm text-gray-500">{c.cases?.name || 'Case'}</div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Message Thread */
          <MessageThread conversation={activeConv} user={user} onBack={() => setActiveConv(null)} />
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowNewConv(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 w-full sm:max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">New Conversation</h2>
            <p className="text-sm text-gray-500 mb-6">Start a secure, documented conversation with your co-parent.</p>

            <label className="block text-sm font-medium text-gray-700 mb-2">Co-parent's name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Their name"
              className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400 text-base" />

            <label className="block text-sm font-medium text-gray-700 mb-2">Co-parent's email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="their@email.com"
              className="w-full mb-4 px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400 text-base" />

            <label className="block text-sm font-medium text-gray-700 mb-2">Related case</label>
            <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
              className="w-full mb-6 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 focus:outline-none focus:border-red-400 text-base">
              <option value="">Select a case...</option>
              {cases.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setShowNewConv(false)} className="flex-1 py-3 text-gray-600 text-sm font-medium">Cancel</button>
              <button onClick={createConversation} disabled={!newEmail.trim() || !selectedCase}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-40">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================ */
/* MESSAGE THREAD */
/* ============================================ */
function MessageThread({ conversation, user, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('general');
  const [sending, setSending] = useState(false);
  const [toneCheck, setToneCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { fetchMessages(); }, [conversation.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('coparent_messages').select('*').eq('conversation_id', conversation.id).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const checkTone = async () => {
    if (!input.trim()) return;
    setChecking(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 500,
          system: `You are a tone analyzer for a co-parent communication tool used in custody situations. Analyze the message for tone.

If the message is calm, neutral, and child-focused, respond EXACTLY: TONE: OK

If it contains hostile, aggressive, accusatory, sarcastic, or emotionally charged language, respond:
TONE: WARNING
ISSUE: [brief explanation]
REWRITE: [a calmer, child-focused alternative]

Be strict — courts view these messages.`,
          messages: [{ role: 'user', content: input.trim() }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || '').join('') || '';
      if (text.includes('TONE: WARNING')) {
        const issue = text.match(/ISSUE:\s*(.+)/)?.[1] || 'This message may appear hostile.';
        const rewrite = text.match(/REWRITE:\s*([\s\S]+)/)?.[1]?.trim() || '';
        setToneCheck({ warning: true, issue, rewrite });
      } else {
        await sendMessage(input.trim());
      }
    } catch (err) {
      await sendMessage(input.trim());
    }
    setChecking(false);
  };

  const sendMessage = async (content, despiteWarning = false) => {
    setSending(true);
    const { data } = await supabase.from('coparent_messages').insert({
      conversation_id: conversation.id, sender_id: user.id, content, category,
      sent_despite_warning: despiteWarning,
      ai_tone_warning: toneCheck?.issue || null,
      ai_suggested_rewrite: toneCheck?.rewrite || null,
    }).select().single();
    if (data) setMessages(prev => [...prev, data]);
    setInput(''); setToneCheck(null); setSending(false);
  };

  const useRewrite = () => {
    if (toneCheck?.rewrite) { setInput(toneCheck.rewrite); setToneCheck(null); }
  };

  const exportLog = () => {
    setExporting(true);
    const lines = messages.map(m => {
      const sender = m.sender_id === user.id ? 'You' : (conversation.coparent_name || 'Co-Parent');
      const time = new Date(m.created_at).toLocaleString('en-CA');
      const cat = CATEGORIES.find(c => c.id === m.category);
      return `[${time}] ${sender} (${cat?.label || 'General'}):\n${m.content}\n`;
    });
    const header = `CO-PARENT COMMUNICATION LOG\n${'─'.repeat(50)}\nBetween: You and ${conversation.coparent_name || conversation.coparent_email}\nCase: ${conversation.cases?.name || 'N/A'}\nExported: ${new Date().toLocaleString('en-CA')}\nMessages: ${messages.length}\n${'─'.repeat(50)}\n\n`;
    const blob = new Blob([header + lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `coparent-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    setExporting(false);
  };

  const isMe = (id) => id === user.id;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      {/* Thread Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-lg font-semibold text-red-600">
            {(conversation.coparent_name || 'C')[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{conversation.coparent_name || conversation.coparent_email}</div>
            <div className="text-xs text-gray-500">{messages.length} messages • {conversation.cases?.name || 'Case'}</div>
          </div>
        </div>
        <button onClick={exportLog} disabled={exporting || messages.length === 0}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium disabled:opacity-40">
          {exporting ? '...' : '📄 Export for Court'}
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
        {/* Court Notice */}
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
          <p className="text-xs text-blue-700">🔒 Messages are permanent and timestamped. They cannot be edited or deleted. Keep communication child-focused.</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm font-medium">Start the conversation</p>
              <p className="text-xs mt-1 max-w-xs mx-auto">Keep it calm, factual, and focused on your child. The AI will check your tone before sending.</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${isMe(msg.sender_id) ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[65%]`}>
                {msg.category && msg.category !== 'general' && (
                  <div className={`text-[11px] mb-1.5 ${isMe(msg.sender_id) ? 'text-right' : ''}`}>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {CATEGORIES.find(c => c.id === msg.category)?.icon} {CATEGORIES.find(c => c.id === msg.category)?.label}
                    </span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  isMe(msg.sender_id)
                    ? 'bg-red-600 text-white rounded-br-lg'
                    : 'bg-gray-100 text-gray-800 rounded-bl-lg'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className={`text-[11px] mt-1.5 px-1 ${isMe(msg.sender_id) ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {msg.sent_despite_warning && <span className="ml-1.5 text-amber-500" title="Sent despite AI tone warning">⚠️</span>}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Tone Warning */}
        {toneCheck && (
          <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <div className="font-semibold text-amber-800 text-sm mb-1">Tone Warning</div>
                <p className="text-sm text-amber-700">{toneCheck.issue}</p>
                {toneCheck.rewrite && (
                  <div className="mt-3 bg-white border border-amber-200 rounded-xl p-3">
                    <div className="text-xs text-amber-600 font-medium mb-1.5">Suggested alternative:</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{toneCheck.rewrite}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={useRewrite} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium">
                    ✅ Use Suggestion
                  </button>
                  <button onClick={() => sendMessage(input.trim(), true)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-medium">
                    Send Original
                  </button>
                  <button onClick={() => setToneCheck(null)} className="px-4 py-2 text-gray-500 text-xs">
                    Edit Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          {/* Category Pills */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  category === c.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-200'
                }`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* Input Row */}
          <div className="flex gap-3">
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && checkTone()}
              placeholder="Type a message about your child..."
              disabled={sending || checking}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 disabled:opacity-50" />
            <button onClick={checkTone} disabled={!input.trim() || sending || checking}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors flex-shrink-0">
              {checking ? '🔍' : sending ? '...' : 'Send'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">Messages are checked for tone before sending</p>
        </div>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '💬' },
  { id: 'exchange', label: 'Custody Exchange', icon: '🔄' },
  { id: 'school', label: 'School', icon: '🏫' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'schedule', label: 'Scheduling', icon: '📅' },
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Co-Parent Messenger</h1>
              <p className="text-xs text-gray-500">Secure, documented, court-ready communication</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <div className="w-72 bg-white border border-gray-200 rounded-xl flex-shrink-0 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <button onClick={() => setShowNewConv(true)} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ New Conversation</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  <p>No conversations yet.</p>
                  <p className="text-xs mt-1">Start one with your co-parent.</p>
                </div>
              ) : conversations.map(c => (
                <button key={c.id} onClick={() => setActiveConv(c)}
                  className={`w-full text-left p-3 border-b border-gray-50 transition-colors ${activeConv?.id === c.id ? 'bg-red-50 border-l-2 border-l-red-600' : 'hover:bg-gray-50'}`}>
                  <div className="font-medium text-sm text-gray-900 truncate">{c.coparent_name || c.coparent_email}</div>
                  <div className="text-xs text-gray-400 truncate">{c.cases?.name || 'Case'}</div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 text-center">All messages are timestamped, permanent, and exportable for court use.</p>
            </div>
          </div>

          {/* Main */}
          {activeConv ? (
            <MessageThread conversation={activeConv} user={user} />
          ) : (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl block mb-4">💬</span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Co-Parent Messenger</h2>
                <p className="text-sm text-gray-500 max-w-sm mb-4">Communicate about your child in a calm, documented way. All messages are timestamped and can be exported for court.</p>
                <button onClick={() => setShowNewConv(true)} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Start a Conversation</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewConv(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">New Co-Parent Conversation</h2>
            <p className="text-xs text-gray-500 mb-4">Messages will be secure, timestamped, and court-ready.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Co-parent's name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Their name"
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400" />
            <label className="block text-sm font-medium text-gray-700 mb-1">Co-parent's email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="their@email.com"
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:border-red-400" />
            <label className="block text-sm font-medium text-gray-700 mb-1">Related case</label>
            <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
              className="w-full mb-4 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:outline-none focus:border-red-400">
              <option value="">Select a case...</option>
              {cases.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewConv(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
              <button onClick={createConversation} disabled={!newEmail.trim() || !selectedCase}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">Create</button>
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
function MessageThread({ conversation, user }) {
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
          system: `You are a tone analyzer for a co-parent communication tool used in custody situations. Analyze the following message for tone.

If the message is calm, neutral, and child-focused, respond with EXACTLY:
TONE: OK

If the message contains hostile, aggressive, accusatory, sarcastic, or emotionally charged language, respond with:
TONE: WARNING
ISSUE: [brief explanation of the issue]
REWRITE: [a calmer, child-focused alternative that conveys the same core information]

Be strict — courts view these messages. Even passive-aggressive or sarcastic tones should be flagged.`,
          messages: [{ role: 'user', content: input.trim() }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || '').join('') || '';

      if (text.includes('TONE: WARNING')) {
        const issue = text.match(/ISSUE:\s*(.+)/)?.[1] || 'This message may appear hostile in a legal context.';
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
    const msg = {
      conversation_id: conversation.id, sender_id: user.id, content,
      category, sent_despite_warning: despiteWarning,
      ai_tone_warning: toneCheck?.issue || null,
      ai_suggested_rewrite: toneCheck?.rewrite || null,
    };
    const { data } = await supabase.from('coparent_messages').insert(msg).select().single();
    if (data) setMessages(prev => [...prev, data]);
    setInput(''); setToneCheck(null); setSending(false);
  };

  const useRewrite = () => {
    if (toneCheck?.rewrite) {
      setInput(toneCheck.rewrite);
      setToneCheck(null);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    const lines = messages.map(m => {
      const sender = m.sender_id === user.id ? 'You' : (conversation.coparent_name || 'Co-Parent');
      const time = new Date(m.created_at).toLocaleString('en-CA');
      const cat = CATEGORIES.find(c => c.id === m.category);
      return `[${time}] ${cat?.icon || ''} ${sender} (${cat?.label || 'General'}):\n${m.content}\n`;
    });

    const header = `COMMUNICATION LOG — COURT RECORD\n${'='.repeat(50)}\nCase: ${conversation.cases?.name || 'N/A'}\nBetween: You and ${conversation.coparent_name || conversation.coparent_email}\nExported: ${new Date().toLocaleString('en-CA')}\nTotal Messages: ${messages.length}\n${'='.repeat(50)}\n\n`;

    const blob = new Blob([header + lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coparent-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const isMe = (senderId) => senderId === user.id;

  return (
    <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
      {/* Thread Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900 text-sm">{conversation.coparent_name || conversation.coparent_email}</div>
          <div className="text-xs text-gray-500">{conversation.cases?.name || 'Case'} • {messages.length} messages</div>
        </div>
        <button onClick={exportPDF} disabled={exporting || messages.length === 0}
          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium disabled:opacity-40">
          {exporting ? 'Exporting...' : '📄 Export for Court'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-100 px-4 py-2">
        <p className="text-[11px] text-blue-700">🔒 Messages are permanent, timestamped, and cannot be edited or deleted. Keep communication focused on your child.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <span className="text-3xl block mb-2">💬</span>
            <p className="text-sm">No messages yet. Start the conversation.</p>
            <p className="text-xs mt-1">Keep it calm, focused on your child, and factual.</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${isMe(msg.sender_id) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] ${isMe(msg.sender_id) ? 'order-last' : ''}`}>
              {/* Category badge */}
              {msg.category && msg.category !== 'general' && (
                <div className={`text-[10px] mb-1 ${isMe(msg.sender_id) ? 'text-right' : 'text-left'}`}>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                    {CATEGORIES.find(c => c.id === msg.category)?.icon} {CATEGORIES.find(c => c.id === msg.category)?.label}
                  </span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                isMe(msg.sender_id) ? 'bg-red-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <div className={`text-[10px] mt-1 text-gray-400 ${isMe(msg.sender_id) ? 'text-right' : 'text-left'}`}>
                {new Date(msg.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {msg.sent_despite_warning && <span className="ml-1 text-amber-500" title="Sent despite AI tone warning">⚠️</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Tone Warning */}
      {toneCheck && (
        <div className="mx-4 mb-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="flex-1">
              <div className="font-medium text-amber-800 text-sm">Tone Warning</div>
              <p className="text-xs text-amber-700 mt-0.5">{toneCheck.issue}</p>
              {toneCheck.rewrite && (
                <div className="mt-2 bg-white border border-amber-200 rounded-lg p-2">
                  <div className="text-[10px] text-amber-600 font-medium mb-1">Suggested alternative:</div>
                  <p className="text-xs text-gray-700">{toneCheck.rewrite}</p>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={useRewrite} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium">
                  ✅ Use Suggestion
                </button>
                <button onClick={() => sendMessage(input.trim(), true)} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs">
                  Send Original Anyway
                </button>
                <button onClick={() => setToneCheck(null)} className="px-3 py-1.5 text-gray-500 text-xs">
                  Edit Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white">
        {/* Category selector */}
        <div className="flex gap-1 mb-2 overflow-x-auto">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                category === c.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && checkTone()}
            placeholder="Type a message about your child..."
            disabled={sending || checking}
            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 disabled:opacity-50" />
          <button onClick={checkTone} disabled={!input.trim() || sending || checking}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors">
            {checking ? '🔍...' : sending ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">Messages are checked for tone before sending. Keep communication child-focused.</p>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

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
      <Header />
        <PageTitle title="Co-Parent Messenger" subtitle="Secure, court-ready communication" icon="🤝" />

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
      const response = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are a co-parenting communication coach for Canadian family law. Analyze this message for court-safety. Respond ONLY as valid JSON with no other text: {"score":<0-100>,"rating":"<EXCELLENT|GOOD|CAUTION|WARNING>","tone":<0-100>,"childFocus":<0-100>,"factual":<0-100>,"professional":<0-100>,"issues":["<issue if any>"],"strengths":["<strength if any>"],"rewrite":"<improved version if score<70 else empty>","sendOK":<true if score>=70>}. Tone=calmness, childFocus=child-centred, factual=facts-only, professional=business-like. Flag: threats, ultimatums, guilt-tripping, ALL CAPS, sarcasm, past grievances. Message: "${input.trim().replace(/"/g, '\\"')}"`,
          userId: user.id
        }),
      });
      const data = await response.json();
      try {
        const text = (data.content || '').trim();
        const jsonStr = text.startsWith('{') ? text : (text.match(/\{[\s\S]+\}/)?.[0] || '{}');
        const a = JSON.parse(jsonStr);
        if (a.sendOK) {
          setToneCheck({ ok: true, score: a.score, rating: a.rating, tone: a.tone, childFocus: a.childFocus, factual: a.factual, professional: a.professional, strengths: a.strengths || [], issues: [] });
          if (a.rating === 'EXCELLENT' || a.rating === 'GOOD') await sendMessage(input.trim());
        } else {
          setToneCheck({ warning: true, score: a.score, rating: a.rating, tone: a.tone, childFocus: a.childFocus, factual: a.factual, professional: a.professional, issues: a.issues || [], rewrite: a.rewrite || '', issue: (a.issues || []).join('. ') });
        }
      } catch { await sendMessage(input.trim()); }
    } catch { await sendMessage(input.trim()); }
    setChecking(false);
  };
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const SPECIALTIES = [
  { id: 'custody', label: 'Custody', icon: '👶' },
  { id: 'divorce', label: 'Divorce', icon: '💔' },
  { id: 'support', label: 'Child Support', icon: '💰' },
  { id: 'cps', label: 'CPS/Protection', icon: '🛡️' },
  { id: 'mediation', label: 'Mediation', icon: '🤝' },
  { id: 'self_rep', label: 'Self-Representation', icon: '⚖️' },
  { id: 'high_conflict', label: 'High Conflict', icon: '🔥' },
  { id: 'relocation', label: 'Relocation', icon: '✈️' },
];

const JURISDICTIONS = [
  { id: 'saskatchewan', name: 'Saskatchewan' }, { id: 'alberta', name: 'Alberta' },
  { id: 'ontario', name: 'Ontario' }, { id: 'british_columbia', name: 'British Columbia' },
  { id: 'manitoba', name: 'Manitoba' }, { id: 'quebec', name: 'Quebec' },
  { id: 'nova_scotia', name: 'Nova Scotia' }, { id: 'new_brunswick', name: 'New Brunswick' },
  { id: 'newfoundland', name: 'Newfoundland' }, { id: 'pei', name: 'PEI' },
  { id: 'northwest_territories', name: 'NWT' }, { id: 'yukon', name: 'Yukon' },
  { id: 'nunavut', name: 'Nunavut' },
];

export default function MentorsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('browse'); // browse, apply, conversations, my-profile
  const [mentors, setMentors] = useState([]);
  const [myMentorProfile, setMyMentorProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  // Apply form
  const [applyForm, setApplyForm] = useState({ bio: '', specialty: 'custody', experience: '', jurisdiction_id: '', response_time: 'Within 24 hours' });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: prof } = await supabase.from('users').select('*').eq('id', user.id).single();
      setProfile(prof);
      if (prof?.jurisdiction) setApplyForm(prev => ({ ...prev, jurisdiction_id: prof.jurisdiction }));
      await Promise.all([fetchMentors(), fetchMyMentorProfile(user.id), fetchConversations(user.id)]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchMentors = async () => {
    const { data } = await supabase.from('mentors').select('*, users(full_name)').eq('status', 'approved').eq('is_available', true).order('rating', { ascending: false });
    setMentors(data || []);
  };

  const fetchMyMentorProfile = async (userId) => {
    const { data } = await supabase.from('mentors').select('*').eq('user_id', userId).single();
    if (data) setMyMentorProfile(data);
  };

  const fetchConversations = async (userId) => {
    // Get convos where user is the mentee
    const { data: asUser } = await supabase.from('mentor_conversations').select('*, mentors(*, users(full_name))').eq('user_id', userId).order('last_message_at', { ascending: false });
    // Get convos where user is the mentor
    const { data: myMentor } = await supabase.from('mentors').select('id').eq('user_id', userId).single();
    let asMentor = [];
    if (myMentor) {
      const { data } = await supabase.from('mentor_conversations').select('*, users!mentor_conversations_user_id_fkey(full_name)').eq('mentor_id', myMentor.id).order('last_message_at', { ascending: false });
      asMentor = (data || []).map(c => ({ ...c, _role: 'mentor' }));
    }
    setConversations([...(asUser || []).map(c => ({ ...c, _role: 'mentee' })), ...asMentor].sort((a, b) => new Date(b.last_message_at || b.started_at) - new Date(a.last_message_at || a.started_at)));
  };

  const fetchMessages = async (convoId) => {
    const { data } = await supabase.from('mentor_messages').select('*').eq('conversation_id', convoId).order('created_at');
    setMessages(data || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openConvo = async (convo) => {
    setActiveConvo(convo);
    setTab('conversations');
    await fetchMessages(convo.id);
    // Mark unread messages as read
    await supabase.from('mentor_messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('conversation_id', convo.id).neq('sender_id', user.id).eq('is_read', false);
  };

  const sendMessage = async () => {
    if (!msgInput.trim() || !activeConvo) return;
    await supabase.from('mentor_messages').insert({ conversation_id: activeConvo.id, sender_id: user.id, content: msgInput.trim() });
    await supabase.from('mentor_conversations').update({ last_message_at: new Date().toISOString(), message_count: (activeConvo.message_count || 0) + 1 }).eq('id', activeConvo.id);
    setMsgInput('');
    await fetchMessages(activeConvo.id);
  };

  const startConvo = async (mentor) => {
    // Check if convo already exists
    const { data: existing } = await supabase.from('mentor_conversations').select('*').eq('user_id', user.id).eq('mentor_id', mentor.id).single();
    if (existing) { openConvo(existing); return; }
    const { data: newConvo } = await supabase.from('mentor_conversations').insert({ mentor_id: mentor.id, user_id: user.id, is_active: true, message_count: 0 }).select().single();
    if (newConvo) {
      await fetchConversations(user.id);
      openConvo(newConvo);
    }
  };

  const submitApplication = async () => {
    if (!applyForm.bio.trim() || !applyForm.experience.trim()) return;
    setApplying(true);
    const { error } = await supabase.from('mentors').insert({
      user_id: user.id, bio: applyForm.bio.trim(), specialty: applyForm.specialty,
      experience: applyForm.experience.trim(), jurisdiction_id: applyForm.jurisdiction_id,
      response_time: applyForm.response_time, status: 'approved', is_available: true,
      rating: 5.0, review_count: 0, total_sessions: 0,
    });
    if (!error) {
      await fetchMyMentorProfile(user.id);
      await fetchMentors();
      setTab('browse');
    }
    setApplying(false);
  };

  const toggleAvailability = async () => {
    if (!myMentorProfile) return;
    await supabase.from('mentors').update({ is_available: !myMentorProfile.is_available }).eq('id', myMentorProfile.id);
    setMyMentorProfile(prev => ({ ...prev, is_available: !prev.is_available }));
  };

  const filtered = filter === 'all' ? mentors : mentors.filter(m => m.specialty === filter);
  const getSpecLabel = (id) => SPECIALTIES.find(s => s.id === id);
  const getJurisName = (id) => JURISDICTIONS.find(j => j.id === id)?.name || id;
  const timeAgo = (d) => { if (!d) return ''; const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'just now'; const m = Math.floor(s/60); if (m < 60) return `${m}m`; const h = Math.floor(m/60); if (h < 24) return `${h}h`; return `${Math.floor(h/24)}d`; };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <PageTitle title="Mentors" subtitle="Connect with parents who've been through it" icon="🧭" />

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-xl p-1">
          {[
            { id: 'browse', label: 'Find Mentors' },
            { id: 'conversations', label: `Messages${conversations.length > 0 ? ` (${conversations.length})` : ''}` },
            { id: 'apply', label: myMentorProfile ? 'My Mentor Profile' : 'Become a Mentor' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setActiveConvo(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
          ))}
        </div>

        {/* BROWSE TAB */}
        {tab === 'browse' && (
          <>
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>All</button>
              {SPECIALTIES.map(s => (
                <button key={s.id} onClick={() => setFilter(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{s.icon} {s.label}</button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <span className="text-4xl block mb-3">🧭</span>
                <h3 className="font-bold text-gray-900 mb-2">No mentors yet</h3>
                <p className="text-sm text-gray-500 mb-4">Be the first to help other parents by becoming a mentor.</p>
                <button onClick={() => setTab('apply')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">Become a Mentor</button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(mentor => {
                  const spec = getSpecLabel(mentor.specialty);
                  const name = mentor.users?.full_name || 'Mentor';
                  return (
                    <div key={mentor.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">{name[0].toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                            {mentor.is_available && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            {spec && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium">{spec.icon} {spec.label}</span>}
                            <span>{getJurisName(mentor.jurisdiction_id)}</span>
                            <span>·</span>
                            <span>⭐ {mentor.rating?.toFixed(1) || '5.0'} ({mentor.review_count || 0})</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{mentor.bio}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <span>⏱ {mentor.response_time || 'Within 24 hours'}</span>
                            <span>·</span>
                            <span>{mentor.total_sessions || 0} sessions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => startConvo(mentor)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Message</button>
                        <button onClick={() => { /* view full profile */ }} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm">View</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CONVERSATIONS TAB */}
        {tab === 'conversations' && !activeConvo && (
          <>
            {conversations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <span className="text-4xl block mb-3">💬</span>
                <p className="text-sm text-gray-500 mb-4">No conversations yet. Find a mentor and start chatting!</p>
                <button onClick={() => setTab('browse')} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">Find Mentors</button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map(c => {
                  const otherName = c._role === 'mentee' ? (c.mentors?.users?.full_name || 'Mentor') : (c.users?.full_name || 'User');
                  return (
                    <button key={c.id} onClick={() => openConvo(c)}
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-red-300 transition-colors text-left">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{otherName[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-gray-900">{otherName}</span>
                          <span className="text-[10px] text-gray-400">{timeAgo(c.last_message_at || c.started_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 truncate">{c.message_count || 0} messages</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${c._role === 'mentor' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {c._role === 'mentor' ? 'Mentoring' : 'Mentee'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ACTIVE CONVERSATION */}
        {tab === 'conversations' && activeConvo && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setActiveConvo(null)} className="text-gray-400 hover:text-gray-600">← </button>
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(activeConvo._role === 'mentee' ? (activeConvo.mentors?.users?.full_name || 'M') : (activeConvo.users?.full_name || 'U'))[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  {activeConvo._role === 'mentee' ? (activeConvo.mentors?.users?.full_name || 'Mentor') : (activeConvo.users?.full_name || 'User')}
                </div>
                <div className="text-[10px] text-gray-400">{activeConvo._role === 'mentee' ? 'Your mentor' : 'Your mentee'}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ height: 'calc(100% - 120px)' }}>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">👋</span>
                  <p className="text-sm text-gray-500">Start the conversation! Introduce yourself and share what you need help with.</p>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-red-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMe && msg.is_read && ' · Read'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-400" />
                <button onClick={sendMessage} disabled={!msgInput.trim()}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center disabled:opacity-30">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPLY / MY PROFILE TAB */}
        {tab === 'apply' && !myMentorProfile && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-center mb-6">
              <span className="text-4xl block mb-3">🧭</span>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Become a Mentor</h3>
              <p className="text-sm text-gray-500">Share your experience to help other parents navigate their custody journey. Mentoring is voluntary and free.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Your Specialty *</label>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIALTIES.map(s => (
                    <button key={s.id} onClick={() => setApplyForm(prev => ({ ...prev, specialty: s.id }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${applyForm.specialty === s.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.icon} {s.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Province *</label>
                <select value={applyForm.jurisdiction_id} onChange={e => setApplyForm(prev => ({ ...prev, jurisdiction_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400">
                  <option value="">Select province...</option>
                  {JURISDICTIONS.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">About You *</label>
                <textarea value={applyForm.bio} onChange={e => setApplyForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell other parents about yourself and why you want to help. What did you go through? What did you learn?"
                  rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Your Experience *</label>
                <textarea value={applyForm.experience} onChange={e => setApplyForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your custody experience. How long did your case take? What was the outcome? What do you wish you'd known?"
                  rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Response Time</label>
                <div className="flex gap-2">
                  {['Within a few hours', 'Within 24 hours', 'Within 48 hours'].map(t => (
                    <button key={t} onClick={() => setApplyForm(prev => ({ ...prev, response_time: t }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${applyForm.response_time === t ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <strong>Important:</strong> Mentors share personal experience, not legal advice. You are not a lawyer and should not provide legal counsel. Always encourage mentees to consult a professional for legal questions.
              </div>

              <button onClick={submitApplication} disabled={!applyForm.bio.trim() || !applyForm.experience.trim() || !applyForm.jurisdiction_id || applying}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}

        {/* MY MENTOR PROFILE */}
        {tab === 'apply' && myMentorProfile && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Your Mentor Profile</h3>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${myMentorProfile.is_available ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <button onClick={toggleAvailability} className={`text-xs font-medium ${myMentorProfile.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                    {myMentorProfile.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">⭐ {myMentorProfile.rating?.toFixed(1) || '5.0'}</div>
                  <div className="text-[10px] text-gray-500">Rating</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">{myMentorProfile.review_count || 0}</div>
                  <div className="text-[10px] text-gray-500">Reviews</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">{myMentorProfile.total_sessions || 0}</div>
                  <div className="text-[10px] text-gray-500">Sessions</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Specialty</span>
                  <span className="text-gray-900 font-medium">{getSpecLabel(myMentorProfile.specialty)?.label || myMentorProfile.specialty}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Province</span>
                  <span className="text-gray-900 font-medium">{getJurisName(myMentorProfile.jurisdiction_id)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Response Time</span>
                  <span className="text-gray-900 font-medium">{myMentorProfile.response_time}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${myMentorProfile.status === 'approved' ? 'text-green-600' : 'text-amber-600'}`}>{myMentorProfile.status === 'approved' ? '✓ Approved' : 'Pending'}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-1">Your Bio</div>
                <p className="text-sm text-gray-700">{myMentorProfile.bio}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

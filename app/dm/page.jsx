'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

export default function DMPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get('with');
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(withUserId);
  const [activeUserName, setActiveUserName] = useState('');
  const [activeUserMentor, setActiveUserMentor] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await fetchConversations(user.id);
      if (withUserId) {
        const { data: u } = await supabase.from('users').select('full_name, is_mentor').eq('id', withUserId).single();
        if (u) { setActiveUserName(u.full_name || 'User'); setActiveUserMentor(u.is_mentor); }
        await fetchMessages(user.id, withUserId);
      }
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const sub = supabase.channel('dm-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new;
          if ((msg.sender_id === user.id || msg.receiver_id === user.id) &&
              (msg.sender_id === activeUserId || msg.receiver_id === activeUserId)) {
            setMessages(prev => [...prev, msg]);
          }
          fetchConversations(user.id);
        })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [user, activeUserId]);

  const fetchConversations = async (myId) => {
    // Get all unique users I've messaged with
    const { data: sent } = await supabase.from('direct_messages').select('receiver_id, content, created_at, is_read').eq('sender_id', myId).order('created_at', { ascending: false });
    const { data: received } = await supabase.from('direct_messages').select('sender_id, content, created_at, is_read').eq('receiver_id', myId).order('created_at', { ascending: false });

    const userMap = {};
    (sent || []).forEach(m => {
      if (!userMap[m.receiver_id] || new Date(m.created_at) > new Date(userMap[m.receiver_id].last_at)) {
        userMap[m.receiver_id] = { userId: m.receiver_id, lastMsg: m.content, last_at: m.created_at, unread: 0 };
      }
    });
    (received || []).forEach(m => {
      if (!userMap[m.sender_id] || new Date(m.created_at) > new Date(userMap[m.sender_id].last_at)) {
        userMap[m.sender_id] = { userId: m.sender_id, lastMsg: m.content, last_at: m.created_at, unread: 0 };
      }
      if (!m.is_read) userMap[m.sender_id] = { ...userMap[m.sender_id], unread: (userMap[m.sender_id]?.unread || 0) + 1 };
    });

    // Fetch user names
    const ids = Object.keys(userMap);
    if (ids.length > 0) {
      const { data: users } = await supabase.from('users').select('id, full_name, is_mentor').in('id', ids);
      (users || []).forEach(u => { if (userMap[u.id]) { userMap[u.id].name = u.full_name; userMap[u.id].is_mentor = u.is_mentor; } });
    }

    setConversations(Object.values(userMap).sort((a, b) => new Date(b.last_at) - new Date(a.last_at)));
  };

  const fetchMessages = async (myId, otherId) => {
    const { data } = await supabase.from('direct_messages').select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`)
      .order('created_at').limit(200);
    setMessages(data || []);
    // Mark as read
    await supabase.from('direct_messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('sender_id', otherId).eq('receiver_id', myId).eq('is_read', false);
  };

  const openConvo = async (c) => {
    setActiveUserId(c.userId);
    setActiveUserName(c.name || 'User');
    setActiveUserMentor(c.is_mentor);
    await fetchMessages(user.id, c.userId);
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeUserId || sending) return;
    setSending(true);
    await supabase.from('direct_messages').insert({ sender_id: user.id, receiver_id: activeUserId, content: input.trim() });
    setInput('');
    await fetchMessages(user.id, activeUserId);
    setSending(false);
  };

  const timeAgo = (d) => { const s = Math.floor((Date.now() - new Date(d)) / 1000); if (s < 60) return 'now'; const m = Math.floor(s/60); if (m < 60) return `${m}m`; const h = Math.floor(m/60); if (h < 24) return `${h}h`; return `${Math.floor(h/24)}d`; };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;

  // Chat thread view
  if (activeUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Thread header */}
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
            <button onClick={() => { setActiveUserId(null); fetchConversations(user.id); }} className="text-gray-400 hover:text-gray-600">←</button>
            <Link href={`/user?id=${activeUserId}`} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{(activeUserName || 'U')[0].toUpperCase()}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-gray-900">{activeUserName}</span>
                  {activeUserMentor && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">MENTOR</span>}
                </div>
                <span className="text-[10px] text-gray-400">Tap to view profile</span>
              </div>
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.length === 0 && (
              <div className="text-center py-12"><span className="text-3xl block mb-2">💬</span><p className="text-sm text-gray-400">Start the conversation</p></div>
            )}
            {messages.map(msg => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-red-600 text-white rounded-br-md' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'}`}>
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
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-400" />
              <button onClick={sendMessage} disabled={!input.trim() || sending}
                className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center disabled:opacity-30">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Inbox view
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <PageTitle title="Messages" subtitle="Private conversations" icon="✉️" />
      <main className="max-w-lg mx-auto px-4 py-4">
        {conversations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-3">✉️</span>
            <h3 className="font-bold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Visit someone's profile in the community to start a private conversation.</p>
            <Link href="/community" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">Go to Community</Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map(c => (
              <button key={c.userId} onClick={() => openConvo(c)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-red-300 transition-colors text-left">
                <div className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{(c.name || 'U')[0].toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-gray-900">{c.name || 'User'}</span>
                      {c.is_mentor && <span className="px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold">MENTOR</span>}
                    </div>
                    <span className="text-[10px] text-gray-400">{timeAgo(c.last_at)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{c.lastMsg}</p>
                    {c.unread > 0 && <span className="w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

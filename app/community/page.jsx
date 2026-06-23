'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const CATEGORIES = {
  legal: { label: 'LEGAL & CASE HELP', icon: '⚖️' },
  support: { label: 'SUPPORT GROUPS', icon: '💚' },
  hobbies: { label: 'INTERESTS', icon: '🎮' },
};

const CHANNEL_ICONS = {
  'sk-parents': '🌾', 'ab-parents': '🏔️', 'on-parents': '🍁', 'bc-parents': '🌊',
  'high-conflict': '🔥', 'mental-health': '🧠', 'dads-corner': '👨', 'moms-circle': '👩',
  'gaming': '🎮', 'outdoors': '🏕️', 'books': '📚',
};

const WEEKLY_PROMPTS = [
  { emoji: '💬', text: "What's one thing you wish you knew before your first court date?" },
  { emoji: '🏆', text: "Share a small win from this week — no win is too small." },
  { emoji: '📚', text: "What resource (book, video, website) helped you most?" },
  { emoji: '🧠', text: "How do you handle stress during the custody process?" },
  { emoji: '💡', text: "What's the best advice you've received from another parent?" },
];

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState('posts');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users').select('full_name, avatar_url, jurisdiction').eq('id', user.id).single();
      setUserProfile(profile);
      const { data: ch } = await supabase.from('channels').select('*').order('display_order');
      setChannels(ch || []);
      if (ch?.length) setActiveChannel(ch[0]);
      setLoading(false);
    };
    init();
  }, []);

  const channelsByCategory = channels.reduce((acc, c) => {
    const cat = c.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  const weeklyPrompt = WEEKLY_PROMPTS[new Date().getDay() % WEEKLY_PROMPTS.length];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-gray-50 overflow-hidden">

      {/* Server Icon Rail */}
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-2 flex-shrink-0 hidden sm:flex">
        <Link href="/dashboard" className="w-12 h-12 bg-red-600 rounded-2xl hover:rounded-xl transition-all flex items-center justify-center" title="Dashboard">
          <span className="text-white font-bold text-lg">F</span>
        </Link>
        <div className="w-8 h-0.5 bg-gray-200 rounded-full my-1" />
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => {
            const first = channelsByCategory[key]?.[0];
            if (first) { setActiveChannel(first); setShowSidebar(true); }
          }}
            className="w-12 h-12 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-2xl hover:rounded-xl hover:border-red-200 transition-all flex items-center justify-center" title={cat.label}>
            <span className="text-xl">{cat.icon}</span>
          </button>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <Link href="/coparent" className="w-12 h-12 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-2xl hover:rounded-xl transition-all flex items-center justify-center" title="Co-Parent Chat">
            <span className="text-xl">🤝</span>
          </Link>
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-60 bg-white border-r border-gray-200 flex-col flex-shrink-0`}>
        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">🏠 Foresight Community</h2>
        </div>

        {/* Weekly Prompt Banner */}
        <div className="mx-2 mt-2 mb-1 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-xl p-2.5">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1">📅 This Week's Prompt</div>
          <p className="text-[11px] text-gray-700 leading-snug">{weeklyPrompt.emoji} {weeklyPrompt.text}</p>
          <button onClick={() => setView('posts')} className="mt-1.5 text-[10px] font-semibold text-red-600 hover:underline">Reply in Posts →</button>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {Object.entries(channelsByCategory).map(([catKey, catChannels]) => (
            <div key={catKey}>
              <div className="px-1 mb-1 flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{CATEGORIES[catKey]?.icon} {CATEGORIES[catKey]?.label || catKey}</span>
              </div>
              {catChannels.map(ch => {
                const icon = CHANNEL_ICONS[ch.name.toLowerCase().replace(/\s+/g, '-')] || '#';
                const isActive = activeChannel?.id === ch.id;
                return (
                  <button key={ch.id} onClick={() => { setActiveChannel(ch); setShowSidebar(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
                    <span className={`text-sm truncate font-medium ${isActive ? 'text-white' : ''}`}>{ch.name.toLowerCase().replace(/\s+/g, '-')}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Panel */}
        <div className="h-[52px] bg-gray-50 border-t border-gray-100 px-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(userProfile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 font-semibold truncate">{userProfile?.full_name || 'User'}</div>
            <div className="text-[10px] text-green-500 font-medium">● Online</div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 px-4 flex items-center gap-3 border-b border-gray-200 bg-white flex-shrink-0 shadow-sm">
          <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden text-gray-600 hover:text-red-600 text-lg">☰</button>
          <span className="text-xl">{CHANNEL_ICONS[activeChannel?.name?.toLowerCase().replace(/\s+/g, '-')] || '💬'}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">{activeChannel?.name || 'Select a channel'}</h3>
          </div>
          <div className="hidden sm:block text-xs text-gray-400 max-w-[180px] truncate">{activeChannel?.description}</div>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {[
              { id: 'posts', label: '📝 Posts' },
              { id: 'chat', label: '💬 Chat' },
              { id: 'mentors', label: '🤝 Mentors' },
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === t.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {view === 'chat' && activeChannel && <ChatView channel={activeChannel} user={user} userProfile={userProfile} />}
        {view === 'posts' && activeChannel && <PostsView channel={activeChannel} user={user} userProfile={userProfile} weeklyPrompt={weeklyPrompt} />}
        {view === 'mentors' && <MentorsView user={user} userProfile={userProfile} />}
      </div>
    </div>
  );
}

/* ============================================ */
/* CHAT VIEW */
/* ============================================ */
function ChatView({ channel, user, userProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const endRef = useRef(null);

  const QUICK_EMOJIS = ['❤️','👍','😂','😢','🙏','💪','🔥','👏','✅','💯'];

  useEffect(() => { fetchMessages(); }, [channel.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const sub = supabase.channel(`chat-${channel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${channel.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channel.id]);

  useEffect(() => {
    const names = [...new Set(messages.map(m => m.user_name).filter(Boolean))];
    setChatUsers(names);
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').eq('channel_id', channel.id).order('created_at', { ascending: true }).limit(100);
    setMessages(data || []);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt === val.length - 1 || (lastAt !== -1 && !val.substring(lastAt).includes(' '))) {
      setMentionFilter(val.substring(lastAt + 1).toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name) => {
    const lastAt = input.lastIndexOf('@');
    setInput(input.substring(0, lastAt) + `@${name} `);
    setShowMentions(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      channel_id: channel.id, user_id: user.id, content: input.trim(),
      user_name: userProfile?.full_name || user.email?.split('@')[0] || 'User',
    });
    setInput('');
    setSending(false);
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  const [mentorIds, setMentorIds] = useState(new Set());
  useEffect(() => {
    const ids = [...new Set(messages.map(m => m.user_id).filter(Boolean))];
    if (ids.length > 0) {
      supabase.from('users').select('id, is_mentor').in('id', ids).eq('is_mentor', true)
        .then(({ data }) => setMentorIds(new Set((data || []).map(u => u.id))));
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center text-4xl mb-4 border-2 border-red-100">
              {CHANNEL_ICONS[channel.name.toLowerCase().replace(/\s+/g, '-')] || '💬'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to #{channel.name.toLowerCase().replace(/\s+/g, '-')}</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-4">{channel.description || 'Be the first to say something!'}</p>
            <div className="flex gap-2">
              {['👋 Say hi', '❓ Ask a question', '💡 Share a tip'].map(s => (
                <button key={s} onClick={() => setInput(s.split(' ').slice(1).join(' '))}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-400 font-semibold bg-white px-2">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const sameAuthor = prevMsg?.user_id === msg.user_id;
              const timeDiff = prevMsg ? (new Date(msg.created_at) - new Date(prevMsg.created_at)) / 60000 : 999;
              const compact = sameAuthor && timeDiff < 5;
              const isMentor = mentorIds.has(msg.user_id);
              return (
                <div key={msg.id} className={`flex gap-3 px-2 py-0.5 hover:bg-gray-50 rounded-lg group ${compact ? '' : 'mt-3'}`}>
                  {compact ? (
                    <div className="w-9 flex-shrink-0 flex items-center justify-center">
                      <span className="text-[10px] text-gray-400 hidden group-hover:inline">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                      style={{ backgroundColor: stringToColor(msg.user_name || msg.user_id) }}>
                      {(msg.user_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!compact && (
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm" style={{ color: stringToColor(msg.user_name || msg.user_id) }}>{msg.user_name || 'User'}</span>
                        {isMentor && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">⭐ MENTOR</span>}
                        <span className="text-[11px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    <p className="text-gray-800 text-sm leading-relaxed break-words">
                      {msg.content.split(/(@\w[\w\s.]*?)(?=\s|$)/g).map((part, i) =>
                        part.startsWith('@') ? <span key={i} className="bg-blue-100 text-blue-700 rounded px-1 font-medium">{part}</span> : part
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0 relative">
        {showMentions && chatUsers.filter(n => n.toLowerCase().includes(mentionFilter)).length > 0 && (
          <div className="absolute bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
            {chatUsers.filter(n => n.toLowerCase().includes(mentionFilter)).slice(0, 5).map(name => (
              <button key={name} onClick={() => insertMention(name)}
                className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: stringToColor(name) }}>
                  {name[0].toUpperCase()}
                </div>
                <span className="text-gray-900">{name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-2xl flex items-center gap-1 px-2 shadow-sm">
          <button onClick={() => setShowEmojiPicker(v => !v)} className="p-2 text-gray-400 hover:text-gray-600 text-lg">😊</button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-20 flex flex-wrap gap-2 w-64">
              {QUICK_EMOJIS.map(e => (
                <button key={e} onClick={() => { setInput(i => i + e); setShowEmojiPicker(false); }}
                  className="text-2xl hover:scale-125 transition-transform">{e}</button>
              ))}
            </div>
          )}
          <input type="text" value={input} onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && !showMentions) sendMessage(); }}
            placeholder={`Message #${channel.name.toLowerCase().replace(/\s+/g, '-')} — type @ to mention`}
            className="flex-1 bg-transparent py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* POSTS VIEW */
/* ============================================ */
function PostsView({ channel, user, userProfile, weeklyPrompt }) {
  const [posts, setPosts] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('discussion');
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const [myLikes, setMyLikes] = useState(new Set());
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchPosts(); fetchMyLikes(); }, [channel.id]);

  const fetchPosts = async () => {
    const { data } = await supabase.from('community_posts').select('*, users(full_name)')
      .eq('channel_id', channel.id).order('created_at', { ascending: false }).limit(50);
    setPosts(data || []);
  };

  const fetchMyLikes = async () => {
    const { data } = await supabase.from('post_user_likes').select('post_id').eq('user_id', user.id);
    setMyLikes(new Set((data || []).map(l => l.post_id)));
  };

  const fetchComments = async (postId) => {
    const { data } = await supabase.from('post_comments').select('*, users(full_name)').eq('post_id', postId).order('created_at');
    setComments(prev => ({ ...prev, [postId]: data || [] }));
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim() || posting) return;
    setPosting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Your session has expired. Please refresh the page and try again.");
      setPosting(false);
      return;
    }
    const { error } = await supabase.from("community_posts").insert({
      channel_id: channel.id, user_id: session.user.id,
      title: newTitle.trim(), content: newContent.trim(), post_type: newType,
      like_count: 0, comment_count: 0,
    });
    if (error) { console.error("Post error:", error); alert("Could not create post: " + error.message); }
    else { setNewTitle(""); setNewContent(""); setShowNew(false); setNewType("discussion"); }
    await fetchPosts();
    setPosting(false);
  };

  const toggleLike = async (postId) => {
    const liked = myLikes.has(postId);
    if (liked) {
      await supabase.from('post_user_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      await supabase.from('community_posts').update({ like_count: Math.max(0, (posts.find(p => p.id === postId)?.like_count || 1) - 1) }).eq('id', postId);
      setMyLikes(prev => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: Math.max(0, (p.like_count || 1) - 1) } : p));
    } else {
      await supabase.from('post_user_likes').insert({ user_id: user.id, post_id: postId });
      await supabase.from('community_posts').update({ like_count: (posts.find(p => p.id === postId)?.like_count || 0) + 1 }).eq('id', postId);
      setMyLikes(prev => new Set([...prev, postId]));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: (p.like_count || 0) + 1 } : p));
    }
  };

  const addComment = async (postId) => {
    if (!commentText.trim()) return;
    await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() });
    await supabase.from('community_posts').update({ comment_count: (posts.find(p => p.id === postId)?.comment_count || 0) + 1 }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
    setCommentText('');
    await fetchComments(postId);
  };

  const deleteComment = async (commentId, postId) => {
    await supabase.from('post_comments').delete().eq('id', commentId);
    await supabase.from('community_posts').update({ comment_count: Math.max(0, (posts.find(p => p.id === postId)?.comment_count || 1) - 1) }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) } : p));
    await fetchComments(postId);
  };

  const toggleExpand = async (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    if (!comments[postId]) await fetchComments(postId);
  };

  const typeConfig = {
    discussion: { label: 'Discussion', color: 'bg-gray-100 text-gray-700', badge: 'bg-gray-200 text-gray-700', icon: '💬' },
    question:   { label: 'Question',   color: 'bg-blue-50 text-blue-700',  badge: 'bg-blue-100 text-blue-700',  icon: '❓' },
    success_story: { label: 'Win 🎉',  color: 'bg-green-50 text-green-700', badge: 'bg-green-100 text-green-700', icon: '🏆' },
    resource:   { label: 'Resource',   color: 'bg-amber-50 text-amber-700', badge: 'bg-amber-100 text-amber-700', icon: '📎' },
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  const filteredPosts = filter === 'all' ? posts : posts.filter(p => p.post_type === filter);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Composer */}
      <div className="bg-white border-b border-gray-100 p-4">
        {!showNew ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
              style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
              {(userProfile?.full_name || 'U')[0].toUpperCase()}
            </div>
            <button onClick={() => setShowNew(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-2xl px-4 py-2.5 text-left text-sm text-gray-400 transition-colors font-medium">
              ✍️ Share something with the community...
            </button>
            <div className="hidden sm:flex gap-1.5">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => { setNewType(key); setShowNew(true); }}
                  className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 transition-colors whitespace-nowrap">
                  {cfg.icon}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm mt-0.5"
                style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
                {(userProfile?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-gray-900 mb-1.5">{userProfile?.full_name || 'You'}</div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewType(key)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${newType === key ? cfg.badge + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Give your post a title..."
                  className="w-full px-0 py-1 text-base font-bold text-gray-900 placeholder-gray-300 focus:outline-none border-b border-gray-100 mb-2" />
                <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share your thoughts, ask a question, or celebrate a win..."
                  rows={4} className="w-full px-0 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none leading-relaxed" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button onClick={() => { setShowNew(false); setNewTitle(''); setNewContent(''); }} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              <button onClick={createPost} disabled={!newTitle.trim() || !newContent.trim() || posting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold disabled:opacity-40 transition-colors">
                {posting ? '⏳ Posting...' : '🚀 Post'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Prompt Card */}
      {posts.length === 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="text-xs font-bold uppercase tracking-wider text-red-200 mb-2">📅 This Week's Prompt</div>
          <p className="text-lg font-bold mb-3">{weeklyPrompt.emoji} {weeklyPrompt.text}</p>
          <button onClick={() => { setShowNew(true); setNewType('discussion'); setNewTitle(weeklyPrompt.text); }}
            className="px-5 py-2 bg-white text-red-600 rounded-full text-sm font-bold hover:bg-red-50 transition-colors">
            Answer this prompt →
          </button>
        </div>
      )}

      {/* Filter bar */}
      {posts.length > 0 && (
        <div className="flex gap-2 px-4 py-3 border-b border-gray-100 bg-white overflow-x-auto">
          {[['all', '🗂️ All'], ['discussion', '💬 Discussion'], ['question', '❓ Questions'], ['success_story', '🏆 Wins'], ['resource', '📎 Resources']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filter === key ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="bg-gray-50 min-h-full">
        {filteredPosts.length === 0 && posts.length === 0 ? null : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><p className="text-sm">No {filter} posts yet.</p></div>
        ) : (
          <div className="space-y-3 p-3 sm:p-4 max-w-2xl mx-auto">
            {filteredPosts.map(post => {
              const cfg = typeConfig[post.post_type] || typeConfig.discussion;
              const name = post.users?.full_name || 'User';
              const isExpanded = expandedPost === post.id;
              const liked = myLikes.has(post.id);
              const postComments = comments[post.id] || [];

              return (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:border-gray-200 transition-all">
                  {/* Post type accent bar */}
                  <div className={`h-1 w-full ${post.post_type === 'success_story' ? 'bg-green-400' : post.post_type === 'question' ? 'bg-blue-400' : post.post_type === 'resource' ? 'bg-amber-400' : 'bg-gray-200'}`} />
                  <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                      style={{ backgroundColor: stringToColor(name) }}>{name[0].toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">{name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{timeAgo(post.created_at)}</div>
                    </div>
                    {post.user_id === user.id && (
                      <button onClick={async () => { if (confirm('Delete this post?')) { await supabase.from('community_posts').delete().eq('id', post.id); await fetchPosts(); } }}
                        className="text-gray-200 hover:text-red-400 text-sm p-1 transition-colors">✕</button>
                    )}
                  </div>
                  <div className="px-4 pb-3">
                    <h4 className="font-bold text-gray-900 text-[15px] mb-1.5 leading-snug">{post.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {(post.like_count > 0 || post.comment_count > 0) && (
                    <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        {post.like_count > 0 && <span>❤️ {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}</span>}
                      </div>
                      {post.comment_count > 0 && <button onClick={() => toggleExpand(post.id)} className="hover:text-gray-600 hover:underline">{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</button>}
                    </div>
                  )}
                  <div className="border-t border-gray-50 flex">
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold transition-all ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-red-50'}`}>
                      {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
                    </button>
                    <button onClick={() => toggleExpand(post.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                      💬 Comment
                    </button>
                    <button onClick={() => { navigator.clipboard?.writeText(post.title); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                      🔗 Share
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-gray-50 bg-gray-50">
                      {postComments.length > 0 && (
                        <div className="px-4 pt-3 space-y-3">
                          {postComments.map(c => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]"
                                style={{ backgroundColor: stringToColor(c.users?.full_name || 'U') }}>
                                {(c.users?.full_name || 'U')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-gray-100">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-bold text-gray-900">{c.users?.full_name || 'User'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                                    {c.user_id === user.id && (
                                      <button onClick={() => deleteComment(c.id, post.id)} className="text-[10px] text-gray-300 hover:text-red-500">✕</button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="px-4 py-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]"
                          style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
                          {(userProfile?.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-red-300" />
                        <button onClick={() => addComment(post.id)} disabled={!commentText.trim()}
                          className="text-red-600 text-sm font-bold disabled:opacity-30 hover:text-red-700">Post</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* MENTORS VIEW */
/* ============================================ */
const SPECIALTIES = [
  { id: 'custody', label: 'Custody', icon: '👶' }, { id: 'divorce', label: 'Divorce', icon: '💔' },
  { id: 'support', label: 'Child Support', icon: '💰' }, { id: 'cps', label: 'CPS', icon: '🛡️' },
  { id: 'mediation', label: 'Mediation', icon: '🤝' }, { id: 'self_rep', label: 'Self-Rep', icon: '⚖️' },
  { id: 'high_conflict', label: 'High Conflict', icon: '🔥' }, { id: 'relocation', label: 'Relocation', icon: '✈️' },
];
const JURIS_NAMES = { saskatchewan: 'SK', alberta: 'AB', ontario: 'ON', british_columbia: 'BC', manitoba: 'MB', quebec: 'QC', nova_scotia: 'NS', new_brunswick: 'NB', newfoundland: 'NL', pei: 'PEI', northwest_territories: 'NWT', yukon: 'YK', nunavut: 'NU' };

function MentorsView({ user, userProfile }) {
  const [mentors, setMentors] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [subTab, setSubTab] = useState('browse');
  const [filter, setFilter] = useState('all');
  const [convos, setConvos] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [applyForm, setApplyForm] = useState({ bio: '', specialty: 'custody', experience: '', jurisdiction_id: userProfile?.jurisdiction || '', response_time: 'Within 24 hours' });
  const [applying, setApplying] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data: m } = await supabase.from('mentors').select('*, users(full_name)').eq('status', 'approved').eq('is_available', true).order('rating', { ascending: false });
    setMentors(m || []);
    const { data: mp } = await supabase.from('mentors').select('*').eq('user_id', user.id).single();
    if (mp) setMyProfile(mp);
    const { data: asUser } = await supabase.from('mentor_conversations').select('*, mentors(*, users(full_name))').eq('user_id', user.id);
    let asMentor = [];
    if (mp) {
      const { data } = await supabase.from('mentor_conversations').select('*, users!mentor_conversations_user_id_fkey(full_name)').eq('mentor_id', mp.id);
      asMentor = (data || []).map(c => ({ ...c, _role: 'mentor' }));
    }
    setConvos([...(asUser || []).map(c => ({ ...c, _role: 'mentee' })), ...asMentor].sort((a, b) => new Date(b.last_message_at || b.started_at) - new Date(a.last_message_at || a.started_at)));
  };

  const startConvo = async (mentor) => {
    const { data: existing } = await supabase.from('mentor_conversations').select('*').eq('user_id', user.id).eq('mentor_id', mentor.id).single();
    if (existing) { openConvo(existing); return; }
    const { data: nc } = await supabase.from('mentor_conversations').insert({ mentor_id: mentor.id, user_id: user.id, is_active: true, message_count: 0 }).select().single();
    if (nc) { await fetchAll(); openConvo(nc); }
  };

  const openConvo = async (c) => {
    setActiveConvo(c); setSubTab('chat');
    const { data } = await supabase.from('mentor_messages').select('*').eq('conversation_id', c.id).order('created_at');
    setMessages(data || []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMsg = async () => {
    if (!msgInput.trim() || !activeConvo) return;
    await supabase.from('mentor_messages').insert({ conversation_id: activeConvo.id, sender_id: user.id, content: msgInput.trim() });
    await supabase.from('mentor_conversations').update({ last_message_at: new Date().toISOString(), message_count: (activeConvo.message_count || 0) + 1 }).eq('id', activeConvo.id);
    setMsgInput('');
    const { data } = await supabase.from('mentor_messages').select('*').eq('conversation_id', activeConvo.id).order('created_at');
    setMessages(data || []);
  };

  const submitApp = async () => {
    if (!applyForm.bio.trim() || !applyForm.experience.trim() || !applyForm.jurisdiction_id) return;
    setApplying(true);
    await supabase.from('mentors').insert({ user_id: user.id, bio: applyForm.bio.trim(), specialty: applyForm.specialty, experience: applyForm.experience.trim(), jurisdiction_id: applyForm.jurisdiction_id, response_time: applyForm.response_time, status: 'approved', is_available: true, rating: 5.0, review_count: 0, total_sessions: 0 });
    await fetchAll(); setSubTab('browse'); setApplying(false);
  };

  const filtered = filter === 'all' ? mentors : mentors.filter(m => m.specialty === filter);
  const spec = (id) => SPECIALTIES.find(s => s.id === id);

  if (subTab === 'chat' && activeConvo) {
    const otherName = activeConvo._role === 'mentee' ? (activeConvo.mentors?.users?.full_name || 'Mentor') : (activeConvo.users?.full_name || 'User');
    return (
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm">
          <button onClick={() => { setActiveConvo(null); setSubTab('messages'); }} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: stringToColor(otherName) }}>{otherName[0].toUpperCase()}</div>
          <div>
            <div className="font-bold text-sm text-gray-900">{otherName}</div>
            <div className="text-[10px] text-gray-400">{activeConvo._role === 'mentee' ? '⭐ Your mentor' : '👤 Your mentee'}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {messages.length === 0 && <div className="text-center py-12"><span className="text-4xl block mb-3">👋</span><p className="text-sm text-gray-500 font-medium">Start the conversation!</p><p className="text-xs text-gray-400 mt-1">Mentors share personal experience, not legal advice.</p></div>}
          {messages.map(msg => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-red-600 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'}`}>
                  <p>{msg.content}</p>
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <input type="text" value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-300" />
            <button onClick={sendMsg} disabled={!msgInput.trim()} className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center disabled:opacity-30 transition-colors">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      {subTab === 'browse' && mentors.length === 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="text-2xl mb-2">🧭</div>
          <h3 className="font-bold text-lg mb-1">Peer Mentors — Real Experience</h3>
          <p className="text-sm text-amber-100 mb-3">Connect with parents who've been through it. Free, voluntary, and judgment-free.</p>
          <button onClick={() => setSubTab('apply')} className="px-5 py-2 bg-white text-amber-700 rounded-full text-sm font-bold hover:bg-amber-50 transition-colors">
            Become the first mentor →
          </button>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 p-3 bg-white border-b border-gray-100">
        {[
          { id: 'browse', label: '🔍 Find Mentors', count: null },
          { id: 'messages', label: '💬 Messages', count: convos.length || null },
          { id: 'apply', label: myProfile ? '⭐ My Profile' : '✋ Become a Mentor', count: null },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${subTab === t.id ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
            {t.label}{t.count ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* Browse */}
      {subTab === 'browse' && (
        <div className="p-3">
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>🗂️ All</button>
            {SPECIALTIES.map(s => (
              <button key={s.id} onClick={() => setFilter(s.id)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${filter === s.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>{s.icon} {s.label}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">🧭</span>
              <p className="text-sm font-semibold text-gray-700 mb-1">No mentors yet</p>
              <p className="text-xs text-gray-400 mb-4">Be the first to share your experience and help others.</p>
              <button onClick={() => setSubTab('apply')} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Become a Mentor</button>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl mx-auto">
              {filtered.map(m => {
                const s = spec(m.specialty); const name = m.users?.full_name || 'Mentor';
                return (
                  <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-all shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: stringToColor(name) }}>{name[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">{name}</span>
                          <span className="w-2 h-2 bg-green-400 rounded-full" title="Available" />
                          {s && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">{s.icon} {s.label}</span>}
                          <span className="text-[10px] text-gray-400 font-medium">{JURIS_NAMES[m.jurisdiction_id] || m.jurisdiction_id}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>⭐ {m.rating?.toFixed(1)}</span>
                          <span>·</span>
                          <span>{m.total_sessions || 0} sessions</span>
                          <span>·</span>
                          <span>⏱️ {m.response_time || 'Within 24h'}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{m.bio}</p>
                      </div>
                    </div>
                    <button onClick={() => startConvo(m)}
                      className="w-full mt-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors">
                      💬 Message {name.split(' ')[0]}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {subTab === 'messages' && (
        <div className="p-3">
          {convos.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl block mb-3">💬</span>
              <p className="text-sm font-semibold text-gray-700 mb-1">No conversations yet</p>
              <p className="text-xs text-gray-400 mb-4">Browse mentors and start a conversation.</p>
              <button onClick={() => setSubTab('browse')} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">Find a Mentor</button>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl mx-auto">
              {convos.map(c => {
                const other = c._role === 'mentee' ? (c.mentors?.users?.full_name || 'Mentor') : (c.users?.full_name || 'User');
                return (
                  <button key={c.id} onClick={() => openConvo(c)} className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center gap-3 hover:border-red-200 hover:shadow-sm text-left transition-all">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: stringToColor(other) }}>{other[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-900">{other}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{c.message_count || 0} messages · <span className={c._role === 'mentor' ? 'text-amber-500 font-semibold' : 'text-blue-500 font-semibold'}>{c._role === 'mentor' ? '⭐ Mentoring' : '👤 Mentee'}</span></div>
                    </div>
                    <span className="text-gray-300 text-lg">›</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply */}
      {subTab === 'apply' && !myProfile && (
        <div className="p-4 max-w-lg mx-auto space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🧭</div>
            <h3 className="font-bold text-gray-900 text-lg">Become a Mentor</h3>
            <p className="text-sm text-gray-500 mt-1">Share your lived experience to help other parents. It's completely voluntary and free.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Your Specialty</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button key={s.id} onClick={() => setApplyForm(p => ({ ...p, specialty: s.id }))}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${applyForm.specialty === s.id ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">Province</label>
            <select value={applyForm.jurisdiction_id} onChange={e => setApplyForm(p => ({ ...p, jurisdiction_id: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-300">
              <option value="">Select province...</option>
              {Object.entries(JURIS_NAMES).map(([id, name]) => <option key={id} value={id}>{name} — {id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">About You</label>
            <textarea value={applyForm.bio} onChange={e => setApplyForm(p => ({ ...p, bio: e.target.value }))} placeholder="Who you are and how you can help other parents..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-300 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 block">Your Experience</label>
            <textarea value={applyForm.experience} onChange={e => setApplyForm(p => ({ ...p, experience: e.target.value }))} placeholder="What you went through, your timeline, and what you learned..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-300 resize-none" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <strong>Important:</strong> Mentors share personal lived experience only — not legal advice. Always recommend professional legal counsel for specific legal questions.
          </div>
          <button onClick={submitApp} disabled={!applyForm.bio.trim() || !applyForm.experience.trim() || !applyForm.jurisdiction_id || applying}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
            {applying ? '⏳ Submitting...' : '✋ Submit Application'}
          </button>
        </div>
      )}

      {/* My Profile */}
      {subTab === 'apply' && myProfile && (
        <div className="p-4 max-w-lg mx-auto">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">⭐ Your Mentor Profile</h3>
              <button onClick={async () => { await supabase.from('mentors').update({ is_available: !myProfile.is_available }).eq('id', myProfile.id); setMyProfile(p => ({ ...p, is_available: !p.is_available })); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${myProfile.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${myProfile.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />{myProfile.is_available ? 'Available' : 'Unavailable'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gray-900">⭐ {myProfile.rating?.toFixed(1)}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">Rating</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{myProfile.review_count || 0}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">Reviews</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{myProfile.total_sessions || 0}</div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">Sessions</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{myProfile.bio}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================ */
/* HELPERS */
/* ============================================ */
function stringToColor(str) {
  const colors = ['#5865f2','#e74c3c','#e67e22','#2ecc71','#1abc9c','#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

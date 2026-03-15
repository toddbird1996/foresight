'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const CATEGORIES = {
  legal: { label: 'LEGAL SUPPORT', icon: '⚖️' },
  support: { label: 'SUPPORT GROUPS', icon: '💚' },
  hobbies: { label: 'HOBBY GROUPS', icon: '🎮' },
};

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [view, setView] = useState('chat'); // chat or posts

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users').select('full_name, avatar_url').eq('id', user.id).single();
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-3.5rem)] flex bg-gray-50 overflow-hidden">

      {/* Server Icon Rail (far left) */}
      <div className="w-[72px] bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-2 flex-shrink-0 hidden sm:flex">
        <Link href="/dashboard" className="w-12 h-12 bg-red-600 rounded-2xl hover:rounded-xl transition-all flex items-center justify-center group" title="Dashboard">
          <span className="text-white font-bold text-lg">F</span>
        </Link>
        <div className="w-8 h-0.5 bg-gray-200 rounded-full my-1" />
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => {
            const first = channelsByCategory[key]?.[0];
            if (first) { setActiveChannel(first); setShowSidebar(true); }
          }}
            className="w-12 h-12 bg-white rounded-full hover:rounded-xl hover:bg-red-600 transition-all flex items-center justify-center group" title={cat.label}>
            <span className="text-xl">{cat.icon}</span>
          </button>
        ))}
        <div className="mt-auto">
          <Link href="/coparent" className="w-12 h-12 bg-white rounded-full hover:rounded-xl hover:bg-red-600 transition-all flex items-center justify-center" title="Co-Parent Chat">
            <span className="text-xl">🤝</span>
          </Link>
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-60 bg-gray-50 border-r border-gray-200 flex-col flex-shrink-0`}>
        {/* Server Header */}
        <div className="h-12 px-4 flex items-center border-b border-gray-200 shadow-sm">
          <h2 className="font-semibold text-gray-900 text-sm truncate">Foresight Community</h2>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {Object.entries(channelsByCategory).map(([catKey, catChannels]) => (
            <div key={catKey}>
              <div className="flex items-center gap-1 px-1 mb-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  {CATEGORIES[catKey]?.label || catKey}
                </span>
              </div>
              {catChannels.map(ch => (
                <button key={ch.id} onClick={() => { setActiveChannel(ch); setShowSidebar(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 group transition-colors ${
                    activeChannel?.id === ch.id
                      ? 'bg-red-50 text-white'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}>
                  <span className="text-gray-500 text-lg">#</span>
                  <span className="text-sm truncate">{ch.name.toLowerCase().replace(/\s+/g, '-')}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* User Panel */}
        <div className="h-[52px] bg-gray-100 px-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(userProfile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 font-medium truncate">{userProfile?.full_name || 'User'}</div>
            <div className="text-[11px] text-gray-500 truncate">Online</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center gap-3 border-b border-gray-200 bg-white flex-shrink-0 border-b border-gray-200">
          <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden text-gray-600 hover:text-red-600">
            ☰
          </button>
          <span className="text-gray-500 text-xl">#</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">{activeChannel?.name || 'Select a channel'}</h3>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-500 max-w-[200px] truncate">{activeChannel?.description}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setView('chat')}
              className={`px-3 py-1 rounded text-xs font-medium ${view === 'chat' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}>
              Chat
            </button>
            <button onClick={() => setView('posts')}
              className={`px-3 py-1 rounded text-xs font-medium ${view === 'posts' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}>
              Posts
            </button>
            <button onClick={() => setView('mentors')}
              className={`px-3 py-1 rounded text-xs font-medium ${view === 'mentors' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}>
              Mentors
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'chat' && activeChannel && <ChatView channel={activeChannel} user={user} userProfile={userProfile} />}
        {view === 'posts' && activeChannel && <PostsView channel={activeChannel} user={user} userProfile={userProfile} />}
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
  const endRef = useRef(null);

  useEffect(() => { fetchMessages(); }, [channel.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const sub = supabase.channel(`chat-${channel.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${channel.id}` },
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [channel.id]);

  // Build list of users who have posted in this channel
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
    // Check if user is typing @mention
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt === val.length - 1 || (lastAt !== -1 && !val.substring(lastAt).includes(' '))) {
      const query = val.substring(lastAt + 1).toLowerCase();
      setMentionFilter(query);
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

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  // Build mentor lookup from messages
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
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mb-4">#</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to #{channel.name.toLowerCase().replace(/\s+/g, '-')}</h3>
            <p className="text-gray-500 text-sm max-w-md">{channel.description || 'This is the start of this channel. Be the first to say something!'}</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-500 font-semibold">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const sameAuthor = prevMsg?.user_id === msg.user_id;
              const timeDiff = prevMsg ? (new Date(msg.created_at) - new Date(prevMsg.created_at)) / 60000 : 999;
              const compact = sameAuthor && timeDiff < 5;
              const isMentor = mentorIds.has(msg.user_id);

              return (
                <div key={msg.id} className={`flex gap-4 px-2 py-0.5 hover:bg-gray-50 rounded group ${compact ? '' : 'mt-4'}`}>
                  {compact ? (
                    <div className="w-10 flex-shrink-0">
                      <span className="text-[11px] text-gray-500 hidden group-hover:inline">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <Link href={`/user?id=${msg.user_id}`} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: stringToColor(msg.user_name || msg.user_id) }}>
                      {(msg.user_name || 'U')[0].toUpperCase()}
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    {!compact && (
                      <div className="flex items-center gap-2">
                        <Link href={`/user?id=${msg.user_id}`} className="font-medium text-sm hover:underline" style={{ color: stringToColor(msg.user_name || msg.user_id) }}>
                          {msg.user_name || 'User'}
                        </Link>
                        {isMentor && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold leading-none">MENTOR</span>}
                        <span className="text-[11px] text-gray-500">
                          {new Date(msg.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
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
      <div className="px-4 pb-6 pt-2 flex-shrink-0 relative">
        {/* @Mention dropdown */}
        {showMentions && chatUsers.filter(n => n.toLowerCase().includes(mentionFilter)).length > 0 && (
          <div className="absolute bottom-16 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
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
        <div className="bg-white border border-gray-200 rounded-xl flex items-center">
          <input type="text" value={input} onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && !showMentions) sendMessage(); }}
            placeholder={`Message #${channel.name.toLowerCase().replace(/\s+/g, '-')} — type @ to mention`}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="px-3 py-2 mr-1 text-gray-600 hover:text-red-600 disabled:opacity-30 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* POSTS VIEW */
/* ============================================ */
function PostsView({ channel, user, userProfile }) {
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
    await supabase.from('community_posts').insert({ channel_id: channel.id, user_id: user.id, title: newTitle.trim(), content: newContent.trim(), post_type: newType });
    setNewTitle(''); setNewContent(''); setShowNew(false); setNewType('discussion');
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
    discussion: { label: 'Discussion', color: 'bg-gray-100 text-gray-600', icon: '💬' },
    question: { label: 'Question', color: 'bg-blue-50 text-blue-600', icon: '❓' },
    success_story: { label: 'Success Story', color: 'bg-green-50 text-green-600', icon: '🎉' },
    resource: { label: 'Resource', color: 'bg-amber-50 text-amber-600', icon: '📎' },
  };

  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Composer */}
      <div className="bg-white border-b border-gray-200 p-4">
        {!showNew ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
              style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
              {(userProfile?.full_name || 'U')[0].toUpperCase()}
            </div>
            <button onClick={() => setShowNew(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-left text-sm text-gray-500 transition-colors">
              What's on your mind?
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
                {(userProfile?.full_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{userProfile?.full_name || 'You'}</div>
                <div className="flex gap-1.5">
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewType(key)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${newType === key ? cfg.color : 'bg-gray-50 text-gray-400'}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title"
              className="w-full px-0 py-1 text-lg font-semibold text-gray-900 placeholder-gray-300 focus:outline-none border-0" />
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share your thoughts..."
              rows={4} className="w-full px-0 py-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none border-0 resize-none" />
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button onClick={() => { setShowNew(false); setNewTitle(''); setNewContent(''); }} className="text-sm text-gray-500">Cancel</button>
              <button onClick={createPost} disabled={!newTitle.trim() || !newContent.trim() || posting}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold disabled:opacity-40">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="bg-gray-100 min-h-full">
        {posts.length === 0 ? (
          <div className="text-center py-16 px-4"><span className="text-4xl block mb-3">📝</span><p className="text-gray-500 text-sm">No posts yet. Be the first!</p></div>
        ) : (
          <div className="space-y-3 p-3 sm:p-4">
            {posts.map(post => {
              const cfg = typeConfig[post.post_type] || typeConfig.discussion;
              const name = post.users?.full_name || 'User';
              const isExpanded = expandedPost === post.id;
              const liked = myLikes.has(post.id);
              const postComments = comments[post.id] || [];

              return (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                      style={{ backgroundColor: stringToColor(name) }}>{name[0].toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">{name}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{timeAgo(post.created_at)}</span><span>·</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-3">
                    <h4 className="font-semibold text-gray-900 text-[15px] mb-1">{post.title}</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                  {(post.like_count > 0 || post.comment_count > 0) && (
                    <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-500">
                      <div>{post.like_count > 0 && <><span className="text-red-500">❤️</span> {post.like_count}</>}</div>
                      {post.comment_count > 0 && <button onClick={() => toggleExpand(post.id)} className="hover:underline">{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</button>}
                    </div>
                  )}
                  <div className="border-t border-gray-100 flex">
                    <button onClick={() => toggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm transition-colors ${liked ? 'text-red-500 font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {liked ? '❤️' : '🤍'} {liked ? 'Liked' : 'Like'}
                    </button>
                    <button onClick={() => toggleExpand(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-gray-500 hover:bg-gray-50">
                      💬 Comment
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      {postComments.length > 0 && (
                        <div className="px-4 pt-3 space-y-3">
                          {postComments.map(c => (
                            <div key={c.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-[10px]"
                                style={{ backgroundColor: stringToColor(c.users?.full_name || 'U') }}>
                                {(c.users?.full_name || 'U')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 bg-white rounded-xl px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-gray-900">{c.users?.full_name || 'User'}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                                    {c.user_id === user.id && (
                                      <button onClick={() => deleteComment(c.id, post.id)} className="text-[10px] text-gray-300 hover:text-red-500">✕</button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="px-4 py-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-[10px]"
                          style={{ backgroundColor: stringToColor(userProfile?.full_name || user?.email) }}>
                          {(userProfile?.full_name || 'U')[0].toUpperCase()}
                        </div>
                        <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-red-400" />
                        <button onClick={() => addComment(post.id)} disabled={!commentText.trim()}
                          className="text-red-600 text-sm font-medium disabled:opacity-30">Post</button>
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
    // Fetch conversations
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

  // Chat view for active conversation
  if (subTab === 'chat' && activeConvo) {
    const otherName = activeConvo._role === 'mentee' ? (activeConvo.mentors?.users?.full_name || 'Mentor') : (activeConvo.users?.full_name || 'User');
    return (
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white">
          <button onClick={() => { setActiveConvo(null); setSubTab('messages'); }} className="text-gray-400 hover:text-gray-600">←</button>
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{otherName[0].toUpperCase()}</div>
          <div><div className="font-semibold text-sm text-gray-900">{otherName}</div><div className="text-[10px] text-gray-400">{activeConvo._role === 'mentee' ? 'Your mentor' : 'Your mentee'}</div></div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && <div className="text-center py-8"><span className="text-3xl block mb-2">👋</span><p className="text-sm text-gray-500">Start the conversation!</p></div>}
          {messages.map(msg => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-red-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
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
              placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-400" />
            <button onClick={sendMsg} disabled={!msgInput.trim()} className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center disabled:opacity-30">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M2.94 3.19a1 1 0 0 1 1.15-.33l12 5a1 1 0 0 1 0 1.84l-12 5a1 1 0 0 1-1.37-1.15L4.08 10 2.72 6.45a1 1 0 0 1 .22-1.26Z"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-3 bg-white border-b border-gray-100">
        {[
          { id: 'browse', label: 'Find Mentors' },
          { id: 'messages', label: `Messages${convos.length > 0 ? ` (${convos.length})` : ''}` },
          { id: 'apply', label: myProfile ? 'My Profile' : 'Become a Mentor' },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium ${subTab === t.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{t.label}</button>
        ))}
      </div>

      {/* Browse */}
      {subTab === 'browse' && (
        <div className="p-3">
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            <button onClick={() => setFilter('all')} className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>All</button>
            {SPECIALTIES.map(s => (
              <button key={s.id} onClick={() => setFilter(s.id)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${filter === s.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>{s.icon} {s.label}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12"><span className="text-3xl block mb-2">🧭</span><p className="text-sm text-gray-500 mb-3">No mentors yet</p>
              <button onClick={() => setSubTab('apply')} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">Become the first</button></div>
          ) : (
            <div className="space-y-2">
              {filtered.map(m => {
                const s = spec(m.specialty); const name = m.users?.full_name || 'Mentor';
                return (
                  <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: stringToColor(name) }}>{name[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-gray-900">{name}</span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-500">
                          {s && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-medium">{s.icon} {s.label}</span>}
                          <span>{JURIS_NAMES[m.jurisdiction_id] || m.jurisdiction_id}</span>
                          <span>⭐{m.rating?.toFixed(1)}</span>
                          <span>{m.total_sessions || 0} sessions</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{m.bio}</p>
                      </div>
                    </div>
                    <button onClick={() => startConvo(m)} className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">Message</button>
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
            <div className="text-center py-12"><span className="text-3xl block mb-2">💬</span><p className="text-sm text-gray-500">No conversations yet</p></div>
          ) : (
            <div className="space-y-1.5">
              {convos.map(c => {
                const other = c._role === 'mentee' ? (c.mentors?.users?.full_name || 'Mentor') : (c.users?.full_name || 'User');
                return (
                  <button key={c.id} onClick={() => openConvo(c)} className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 hover:border-red-300 text-left">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: stringToColor(other) }}>{other[0].toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{other}</div>
                      <div className="text-[10px] text-gray-500">{c.message_count || 0} messages · <span className={c._role === 'mentor' ? 'text-amber-600' : 'text-blue-600'}>{c._role === 'mentor' ? 'Mentoring' : 'Mentee'}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Apply */}
      {subTab === 'apply' && !myProfile && (
        <div className="p-4 space-y-3">
          <div className="text-center mb-4"><span className="text-3xl block mb-2">🧭</span><h3 className="font-bold text-gray-900">Become a Mentor</h3><p className="text-xs text-gray-500">Share your experience to help others. It's voluntary and free.</p></div>
          <div className="flex flex-wrap gap-1.5">
            {SPECIALTIES.map(s => (
              <button key={s.id} onClick={() => setApplyForm(p => ({ ...p, specialty: s.id }))} className={`px-3 py-1.5 rounded-full text-xs font-medium ${applyForm.specialty === s.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.icon} {s.label}</button>
            ))}
          </div>
          <select value={applyForm.jurisdiction_id} onChange={e => setApplyForm(p => ({ ...p, jurisdiction_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400">
            <option value="">Select province...</option>
            {Object.entries(JURIS_NAMES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <textarea value={applyForm.bio} onChange={e => setApplyForm(p => ({ ...p, bio: e.target.value }))} placeholder="About you — what you went through and how you can help" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />
          <textarea value={applyForm.experience} onChange={e => setApplyForm(p => ({ ...p, experience: e.target.value }))} placeholder="Your custody experience — timeline, outcome, lessons learned" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-800"><strong>Note:</strong> Mentors share personal experience, not legal advice.</div>
          <button onClick={submitApp} disabled={!applyForm.bio.trim() || !applyForm.experience.trim() || !applyForm.jurisdiction_id || applying}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40">{applying ? 'Submitting...' : 'Submit'}</button>
        </div>
      )}

      {/* My Profile */}
      {subTab === 'apply' && myProfile && (
        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Your Mentor Profile</h3>
              <button onClick={async () => { await supabase.from('mentors').update({ is_available: !myProfile.is_available }).eq('id', myProfile.id); setMyProfile(p => ({ ...p, is_available: !p.is_available })); }}
                className={`text-xs font-medium flex items-center gap-1.5 ${myProfile.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${myProfile.is_available ? 'bg-green-500' : 'bg-gray-300'}`} />{myProfile.is_available ? 'Available' : 'Unavailable'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-bold text-gray-900">⭐{myProfile.rating?.toFixed(1)}</div><div className="text-[10px] text-gray-500">Rating</div></div>
              <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-bold text-gray-900">{myProfile.review_count || 0}</div><div className="text-[10px] text-gray-500">Reviews</div></div>
              <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-bold text-gray-900">{myProfile.total_sessions || 0}</div><div className="text-[10px] text-gray-500">Sessions</div></div>
            </div>
            <p className="text-xs text-gray-600">{myProfile.bio}</p>
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
  const colors = ['#5865f2', '#57f287', '#fee75c', '#eb459e', '#ed4245', '#3ba55c', '#faa61a', '#e67e22', '#9b59b6', '#1abc9c'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

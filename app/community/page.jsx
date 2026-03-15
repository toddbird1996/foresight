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
  const [showSidebar, setShowSidebar] = useState(true);
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
          </div>
        </div>

        {/* Content */}
        {view === 'chat' && activeChannel && <ChatView channel={activeChannel} user={user} userProfile={userProfile} />}
        {view === 'posts' && activeChannel && <PostsView channel={activeChannel} user={user} userProfile={userProfile} />}
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
            {/* Date Separator */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[11px] text-gray-500 font-semibold">{date}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Messages */}
            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const sameAuthor = prevMsg?.user_id === msg.user_id;
              const timeDiff = prevMsg ? (new Date(msg.created_at) - new Date(prevMsg.created_at)) / 60000 : 999;
              const compact = sameAuthor && timeDiff < 5;

              return (
                <div key={msg.id} className={`flex gap-4 px-2 py-0.5 hover:bg-gray-50 rounded group ${compact ? '' : 'mt-4'}`}>
                  {compact ? (
                    <div className="w-10 flex-shrink-0">
                      <span className="text-[11px] text-gray-500 hidden group-hover:inline">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                      style={{ backgroundColor: stringToColor(msg.user_name || msg.user_id) }}>
                      {(msg.user_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!compact && (
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm" style={{ color: stringToColor(msg.user_name || msg.user_id) }}>
                          {msg.user_name || 'User'}
                        </span>
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
/* HELPERS */
/* ============================================ */
function stringToColor(str) {
  const colors = ['#5865f2', '#57f287', '#fee75c', '#eb459e', '#ed4245', '#3ba55c', '#faa61a', '#e67e22', '#9b59b6', '#1abc9c'];
  let hash = 0;
  for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

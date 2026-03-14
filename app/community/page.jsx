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
    <div className="min-h-screen bg-[#313338] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex bg-[#313338] overflow-hidden">

      {/* Server Icon Rail (far left) */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0 hidden sm:flex">
        <Link href="/dashboard" className="w-12 h-12 bg-[#5865f2] rounded-2xl hover:rounded-xl transition-all flex items-center justify-center group" title="Dashboard">
          <span className="text-white font-bold text-lg">F</span>
        </Link>
        <div className="w-8 h-0.5 bg-[#35363c] rounded-full my-1" />
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => {
            const first = channelsByCategory[key]?.[0];
            if (first) { setActiveChannel(first); setShowSidebar(true); }
          }}
            className="w-12 h-12 bg-[#2b2d31] rounded-full hover:rounded-xl hover:bg-[#5865f2] transition-all flex items-center justify-center group" title={cat.label}>
            <span className="text-xl">{cat.icon}</span>
          </button>
        ))}
        <div className="mt-auto">
          <Link href="/coparent" className="w-12 h-12 bg-[#2b2d31] rounded-full hover:rounded-xl hover:bg-green-600 transition-all flex items-center justify-center" title="Co-Parent Chat">
            <span className="text-xl">🤝</span>
          </Link>
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-60 bg-[#2b2d31] flex-col flex-shrink-0`}>
        {/* Server Header */}
        <div className="h-12 px-4 flex items-center border-b border-[#1f2023] shadow-sm">
          <h2 className="font-semibold text-white text-sm truncate">Foresight Community</h2>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {Object.entries(channelsByCategory).map(([catKey, catChannels]) => (
            <div key={catKey}>
              <div className="flex items-center gap-1 px-1 mb-1">
                <span className="text-[11px] font-semibold text-[#949ba4] uppercase tracking-wide">
                  {CATEGORIES[catKey]?.label || catKey}
                </span>
              </div>
              {catChannels.map(ch => (
                <button key={ch.id} onClick={() => { setActiveChannel(ch); setShowSidebar(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 group transition-colors ${
                    activeChannel?.id === ch.id
                      ? 'bg-[#404249] text-white'
                      : 'text-[#949ba4] hover:text-[#dbdee1] hover:bg-[#35373c]'
                  }`}>
                  <span className="text-[#949ba4] text-lg">#</span>
                  <span className="text-sm truncate">{ch.name.toLowerCase().replace(/\s+/g, '-')}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* User Panel */}
        <div className="h-[52px] bg-[#232428] px-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {(userProfile?.full_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">{userProfile?.full_name || 'User'}</div>
            <div className="text-[11px] text-[#949ba4] truncate">Online</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="h-12 px-4 flex items-center gap-3 border-b border-[#1f2023] bg-[#313338] flex-shrink-0">
          <button onClick={() => setShowSidebar(!showSidebar)} className="sm:hidden text-[#b5bac1] hover:text-white">
            ☰
          </button>
          <span className="text-[#949ba4] text-xl">#</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm">{activeChannel?.name || 'Select a channel'}</h3>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-[#949ba4] max-w-[200px] truncate">{activeChannel?.description}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setView('chat')}
              className={`px-3 py-1 rounded text-xs font-medium ${view === 'chat' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}>
              Chat
            </button>
            <button onClick={() => setView('posts')}
              className={`px-3 py-1 rounded text-xs font-medium ${view === 'posts' ? 'bg-[#404249] text-white' : 'text-[#949ba4] hover:text-white'}`}>
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

  const fetchMessages = async () => {
    const { data } = await supabase.from('chat_messages').select('*').eq('channel_id', channel.id).order('created_at', { ascending: true }).limit(100);
    setMessages(data || []);
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
            <div className="w-16 h-16 bg-[#404249] rounded-full flex items-center justify-center text-3xl mb-4">#</div>
            <h3 className="text-2xl font-bold text-white mb-2">Welcome to #{channel.name.toLowerCase().replace(/\s+/g, '-')}</h3>
            <p className="text-[#949ba4] text-sm max-w-md">{channel.description || 'This is the start of this channel. Be the first to say something!'}</p>
          </div>
        )}

        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-[#3f4147]" />
              <span className="text-[11px] text-[#949ba4] font-semibold">{date}</span>
              <div className="flex-1 h-px bg-[#3f4147]" />
            </div>

            {/* Messages */}
            {msgs.map((msg, i) => {
              const prevMsg = i > 0 ? msgs[i - 1] : null;
              const sameAuthor = prevMsg?.user_id === msg.user_id;
              const timeDiff = prevMsg ? (new Date(msg.created_at) - new Date(prevMsg.created_at)) / 60000 : 999;
              const compact = sameAuthor && timeDiff < 5;

              return (
                <div key={msg.id} className={`flex gap-4 px-2 py-0.5 hover:bg-[#2e3035] rounded group ${compact ? '' : 'mt-4'}`}>
                  {compact ? (
                    <div className="w-10 flex-shrink-0">
                      <span className="text-[11px] text-[#949ba4] hidden group-hover:inline">
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
                        <span className="text-[11px] text-[#949ba4]">
                          {new Date(msg.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    <p className="text-[#dbdee1] text-sm leading-relaxed break-words">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-6 pt-2 flex-shrink-0">
        <div className="bg-[#383a40] rounded-lg flex items-center">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={`Message #${channel.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-[#dbdee1] placeholder-[#6d6f78] focus:outline-none" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="px-3 py-2 mr-1 text-[#b5bac1] hover:text-white disabled:opacity-30 transition-colors">
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

  useEffect(() => { fetchPosts(); }, [channel.id]);

  const fetchPosts = async () => {
    const { data } = await supabase.from('community_posts').select('*, users(full_name)')
      .eq('channel_id', channel.id).order('created_at', { ascending: false }).limit(50);
    setPosts(data || []);
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim() || posting) return;
    setPosting(true);
    const { error } = await supabase.from('community_posts').insert({
      channel_id: channel.id, user_id: user.id, title: newTitle.trim(),
      content: newContent.trim(), post_type: newType,
    });
    if (!error) {
      setNewTitle(''); setNewContent(''); setShowNew(false);
      await fetchPosts();
    }
    setPosting(false);
  };

  const typeConfig = {
    discussion: { label: 'Discussion', color: 'bg-[#404249] text-[#dbdee1]', icon: '💬' },
    question: { label: 'Question', color: 'bg-[#5865f2]/20 text-[#949cf7]', icon: '❓' },
    success_story: { label: 'Success', color: 'bg-green-500/20 text-green-400', icon: '🎉' },
    resource: { label: 'Resource', color: 'bg-amber-500/20 text-amber-400', icon: '📎' },
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {/* New Post Button */}
      <div className="mb-4">
        {!showNew ? (
          <button onClick={() => setShowNew(true)}
            className="w-full bg-[#383a40] hover:bg-[#404249] rounded-lg px-4 py-3 text-left text-sm text-[#6d6f78] transition-colors">
            + Create a post in #{channel.name.toLowerCase().replace(/\s+/g, '-')}...
          </button>
        ) : (
          <div className="bg-[#2b2d31] border border-[#3f4147] rounded-xl p-4 space-y-3">
            <div className="flex gap-2">
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setNewType(key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${newType === key ? cfg.color : 'bg-[#383a40] text-[#949ba4]'}`}>
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>
            <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title"
              className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#6d6f78] focus:outline-none focus:border-[#5865f2]" />
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Share your thoughts, ask a question, or post a resource..."
              rows={4} className="w-full bg-[#1e1f22] border border-[#3f4147] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#6d6f78] focus:outline-none focus:border-[#5865f2] resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#949ba4]">Cancel</button>
              <button onClick={createPost} disabled={!newTitle.trim() || !newContent.trim() || posting}
                className="px-5 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg text-sm font-medium disabled:opacity-40">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-3xl block mb-3">📝</span>
          <p className="text-[#949ba4] text-sm">No posts in this channel yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const cfg = typeConfig[post.post_type] || typeConfig.discussion;
            return (
              <div key={post.id} className="bg-[#2b2d31] border border-[#3f4147] rounded-xl p-4 hover:border-[#4f5159] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
                    style={{ backgroundColor: stringToColor(post.users?.full_name || post.user_id) }}>
                    {(post.users?.full_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-white">{post.users?.full_name || 'User'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                      <span className="text-[11px] text-[#949ba4]">{new Date(post.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">{post.title}</h4>
                    <p className="text-[#b5bac1] text-sm leading-relaxed">{post.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
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

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from 'next/navigation';

// ============================================
// CHANNEL CATEGORIES CONFIG
// ============================================
const CATEGORY_CONFIG = {
  legal: { label: 'Legal Support', icon: '⚖️', color: 'text-red-600' },
  support: { label: 'Support Groups', icon: '💚', color: 'text-emerald-600' },
  hobbies: { label: 'Hobby Groups', icon: '🎮', color: 'text-blue-600' },
};

const EMOJI_OPTIONS = ['👍', '❤️', '🙏', '💪', '🎉', '😂', '😢', '🤔'];

const POST_TYPE_CONFIG = {
  discussion: { label: 'Discussion', color: 'bg-gray-100 text-gray-700', icon: '💬' },
  question: { label: 'Question', color: 'bg-blue-50 text-blue-700', icon: '❓' },
  success_story: { label: 'Success Story', color: 'bg-emerald-50 text-emerald-700', icon: '🎉' },
  resource: { label: 'Resource', color: 'bg-amber-50 text-amber-700', icon: '📎' },
};

// ============================================
// MAIN COMMUNITY PAGE
// ============================================
export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUser(user);
      await fetchChannels();
      setLoading(false);
    };
    init();
  }, []);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) { console.error("Error fetching channels:", error); return; }
    setChannels(data || []);
    if (data && data.length > 0) setActiveChannel(data[0]);
  };

  const channelsByCategory = channels.reduce((acc, c) => {
    const cat = c.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
        <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">F</span>
        </div>
        <h1 className="font-bold text-gray-900">Community</h1>

        {/* Tab Switcher */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 ml-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chat' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'posts' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Posts
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto md:hidden text-gray-600 p-2"
        >
          ☰
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-50' : 'hidden'} md:relative md:block w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0`}>
          <div className="p-4">
            {/* Online count */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs text-gray-500">12 members online</span>
            </div>

            {/* Channels by category */}
            {Object.entries(CATEGORY_CONFIG).map(([catKey, catConfig]) => {
              const catChannels = channelsByCategory[catKey] || [];
              if (catChannels.length === 0) return null;
              return (
                <div key={catKey} className="mb-4">
                  <h3 className={`text-xs font-semibold uppercase mb-2 px-2 ${catConfig.color}`}>
                    {catConfig.icon} {catConfig.label}
                  </h3>
                  {catChannels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => {
                        setActiveChannel(channel);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all ${
                        activeChannel?.id === channel.id
                          ? 'bg-red-50 text-red-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base">{channel.icon || '💬'}</span>
                      <span className="flex-1 text-left truncate">{channel.name}</span>
                      {channel.member_count > 0 && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {channel.member_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {activeTab === 'chat' ? (
            <ChatView user={user} activeChannel={activeChannel} />
          ) : (
            <PostsView user={user} activeChannel={activeChannel} channels={channels} />
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================
// CHAT VIEW (Discord-style)
// ============================================
function ChatView({ user, activeChannel }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [emojiPickerMsg, setEmojiPickerMsg] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeChannel) return;
    fetchMessages(activeChannel.id);

    const subscription = supabase
      .channel(`messages:${activeChannel.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${activeChannel.id}`
      }, () => {
        fetchMessages(activeChannel.id);
      })
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (channelId) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`*, user:users(id, full_name, email)`)
      .eq("channel_id", channelId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) { console.error("Error:", error); return; }
    setMessages(data || []);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !activeChannel) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      channel_id: activeChannel.id,
      user_id: user.id,
      content: newMessage.trim()
    });
    if (!error) {
      setNewMessage("");
      await fetchMessages(activeChannel.id);
    }
    setSending(false);
  };

  const addReaction = async (messageId, emoji) => {
    const { error } = await supabase.from("message_reactions").upsert({
      message_id: messageId,
      user_id: user.id,
      emoji: emoji
    }, { onConflict: 'message_id,user_id,emoji' });
    if (error && error.code === '23505') {
      await supabase.from("message_reactions")
        .delete()
        .match({ message_id: messageId, user_id: user.id, emoji: emoji });
    }
    setEmojiPickerMsg(null);
  };

  const getInitial = (msg) => {
    if (msg.user?.full_name) return msg.user.full_name[0].toUpperCase();
    if (msg.user?.email) return msg.user.email[0].toUpperCase();
    return "?";
  };

  const getUserName = (msg) => {
    if (msg.user?.full_name) return msg.user.full_name;
    if (msg.user?.email) return msg.user.email.split("@")[0];
    return "Anonymous";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMin = (now - date) / 1000 / 60;
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${Math.floor(diffMin)}m ago`;
    if (diffMin < 1440) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <>
      {/* Channel Header */}
      {activeChannel && (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 flex-shrink-0">
          <span className="text-lg mr-2">{activeChannel.icon || '💬'}</span>
          <span className="font-semibold text-gray-900">{activeChannel.name}</span>
          {activeChannel.description && (
            <span className="ml-3 text-sm text-gray-400 hidden sm:block">— {activeChannel.description}</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{messages.length} messages</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-4xl mb-3">💬</span>
            <p className="text-lg font-medium text-gray-600">No messages yet</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, msgs]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{dateKey}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className="flex gap-3 py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 group relative"
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => { setHoveredMsg(null); setEmojiPickerMsg(null); }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm ${
                    msg.user_id === user.id ? 'bg-red-600' : 'bg-gray-500'
                  }`}>
                    {getInitial(msg)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-semibold text-sm ${msg.user_id === user.id ? 'text-red-700' : 'text-gray-900'}`}>
                        {getUserName(msg)}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                      {msg.is_pinned && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                    </div>
                    <p className="text-gray-700 text-sm mt-0.5 break-words">{msg.content}</p>
                  </div>

                  {/* Hover actions */}
                  {hoveredMsg === msg.id && (
                    <div className="absolute right-2 -top-3 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center overflow-hidden">
                      <button
                        onClick={() => setEmojiPickerMsg(emojiPickerMsg === msg.id ? null : msg.id)}
                        className="px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm"
                        title="React"
                      >
                        😀
                      </button>
                      <button className="px-2 py-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm" title="Reply">
                        ↩
                      </button>
                    </div>
                  )}

                  {/* Emoji picker */}
                  {emojiPickerMsg === msg.id && (
                    <div className="absolute right-2 top-5 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className="w-8 h-8 hover:bg-gray-100 rounded flex items-center justify-center text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-100">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message #${activeChannel?.name || 'channel'}...`}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none py-2.5 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================
// POSTS VIEW (Reddit/Facebook-style)
// ============================================
function PostsView({ user, activeChannel, channels }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState('discussion');
  const [newPostChannel, setNewPostChannel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filterChannel]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    let query = supabase
      .from("community_posts")
      .select(`*, user:users(id, full_name, email), channel:channels(id, name, icon)`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);

    if (filterChannel !== 'all') {
      query = query.eq('channel_id', filterChannel);
    }

    const { data, error } = await query;
    if (error) { console.error("Error:", error); }

    if (data && user) {
      const postIds = data.map(p => p.id);
      let likedPostIds = new Set();
      if (postIds.length > 0) {
        const { data: likes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);
        likedPostIds = new Set((likes || []).map(l => l.post_id));
      }
      setPosts(data.map(p => ({ ...p, userLiked: likedPostIds.has(p.id) })));
    } else {
      setPosts(data || []);
    }
    setLoadingPosts(false);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || submitting) return;
    setSubmitting(true);

    const { error } = await supabase.from("community_posts").insert({
      user_id: user.id,
      channel_id: newPostChannel || activeChannel?.id || channels[0]?.id,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      post_type: newPostType
    });

    if (!error) {
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostType('discussion');
      setShowNewPost(false);
      await fetchPosts();
    } else {
      alert("Error creating post: " + error.message);
    }
    setSubmitting(false);
  };

  const toggleLike = async (postId, currentlyLiked) => {
    if (currentlyLiked) {
      await supabase.from("post_likes").delete().match({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({ like_count: Math.max(0, (posts.find(p => p.id === postId)?.like_count || 1) - 1) }).eq("id", postId);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      await supabase.from("community_posts").update({ like_count: (posts.find(p => p.id === postId)?.like_count || 0) + 1 }).eq("id", postId);
    }
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      userLiked: !currentlyLiked,
      like_count: currentlyLiked ? Math.max(0, p.like_count - 1) : p.like_count + 1
    } : p));
  };

  const filteredPosts = filterType === 'all' ? posts : posts.filter(p => p.post_type === filterType);

  const getPostUserName = (post) => {
    if (post.user?.full_name) return post.user.full_name;
    if (post.user?.email) return post.user.email.split("@")[0];
    return "Anonymous";
  };

  const formatTimeAgo = (timestamp) => {
    const diff = (new Date() - new Date(timestamp)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Posts Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
        <h2 className="font-semibold text-gray-900">Community Posts</h2>
        <div className="flex-1" />

        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-red-400"
        >
          <option value="all">All Channels</option>
          {channels.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-red-400"
        >
          <option value="all">All Types</option>
          {Object.entries(POST_TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.icon} {config.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + New Post
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* New Post Form */}
        {showNewPost && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Create a Post</h3>

            <div className="flex gap-2 mb-3 flex-wrap">
              {Object.entries(POST_TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setNewPostType(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    newPostType === key
                      ? 'bg-red-600 text-white'
                      : `${config.color} hover:opacity-80`
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>

            <select
              value={newPostChannel || activeChannel?.id || ''}
              onChange={(e) => setNewPostChannel(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-gray-50 focus:outline-none focus:border-red-400"
            >
              {channels.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Post title..."
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 bg-gray-50"
            />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or tell your story..."
              rows={4}
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 resize-none bg-gray-50"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || submitting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {loadingPosts ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-lg font-medium text-gray-600">No posts yet</p>
            <p className="text-sm">Be the first to share something with the community!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onLike={() => toggleLike(post.id, post.userLiked)}
              isExpanded={expandedPost === post.id}
              onToggleExpand={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              formatTimeAgo={formatTimeAgo}
              getPostUserName={getPostUserName}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// POST CARD COMPONENT
// ============================================
function PostCard({ post, user, onLike, isExpanded, onToggleExpand, formatTimeAgo, getPostUserName }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const typeConfig = POST_TYPE_CONFIG[post.post_type] || POST_TYPE_CONFIG.discussion;

  useEffect(() => {
    if (isExpanded) fetchComments();
  }, [isExpanded]);

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from("post_comments")
      .select(`*, user:users(id, full_name, email)`)
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    if (!error) setComments(data || []);
    setLoadingComments(false);
  };

  const handleComment = async () => {
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);

    const { error } = await supabase.from("post_comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim()
    });

    if (!error) {
      await supabase.from("community_posts")
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq("id", post.id);
      setNewComment('');
      await fetchComments();
    }
    setSubmittingComment(false);
  };

  const getCommentUserName = (comment) => {
    if (comment.user?.full_name) return comment.user.full_name;
    if (comment.user?.email) return comment.user.email.split("@")[0];
    return "Anonymous";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Post Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
            post.user_id === user.id ? 'bg-red-600' : 'bg-gray-500'
          }`}>
            {post.user?.full_name?.[0]?.toUpperCase() || post.user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">{getPostUserName(post)}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-400">{formatTimeAgo(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {post.channel && (
                <span className="text-xs text-gray-500">
                  {post.channel.icon} {post.channel.name}
                </span>
              )}
              <span className={`text-xs px-1.5 py-0.5 rounded ${typeConfig.color}`}>
                {typeConfig.icon} {typeConfig.label}
              </span>
            </div>
          </div>
          {post.is_pinned && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">📌 Pinned</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content.length > 300 && !isExpanded
            ? post.content.slice(0, 300) + '...'
            : post.content
          }
        </p>
        {post.content.length > 300 && !isExpanded && (
          <button onClick={onToggleExpand} className="text-red-600 text-sm font-medium mt-1 hover:text-red-700">
            Read more
          </button>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            post.userLiked ? 'text-red-600 font-medium' : 'text-gray-500 hover:text-red-600'
          }`}
        >
          <span>{post.userLiked ? '❤️' : '🤍'}</span>
          <span>{post.like_count || 0}</span>
        </button>

        <button
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>💬</span>
          <span>{post.comment_count || 0} comments</span>
        </button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="px-4 py-3 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400"
            />
            <button
              onClick={handleComment}
              disabled={!newComment.trim() || submittingComment}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
            >
              {submittingComment ? '...' : 'Reply'}
            </button>
          </div>

          <div className="px-4 pb-3 space-y-3">
            {loadingComments ? (
              <p className="text-sm text-gray-400 text-center py-2">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">No comments yet. Be the first!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 ${
                    comment.user_id === user.id ? 'bg-red-500' : 'bg-gray-400'
                  }`}>
                    {comment.user?.full_name?.[0]?.toUpperCase() || comment.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-xs text-gray-900">{getCommentUserName(comment)}</span>
                      <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

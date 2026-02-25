'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchChannels();
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);

      // Subscribe to new messages
      const subscription = supabase
        .channel(`messages:${activeChannel.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching channels:", error);
      return;
    }

    setChannels(data || []);
    if (data && data.length > 0) {
      setActiveChannel(data[0]);
    }
  };

  const fetchMessages = async (channelId) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !activeChannel) return;

    setSending(true);

    const { error } = await supabase.from("messages").insert({
      channel_id: activeChannel.id,
      user_id: user.id,
      content: newMessage.trim()
    });

    if (error) {
      alert("Error sending message: " + error.message);
    } else {
      setNewMessage("");
      await fetchMessages(activeChannel.id);
    }

    setSending(false);
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
    const diff = (now - date) / 1000 / 60; // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading community...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="h-14 bg-slate-900/95 border-b border-slate-800 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
        <h1 className="font-bold">Community</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 overflow-y-auto hidden md:block">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-slate-500 uppercase mb-3">Channels</h2>
            {channels.length === 0 ? (
              <p className="text-sm text-slate-500">No channels yet</p>
            ) : (
              channels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${
                    activeChannel?.id === channel.id 
                      ? 'bg-orange-500/20 text-orange-400' 
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{channel.icon || '💬'}</span>
                  <span className="flex-1 text-left text-sm">{channel.name}</span>
                  {channel.member_count > 0 && (
                    <span className="text-xs text-slate-500">
                      {channel.member_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Channel Header */}
          {activeChannel && (
            <div className="h-12 border-b border-slate-800 flex items-center px-4">
              <span className="text-lg mr-2">{activeChannel.icon || '💬'}</span>
              <span className="font-semibold">{activeChannel.name}</span>
              {activeChannel.description && (
                <span className="ml-2 text-sm text-slate-500">• {activeChannel.description}</span>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold flex-shrink-0">
                    {getInitial(msg)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{getUserName(msg)}</span>
                      <span className="text-xs text-slate-500">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-slate-300">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button 
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-orange-500 rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Channel Selector */}
      <div className="md:hidden border-t border-slate-800 p-2 flex gap-2 overflow-x-auto">
        {channels.map(channel => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel)}
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
              activeChannel?.id === channel.id 
                ? 'bg-orange-500 text-white' 
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {channel.icon} {channel.name}
          </button>
        ))}
      </div>
    </div>
  );
              }

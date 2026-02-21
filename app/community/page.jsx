'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const SAMPLE_CHANNELS = [
  { id: 'sk-parents', name: 'Saskatchewan Parents', icon: '⚖️', unread: 3, category: 'legal' },
  { id: 'high-conflict', name: 'High Conflict', icon: '🔥', unread: 0, category: 'support' },
  { id: 'mental-health', name: 'Mental Health', icon: '💚', unread: 1, category: 'support' },
  { id: 'gaming', name: 'Gaming Lounge', icon: '🎮', unread: 0, category: 'hobbies' },
];

const SAMPLE_MESSAGES = [
  { id: 1, user: 'Sarah M.', avatar: 'S', message: 'Just filed my response today! The AI assistant really helped me understand what to include.', time: '10 min ago' },
  { id: 2, user: 'Mike T.', avatar: 'M', message: 'Has anyone dealt with a JCC in Regina? How long does it usually take to get a date?', time: '25 min ago' },
  { id: 3, user: 'Jennifer K.', avatar: 'J', message: '@Mike T. Took me about 6 weeks to get scheduled. Make sure you have all your documents ready!', time: '20 min ago' },
];

export default function CommunityPage() {
  const [activeChannel, setActiveChannel] = useState('sk-parents');
  const [newMessage, setNewMessage] = useState('');

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
            {SAMPLE_CHANNELS.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 ${
                  activeChannel === channel.id 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>{channel.icon}</span>
                <span className="flex-1 text-left text-sm">{channel.name}</span>
                {channel.unread > 0 && (
                  <span className="px-2 py-0.5 bg-orange-500 rounded-full text-xs">
                    {channel.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Channel Header */}
          <div className="h-12 border-b border-slate-800 flex items-center px-4">
            <span className="text-lg mr-2">⚖️</span>
            <span className="font-semibold">Saskatchewan Parents</span>
            <span className="ml-2 text-sm text-slate-500">• 156 members</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {SAMPLE_MESSAGES.map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold flex-shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{msg.user}</span>
                    <span className="text-xs text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-300">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button className="px-6 py-3 bg-orange-500 rounded-xl font-medium hover:bg-orange-600">
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

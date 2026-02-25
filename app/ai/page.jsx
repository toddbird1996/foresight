'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AIPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('bronze');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
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

      const { data: profile } = await supabase
        .from("users")
        .select("tier")
        .eq("id", user.id)
        .single();

      if (profile?.tier) {
        setUserTier(profile.tier);
      }

      setLoading(false);
    };

    init();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isPaidUser = userTier !== 'bronze';

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: user.id,
          jurisdiction: 'saskatchewan'
        })
      });

      const data = await res.json();

      if (data.upgradeRequired) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          isUpgradePrompt: true
        }]);
      } else if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show upgrade gate for free users
  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
          <h1 className="font-bold text-gray-900">AI Assistant</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-4xl">
              🤖
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">AI Assistant is a Premium Feature</h2>
            <p className="text-gray-600 mb-6">
              Get instant answers to your custody questions, document analysis, and personalized guidance with our AI assistant.
            </p>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">What you get with AI:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  24/7 instant answers to custody questions
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Province-specific legal information
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Document review and suggestions
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="text-green-600">✓</span>
                  Step-by-step filing guidance
                </li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-center mb-3"
            >
              Upgrade to Silver - $9.99/month
            </Link>
            <Link href="/dashboard" className="text-gray-500 text-sm hover:text-red-600">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paid user - show chat interface
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
        <h1 className="font-bold text-gray-900">AI Assistant</h1>
        <span className="ml-auto text-xs text-gray-500">
          {userTier === 'gold' ? 'Unlimited' : '25 queries/day'}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
            <p className="text-gray-600 mb-6">Ask me anything about custody procedures in Canada or the US.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['How do I file for custody?', 'What is a JCC?', 'How long does the process take?'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:border-red-500 text-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === 'user'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <div className="bg-white border border-gray-200 p-3 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about custody procedures..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

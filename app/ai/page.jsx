'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// Simulated user - in production, get from auth
const mockUser = { id: '123', tier: 'bronze' }; // Change to 'silver' or 'gold' to test

export default function AIPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const isPaidUser = mockUser.tier !== 'bronze';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          userId: mockUser.id,
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  // Show upgrade gate for free users
  if (!isPaidUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <header className="h-14 bg-slate-900/95 border-b border-slate-800 flex items-center px-4 gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
          <h1 className="font-bold">AI Assistant</h1>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-4xl">
              🤖
            </div>
            <h2 className="text-2xl font-bold mb-3">AI Assistant is a Premium Feature</h2>
            <p className="text-slate-400 mb-6">
              Get instant answers to your custody questions, document analysis, and personalized guidance with our AI assistant.
            </p>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3">What you get with AI:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  24/7 instant answers to custody questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Province-specific legal information
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Document review and suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Step-by-step filing guidance
                </li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="block w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-center mb-3"
            >
              Upgrade to Silver - $9.99/month
            </Link>
            <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Paid user - show chat interface
  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      <header className="h-14 bg-slate-900/95 border-b border-slate-800 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
        <h1 className="font-bold">AI Assistant</h1>
        <span className="ml-auto text-xs text-slate-500">
          {mockUser.tier === 'gold' ? 'Unlimited' : '25 queries/day'}
        </span>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
            <p className="text-slate-400 mb-6">Ask me anything about custody procedures in Canada.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['How do I file for custody?', 'What is a JCC?', 'How long does the process take?'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-3 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700"
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                🤖
              </div>
            )}
            <div className={`max-w-[80%] p-3 rounded-xl ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              🤖
            </div>
            <div className="bg-slate-800 p-3 rounded-xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about custody procedures..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-orange-500 rounded-xl font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

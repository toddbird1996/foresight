// ============================================
// FORESIGHT - AI CHAT COMPONENT
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ============================================
// AI CHAT HOOK (Client-side)
// ============================================

export function useAIChat(user, profile) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queriesRemaining, setQueriesRemaining] = useState(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  // Check if user can use AI (paid users only)
  useEffect(() => {
    if (profile) {
      if (profile.tier === 'bronze') {
        setUpgradeRequired(true);
        setQueriesRemaining(0);
      } else {
        setUpgradeRequired(false);
        const limits = { silver: 25, gold: 999 }; // Gold is unlimited
        const limit = limits[profile.tier] || 25;
        setQueriesRemaining(limit - (profile.daily_queries_used || 0));
      }
    }
  }, [profile]);

  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    // Block free users
    if (upgradeRequired) {
      setError('AI assistant is a premium feature. Please upgrade to Silver or Gold.');
      return;
    }
    
    if (queriesRemaining <= 0) {
      setError('Daily query limit reached. Upgrade to Gold for unlimited queries.');
      return;
    }

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          jurisdiction: profile?.jurisdiction || 'saskatchewan',
          userId: user?.id,
          conversationHistory: messages.slice(-10)
        })
      });

      const data = await response.json();

      if (response.status === 403 && data.upgradeRequired) {
        setUpgradeRequired(true);
        setError(data.content);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        tokensUsed: data.tokensUsed
      };
      setMessages(prev => [...prev, aiMessage]);
      if (data.queriesRemaining !== undefined) {
        setQueriesRemaining(data.queriesRemaining);
      }
      await refreshProfile();

      return aiMessage;
    } catch (err) {
      setError(err.message);
      // Remove the user message if request failed
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    queriesRemaining,
    sendMessage,
    clearChat
  };
}

// ============================================
// AI CHAT COMPONENT
// ============================================

export function AIChat({ onClose }) {
  const { profile } = useAuth();
  const { messages, loading, error, queriesRemaining, sendMessage, clearChat } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    
    const message = input;
    setInput('');
    
    try {
      await sendMessage(message);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedQuestions = [
    "How do I start a custody case?",
    "What forms do I need?",
    "Explain parenting time",
    "How does child support work?",
    "What is a JCC?"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-slate-400">
              {queriesRemaining !== null ? `${queriesRemaining} queries remaining` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            title="Clear chat"
          >
            🗑️
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState 
            jurisdiction={profile?.jurisdiction}
            suggestedQuestions={suggestedQuestions}
            onQuestionClick={(q) => {
              setInput(q);
              inputRef.current?.focus();
            }}
          />
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        
        {loading && <TypingIndicator />}
        
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-orange-500/10 border-t border-orange-500/20">
        <p className="text-xs text-orange-300/80 text-center">
          ⚠️ Legal information only, not legal advice. Always verify with official sources.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about custody, forms, court processes..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 resize-none focus:outline-none text-sm"
              rows={1}
              disabled={loading || queriesRemaining <= 0}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading || queriesRemaining <= 0}
            className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '➤'
            )}
          </button>
        </div>
        
        {queriesRemaining <= 0 && (
          <p className="text-xs text-red-400 mt-2 text-center">
            Daily limit reached. <button className="text-orange-400 underline">Upgrade</button> for more queries.
          </p>
        )}
      </form>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function EmptyState({ jurisdiction, suggestedQuestions, onQuestionClick }) {
  const jurisdictionNames = {
    saskatchewan: 'Saskatchewan',
    alberta: 'Alberta',
    ontario: 'Ontario',
    bc: 'British Columbia',
    manitoba: 'Manitoba'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center text-4xl mb-6">
        🤖
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        How can I help you today?
      </h3>
      <p className="text-slate-400 mb-6 max-w-md">
        Ask me about {jurisdictionNames[jurisdiction] || 'Canadian'} custody procedures, 
        required forms, court processes, and more.
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {suggestedQuestions.map((question, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(question)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300 hover:border-orange-500/50 hover:text-orange-300 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ message }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm flex-shrink-0">
          🤖
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        <div
          className={`p-4 rounded-2xl text-sm ${
            isUser
              ? 'bg-orange-500/20 text-white'
              : 'bg-slate-800 text-slate-100'
          }`}
        >
          {isUser ? (
            message.content
          ) : (
            <FormattedResponse content={message.content} />
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-1 text-xs text-slate-500 ${isUser ? 'justify-end' : ''}`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {message.tokensUsed && (
            <span>• {message.tokensUsed} tokens</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FormattedResponse({ content }) {
  // Simple markdown-like formatting
  const formatContent = (text) => {
    // Split into paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, i) => {
      // Check for headers
      if (paragraph.startsWith('## ')) {
        return (
          <h3 key={i} className="text-lg font-semibold text-orange-400 mt-4 mb-2">
            {paragraph.replace('## ', '')}
          </h3>
        );
      }
      
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={i} className="font-semibold text-orange-300 mt-3 mb-1">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }
      
      // Check for bullet points
      if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
        return (
          <ul key={i} className="list-disc list-inside space-y-1 my-2">
            {items.map((item, j) => (
              <li key={j} className="text-slate-300">
                {formatInlineText(item.replace('- ', ''))}
              </li>
            ))}
          </ul>
        );
      }
      
      // Check for numbered lists
      if (/^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n').filter(line => /^\d+\./.test(line));
        return (
          <ol key={i} className="list-decimal list-inside space-y-1 my-2">
            {items.map((item, j) => (
              <li key={j} className="text-slate-300">
                {formatInlineText(item.replace(/^\d+\.\s*/, ''))}
              </li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph
      return (
        <p key={i} className="text-slate-300 my-2">
          {formatInlineText(paragraph)}
        </p>
      );
    });
  };
  
  const formatInlineText = (text) => {
    // Bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };
  
  return <div className="prose prose-invert prose-sm max-w-none">{formatContent(content)}</div>;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm">
        🤖
      </div>
      <div className="p-4 rounded-2xl bg-slate-800">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// AI CHAT PAGE (Full page version)
// ============================================

export function AIChatPage() {
  const { profile } = useAuth();
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <a href="/dashboard" className="p-2 text-slate-400 hover:text-white">
          ←
        </a>
        <div className="flex-1">
          <h1 className="font-semibold text-white">AI Assistant</h1>
          <p className="text-xs text-slate-400">
            {profile?.jurisdiction ? `${profile.jurisdiction.charAt(0).toUpperCase() + profile.jurisdiction.slice(1)} Custody Guide` : 'Loading...'}
          </p>
        </div>
      </header>
      
      {/* Chat */}
      <div className="flex-1">
        <AIChat />
      </div>
    </div>
  );
}

// ============================================
// AI CHAT MODAL (Overlay version)
// ============================================

export function AIChatModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[80vh] bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <AIChat onClose={onClose} />
      </div>
    </div>
  );
}

// ============================================
// AI QUICK ASK (Inline mini version)
// ============================================

export function AIQuickAsk({ onFullChat }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendMessage } = useAIChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    setLoading(true);
    try {
      const result = await sendMessage(input);
      setResponse(result.content);
    } catch (err) {
      setResponse('Sorry, I couldn\'t process that request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🤖</span>
        <div>
          <h3 className="font-semibold text-white">Quick Ask</h3>
          <p className="text-sm text-slate-400">Get a quick answer</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a quick question..."
          className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium text-white disabled:opacity-50"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </form>
      
      {response && (
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mb-3">
          <p className="text-sm text-slate-300 line-clamp-4">{response}</p>
        </div>
      )}
      
      <button
        onClick={onFullChat}
        className="text-sm text-orange-400 hover:text-orange-300"
      >
        Open full chat →
      </button>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default AIChat;

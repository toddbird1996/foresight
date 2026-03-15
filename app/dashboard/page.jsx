"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OnboardingFlow from "../components/Onboarding";
import Header from "../components/Header";
import Footer from '../components/Footer';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);


  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);

        const { data: profile } = await supabase
          .from("users")
          .select("onboarding_completed, action_plan, full_name, case_status")
          .eq("id", user.id)
          .single();

        if (profile && !profile.onboarding_completed) {
          setShowOnboarding(true);
        }
        if (profile?.action_plan) setActionPlan(profile.action_plan);
        if (profile) setUserProfile(profile);

        // Fetch upcoming deadlines (next 14 days, not completed)
        const today = new Date().toISOString().split('T')[0];
        const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        const { data: deadlines } = await supabase
          .from("deadlines")
          .select("*")
          .eq("user_id", user.id)
          .eq("completed", false)
          .gte("due_date", today)
          .lte("due_date", twoWeeks)
          .order("due_date", { ascending: true })
          .limit(5);
        setUpcomingDeadlines(deadlines || []);
      }
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Logout error: " + error.message);
    else router.push("/auth/login");
  };


  if (!user) return null;

  if (showOnboarding) {
    return <OnboardingFlow user={user} onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* AI Question Bar */}
        <QuestionBar />

        {/* Welcome */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {userProfile?.full_name ? `Welcome back, ${userProfile.full_name.split(' ')[0]}!` : 'Welcome back!'}
            </h2>
            <p className="text-gray-600">Manage your custody case from one place.</p>
          </div>
          <Link href="/progress" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors">
            <span className="text-sm">📊</span>
            <span className="text-sm text-gray-600 font-medium">My Progress</span>
          </Link>
        </div>

        {/* Getting Started Guide - shows when no action plan */}
        {(!actionPlan || actionPlan.length === 0) && (
          <div className="mb-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white">
            <h3 className="font-bold text-lg mb-1">Start Your Custody Journey</h3>
            <p className="text-red-100 text-sm mb-4">Follow these steps to build your case. Foresight will guide you through each one.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { step: '1', label: 'Learn Your Rights', link: '/rights' },
                { step: '2', label: 'Read Filing Guide', link: '/filing' },
                { step: '3', label: 'Get Court Forms', link: '/court-forms' },
                { step: '4', label: 'Start Your Case', link: '/cases' },
              ].map(s => (
                <Link key={s.step} href={s.link} className="bg-white/10 hover:bg-white/20 rounded-xl p-3 text-center transition-colors">
                  <div className="text-lg font-bold mb-0.5">{s.step}</div>
                  <div className="text-xs text-red-100">{s.label}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Deadline Reminders */}
        {upcomingDeadlines.length > 0 && (
          <div className="mb-6">
            {upcomingDeadlines.map(d => {
              const daysLeft = Math.ceil((new Date(d.due_date) - new Date()) / 86400000);
              const isUrgent = daysLeft <= 3;
              const isToday = daysLeft <= 0;
              return (
                <Link key={d.id} href="/deadlines"
                  className={`flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${
                    isToday ? 'bg-red-50 border-2 border-red-300' :
                    isUrgent ? 'bg-amber-50 border border-amber-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isToday ? 'bg-red-600 text-white' : isUrgent ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                  }`}>
                    {isToday ? '!' : daysLeft}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${isToday ? 'text-red-800' : isUrgent ? 'text-amber-800' : 'text-blue-800'}`}>
                      {d.title}
                    </div>
                    <div className={`text-xs ${isToday ? 'text-red-600' : isUrgent ? 'text-amber-600' : 'text-blue-600'}`}>
                      {isToday ? 'Due today!' : daysLeft === 1 ? 'Due tomorrow' : `Due in ${daysLeft} days`}
                      {' · '}{new Date(d.due_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    d.priority === 'high' ? 'bg-red-100 text-red-700' :
                    d.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{d.priority}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Action Plan */}
        {actionPlan && actionPlan.length > 0 && (
          <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">🎯 Your Action Plan</h3>
              <span className="text-xs text-gray-400">Based on your case questionnaire</span>
            </div>
            <div className="space-y-2">
              {actionPlan.slice(0, 5).map((item, i) => (
                <Link key={i} href={item.link || '/cases'}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-red-50 hover:border-red-200 border border-gray-100 transition-colors">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{item.step}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                  </div>
                  <span className="text-gray-400 text-sm">→</span>
                </Link>
              ))}
              {actionPlan.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-1">+ {actionPlan.length - 5} more steps</p>
              )}
            </div>
          </div>
        )}

        {/* QUICK LINKS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/progress" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">📊</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">My Progress</h3>
              <p className="text-xs text-gray-500">Track your journey</p>
            </div>
          </Link>
          <Link href="/refer" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">🤝</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Invite a Parent</h3>
              <p className="text-xs text-gray-500">Help someone else</p>
            </div>
          </Link>
        </div>

        {/* YOUR CASE */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Your Case</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/cases" className="bg-white border-2 border-red-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📁</div>
              <h3 className="font-semibold text-gray-900 text-sm">Current Case</h3>
              <p className="text-xs text-gray-500">Documents, AI & progress</p>
            </Link>
            <Link href="/deadlines" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-semibold text-gray-900 text-sm">Calendar Custody Calendar Deadlines</h3>
              <p className="text-xs text-gray-500">Parenting schedule</p>
            </Link>
            <Link href="/expenses" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-900 text-sm">Expenses</h3>
              <p className="text-xs text-gray-500">Track & split costs</p>
            </Link>
            <Link href="/children" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">👧</div>
              <h3 className="font-semibold text-gray-900 text-sm">Children's Info</h3>
              <p className="text-xs text-gray-500">Medical, school, contacts</p>
            </Link>
            <Link href="/coparent" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🤝</div>
              <h3 className="font-semibold text-gray-900 text-sm">Co-Parent Chat</h3>
              <p className="text-xs text-gray-500">Court-ready messaging</p>
            </Link>
            <Link href="/deadlines" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">⏰</div>
              <h3 className="font-semibold text-gray-900 text-sm">Deadlines</h3>
              <p className="text-xs text-gray-500">Track important dates</p>
            </Link>
            <Link href="/templates" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-900 text-sm">Doc Templates</h3>
              <p className="text-xs text-gray-500">Guided fill-in wizards</p>
            </Link>
          </div>
        </div>

        {/* LEARN & PREPARE */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Learn & Prepare</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/filing" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-900 text-sm">Filing Guide</h3>
              <p className="text-xs text-gray-500">Step-by-step process</p>
            </Link>
            <Link href="/court-forms" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-semibold text-gray-900 text-sm">Court Forms</h3>
              <p className="text-xs text-gray-500">Download official forms</p>
            </Link>
            <Link href="/rights" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">⚖️</div>
              <h3 className="font-semibold text-gray-900 text-sm">Know Your Rights</h3>
              <p className="text-xs text-gray-500">CPS codes & regulations</p>
            </Link>
            <Link href="/judge-insight" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="font-semibold text-gray-900 text-sm">Judge Insight</h3>
              <p className="text-xs text-gray-500">How to present in court</p>
            </Link>
          </div>
        </div>

        {/* TOOLS & RESOURCES */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Tools & Resources</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/calculator" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🧮</div>
              <h3 className="font-semibold text-gray-900 text-sm">Support Calculator</h3>
              <p className="text-xs text-gray-500">Estimate child support</p>
            </Link>
            <Link href="/programs" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-gray-900 text-sm">Programs</h3>
              <p className="text-xs text-gray-500">Support & resources</p>
            </Link>
            <Link href="/community" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-900 text-sm">Community</h3>
              <p className="text-xs text-gray-500">Chat, posts & mentors</p>
            </Link>
            <Link href="/emergency" className="bg-red-50 border-2 border-red-300 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">🚨</div>
              <h3 className="font-semibold text-red-700 text-sm">Emergency</h3>
              <p className="text-xs text-red-500">Crisis contacts & urgent filings</p>
            </Link>
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">Account</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/profile" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-semibold text-gray-900 text-sm">Profile</h3>
              <p className="text-xs text-gray-500">Account settings</p>
            </Link>
            <Link href="/pricing" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all">
              <div className="text-2xl mb-2">⭐</div>
              <h3 className="font-semibold text-gray-900 text-sm">Pricing</h3>
              <p className="text-xs text-gray-500">Upgrade your plan</p>
            </Link>
            <button onClick={handleLogout} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all text-left">
              <div className="text-2xl mb-2">🚪</div>
              <h3 className="font-semibold text-gray-900 text-sm">Logout</h3>
              <p className="text-xs text-gray-500">Sign out</p>
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
      }

/* ============================================ */
/* QUESTION BAR - AI Quick Ask */
/* ============================================ */
function QuestionBar() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const suggestions = [
    'How do I file for custody?',
    'What is a parenting plan?',
    'How does child support work?',
    'What happens at a court hearing?',
    'How do I respond to a filing?',
    'What are my rights as a parent?',
  ];

  const handleAsk = async (question) => {
    const q = question || query.trim();
    if (!q) return;
    setQuery(q);
    setShowAnswer(true);
    setShowSuggestions(false);
    setLoading(true);
    setAnswer('');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, userId: user?.id, jurisdiction: userProfile?.jurisdiction }),
      });
      const data = await response.json();
      if (data.upgradeRequired) {
        setAnswer('🔒 AI is a premium feature. Upgrade to Silver or Gold to ask unlimited questions!');
      } else {
        setAnswer(data.content || 'Sorry, I couldn\'t process that. Please try again.');
      }
    } catch (err) {
      setAnswer('Sorry, the AI assistant is currently unavailable. Please try again later or visit our Filing Guide for help.');
    }
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">?</span>
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask about custody, court, or your rights..."
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || loading}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors flex-shrink-0"
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {/* Suggested Questions - collapsed behind toggle */}
        {!showAnswer && (
          <div className="mt-2">
            <button onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
              <span className={`transition-transform ${showSuggestions ? 'rotate-90' : ''}`}>▸</span>
              Suggested questions
            </button>
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s); handleAsk(s); }}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-full text-xs text-gray-600 hover:text-red-600 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Answer Panel */}
      {showAnswer && (
        <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">F</div>
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{answer}</div>
              )}
            </div>
          </div>
          {!loading && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-[10px] text-gray-400">This is general information, not legal advice.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAnswer(false); setQuery(''); setAnswer(''); inputRef.current?.focus(); }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Ask another →
                </button>
                <Link href="/cases" className="text-xs text-red-600 hover:text-red-700 font-medium">
                  Open My Case →
                </Link>
              </div>
            </div>
          )}
      </div>
      )}
    </div>
  );
}
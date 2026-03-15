"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [deadlineCount, setDeadlineCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const week = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        supabase.from('deadlines').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('completed', false)
          .gte('due_date', today).lte('due_date', week)
          .then(({ count }) => setDeadlineCount(count || 0));
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-gray-900 hidden sm:inline">Foresight</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Home' },
            { href: '/cases', label: 'My Case', highlight: true },
            { href: '/filing', label: 'Filing' },
            { href: '/court-forms', label: 'Forms' },
            { href: '/community', label: 'Community' },
            { href: '/coparent', label: 'Co-Parent' },
            { href: '/programs', label: 'Programs' },
            { href: '/rights', label: 'Rights' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${link.highlight ? 'text-red-600 font-medium hover:bg-red-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              {link.label}
            </Link>
          ))}
          <Link href="/emergency" className="px-3 py-1.5 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50">🚨 SOS</Link>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <Link href="/profile" className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50">Profile</Link>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-gray-50">Logout</button>
        </nav>

        {/* Mobile - secondary menu (links not in bottom tabs) */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/deadlines" className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm relative">
            🔔
            {deadlineCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{deadlineCount}</span>
            )}
          </Link>
          <Link href="/dm" className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm">✉️</Link>
          <Link href="/emergency" className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-sm">🚨</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
            {menuOpen ? '✕' : '•••'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown - directory-style menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3">
          {/* Quick Nav */}
          <div className="grid grid-cols-4 gap-2 mb-3 pb-3 border-b border-gray-100">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-gray-50">
              <span className="text-lg">🏠</span><span className="text-[10px] text-gray-600">Home</span>
            </Link>
            <Link href="/cases" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-gray-50">
              <span className="text-lg">📁</span><span className="text-[10px] text-gray-600">My Case</span>
            </Link>
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-gray-50">
              <span className="text-lg">👤</span><span className="text-[10px] text-gray-600">Profile</span>
            </Link>
            <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-gray-50">
              <span className="text-lg">⚙️</span><span className="text-[10px] text-gray-600">Settings</span>
            </Link>
          </div>

          {/* Case Tools */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">Case Tools</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { href: '/deadlines', label: 'Calendar Custody Calendar Deadlines', icon: '📅' },
                { href: '/expenses', label: 'Expenses', icon: '💰' },
                { href: '/children', label: 'Children\'s Info', icon: '👧' },
                { href: '/coparent', label: 'Co-Parent Chat', icon: '🤝' },
                { href: '/deadlines', label: 'Deadlines', icon: '⏰' },
                { href: '/templates', label: 'Templates', icon: '📝' },
              ].map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <span>{link.icon}</span>{link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Learn */}
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">Learn & Prepare</div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { href: '/filing', label: 'Filing Guide', icon: '📋' },
                { href: '/court-forms', label: 'Court Forms', icon: '📄' },
                { href: '/rights', label: 'Your Rights', icon: '⚖️' },
                { href: '/judge-insight', label: 'Court Tips', icon: '🏛️' },
                { href: '/calculator', label: 'Calculator', icon: '🧮' },
                { href: '/programs', label: 'Programs', icon: '🛡️' },
              ].map(link => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <span>{link.icon}</span>{link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account & Legal */}
          <div className="border-t border-gray-100 pt-2 space-y-0.5">
            {[
              { href: '/progress', label: 'My Progress', icon: '📊' },
              { href: '/refer', label: 'Invite a Parent', icon: '🤝' },
              { href: '/pricing', label: 'Pricing & Plans', icon: '⭐' },
              { href: '/disclaimer', label: 'Legal Disclaimer', icon: '⚠️' },
              { href: '/privacy', label: 'Privacy Policy', icon: '🔒' },
              { href: '/terms', label: 'Terms of Service', icon: '📃' },
            ].map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
            <button onClick={() => { handleLogout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
              <span>🚪</span>Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

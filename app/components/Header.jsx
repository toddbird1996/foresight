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
          <Link href="/emergency" className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-sm">🚨</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
            {menuOpen ? '✕' : '•••'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown - only secondary pages */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {[
            { href: '/court-forms', label: '📄 Court Forms' },
            { href: '/calendar-custody', label: '📅 Custody Calendar' },
            { href: '/expenses', label: '💰 Expenses' },
            { href: '/children', label: '👧 Children\'s Info' },
            { href: '/coparent', label: '🤝 Co-Parent Chat' },
            { href: '/programs', label: '🛡️ Programs' },
            { href: '/rights', label: '⚖️ Know Your Rights' },
            { href: '/judge-insight', label: '🏛️ Judge Insight' },
            { href: '/calculator', label: '🧮 Support Calculator' },
            { href: '/templates', label: '📝 Doc Templates' },
            { href: '/deadlines', label: '⏰ Deadlines' },
            { href: '/progress', label: '📊 My Progress' },
            { href: '/refer', label: '🤝 Invite a Parent' },
            { href: '/profile', label: '👤 Profile' },
            { href: '/settings', label: '⚙️ Settings' },
            { href: '/pricing', label: '⭐ Pricing' },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
              {link.label}
            </Link>
          ))}
          <button onClick={() => { handleLogout(); setMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50">
            🚪 Logout
          </button>
        </div>
      )}
    </header>
  );
}

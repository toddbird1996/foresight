'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { href: '/cases', label: 'My Case', icon: '📁', activeIcon: '📁' },
  { href: '/filing', label: 'Filing', icon: '📋', activeIcon: '📋' },
  { href: '/community', label: 'Community', icon: '💬', activeIcon: '💬' },
  { href: '/emergency', label: 'SOS', icon: '🚨', activeIcon: '🚨' },
];

// Pages where bottom nav should NOT show
const hiddenPaths = ['/', '/auth', '/pricing'];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on landing, auth, or pricing pages
  if (hiddenPaths.some(p => pathname === p || pathname?.startsWith('/auth'))) return null;
  // Don't show on landing page
  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 sm:hidden">
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {tabs.map(tab => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname?.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-red-600' : 'text-gray-400'
              }`}>
              <span className="text-xl leading-none mb-0.5">{isActive ? tab.activeIcon : tab.icon}</span>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

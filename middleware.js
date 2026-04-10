import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/callback',
  '/',
  '/disclaimer',
  '/privacy',
  '/terms',
];

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if it exists (keeps cookies in sync)
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow public routes and static assets
  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/auth/'));
  const isAsset = pathname.startsWith('/_next') || pathname.startsWith('/icons') || pathname.startsWith('/api') || pathname.includes('.');

  if (isAsset || isPublic) {
    return res;
  }

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};

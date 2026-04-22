import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/cases',
  '/documents',
  '/ai',
  '/deadlines',
  '/calendar',
  '/calendar-custody',
  '/incident-log',
  '/children',
  '/expenses',
  '/coparent',
  '/community',
  '/profile',
  '/settings',
  '/progress',
  '/filing',
  '/forms',
  '/mentors',
  '/schedule-builder',
  '/templates',
  '/admin',
  '/refer',
  '/user',
  '/dm',
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/ai',
  '/api/documents',
  '/api/stripe/checkout',
  '/api/stripe/portal',
];

// Public routes (never redirect)
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/pricing',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/glossary',
  '/rights',
  '/programs',
  '/court-forms',
  '/lawyers',
  '/emergency',
  '/judge-insight',
  '/calculator',
];

export async function middleware(req) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Skip static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') 
  ) {
    return res;
  }

  // Check if this is a protected route
  const isProtectedPage = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedAPI = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedPage && !isProtectedAPI) {
    return res;
  }

  // Validate session server-side
  try {
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      if (isProtectedAPI) {
        // Return 401 for unauthenticated API requests
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      // Redirect to login for protected pages
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session is valid — add user ID header for API routes
    if (isProtectedAPI) {
      res.headers.set('x-user-id', session.user.id);
    }

    return res;
  } catch (error) {
    console.error('Middleware auth error:', error);
    if (isProtectedAPI) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};

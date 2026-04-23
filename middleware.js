import { NextResponse } from 'next/server';

// API routes that require Authorization header
// Note: /api/ai handles its own auth internally via userId + service role key
const PROTECTED_API_ROUTES = [
  '/api/stripe/checkout',
  '/api/stripe/portal',
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  const isProtectedAPI = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedAPI) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};

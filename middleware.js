import { NextResponse } from 'next/server';

// Protected API routes — return 401 if no auth token present
const PROTECTED_API_ROUTES = [
  '/api/ai',
  '/api/documents',
  '/api/stripe/checkout',
  '/api/stripe/portal',
];

export async function middleware(req) {
  const pathname = req.nextUrl.pathname;

  // Check protected API routes — must have Authorization header
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

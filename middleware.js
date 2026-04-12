import { NextResponse } from 'next/server';

// Middleware is kept minimal - each page handles its own auth check
// The supabase client uses localStorage which middleware can't read,
// so we just pass all requests through and let page-level auth handle redirects.
export async function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};

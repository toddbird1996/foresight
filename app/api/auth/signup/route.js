import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MAX_ATTEMPTS = 3;
const WINDOW_MINUTES = 60;

function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '0.0.0.0'
  );
}

export async function POST(request) {
  const ip = getClientIP(request);

  try {
    // Stricter rate limit for signups: 3 per hour per IP
    const { data: allowed } = await supabase.rpc('check_auth_rate_limit', {
      p_ip_address: ip,
      p_attempt_type: 'signup',
      p_window_minutes: WINDOW_MINUTES,
      p_max_attempts: MAX_ATTEMPTS
    });

    if (allowed === false) {
      return NextResponse.json(
        { error: 'Too many signup attempts from this location. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Record attempt
    await supabase.from('auth_rate_limits').insert({
      ip_address: ip,
      attempt_type: 'signup',
      success: true
    });

    return NextResponse.json({ message: 'Proceed with signup' });

  } catch (err) {
    console.error('Signup rate limit error:', err);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

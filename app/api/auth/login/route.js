import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limit: 5 failed attempts per 15 minutes per IP
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

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
    // Check rate limit
    const { data: allowed, error: rateError } = await supabase.rpc('check_auth_rate_limit', {
      p_ip_address: ip,
      p_attempt_type: 'login',
      p_window_minutes: WINDOW_MINUTES,
      p_max_attempts: MAX_ATTEMPTS
    });

    if (rateError) {
      console.error('Rate limit check error:', rateError);
    }

    if (allowed === false) {
      return NextResponse.json(
        { error: `Too many login attempts. Please wait ${WINDOW_MINUTES} minutes before trying again.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Attempt login via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    // Record the attempt
    await supabase.from('auth_rate_limits').insert({
      ip_address: ip,
      attempt_type: 'login',
      success: !error
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ 
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: data.user.id, email: data.user.email }
    });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

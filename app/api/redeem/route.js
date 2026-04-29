import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code) {
      return NextResponse.json({ error: 'User ID and code are required' }, { status: 400 });
    }

    // Call the database function to redeem the code
    const { data, error } = await supabase.rpc('redeem_sponsorship_code', {
      p_user_id: userId,
      p_code: code.trim().toUpperCase()
    });

    if (error) {
      console.error('Redeem error:', error);
      return NextResponse.json({ error: 'Failed to process code' }, { status: 500 });
    }

    if (!data.success) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      tier: data.tier,
      organization: data.organization,
      sponsored_until: data.sponsored_until,
      duration_days: data.duration_days,
      message: `You now have ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} access sponsored by ${data.organization} for ${data.duration_days} days!`
    });

  } catch (err) {
    console.error('Redeem route error:', err);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

// GET — validate a code without redeeming it
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sponsorship_codes')
      .select('code, organization_name, tier, duration_days, uses_remaining, expires_at')
      .eq('code', code.trim().toUpperCase())
      .eq('is_active', true)
      .gt('uses_remaining', 0)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired code' }, { status: 200 });
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      organization: data.organization_name,
      tier: data.tier,
      duration_days: data.duration_days,
      uses_remaining: data.uses_remaining
    });

  } catch (err) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

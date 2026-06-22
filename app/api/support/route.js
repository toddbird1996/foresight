import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, email, subject, message, tier } = await request.json();

    if (!userId || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify user is Gold or Silver
    const { data: user } = await supabase
      .from('users')
      .select('tier, full_name')
      .eq('id', userId)
      .single();

    if (!user || user.tier === 'bronze') {
      return NextResponse.json({ error: 'Priority support is available on Silver and Gold plans' }, { status: 403 });
    }

    // Save ticket to Supabase
    const { error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        email,
        subject,
        message,
        tier: user.tier,
        status: 'open'
      });

    if (ticketError) {
      console.error('Ticket insert error:', ticketError);
      return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 });
    }

    // Send email notification via Resend
    console.log(`[SUPPORT TICKET] From: ${email} | Tier: ${user.tier} | Subject: ${subject}`);
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Foresight Support <onboarding@resend.dev>',
          to: 'Foresightcustodysupport@gmail.com',
          subject: `[Support Ticket] ${subject}`,
          html: `
            <h2>New Support Ticket</h2>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Name:</strong> ${user.full_name || 'N/A'}</p>
            <p><strong>Tier:</strong> ${user.tier}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br/>')}</p>
          `
        })
      }).catch(err => console.error('Resend error:', err));
    }

    return NextResponse.json({ success: true, message: 'Your ticket has been submitted. We will respond within 24 hours.' });

  } catch (err) {
    console.error('Support ticket error:', err);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

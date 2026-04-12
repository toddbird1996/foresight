import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const tier = session.metadata.tier;
        await supabase.from('users').update({
          tier,
          stripe_subscription_id: session.subscription,
          subscription_status: 'active'
        }).eq('id', userId);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata.user_id;
        await supabase.from('users').update({
          subscription_status: sub.status,
          subscription_ends_at: sub.status === 'canceled'
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null
        }).eq('id', userId);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata.user_id;
        await supabase.from('users').update({
          tier: 'bronze',
          subscription_status: 'canceled',
          stripe_subscription_id: null
        }).eq('id', userId);
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// FORESIGHT - STRIPE PAYMENT INTEGRATION
// ============================================

// ============================================
// CONFIGURATION
// ============================================

// Pricing configuration
export const PRICING = {
  bronze: {
    name: 'Bronze',
    price: 0,
    priceId: null, // Free tier
    icon: '🥉',
    color: '#CD7F32',
    features: [
      '10 AI queries per day',
      '1 document analysis per month',
      '1 jurisdiction',
      'Community access',
      'Filing guide access'
    ],
    limits: {
      dailyQueries: 10,
      monthlyDocs: 1,
      jurisdictions: 1,
      mentorAccess: false
    }
  },
  silver: {
    name: 'Silver',
    price: 9.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_SILVER_PRICE_ID || 'price_silver',
    icon: '🥈',
    color: '#C0C0C0',
    features: [
      '25 AI queries per day',
      '5 document analyses per month',
      '3 jurisdictions',
      'Community access',
      'Filing guide access',
      'Limited mentor access',
      'Priority email support'
    ],
    limits: {
      dailyQueries: 25,
      monthlyDocs: 5,
      jurisdictions: 3,
      mentorAccess: 'limited'
    }
  },
  gold: {
    name: 'Gold',
    price: 19.99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID || 'price_gold',
    icon: '🥇',
    color: '#FFD700',
    features: [
      '50 AI queries per day',
      '10 document analyses per month',
      'All jurisdictions',
      'Community access',
      'Filing guide access',
      'Unlimited mentor access',
      'Priority support',
      'Early access to new features'
    ],
    limits: {
      dailyQueries: 50,
      monthlyDocs: 10,
      jurisdictions: 'all',
      mentorAccess: 'unlimited'
    },
    popular: true
  }
};

// ============================================
// SERVER-SIDE: API ROUTES
// ============================================

/**
 * Create Stripe checkout session
 * File: app/api/stripe/checkout/route.js
 */
export const checkoutRouteCode = `
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Verify user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, tier } = await request.json();

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: { supabase_user_id: user.id }
      });
      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/pricing\`,
      metadata: {
        user_id: user.id,
        tier: tier
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          tier: tier
        }
      }
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

/**
 * Stripe webhook handler
 * File: app/api/stripe/webhook/route.js
 */
export const webhookRouteCode = `
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.user_id;
        const tier = session.metadata.tier;

        await supabase
          .from('users')
          .update({
            tier: tier,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active'
          })
          .eq('id', userId);

        // Send welcome email, etc.
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            subscription_ends_at: subscription.status === 'canceled' 
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null
          })
          .eq('id', userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        await supabase
          .from('users')
          .update({
            tier: 'bronze',
            subscription_status: 'canceled',
            stripe_subscription_id: null
          })
          .eq('id', userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        // Handle failed payment - send email, etc.
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

/**
 * Create customer portal session
 * File: app/api/stripe/portal/route.js
 */
export const portalRouteCode = `
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/profile\`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`;

// ============================================
// CLIENT-SIDE: HOOKS
// ============================================

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

/**
 * Hook for handling subscription checkout
 */
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkout = async (tier) => {
    const priceId = PRICING[tier]?.priceId;
    if (!priceId) {
      setError('Invalid tier selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ priceId, tier })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}

/**
 * Hook for managing subscription
 */
export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open portal');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { openPortal, loading, error };
}

// ============================================
// REACT COMPONENTS
// ============================================

import React from 'react';

/**
 * Pricing Page Component
 */
export function PricingPage({ currentTier = 'bronze', onBack }) {
  const { checkout, loading, error } = useCheckout();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2"
        >
          ← Back
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Plan
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Start free, upgrade when you need more
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PRICING).map(([key, tier]) => (
            <PricingCard
              key={key}
              tier={tier}
              tierKey={key}
              isCurrentPlan={currentTier === key}
              onSelect={() => checkout(key)}
              loading={loading}
            />
          ))}
        </div>

        {/* FAQ or additional info */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 mb-4">
            All plans include a 7-day money-back guarantee
          </p>
          <p className="text-sm text-slate-500">
            Questions? Contact us at support@foresight.app
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * Individual Pricing Card
 */
function PricingCard({ tier, tierKey, isCurrentPlan, onSelect, loading }) {
  return (
    <div
      className={`relative p-6 rounded-2xl border ${
        tier.popular
          ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/50'
          : 'bg-slate-900/50 border-slate-800'
      }`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black rounded-full text-sm font-semibold">
          BEST VALUE
        </div>
      )}

      {/* Icon & Name */}
      <div className="text-4xl mb-2">{tier.icon}</div>
      <h3 
        className="text-2xl font-semibold mb-1"
        style={{ color: tier.color }}
      >
        {tier.name}
      </h3>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold">${tier.price}</span>
        <span className="text-slate-400">/month</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-green-400 mt-0.5">✓</span>
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        disabled={isCurrentPlan || loading || tier.price === 0}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          isCurrentPlan
            ? 'border border-slate-700 text-slate-400 cursor-default'
            : tier.popular
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-90'
            : tierKey === 'silver'
            ? 'bg-gradient-to-r from-slate-400 to-slate-300 text-black hover:opacity-90'
            : 'border border-slate-700 text-white hover:bg-slate-800'
        } disabled:opacity-50`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            Processing...
          </span>
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : tier.price === 0 ? (
          'Get Started'
        ) : (
          'Upgrade'
        )}
      </button>
    </div>
  );
}

/**
 * Upgrade Modal Component
 */
export function UpgradeModal({ isOpen, onClose, currentTier = 'bronze' }) {
  const { checkout, loading, error } = useCheckout();
  const [selected, setSelected] = useState(
    currentTier === 'bronze' ? 'silver' : 'gold'
  );

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    await checkout(selected);
  };

  const availableTiers = Object.entries(PRICING)
    .filter(([key]) => key !== 'bronze' && key !== currentTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          Upgrade Your Plan
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tier Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {availableTiers.map(([key, tier]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`p-4 rounded-xl border-2 text-left transition-colors ${
                selected === key
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{tier.icon}</div>
              <div className="font-semibold" style={{ color: tier.color }}>
                {tier.name}
              </div>
              <div className="text-lg font-bold">
                ${tier.price}
                <span className="text-sm text-slate-500">/mo</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Plan Features */}
        <div className="p-4 rounded-xl bg-slate-800/50 mb-6">
          <h3 className="font-semibold mb-2">
            {PRICING[selected].name} includes:
          </h3>
          <ul className="space-y-1 text-sm text-slate-300">
            {PRICING[selected].features.slice(0, 5).map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Upgrade to ${PRICING[selected].name} - $${PRICING[selected].price}/mo`
          )}
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 text-slate-400 hover:text-white mt-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

/**
 * Subscription Management in Profile
 */
export function SubscriptionSection({ profile }) {
  const { openPortal, loading, error } = useSubscription();
  const tier = PRICING[profile?.tier] || PRICING.bronze;

  return (
    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Subscription</h3>
        <div
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{ 
            backgroundColor: `${tier.color}20`, 
            color: tier.color 
          }}
        >
          {tier.icon} {tier.name}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {profile?.subscription_status === 'active' ? (
        <>
          <p className="text-sm text-slate-400 mb-4">
            Your {tier.name} subscription is active.
            {profile.subscription_ends_at && (
              <> Renews on {new Date(profile.subscription_ends_at).toLocaleDateString()}.</>
            )}
          </p>
          <button
            onClick={openPortal}
            disabled={loading}
            className="w-full py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Manage Subscription'}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-4">
            You're on the free Bronze plan. Upgrade to unlock more features.
          </p>
          <a
            href="/pricing"
            className="block w-full py-3 text-center bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-white hover:opacity-90"
          >
            View Plans
          </a>
        </>
      )}
    </div>
  );
}

// ============================================
// SETUP INSTRUCTIONS
// ============================================

export const STRIPE_SETUP_GUIDE = `
# Stripe Integration Setup

## 1. Create Stripe Account
- Go to https://stripe.com
- Create an account and verify your business

## 2. Get API Keys
- Dashboard → Developers → API Keys
- Copy the Publishable key and Secret key

## 3. Create Products & Prices
In Stripe Dashboard → Products:

### Silver Plan
- Name: Foresight Silver
- Price: $9.99/month
- Copy the Price ID (starts with price_)

### Gold Plan  
- Name: Foresight Gold
- Price: $19.99/month
- Copy the Price ID

## 4. Set Up Webhook
Dashboard → Developers → Webhooks → Add endpoint
- URL: https://your-domain.com/api/stripe/webhook
- Events to listen for:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_failed

Copy the Webhook signing secret

## 5. Environment Variables
Add to .env.local:

\`\`\`
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_SILVER_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID=price_xxx
\`\`\`

## 6. Install Dependencies
\`\`\`bash
npm install stripe @stripe/stripe-js
\`\`\`

## 7. Create API Routes
Copy the route code from this file to:
- app/api/stripe/checkout/route.js
- app/api/stripe/webhook/route.js
- app/api/stripe/portal/route.js

## 8. Configure Customer Portal
Dashboard → Settings → Billing → Customer portal
- Enable subscription management
- Allow cancellation
- Set return URL

## 9. Testing
Use test mode first:
- Test card: 4242 4242 4242 4242
- Any future date, any CVC

## 10. Go Live
- Complete Stripe verification
- Switch to live API keys
- Test with real card
`;

// ============================================
// EXPORTS  
// ============================================

export default {
  PRICING,
  useCheckout,
  useSubscription,
  PricingPage,
  PricingCard,
  UpgradeModal,
  SubscriptionSection
};

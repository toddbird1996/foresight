"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import SponsorshipCodeInput from '../components/SponsorshipCode';

const PLANS = [
  {
    id: 'bronze',
    name: 'Bronze',
    price: 'Free',
    priceNum: 0,
    period: '',
    description: 'Get started with essential tools',
    features: [
      'Custody guides & filing resources',
      'Community forum & chat rooms',
      'Co-parent messenger',
      'Calendar & deadlines',
      'Programs directory',
      '2 GB document storage',
      '5 AI questions (one-time trial)',
      '1 PDF scan (one-time trial)',
    ],
    notIncluded: ['Monthly AI credits', 'Monthly PDF scans', 'Priority support'],
    popular: false,
    buttonStyle: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
    priceId: null,
  },
  {
    id: 'silver',
    name: 'Silver',
    price: '$19.99',
    priceNum: 19.99,
    period: '/month CAD',
    description: 'Full AI-powered custody guidance',
    features: [
      'Everything in Bronze',
      '500 AI questions per month',
      '5 PDF scans per month',
      'AI document analysis',
      '10 GB document storage',
    ],
    notIncluded: ['Priority support', 'Unlimited storage'],
    popular: true,
    buttonStyle: 'bg-red-600 hover:bg-red-700 text-white',
    priceId: process.env.NEXT_PUBLIC_STRIPE_SILVER_PRICE_ID,
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$29.99',
    priceNum: 29.99,
    period: '/month CAD',
    description: 'Premium support for complex cases',
    features: [
      'Everything in Silver',
      '2,000 AI questions per month',
      '20 PDF scans per month',
      'Priority support',
      'Unlimited storage',
      'Document review by mentors',
    ],
    notIncluded: [],
    popular: false,
    buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
    priceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE_ID,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('bronze');
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase.from("users").select("tier").eq("id", user.id).single();
        if (profile?.tier) setUserTier(profile.tier);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Check for successful upgrade redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      router.replace('/dashboard?upgraded=true');
    }
  }, []);

  const handleSelectPlan = async (plan) => {
    if (!user) { router.push('/auth/login'); return; }
    if (plan.id === userTier) return;

    if (plan.id === 'bronze') {
      const { error } = await supabase.from('users').update({ tier: 'bronze' }).eq('id', user.id);
      if (!error) { setUserTier('bronze'); }
      return;
    }

    if (!plan.priceId || plan.priceId === 'undefined') {
      setError('Payment is not yet configured. Please contact support.');
      return;
    }

    setCheckingOut(plan.id);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ priceId: plan.priceId, tier: plan.id })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setCheckingOut(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Pricing" subtitle="A coach in your corner — choose your plan" icon="⭐" />

      {/* Sponsorship Code */}
      <div className="max-w-md mx-auto mt-4 mb-2 px-4">
        <SponsorshipCodeInput
          userId={user?.id}
          currentTier={profile?.tier}
          onSuccess={() => window.location.reload()}
        />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get the support you need to navigate your family law case. All plans include access to our community and filing guides.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative bg-white border rounded-2xl p-6 ${plan.popular ? 'border-red-500 shadow-lg' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-600">✓</span> {f}
                  </li>
                ))}
                {plan.notIncluded.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <span>✗</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={plan.id === userTier || checkingOut === plan.id}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.buttonStyle} ${plan.id === userTier || checkingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {checkingOut === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Redirecting...
                  </span>
                ) : plan.id === userTier ? 'Current Plan' : plan.id === 'bronze' ? 'Downgrade' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Current plan banner */}
        {userTier !== 'bronze' && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              You're on the <strong className="capitalize">{userTier}</strong> plan.{' '}
              <button
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  const res = await fetch('/api/stripe/portal', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="text-red-600 hover:underline"
              >
                Manage subscription →
              </button>
            </p>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: "Yes. Cancel or downgrade at any time. You'll keep access until the end of your billing period." },
              { q: 'Is the AI assistant a lawyer?', a: 'No. The AI provides general information about custody procedures, not legal advice. Always consult a lawyer for your specific situation.' },
              { q: 'What payment methods do you accept?', a: 'All major credit cards through Stripe. Your payment information is securely processed and never stored on our servers.' },
              { q: 'Do you offer refunds?', a: 'We offer a 7-day money-back guarantee. Contact us within 7 days for a full refund.' },
              { q: 'What happens to my data if I downgrade?', a: 'Your data is always safe. If you downgrade to Bronze, you keep all your documents and case data — only the AI and PDF scan features become limited.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">Have questions? <a href="mailto:support@foresight.app" className="text-red-600 hover:underline">Contact us</a></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

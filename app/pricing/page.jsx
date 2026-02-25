"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PricingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('bronze');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("users")
          .select("tier")
          .eq("id", user.id)
          .single();

        if (profile?.tier) {
          setUserTier(profile.tier);
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'Free',
      period: '',
      description: 'Get started with the basics',
      features: [
        'Filing guide access',
        'Court forms library',
        'Deadline tracking',
        'Community access',
        '5 AI questions/month',
      ],
      notIncluded: [
        'Unlimited AI assistant',
        'Document storage',
        'Priority support',
        'Mentor access',
      ],
      buttonText: userTier === 'bronze' ? 'Current Plan' : 'Downgrade',
      buttonStyle: 'bg-slate-700 hover:bg-slate-600',
      popular: false,
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '$9.99',
      period: '/month',
      description: 'Everything you need to navigate custody',
      features: [
        'Everything in Bronze',
        'Unlimited AI assistant',
        '10 GB document storage',
        'Email support',
        'Export documents to PDF',
      ],
      notIncluded: [
        'Priority support',
        'Mentor access',
      ],
      buttonText: userTier === 'silver' ? 'Current Plan' : 'Upgrade to Silver',
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
      popular: true,
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '$24.99',
      period: '/month',
      description: 'Premium support for complex cases',
      features: [
        'Everything in Silver',
        'Priority 24/7 support',
        '1-on-1 mentor matching',
        'Unlimited document storage',
        'Case strategy sessions',
        'Document review by mentors',
      ],
      notIncluded: [],
      buttonText: userTier === 'gold' ? 'Current Plan' : 'Upgrade to Gold',
      buttonStyle: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      popular: false,
    },
  ];

  const handleSelectPlan = async (planId) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (planId === userTier) {
      return;
    }

    if (planId === 'bronze') {
      const { error } = await supabase
        .from('users')
        .update({ tier: 'bronze' })
        .eq('id', user.id);

      if (!error) {
        setUserTier('bronze');
        alert('Downgraded to Bronze plan');
      }
    } else {
      alert(`Stripe integration coming soon!\n\nThis will upgrade you to ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/95 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
            <h1 className="text-xl font-bold">Pricing</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Get the support you need to navigate your custody case. All plans include access to our community and filing guides.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-900 border rounded-2xl p-6 ${
                plan.popular ? 'border-orange-500' : 'border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
                {plan.notIncluded.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <span>✗</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={plan.id === userTier}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.buttonStyle} ${
                  plan.id === userTier ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
              <p className="text-slate-400 text-sm">Yes! You can cancel or downgrade your subscription at any time. You'll keep access until the end of your billing period.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Is the AI assistant a lawyer?</h4>
              <p className="text-slate-400 text-sm">No. The AI provides general information about custody procedures, not legal advice. Always consult a lawyer for your specific situation.</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-slate-400 text-sm">We accept all major credit cards through Stripe. Your payment information is securely processed and never stored on our servers.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-slate-400 text-sm">We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days for a full refund.</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            Have questions? <a href="mailto:support@foresight.app" className="text-orange-400 hover:underline">Contact us</a>
          </p>
        </div>
      </main>
    </div>
  );
      }

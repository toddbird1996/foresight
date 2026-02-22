"use client";

// ============================================
// FORESIGHT - MARKETING LANDING PAGE
// ============================================

import React, { useState, useEffect } from 'react';

// ============================================
// MAIN LANDING PAGE
// ============================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

// ============================================
// NAVBAR
// ============================================

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/95 backdrop-blur-lg border-b border-slate-800' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl">
              👁️
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Foresight
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition-colors">FAQ</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-slate-300 hover:text-white transition-colors">
              Sign In
            </a>
            <a
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-slate-300 hover:text-white">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white">How It Works</a>
              <a href="#pricing" className="text-slate-300 hover:text-white">Pricing</a>
              <a href="#faq" className="text-slate-300 hover:text-white">FAQ</a>
              <hr className="border-slate-800" />
              <a href="/login" className="text-slate-300 hover:text-white">Sign In</a>
              <a href="/signup" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium text-center">
                Get Started Free
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm text-orange-300">Now available in Saskatchewan, Alberta, Ontario & BC</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Navigate Custody Battles{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Without Breaking the Bank
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Built by a parent who spent $30,000 on lawyers and lost—then figured out the system and won. 
            Now helping thousands do the same.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Start Free Today
              <span>→</span>
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>▶</span>
              See How It Works
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              24/7 AI assistance
            </div>
          </div>
        </div>

        {/* Hero Image / App Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/10">
            <div className="p-1 bg-slate-800 flex items-center gap-2">
              <div className="flex gap-1.5 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center text-xs text-slate-500">app.foresight.ca</div>
            </div>
            <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
              <div className="text-center text-slate-600">
                <div className="text-6xl mb-4">📊</div>
                <div>Dashboard Preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SOCIAL PROOF BAR
// ============================================

function SocialProofBar() {
  const stats = [
    { value: '2,500+', label: 'Parents Helped' },
    { value: '$4.2M', label: 'Legal Fees Saved' },
    { value: '4.9/5', label: 'User Rating' },
    { value: '24/7', label: 'AI Support' }
  ];

  return (
    <section className="py-12 border-y border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PROBLEM SECTION
// ============================================

function ProblemSection() {
  const problems = [
    { icon: '💸', title: '$15,000 - $50,000', description: 'Average cost of a custody lawyer in Canada' },
    { icon: '📚', title: 'Overwhelming Complexity', description: 'Forms, deadlines, procedures—it\'s designed to confuse you' },
    { icon: '😰', title: 'Emotional Exhaustion', description: 'Fighting for your kids while navigating a broken system' },
    { icon: '⏰', title: 'Months of Delays', description: 'One missed form can set you back weeks or months' }
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            The Family Court System is{' '}
            <span className="text-red-400">Broken</span>
          </h2>
          <p className="text-xl text-slate-400">
            Every year, thousands of parents lose custody battles—not because they're bad parents, 
            but because they can't afford the legal help they need.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 text-center"
            >
              <div className="text-4xl mb-4">{problem.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
              <p className="text-slate-400">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SOLUTION SECTION
// ============================================

function SolutionSection() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-6">
              There's a better way
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              What if You Had a{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Custody Expert
              </span>{' '}
              in Your Pocket?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Foresight gives you everything you need to navigate custody court confidently—
              step-by-step guides, AI assistance, and a community of parents who've been there.
            </p>
            <ul className="space-y-4">
              {[
                'Know exactly what forms to file and when',
                'Get instant answers to your custody questions',
                'Never miss a deadline again',
                'Connect with parents who\'ve won their cases'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6">
              {/* Mock AI Chat */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">👤</div>
                  <div className="flex-1 p-3 rounded-xl bg-slate-800 text-sm">
                    How do I file for custody in Saskatchewan?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm">🤖</div>
                  <div className="flex-1 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-sm">
                    <p className="mb-2">Here's your step-by-step guide for Saskatchewan:</p>
                    <p className="text-slate-400">1. Complete Family Dispute Resolution (FDR)</p>
                    <p className="text-slate-400">2. Take the "For Kids' Sake" parenting course</p>
                    <p className="text-slate-400">3. Prepare Form 70A (Petition)...</p>
                    <p className="text-orange-400 mt-2">Want me to explain each step in detail?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FEATURES SECTION
// ============================================

function FeaturesSection() {
  const features = [
    {
      icon: '📋',
      title: 'Step-by-Step Filing Guides',
      description: 'Province-specific guides walk you through every form, every deadline, every step. Never wonder "what\'s next?" again.',
      color: 'orange'
    },
    {
      icon: '🤖',
      title: '24/7 AI Legal Assistant',
      description: 'Get instant answers to your custody questions. Our AI understands Canadian family law and speaks plain English.',
      color: 'blue'
    },
    {
      icon: '👥',
      title: 'Parent Community',
      description: 'Connect with thousands of parents going through the same thing. Share experiences, get advice, find support.',
      color: 'green'
    },
    {
      icon: '🤝',
      title: 'Mentor Matching',
      description: 'Get paired with parents who\'ve successfully navigated their cases. Learn from their experience.',
      color: 'purple'
    },
    {
      icon: '📄',
      title: 'Document Analysis',
      description: 'Upload your documents for AI-powered review. Get suggestions to strengthen your filings.',
      color: 'pink'
    },
    {
      icon: '📅',
      title: 'Deadline Tracking',
      description: 'Never miss a court date or filing deadline. Get reminders via email, text, and push notifications.',
      color: 'red'
    }
  ];

  const colorClasses = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30'
  };

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Win Your Case
            </span>
          </h2>
          <p className="text-xl text-slate-400">
            A complete toolkit designed by parents, for parents.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-gradient-to-br ${colorClasses[feature.color]} border hover:scale-[1.02] transition-transform`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS SECTION
// ============================================

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Tell Us Your Situation',
      description: 'Select your province, where you are in the process, and what you need help with.',
      icon: '📍'
    },
    {
      number: '02',
      title: 'Get Your Personalized Guide',
      description: 'We create a step-by-step roadmap specific to your jurisdiction and situation.',
      icon: '🗺️'
    },
    {
      number: '03',
      title: 'Take Action with Confidence',
      description: 'Follow the guide, use AI assistance, track deadlines, and connect with mentors.',
      icon: '⚡'
    },
    {
      number: '04',
      title: 'Win Your Case',
      description: 'Navigate court like a pro. Get the custody arrangement your children deserve.',
      icon: '🏆'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            How Foresight Works
          </h2>
          <p className="text-xl text-slate-400">
            From confusion to clarity in four simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent" />
              )}
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-4xl">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// TESTIMONIALS SECTION
// ============================================

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I was about to spend $20,000 on a lawyer. Foresight helped me understand the process and I represented myself successfully. I got 50/50 custody.",
      author: "Michael T.",
      location: "Regina, SK",
      avatar: "M",
      result: "Won 50/50 custody"
    },
    {
      quote: "The AI assistant answered questions my expensive lawyer couldn't explain clearly. It's like having a legal expert available 24/7.",
      author: "Sarah L.",
      location: "Calgary, AB",
      avatar: "S",
      result: "Primary custody"
    },
    {
      quote: "The community here saved me. Connecting with other parents who understood what I was going through made all the difference.",
      author: "Jennifer K.",
      location: "Toronto, ON",
      avatar: "J",
      result: "Full custody"
    }
  ];

  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Trusted by Parents{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              Across Canada
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(5)].map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-lg mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold">{t.author}</div>
                  <div className="text-sm text-slate-400">{t.location}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  ✓ {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PRICING SECTION
// ============================================

function PricingSection() {
  const plans = [
    {
      name: 'Bronze',
      price: 'Free',
      period: 'forever',
      icon: '🥉',
      description: 'Get started with the basics',
      features: [
        'Filing guide access',
        'Community access',
        'Court forms library',
        '1 jurisdiction'
      ],
      notIncluded: [
        'AI assistant',
        'Document analysis',
        'Mentor access'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Silver',
      price: '$9.99',
      period: 'CAD/month',
      icon: '🥈',
      description: 'AI-powered assistance',
      features: [
        '25 AI queries per day',
        '5 document analyses/month',
        'Filing guide access',
        'Community access',
        'Court forms library',
        '3 jurisdictions',
        'Email support'
      ],
      cta: 'Get Silver',
      popular: false
    },
    {
      name: 'Gold',
      price: '$19.99',
      period: 'CAD/month',
      icon: '🥇',
      description: 'Everything you need to win',
      features: [
        'Unlimited AI queries',
        'Unlimited document analyses',
        'Filing guide access',
        'Community access',
        'Court forms library',
        'All jurisdictions',
        'Mentor access',
        'Priority support'
      ],
      cta: 'Get Gold',
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400">
            Less than a single hour of lawyer time. Full access to everything you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-2xl border ${
                plan.popular
                  ? 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/50'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-black rounded-full text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{plan.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period !== 'forever' && (
                  <span className="text-slate-400 ml-1">{plan.period}</span>
                )}
              </div>

<a
                href="/signup"
                className={`block w-full py-3 rounded-xl font-semibold text-center transition-colors ${
                  plan.popular
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90'
                    : 'border border-slate-700 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 mt-8">
          All plans include 7-day money-back guarantee. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

// ============================================
// FAQ SECTION
// ============================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'Is Foresight legal advice?',
      answer: 'No. Foresight provides legal information and educational resources to help you understand custody procedures. We are not a law firm and do not provide legal advice. For advice specific to your situation, consult a qualified lawyer.'
    },
    {
      question: 'Which provinces do you support?',
      answer: 'We currently support Saskatchewan, Alberta, Ontario, and British Columbia with complete filing guides and court forms. Manitoba, Quebec, and Nova Scotia are in beta. US states (California, Texas, New York, Florida, Washington) are coming soon.'
    },
    {
      question: 'How is Foresight different from a lawyer?',
      answer: 'Lawyers provide legal advice and can represent you in court. Foresight helps you understand the process, track deadlines, and prepare your documents. Many users use Foresight alongside limited lawyer consultations to reduce costs while staying informed.'
    },
    {
      question: 'Can I really represent myself in family court?',
      answer: 'Yes! Many parents successfully represent themselves (called "self-represented litigants"). Courts are required to accommodate self-represented parties. Foresight gives you the knowledge and tools to do this confidently.'
    },
    {
      question: 'What if I have a complicated case?',
      answer: 'For complex cases involving domestic violence, parental alienation, or international custody, we recommend consulting a lawyer. Foresight can still help you understand the process and prepare, but some situations require professional legal help.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Absolutely. We use bank-level encryption, store data in secure Canadian data centers, and never share your information with third parties. Your documents and conversations are private and protected.'
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-900/50"
              >
                <span className="font-semibold">{faq.question}</span>
                <span className="text-2xl">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-slate-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA SECTION
// ============================================

function CTASection() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Fight for Your Kids?
        </h2>
        <p className="text-xl text-slate-400 mb-8">
          Join thousands of parents who've navigated custody court with confidence. 
          Start free today—no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started Free →
          </a>
          <a
            href="/demo"
            className="w-full sm:w-auto px-8 py-4 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-colors"
          >
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================

function Footer() {
  return (
    <footer className="py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl">
                👁️
              </div>
              <span className="text-xl font-bold">Foresight</span>
            </div>
            <p className="text-slate-400 text-sm">
              Helping parents navigate custody battles with confidence.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#features" className="hover:text-white">Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href="/demo" className="hover:text-white">Demo</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/guides" className="hover:text-white">Guides</a></li>
              <li><a href="/community" className="hover:text-white">Community</a></li>
              <li><a href="/support" className="hover:text-white">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              <li><a href="/disclaimer" className="hover:text-white">Legal Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Foresight. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Made with ❤️ in Saskatchewan, Canada
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// EXPORTS
// ============================================

export default LandingPage;

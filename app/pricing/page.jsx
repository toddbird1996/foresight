'use client';

// Correct relative import for PricingPage
import PricingPage from '../../components/PricingPage';

// Optional: Stripe import (fixed relative path)
import stripe from '../../lib/stripe';

export default function Pricing() {
  return <PricingPage />;
}

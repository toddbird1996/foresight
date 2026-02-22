'use client';
import React from 'react';

// Preloaded pricing data
const pricingPlans = [
  { id: 1, type: "Bronze", price: "Free" },
  { id: 2, type: "Silver", price: "$9.99 USD" },
  { id: 3, type: "Gold", price: "$19.99 USD" },
];

export default function PricingPage() {
  return (
    <div>
      <h1>Pricing Plans</h1>
      <ul>
        {pricingPlans.map(plan => (
          <li key={plan.id}>
            <strong>{plan.type}:</strong> {plan.price}
          </li>
        ))}
      </ul>
      <p>Choose the plan that fits your needs. All plans include full access to preloaded features.</p>
    </div>
  );
}

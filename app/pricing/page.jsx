"use client";

import React, { useState, useEffect } from "react";
import { placeholderPricing } from "../../lib/placeholders";

export default function PricingPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    setPlans(placeholderPricing);
  }, []);

  return (
    <div>
      <h1>Pricing Plans</h1>
      {plans.map((plan) => (
        <div key={plan.id} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
          <h2>{plan.plan}</h2>
          <p>Price: {plan.price}</p>
          <ul>
            {plan.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

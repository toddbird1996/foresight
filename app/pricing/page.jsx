"use client";

import React from "react";
import { placeholderPricing } from "../../lib/placeholders";

export default function PricingPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pricing</h1>
      <ul className="space-y-2">
        {placeholderPricing.map((plan) => (
          <li key={plan.id} className="border p-4 rounded shadow hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{plan.name}</span>
              <span className="text-gray-700">{plan.price}</span>
            </div>
            <p className="text-gray-600 mt-1">{plan.details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

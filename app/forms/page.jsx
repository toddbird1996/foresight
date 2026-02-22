// app/forms/page.jsx
"use client";

import React from "react";
import { placeholderForms } from "../lib/placeholders";

export default function FormsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forms</h1>
      <ul className="space-y-2">
        {placeholderForms.map((form) => (
          <li key={form.id} className="border p-4 rounded shadow hover:bg-gray-50">
            <a href={form.form_url} className="text-blue-600 hover:underline">
              {form.form_name} ({form.jurisdiction})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

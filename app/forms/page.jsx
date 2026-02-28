"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import placeholderForms from "../../lib/placeholders";

export default function FormsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Forms</h1>
        <ul className="space-y-2">
          {placeholderForms.forms?.map((form) => (
            <li key={form.id} className="bg-white border border-gray-200 p-4 rounded-xl hover:border-red-500">
              <a href={form.link} className="text-red-600 hover:underline">
                {form.name} ({form.type})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}

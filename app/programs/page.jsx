"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { placeholderPrograms } from "../lib/placeholders";

export default function ProgramsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Programs</h1>
        <ul className="space-y-2">
          {placeholderPrograms?.map((program) => (
            <li key={program.id} className="bg-white border border-gray-200 p-4 rounded-xl hover:border-red-500">
              <a href={program.link} className="text-red-600 hover:underline">
                {program.name} ({program.type})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}

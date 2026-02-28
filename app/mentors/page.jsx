"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import placeholders from "../lib/placeholders";

export default function MentorsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Mentors</h1>
        <ul className="space-y-2">
          {placeholders.mentors?.map((mentor) => (
            <li key={mentor.id} className="bg-white border border-gray-200 p-4 rounded-xl hover:border-red-500">
              <a href={mentor.link} className="text-red-600 hover:underline">
                {mentor.name} ({mentor.expertise})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </ProtectedRoute>
  );
}

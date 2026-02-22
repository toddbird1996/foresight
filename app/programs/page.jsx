"use client";

import React from "react";
import programs from '../../data/programs.json';

export default function ProgramsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Programs</h1>
      <ul className="space-y-2">
        {programs.map((program) => (
          <li key={program.id} className="border p-4 rounded shadow hover:bg-gray-50">
            <a href={program.link} className="text-blue-600 hover:underline">
              {program.name} ({program.type})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

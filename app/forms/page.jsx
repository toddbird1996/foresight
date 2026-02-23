"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function FormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForms() {
      const { data, error } = await supabase.from("forms").select("*");
      if (error) {
        console.error("Error fetching forms:", error);
      } else {
        setForms(data);
      }
      setLoading(false);
    }

    fetchForms();
  }, []);

  if (loading) return <p>Loading forms...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forms</h1>
      <ul className="space-y-2">
        {forms.map((form) => (
          <li
            key={form.id}
            className="border p-4 rounded shadow hover:bg-gray-50"
          >
            <a
              href={form.link}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {form.name} ({form.type})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching programs:", error);
      } else {
        setPrograms(data);
      }

      setLoading(false);
    };

    fetchPrograms();
  }, []);

  if (loading) return <p className="p-6">Loading programs...</p>;

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

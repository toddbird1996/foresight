"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CourtFormsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchJurisdictions();
      setLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (selectedJurisdiction) {
      fetchForms(selectedJurisdiction.id);
    }
  }, [selectedJurisdiction]);

  const fetchJurisdictions = async () => {
    const { data, error } = await supabase
      .from("jurisdictions")
      .select("*")
      .order("display_order");

    if (error) {
      console.error("Error fetching jurisdictions:", error);
      return;
    }

    setJurisdictions(data || []);
    
    const sk = data?.find(j => j.id === 'saskatchewan');
    if (sk) {
      setSelectedJurisdiction(sk);
    } else if (data && data.length > 0) {
      setSelectedJurisdiction(data[0]);
    }
  };

  const fetchForms = async (jurisdictionId) => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("jurisdiction_id", jurisdictionId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching forms:", error);
    } else {
      setForms(data || []);
    }
    setSelectedCategory("all");
  };

  const categories = ["all", ...new Set(forms.map(f => f.category).filter(Boolean))];

  const filteredForms = selectedCategory === "all" 
    ? forms 
    : forms.filter(f => f.category === selectedCategory);

  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading court forms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
              <h1 className="text-xl font-bold text-gray-900">Court Forms Library</h1>
            </div>
          </div>

          {/* Jurisdiction Selector */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Select Jurisdiction</label>
            <select
              value={selectedJurisdiction?.id || ''}
              onChange={(e) => {
                const j = jurisdictions.find(j => j.id === e.target.value);
                setSelectedJurisdiction(j);
              }}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <optgroup label="🇨🇦 Canada">
                {canadianJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
              <optgroup label="🇺🇸 United States">
                {usJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Category Filter */}
          {forms.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {cat === "all" ? "All Forms" : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {forms.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <p className="text-gray-600 mb-4">
              No forms available for {selectedJurisdiction?.name} yet.
            </p>
            <p className="text-sm text-gray-500">
              Forms for this jurisdiction will be added soon. Currently Saskatchewan, Ontario, Alberta, Texas, and California have forms available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-red-600 font-mono text-sm font-medium">{form.form_number}</span>
                      {form.category && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          {form.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{form.name}</h3>
                    <p className="text-gray-600 text-sm">{form.description}</p>
                  </div>

                  {form.download_url && (
                    <a
                      href={form.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0"
                    >
                      📄 Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Card */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">💡 Need Help With a Form?</h3>
          <p className="text-sm text-red-700 mb-3">
            Our AI assistant can explain what each form is for and how to fill it out.
          </p>
          <Link 
            href="/ai"
            className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Ask AI Assistant →
          </Link>
        </div>
      </main>
    </div>
  );
}

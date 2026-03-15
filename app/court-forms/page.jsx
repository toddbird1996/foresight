// Court forms fix v2
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

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
      fetchForms(selectedJurisdiction.name);
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

  const fetchForms = async (jurisdictionName) => {
    const { data, error } = await supabase
      .from("court_forms")
      .select("*")
      .eq("state_province", jurisdictionName)
      .order("filing_order", { ascending: true });

    if (error) {
      console.error("Error fetching forms:", error);
    } else {
      setForms(data || []);
    }
    setSelectedCategory("all");
  };

  const categories = ["all", ...new Set(forms.map(f => f.filing_procedure).filter(Boolean))];

  const filteredForms = selectedCategory === "all" 
    ? forms 
    : forms.filter(f => f.filing_procedure === selectedCategory);

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
      <Header />
        <PageTitle title="Court Forms" subtitle="Download official forms by province" icon="📄" />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Jurisdiction Selector */}
        <select value={selectedJurisdiction?.id || ''} onChange={e => {
          const j = jurisdictions.find(j => j.id === e.target.value);
          if (j) setSelectedJurisdiction(j);
        }} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-red-400">
          <optgroup label="🇨🇦 Canada">
            {canadianJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </optgroup>
          {usJurisdictions.length > 0 && <optgroup label="🇺🇸 United States">
            {usJurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </optgroup>}
        </select>

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
                      <span className="text-red-600 font-mono text-sm font-medium">{form.court_name}</span>
                      {form.filing_procedure && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                          {form.filing_procedure}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{form.form_name}</h3>
                    <p className="text-gray-600 text-sm">{form.form_description}</p>
                  </div>

                  {form.form_url && form.downloadable && (
                    <a
                      href={form.form_url}
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
            href="/cases"
            className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
          >
            Ask AI Assistant →
          </Link>
        </div>
      </main>
    </div>
  );
}

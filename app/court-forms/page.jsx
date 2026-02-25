"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CourtFormsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
      await fetchForms();
      setLoading(false);
    };

    init();
  }, []);

  const fetchForms = async () => {
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("jurisdiction_id", "saskatchewan")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching forms:", error);
    } else {
      setForms(data);
    }
  };

  const categories = ["all", ...new Set(forms.map(f => f.category).filter(Boolean))];

  const filteredForms = selectedCategory === "all" 
    ? forms 
    : forms.filter(f => f.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading court forms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
              <h1 className="text-xl font-bold">Court Forms Library</h1>
            </div>
            <span className="text-sm text-slate-400">Saskatchewan</span>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat === "all" ? "All Forms" : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredForms.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
            No forms found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-400 font-mono text-sm">{form.form_number}</span>
                      {form.category && (
                        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded">
                          {form.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{form.name}</h3>
                    <p className="text-slate-400 text-sm">{form.description}</p>
                  </div>

                  {form.download_url && (
                    <a
                      href={form.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex-shrink-0"
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
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="font-semibold text-blue-400 mb-2">💡 Need Help With a Form?</h3>
          <p className="text-sm text-slate-400 mb-3">
            Our AI assistant can explain what each form is for and how to fill it out.
          </p>
          <Link 
            href="/ai"
            className="inline-block px-4 py-2 bg-blue-500 rounded-lg text-sm font-medium"
          >
            Ask AI Assistant →
          </Link>
        </div>
      </main>
    </div>
  );
            }

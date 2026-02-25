"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

export default function FormDetail({ params }) {
  const router = useRouter();
  const { formId } = use(params);
  
  const [form, setForm] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("user_forms")
        .select("*")
        .eq("id", formId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        alert("Form not found");
        router.push("/dashboard");
        return;
      }

      setForm(data);
      setContent(data.content || "");
      setLoading(false);
    };

    fetchForm();
  }, [formId, router]);

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("user_forms")
      .update({ 
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq("id", formId);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setLastSaved(new Date().toLocaleTimeString());
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
              <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Saved at {lastSaved}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-400"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your notes, evidence, or form details here..."
            className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-red-500 text-gray-900"
          />
          
          <p className="text-sm text-gray-500 mt-4">
            Use this space to draft your documents, take notes, or prepare your case materials.
          </p>
        </div>

        {/* Tips Card */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-800 mb-2">💡 Tips</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Keep your notes organized by topic or date</li>
            <li>• Document important conversations and events</li>
            <li>• Save frequently to avoid losing your work</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

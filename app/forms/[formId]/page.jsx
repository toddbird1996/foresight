"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function FormDetail({ params }) {
  const router = useRouter();
  const { formId } = use(params);
  
  const [form, setForm] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Fetch the form
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

  // Save content
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-blue-500 hover:underline"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex items-center space-x-4">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved at {lastSaved}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Form Title */}
      <h1 className="text-2xl font-bold mb-4">{form.title}</h1>

      {/* Content Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your notes, evidence, or form details here..."
        className="w-full h-96 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Help Text */}
      <p className="text-sm text-gray-500 mt-2">
        Use this space to draft your documents, take notes, or prepare your case materials.
      </p>
    </div>
  );
}

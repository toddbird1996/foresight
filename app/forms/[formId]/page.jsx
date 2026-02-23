"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function FormDetailPage() {
  const router = useRouter();
  const { formId } = useParams(); // get the dynamic form ID
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formTitle, setFormTitle] = useState("");

  // Fetch user and form data
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/auth/login");
      else {
        setUser(user);
        fetchForm(user.id, formId);
      }
    });
  }, [formId]);

  const fetchForm = async (userId, id) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single(); // get a single record

    if (error) {
      alert("Error fetching form: " + error.message);
      router.push("/dashboard"); // redirect if form not found
    } else {
      setForm(data);
      setFormTitle(data.title);
    }
    setLoading(false);
  };

  const handleUpdateForm = async () => {
    if (!formTitle.trim()) return alert("Form title cannot be empty");

    const { error } = await supabase
      .from("forms")
      .update({ title: formTitle })
      .eq("id", formId);

    if (error) alert("Error updating form: " + error.message);
    else alert("Form updated successfully!");
  };

  const handleDeleteForm = async () => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    const { error } = await supabase.from("forms").delete().eq("id", formId);

    if (error) alert("Error deleting form: " + error.message);
    else router.push("/dashboard");
  };

  if (!user || loading) return <p className="p-6">Loading form...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Form Details</h1>

      <label className="block mb-2 font-semibold">Title:</label>
      <input
        type="text"
        value={formTitle}
        onChange={(e) => setFormTitle(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <div className="flex space-x-2">
        <button
          onClick={handleUpdateForm}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={handleDeleteForm}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>
    </div>
  );
        }

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userForms, setUserForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newFormTitle, setNewFormTitle] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);

  // Fetch logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login");
      } else {
        setUser(user);
        fetchUserForms(user.id);
      }
    });
  }, []);

  const fetchUserForms = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user forms:", error.message);
    } else {
      setUserForms(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout error: " + error.message);
    } else {
      router.push("/auth/login");
    }
  };

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) return alert("Form title cannot be empty");

    setCreatingForm(true);
    const { data, error } = await supabase.from("forms").insert([
      {
        title: newFormTitle,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error creating form: " + error.message);
    } else {
      setNewFormTitle("");
      fetchUserForms(user.id); // refresh list
    }
    setCreatingForm(false);
  };

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {user.email}</p>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white p-2 rounded hover:bg-red-700 mb-6"
      >
        Logout
      </button>

      {/* New Form Creation */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:space-x-4">
        <input
          type="text"
          placeholder="New form title"
          value={newFormTitle}
          onChange={(e) => setNewFormTitle(e.target.value)}
          className="border p-2 rounded w-full md:w-auto"
        />
        <button
          onClick={handleCreateForm}
          disabled={creatingForm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2 md:mt-0"
        >
          {creatingForm ? "Creating..." : "Create Form"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Forms</h2>

      {loading ? (
        <p>Loading your forms...</p>
      ) : userForms.length === 0 ? (
        <p>You have no forms yet.</p>
      ) : (
        <ul className="space-y-2">
          {userForms.map((form) => (
            <li key={form.id} className="border p-4 rounded shadow hover:bg-gray-50">
              <p className="font-semibold">{form.title}</p>
              <p className="text-sm text-gray-400">{form.created_at}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

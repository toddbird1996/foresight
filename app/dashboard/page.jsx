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
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingFormTitle, setEditingFormTitle] = useState("");
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

  // Fetch user's forms
  const fetchUserForms = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching forms:", error.message);
    else setUserForms(data);

    setLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Logout error: " + error.message);
    else router.push("/auth/login");
  };

  // Create a new form
  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) return alert("Form title cannot be empty");
    setCreatingForm(true);

    const { error } = await supabase.from("forms").insert([
      { title: newFormTitle, user_id: user.id },
    ]);

    if (error) alert("Error creating form: " + error.message);
    else setNewFormTitle("");

    fetchUserForms(user.id);
    setCreatingForm(false);
  };

  // Start editing a form
  const startEditForm = (form) => {
    setEditingFormId(form.id);
    setEditingFormTitle(form.title);
  };

  // Save edited form
  const saveEditForm = async () => {
    if (!editingFormTitle.trim()) return alert("Form title cannot be empty");

    const { error } = await supabase
      .from("forms")
      .update({ title: editingFormTitle })
      .eq("id", editingFormId);

    if (error) alert("Error updating form: " + error.message);
    setEditingFormId(null);
    setEditingFormTitle("");
    fetchUserForms(user.id);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingFormId(null);
    setEditingFormTitle("");
  };

  // Delete a form
  const deleteForm = async (id) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    const { error } = await supabase.from("forms").delete().eq("id", id);
    if (error) alert("Error deleting form: " + error.message);
    else fetchUserForms(user.id);
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
            <li
              key={form.id}
              className="border p-4 rounded shadow flex flex-col md:flex-row md:justify-between items-start md:items-center"
            >
              {editingFormId === form.id ? (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-2 w-full">
                  <input
                    type="text"
                    value={editingFormTitle}
                    onChange={(e) => setEditingFormTitle(e.target.value)}
                    className="border p-2 rounded flex-1"
                  />
                  <button
                    onClick={saveEditForm}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mt-2 md:mt-0"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 mt-2 md:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 w-full justify-between">
                  <span className="font-semibold">{form.title}</span>
                  <div className="space-x-2 mt-2 md:mt-0">
                    <button
                      onClick={() => startEditForm(form)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

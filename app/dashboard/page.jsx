"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userForms, setUserForms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newFormTitle, setNewFormTitle] = useState("");
  const [editingFormId, setEditingFormId] = useState(null);
  const [editingFormTitle, setEditingFormTitle] = useState("");
  const [creatingForm, setCreatingForm] = useState(false);

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
      .from("user_forms")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching forms:", error.message);
    else setUserForms(data);

    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Logout error: " + error.message);
    else router.push("/auth/login");
  };

  const handleCreateForm = async () => {
    if (!newFormTitle.trim()) return alert("Form title cannot be empty");
    setCreatingForm(true);

    const { error } = await supabase.from("user_forms").insert([
      { title: newFormTitle, user_id: user.id },
    ]);

    if (error) alert("Error creating form: " + error.message);
    else setNewFormTitle("");

    fetchUserForms(user.id);
    setCreatingForm(false);
  };

  const startEditForm = (form) => {
    setEditingFormId(form.id);
    setEditingFormTitle(form.title);
  };

  const saveEditForm = async () => {
    if (!editingFormTitle.trim()) return alert("Form title cannot be empty");

    const { error } = await supabase
      .from("user_forms")
      .update({ title: editingFormTitle })
      .eq("id", editingFormId);

    if (error) alert("Error updating form: " + error.message);
    setEditingFormId(null);
    setEditingFormTitle("");
    fetchUserForms(user.id);
  };

  const cancelEdit = () => {
    setEditingFormId(null);
    setEditingFormTitle("");
  };

  const deleteForm = async (id) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    const { error } = await supabase.from("user_forms").delete().eq("id", id);
    if (error) alert("Error deleting form: " + error.message);
    else fetchUserForms(user.id);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Foresight</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Link
                href="/profile"
                className="text-gray-600 hover:text-red-600"
              >
                👤
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Manage your custody case from one place.</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/filing"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">Filing Guide</h3>
            <p className="text-sm text-gray-500">Step-by-step process</p>
          </Link>

          <Link
            href="/deadlines"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-semibold text-gray-900">Deadlines</h3>
            <p className="text-sm text-gray-500">Track important dates</p>
          </Link>

          <Link
            href="/court-forms"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold text-gray-900">Court Forms</h3>
            <p className="text-sm text-gray-500">Download official forms</p>
          </Link>

          <Link
            href="/ai"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-500">Get instant answers</p>
          </Link>

          <Link
            href="/community"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-gray-900">Community</h3>
            <p className="text-sm text-gray-500">Connect with others</p>
          </Link>

          <Link
            href="/pricing"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="font-semibold text-gray-900">Pricing</h3>
            <p className="text-sm text-gray-500">Upgrade your plan</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all"
          >
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-500">Account settings</p>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-500 hover:shadow-md transition-all text-left"
          >
            <div className="text-2xl mb-2">🚪</div>
            <h3 className="font-semibold text-gray-900">Logout</h3>
            <p className="text-sm text-gray-500">Sign out of account</p>
          </button>
        </div>

        {/* My Documents Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
          </div>

          {/* New Form Creation */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="New document title..."
              value={newFormTitle}
              onChange={(e) => setNewFormTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
            <button
              onClick={handleCreateForm}
              disabled={creatingForm}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
            >
              {creatingForm ? "Creating..." : "Create"}
            </button>
          </div>

          {/* Forms List */}
          {loading ? (
            <p className="text-gray-500">Loading your documents...</p>
          ) : userForms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-500">No documents yet. Create your first one above!</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {userForms.map((form) => (
                <li
                  key={form.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {editingFormId === form.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingFormTitle}
                        onChange={(e) => setEditingFormTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={saveEditForm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/forms/${form.id}`}
                        className="font-medium text-gray-900 hover:text-red-600"
                      >
                        {form.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditForm(form)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-red-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteForm(form.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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
      </main>
    </div>
  );
      }

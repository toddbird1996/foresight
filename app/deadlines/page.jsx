"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DeadlinesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchDeadlines(user.id);
      setLoading(false);
    };

    init();
  }, []);

  const fetchDeadlines = async (userId) => {
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .eq("user_id", userId)
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching deadlines:", error);
    } else {
      setDeadlines(data);
    }
  };

  const handleAddDeadline = async () => {
    if (!newTitle.trim() || !newDueDate) {
      alert("Please enter a title and due date");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("deadlines").insert({
      user_id: user.id,
      title: newTitle,
      description: newDescription,
      due_date: newDueDate,
      priority: newPriority,
      completed: false,
    });

    if (error) {
      alert("Error adding deadline: " + error.message);
    } else {
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      setNewPriority("medium");
      setShowForm(false);
      await fetchDeadlines(user.id);
    }

    setSaving(false);
  };

  const toggleComplete = async (deadline) => {
    const { error } = await supabase
      .from("deadlines")
      .update({
        completed: !deadline.completed,
        completed_at: !deadline.completed ? new Date().toISOString() : null,
      })
      .eq("id", deadline.id);

    if (error) {
      alert("Error updating deadline: " + error.message);
    } else {
      await fetchDeadlines(user.id);
    }
  };

  const deleteDeadline = async (id) => {
    if (!confirm("Delete this deadline?")) return;

    const { error } = await supabase.from("deadlines").delete().eq("id", id);

    if (error) {
      alert("Error deleting deadline: " + error.message);
    } else {
      await fetchDeadlines(user.id);
    }
  };

  const getDaysUntil = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-600";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getUrgencyText = (days) => {
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, color: "text-red-600" };
    if (days === 0) return { text: "Due today!", color: "text-red-600" };
    if (days === 1) return { text: "Due tomorrow", color: "text-orange-600" };
    if (days <= 7) return { text: `${days} days left`, color: "text-yellow-600" };
    return { text: `${days} days left`, color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading deadlines...</p>
      </div>
    );
  }

  const pendingDeadlines = deadlines.filter(d => !d.completed);
  const completedDeadlines = deadlines.filter(d => d.completed);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
              <h1 className="text-xl font-bold text-gray-900">Deadlines & Reminders</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              + Add Deadline
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Add Deadline Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold text-gray-900">New Deadline</h2>
            
            <input
              type="text"
              placeholder="Deadline title (e.g., File Response)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
            
            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 h-20"
            />
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddDeadline}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Add Deadline"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pending Deadlines */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming ({pendingDeadlines.length})</h2>
          
          {pendingDeadlines.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
              No upcoming deadlines. Add one to stay on track!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeadlines.map((deadline) => {
                const days = getDaysUntil(deadline.due_date);
                const urgency = getUrgencyText(days);
                
                return (
                  <div
                    key={deadline.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4"
                  >
                    <button
                      onClick={() => toggleComplete(deadline)}
                      className="w-6 h-6 rounded-full border-2 border-gray-400 hover:border-red-500 flex-shrink-0 mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(deadline.priority)}`}></span>
                        <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          📅 {new Date(deadline.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className={urgency.color}>{urgency.text}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteDeadline(deadline.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Deadlines */}
        {completedDeadlines.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-500 mb-3">Completed ({completedDeadlines.length})</h2>
            
            <div className="space-y-3">
              {completedDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-4 opacity-60"
                >
                  <button
                    onClick={() => toggleComplete(deadline)}
                    className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center flex-shrink-0 mt-1 text-white text-sm"
                  >
                    ✓
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="font-medium line-through text-gray-500">{deadline.title}</h3>
                    <span className="text-sm text-gray-400">
                      Completed {new Date(deadline.completed_at).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteDeadline(deadline.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

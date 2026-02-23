"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userForms, setUserForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login"); // redirect if not logged in
      } else {
        setUser(user);
        fetchUserForms(user.id);
      }
    });
  }, []);

  // Fetch forms for this user
  const fetchUserForms = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forms") // <-- table name in Supabase
      .select("*")
      .eq("user_id", userId);

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

  if (!user) return null; // prevent flashing content

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

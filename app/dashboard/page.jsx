"use client";

import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  // Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      alert("Error logging out. Please try again.");
    } else {
      router.push("/auth/login"); // Redirect to login page
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
      >
        Logout
      </button>

      {/* Dashboard content */}
      <div className="mt-6">
        <p>Welcome to your dashboard!</p>
        {/* Add your other dashboard components/content here */}
      </div>
    </div>
  );
}

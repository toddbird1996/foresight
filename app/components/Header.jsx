"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

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
    <header className="bg-gray-100 p-4 flex justify-between items-center">
      {/* Logo / Site Name */}
      <Link href="/">
        <span className="font-bold text-xl cursor-pointer">Foresight</span>
      </Link>

      {/* Navigation Links */}
      <nav className="space-x-4">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/programs" className="hover:underline">Programs</Link>
        <Link href="/forms" className="hover:underline">Forms</Link>
        <Link href="/mentors" className="hover:underline">Mentors</Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

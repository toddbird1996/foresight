"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Logout error: " + error.message);
      console.error(error);
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/">
        <span className="font-bold text-xl cursor-pointer">Foresight</span>
      </Link>

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/programs" className="hover:underline">Programs</Link>
        <Link href="/forms" className="hover:underline">Forms</Link>
        <Link href="/mentors" className="hover:underline">Mentors</Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden ml-2 p-2 bg-gray-700 rounded"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span>{menuOpen ? "✖" : "☰"}</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-slate-900 rounded shadow-md p-4 flex flex-col space-y-2 md:hidden">
          <Link href="/dashboard" className="hover:underline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/programs" className="hover:underline" onClick={() => setMenuOpen(false)}>Programs</Link>
          <Link href="/forms" className="hover:underline" onClick={() => setMenuOpen(false)}>Forms</Link>
          <Link href="/mentors" className="hover:underline" onClick={() => setMenuOpen(false)}>Mentors</Link>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

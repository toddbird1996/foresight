"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
    <header className="bg-white border-b border-gray-200 text-gray-900 p-4 flex justify-between items-center relative">
      {/* Logo + welcome */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="font-bold text-xl cursor-pointer text-gray-900">Foresight</span>
          </div>
        </Link>
        {user && <span className="text-sm text-gray-500">Welcome, {user.email}</span>}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:flex items-center space-x-6">
        <Link href="/dashboard" className="text-gray-700 hover:text-red-600">Dashboard</Link>
        <Link href="/filing" className="text-gray-700 hover:text-red-600">Filing Guide</Link>
        <Link href="/court-forms" className="text-gray-700 hover:text-red-600">Forms</Link>
        <Link href="/community" className="text-gray-700 hover:text-red-600">Community</Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      {/* Mobile hamburger button */}
      <button
        className="md:hidden ml-2 p-2 bg-gray-100 rounded-lg text-gray-700"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span>{menuOpen ? "✖" : "☰"}</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col space-y-3 md:hidden z-50">
          <Link href="/dashboard" className="text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/filing" className="text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>Filing Guide</Link>
          <Link href="/court-forms" className="text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>Forms</Link>
          <Link href="/community" className="text-gray-700 hover:text-red-600" onClick={() => setMenuOpen(false)}>Community</Link>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

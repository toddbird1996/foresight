"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Login error: " + error.message);
      console.error("Login error:", error);
    } else {
      router.push("/dashboard"); // Redirect to Dashboard on success
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded mt-10">
      <h1 className="text-2xl font-bold mb-4 text-white">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-white mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded bg-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 rounded bg-slate-700 text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 p-2 rounded text-white hover:bg-green-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

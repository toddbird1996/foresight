"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login"); // Redirect to login if not signed in
      } else {
        setLoading(false); // User is logged in
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <p className="p-6 text-center">Checking authentication...</p>;
  }

  return children;
}

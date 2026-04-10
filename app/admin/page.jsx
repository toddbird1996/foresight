'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('../components/AdminDashboard'), { ssr: false });

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: profile } = await supabase.from('users')
        .select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') {
        setAuthorized(true);
      } else {
        router.push('/dashboard');
      }
      setChecking(false);
    };
    check();
  }, []);

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  if (!authorized) return null;

  return <AdminDashboard />;
}

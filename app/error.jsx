'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 text-3xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Something Went Wrong</h2>
        <p className="text-gray-500 mb-6">We hit an unexpected error. This has been noted and we're working on it.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">Try Again</button>
          <Link href="/dashboard" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm">Go to Dashboard</Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">If this keeps happening, try refreshing the page or clearing your browser cache.</p>
      </div>
    </div>
  );
}

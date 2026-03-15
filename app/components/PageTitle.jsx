'use client';
import Link from 'next/link';

export default function PageTitle({ title, subtitle, backHref = '/dashboard', icon }) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href={backHref} className="text-gray-400 hover:text-red-600 text-sm">←</Link>
        {icon && <span className="text-lg">{icon}</span>}
        <div>
          <h1 className="text-base font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

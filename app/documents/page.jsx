'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Financial Statement Draft.pdf', type: 'financial', status: 'analyzed', date: '2 days ago' },
    { id: 2, name: 'Petition v2.docx', type: 'petition', status: 'uploaded', date: '1 week ago' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white">←</Link>
            <h1 className="text-xl font-bold">Documents</h1>
          </div>
          <button className="px-4 py-2 bg-orange-500 rounded-lg font-medium">
            + Upload
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center mb-6 hover:border-orange-500/50 transition-colors cursor-pointer">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-slate-400 mb-2">Drag & drop files here or click to browse</p>
          <p className="text-sm text-slate-500">PDF, DOC, DOCX up to 10MB</p>
        </div>

        {/* Documents List */}
        <h2 className="font-semibold mb-4">Your Documents</h2>
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-2xl">
                📄
              </div>
              <div className="flex-1">
                <div className="font-medium">{doc.name}</div>
                <div className="text-sm text-slate-400">Uploaded {doc.date}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                doc.status === 'analyzed' 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {doc.status === 'analyzed' ? '✓ Analyzed' : 'Pending'}
              </span>
              <button className="text-slate-400 hover:text-white">⋮</button>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No documents yet. Upload your first document above.
          </div>
        )}
      </main>
    </div>
  );
}

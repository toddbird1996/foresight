'use client';
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

const FILE_TYPES = {
  'application/pdf': { icon: '📄', label: 'PDF' },
  'image/jpeg': { icon: '🖼️', label: 'Image' },
  'image/png': { icon: '🖼️', label: 'Image' },
  'application/msword': { icon: '📝', label: 'Word' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', label: 'Word' },
};

const CATEGORIES = [
  { id: 'court_order', label: 'Court Orders', icon: '⚖️' },
  { id: 'financial', label: 'Financial', icon: '💰' },
  { id: 'evidence', label: 'Evidence', icon: '📸' },
  { id: 'correspondence', label: 'Correspondence', icon: '✉️' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'school', label: 'School Records', icon: '🎓' },
  { id: 'other', label: 'Other', icon: '📁' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return `${d}d ago`;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ category: 'other', description: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users')
        .select('full_name, tier, storage_used_bytes')
        .eq('id', user.id).single();
      setProfile(profile);
      await fetchDocs(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const fetchDocs = async (uid) => {
    const { data } = await supabase.from('documents')
      .select('*').eq('user_id', uid)
      .order('created_at', { ascending: false });
    setDocs(data || []);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const maxMB = profile?.tier === 'gold' ? Infinity : profile?.tier === 'silver' ? 10240 : 2048;
    const usedMB = (profile?.storage_used_bytes || 0) / 1048576;
    if (file.size / 1048576 + usedMB > maxMB) {
      setError(`Storage limit reached. Upgrade your plan for more storage.`);
      return;
    }
    if (file.size > 50 * 1048576) { setError('File must be under 50 MB.'); return; }

    setUploading(true);
    setUploadProgress(10);
    setError('');

    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      setUploadProgress(30);
      const { error: storageErr } = await supabase.storage
        .from('documents')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (storageErr) throw new Error(storageErr.message);

      setUploadProgress(70);
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path);

      await supabase.from('documents').insert({
        user_id: user.id,
        name: file.name,
        file_url: publicUrl,
        storage_path: path,
        file_type: file.type,
        file_size: file.size,
        category: uploadForm.category,
        description: uploadForm.description,
      });

      // Update storage usage
      await supabase.from('users').update({
        storage_used_bytes: (profile?.storage_used_bytes || 0) + file.size
      }).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, storage_used_bytes: (prev.storage_used_bytes || 0) + file.size } : prev);

      setUploadProgress(100);
      setSuccess(`"${file.name}" uploaded successfully.`);
      setShowUpload(false);
      setUploadForm({ category: 'other', description: '' });
      await fetchDocs(user.id);
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError('Upload failed: ' + e.message + '. Make sure the documents storage bucket exists in Supabase.');
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    if (doc.storage_path) {
      await supabase.storage.from('documents').remove([doc.storage_path]);
    }
    await supabase.from('documents').delete().eq('id', doc.id);
    await supabase.from('users').update({
      storage_used_bytes: Math.max(0, (profile?.storage_used_bytes || 0) - (doc.file_size || 0))
    }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, storage_used_bytes: Math.max(0, (prev.storage_used_bytes || 0) - (doc.file_size || 0)) } : prev);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const storageLimitMB = profile?.tier === 'gold' ? Infinity : profile?.tier === 'silver' ? 10240 : 2048;
  const storageUsedMB = (profile?.storage_used_bytes || 0) / 1048576;
  const storagePercent = storageLimitMB === Infinity ? 0 : Math.min(100, (storageUsedMB / storageLimitMB) * 100);

  const filtered = docs.filter(d => {
    const matchCat = filter === 'all' || d.category === filter;
    const matchSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-500 mt-0.5">Securely store court orders, evidence, and legal documents</p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
            <span className="text-lg leading-none">+</span> Upload
          </button>
        </div>

        {/* Storage bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Storage Used</span>
            <span className="text-sm text-gray-500">
              {formatBytes(profile?.storage_used_bytes || 0)} / {storageLimitMB === Infinity ? 'Unlimited' : formatBytes(storageLimitMB * 1048576)}
            </span>
          </div>
          {storageLimitMB !== Infinity && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full transition-all"
                style={{ width: `${storagePercent}%`, backgroundColor: storagePercent > 90 ? '#dc2626' : '#ef4444' }} />
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">✓ {success}</div>}

        {/* Upload panel */}
        {showUpload && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Upload Document</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Drop zone */}
            <div
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
                dragOver ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
              }`}>
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
              <div className="text-3xl mb-2">📎</div>
              <p className="text-sm font-medium text-gray-700">Drop file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, Images — Max 50 MB</p>
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading...</span><span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={uploadForm.category} onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                <input type="text" value={uploadForm.description}
                  onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Interim order March 2024"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-red-400" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            All ({docs.length})
          </button>
          {CATEGORIES.map(c => {
            const count = docs.filter(d => d.category === c.id).length;
            if (count === 0) return null;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === c.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {c.icon} {c.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 mb-4" />

        {/* Document list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="font-semibold text-gray-900 mb-1">{docs.length === 0 ? 'No documents yet' : 'No matching documents'}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {docs.length === 0 ? 'Upload court orders, evidence, and important documents to keep them organized.' : 'Try a different search or category.'}
            </p>
            {docs.length === 0 && (
              <button onClick={() => setShowUpload(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(doc => {
              const ft = FILE_TYPES[doc.file_type] || { icon: '📄', label: 'File' };
              const cat = CATEGORIES.find(c => c.id === doc.category);
              return (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                  <div className="text-3xl flex-shrink-0">{ft.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{doc.name}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      {cat && <span>{cat.icon} {cat.label}</span>}
                      <span>·</span>
                      <span>{formatBytes(doc.file_size)}</span>
                      <span>·</span>
                      <span>{timeAgo(doc.created_at)}</span>
                    </div>
                    {doc.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700">
                        View
                      </a>
                    )}
                    <button onClick={() => handleDelete(doc)}
                      className="px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CasesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('bronze');
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewCase, setShowNewCase] = useState(false);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseJurisdiction, setNewCaseJurisdiction] = useState('saskatchewan');
  const [newCaseType, setNewCaseType] = useState('custody');

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('users').select('tier').eq('id', user.id).single();
      if (profile?.tier) setUserTier(profile.tier);
      const { data: jd } = await supabase.from('jurisdictions').select('id, name, country').order('display_order');
      setJurisdictions(jd || []);
      await fetchCases(user.id);
      setLoading(false);
    };
    init();
  }, []);

  const fetchCases = async (userId) => {
    const { data } = await supabase.from('cases').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
    if (data) { setCases(data); if (data.length > 0 && !activeCase) setActiveCase(data[0]); }
  };

  const createCase = async () => {
    if (!newCaseName.trim()) return;
    const { data, error } = await supabase.from('cases').insert({
      user_id: user.id, name: newCaseName.trim(), jurisdiction_id: newCaseJurisdiction, case_type: newCaseType
    }).select().single();
    if (!error && data) { setCases(prev => [data, ...prev]); setActiveCase(data); setNewCaseName(''); setShowNewCase(false); }
  };

  const deleteCase = async (caseId) => {
    if (!confirm('Delete this case? All documents and chat history will be lost.')) return;
    await supabase.from('cases').delete().eq('id', caseId);
    const remaining = cases.filter(c => c.id !== caseId);
    setCases(remaining);
    if (activeCase?.id === caseId) setActiveCase(remaining[0] || null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading cases...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard" className="text-gray-400 hover:text-red-600 text-lg">←</Link>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Current Case</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {cases.map(c => (
              <button key={c.id} onClick={() => { setActiveCase(c); setActiveTab('overview'); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeCase?.id === c.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <span>📁</span><span>{c.name}</span>
                {activeCase?.id === c.id && (
                  <button onClick={(e) => { e.stopPropagation(); deleteCase(c.id); }} className="ml-1 hover:bg-red-700 rounded px-1 text-xs" title="Delete case">×</button>
                )}
              </button>
            ))}
            <button onClick={() => setShowNewCase(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap">
              <span>+</span> New Case
            </button>
          </div>
        </div>
      </header>

      {showNewCase && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewCase(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Case</h2>
            <input type="text" value={newCaseName} onChange={e => setNewCaseName(e.target.value)} placeholder="Case name (e.g., Custody of Sarah & James)"
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 bg-gray-50" />
            <select value={newCaseJurisdiction} onChange={e => setNewCaseJurisdiction(e.target.value)}
              className="w-full mb-3 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:outline-none focus:border-red-400">
              {jurisdictions.filter(j => j.country === 'Canada').map(j => (<option key={j.id} value={j.id}>🇨🇦 {j.name}</option>))}
            </select>
            <select value={newCaseType} onChange={e => setNewCaseType(e.target.value)}
              className="w-full mb-4 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 bg-gray-50 focus:outline-none focus:border-red-400">
              <option value="custody">Custody / Parenting</option>
              <option value="divorce">Divorce</option>
              <option value="support">Child Support</option>
              <option value="protection">Child Protection (CPS)</option>
              <option value="variation">Variation of Order</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewCase(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
              <button onClick={createCase} disabled={!newCaseName.trim()} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">Create Case</button>
            </div>
          </div>
        </div>
      )}

      {activeCase ? (
        <main className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 overflow-x-auto">
            {[{ id: 'overview', label: '📋 Overview' }, { id: 'documents', label: '📄 Documents' }, { id: 'ai-chat', label: '🤖 AI Assistant' }, { id: 'filing', label: '📝 Filing Progress' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'overview' && <CaseOverview caseData={activeCase} setCaseData={setActiveCase} />}
          {activeTab === 'documents' && <CaseDocuments caseData={activeCase} user={user} userTier={userTier} />}
          {activeTab === 'ai-chat' && <CaseAIChat caseData={activeCase} user={user} userTier={userTier} />}
          {activeTab === 'filing' && <CaseFilingProgress caseData={activeCase} user={user} />}
        </main>
      ) : (
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <span className="text-5xl block mb-4">📁</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Cases Yet</h2>
          <p className="text-gray-500 mb-6">Create your first case to start organizing your custody journey.</p>
          <button onClick={() => setShowNewCase(true)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">+ Create First Case</button>
        </main>
      )}
    </div>
  );
}

/* ============================================ */
/* CASE OVERVIEW */
/* ============================================ */
function CaseOverview({ caseData, setCaseData }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(caseData.notes || '');
  const [courtFile, setCourtFile] = useState(caseData.court_file_number || '');
  const [opposing, setOpposing] = useState(caseData.opposing_party_name || '');
  const [docCount, setDocCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    setNotes(caseData.notes || '');
    setCourtFile(caseData.court_file_number || '');
    setOpposing(caseData.opposing_party_name || '');
    const fetchCounts = async () => {
      const { count: dc } = await supabase.from('case_documents').select('id', { count: 'exact', head: true }).eq('case_id', caseData.id);
      const { count: mc } = await supabase.from('case_ai_messages').select('id', { count: 'exact', head: true }).eq('case_id', caseData.id);
      setDocCount(dc || 0);
      setMsgCount(mc || 0);
    };
    fetchCounts();
  }, [caseData]);

  const saveChanges = async () => {
    const { data } = await supabase.from('cases').update({ notes, court_file_number: courtFile, opposing_party_name: opposing, updated_at: new Date().toISOString() }).eq('id', caseData.id).select().single();
    if (data) setCaseData(data);
    setEditing(false);
  };

  const caseTypes = { custody: 'Custody / Parenting', divorce: 'Divorce', support: 'Child Support', protection: 'Child Protection', variation: 'Variation of Order' };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{caseData.name}</h2>
          <button onClick={() => setEditing(!editing)} className="text-sm text-red-600 hover:text-red-700 font-medium">{editing ? 'Cancel' : '✏️ Edit'}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard label="Case Type" value={caseTypes[caseData.case_type] || caseData.case_type} />
          <InfoCard label="Jurisdiction" value={caseData.jurisdiction_id?.replace(/_/g, ' ')} />
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Court File Number</div>
            {editing ? <input value={courtFile} onChange={e => setCourtFile(e.target.value)} placeholder="e.g., FLD-2024-12345" className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm" />
              : <div className="font-medium text-gray-900 text-sm">{caseData.court_file_number || 'Not filed yet'}</div>}
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Other Party</div>
            {editing ? <input value={opposing} onChange={e => setOpposing(e.target.value)} placeholder="Name of other parent" className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-sm" />
              : <div className="font-medium text-gray-900 text-sm">{caseData.opposing_party_name || 'Not set'}</div>}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">Case Notes</div>
          {editing ? (
            <>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder="Private notes about your case..." className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
              <button onClick={saveChanges} className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Save Changes</button>
            </>
          ) : <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 min-h-[60px]">{caseData.notes || 'No notes yet. Click Edit to add notes.'}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📄" label="Documents" value={docCount} />
        <StatCard icon="💬" label="AI Messages" value={msgCount} />
        <StatCard icon="📝" label="Filing" value={caseData.jurisdiction_id ? '→' : '—'} />
        <StatCard icon="⏰" label="Created" value={new Date(caseData.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} />
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-medium text-gray-900 text-sm capitalize">{value || 'Not set'}</div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/* ============================================ */
/* CASE DOCUMENTS */
/* ============================================ */
function CaseDocuments({ caseData, user, userTier }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(null);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const fileInputRef = useRef(null);
  const canUseAI = true; // All tiers get some AI (Bronze: 5 trial, Silver: 500/mo, Gold: 2000/mo)

  useEffect(() => { fetchDocuments(); }, [caseData.id]);

  const fetchDocuments = async () => {
    const { data } = await supabase.from('case_documents').select('*').eq('case_id', caseData.id).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const filePath = `cases/${caseData.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      await supabase.from('case_documents').insert({
        case_id: caseData.id, user_id: user.id, file_name: file.name, file_type: file.type,
        file_size: file.size, file_url: urlData.publicUrl, storage_path: filePath
      });
      await fetchDocuments();
    } else {
      // If storage bucket doesn't exist, save reference anyway
      await supabase.from('case_documents').insert({
        case_id: caseData.id, user_id: user.id, file_name: file.name, file_type: file.type, file_size: file.size
      });
      await fetchDocuments();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAIAction = async (doc, action) => {
    if (!canUseAI) return;
    setScanning(doc.id + '-' + action);
    try {
      const prompt = action === 'summarize'
        ? `You are a legal document assistant for Foresight, a Canadian family law platform. A parent in ${caseData.jurisdiction_id?.replace(/_/g, ' ') || 'Canada'} has uploaded a document titled "${doc.file_name}" to their ${caseData.case_type} case. Based on the document name, explain what this type of document typically contains, its purpose in family law proceedings, key things to watch for, and any deadlines or action items they should be aware of. Be empathetic and thorough.`
        : action === 'scan'
        ? `You are a legal document analyst for Foresight. Analyze a document titled "${doc.file_name}" uploaded to a ${caseData.case_type} case in ${caseData.jurisdiction_id?.replace(/_/g, ' ') || 'Canada'}. Identify potential issues, missing information, red flags, and things a self-represented parent should verify. Note: you only have the filename. Provide guidance about what this type of document typically requires.`
        : `You are a legal document comparator for Foresight. A parent uploaded "${doc.file_name}" in a ${caseData.case_type} case in ${caseData.jurisdiction_id?.replace(/_/g, ' ') || 'Canada'}. Compare what this document likely contains against standard court requirements for this jurisdiction. Note any typical deficiencies or areas needing attention.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, userId: user.id, jurisdiction: caseData.jurisdiction_id })
      });
      const data = await response.json();
      const result = data.content || 'Unable to analyze.';
      const updateField = action === 'compare' ? { ai_comparison: result, ai_scanned: true } : { ai_summary: result, ai_scanned: true };
      await supabase.from('case_documents').update(updateField).eq('id', doc.id);
      await fetchDocuments();
      setExpandedDoc(doc.id);
    } catch (err) { console.error('AI error:', err); }
    setScanning(null);
  };

  const deleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return;
    await supabase.from('case_documents').delete().eq('id', docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Case Documents</h3>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-40">
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={handleUpload} className="hidden" />
        </div>
        {!canUseAI && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-700">🔒 <strong>AI document scanning</strong> — upgrade for more scans. Bronze includes 1 scan trial. <Link href="/pricing" className="text-red-600 underline">Upgrade</Link></p>
          </div>
        )}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <span className="text-3xl block mb-2">📄</span>
            <p className="text-sm">No documents uploaded yet.</p>
            <p className="text-xs mt-1">Upload court forms, affidavits, orders, agreements, and more.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {doc.file_type?.includes('pdf') ? '📕' : doc.file_type?.includes('image') ? '🖼️' : '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{doc.file_name}</div>
                    <div className="text-xs text-gray-400">{formatSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => deleteDocument(doc.id)} className="text-gray-400 hover:text-red-600 text-xs p-1">🗑</button>
                </div>
                {canUseAI && (
                  <div className="flex gap-2 mt-2 pl-13">
                    {['summarize', 'scan', 'compare'].map(action => (
                      <button key={action} onClick={() => handleAIAction(doc, action)} disabled={scanning === doc.id + '-' + action}
                        className={`px-2.5 py-1 rounded text-xs font-medium disabled:opacity-40 ${
                          action === 'summarize' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                          action === 'scan' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                          'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}>
                        {scanning === doc.id + '-' + action ? '⏳ Working...' :
                          action === 'summarize' ? '📝 Summarize' : action === 'scan' ? '🔍 Scan' : '⚖️ Compare'}
                      </button>
                    ))}
                    <button onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">
                      {(doc.ai_summary || doc.ai_comparison) ? (expandedDoc === doc.id ? '▲ Hide' : '▼ Show AI') : ''}
                    </button>
                  </div>
                )}
                {expandedDoc === doc.id && doc.ai_summary && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-blue-700 mb-1">📝 AI Summary</div>
                    <p className="text-xs text-blue-800 whitespace-pre-wrap leading-relaxed">{doc.ai_summary}</p>
                  </div>
                )}
                {expandedDoc === doc.id && doc.ai_comparison && (
                  <div className="mt-2 bg-purple-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-purple-700 mb-1">⚖️ AI Comparison</div>
                    <p className="text-xs text-purple-800 whitespace-pre-wrap leading-relaxed">{doc.ai_comparison}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* CASE AI CHAT */
/* ============================================ */
function CaseAIChat({ caseData, user, userTier }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const canUseAI = true; // All tiers get some AI

  useEffect(() => { fetchMessages(); }, [caseData.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('case_ai_messages').select('*').eq('case_id', caseData.id).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !canUseAI) return;
    const userMsg = input.trim();
    setInput('');
    const tempUserMsg = { id: 'temp-' + Date.now(), role: 'user', content: userMsg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);
    setSending(true);

    await supabase.from('case_ai_messages').insert({ case_id: caseData.id, user_id: user.id, role: 'user', content: userMsg });

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const response = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, userId: user.id, jurisdiction: caseData.jurisdiction_id })
      });
      const data = await response.json();
      const aiReply = data.content || 'Sorry, I was unable to process that. Please try again.';
      await supabase.from('case_ai_messages').insert({ case_id: caseData.id, user_id: user.id, role: 'assistant', content: aiReply });
      setMessages(prev => [...prev, { id: 'ai-' + Date.now(), role: 'assistant', content: aiReply, created_at: new Date().toISOString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'err-' + Date.now(), role: 'assistant', content: 'Sorry, there was an error connecting to the AI. Please try again.', created_at: new Date().toISOString() }]);
    }
    setSending(false);
  };

  if (!canUseAI) return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
      <span className="text-4xl block mb-3">🔒</span>
      <h3 className="font-bold text-gray-900 text-lg mb-2">You've used your AI questions</h3>
      <p className="text-gray-500 text-sm mb-1">Silver ($19.99 CAD/month) — 500 AI questions/month</p>
      <p className="text-gray-500 text-sm mb-4">Gold ($29.99 CAD/month) — 2,000 AI questions/month</p>
      <Link href="/pricing" className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium inline-block">View Plans</Link>
    </div>
  );

  const suggestions = [
    `What documents do I need to file in ${caseData.jurisdiction_id?.replace(/_/g, ' ')}?`,
    'What are my rights in this situation?',
    'Explain the court process step by step',
    'What should I expect at my first hearing?',
    'How do I respond to the other party\'s application?',
    'What factors does the court consider for custody?'
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col" style={{ height: '70vh' }}>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <p className="text-xs text-amber-700">⚠️ AI provides legal information, not legal advice. Always consult a lawyer for your specific situation.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <span className="text-3xl block mb-2">🤖</span>
            <p className="text-sm mb-4">Ask anything about your case, court procedures, documents, or your rights.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => setInput(q)} className="text-left text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg px-3 py-2.5 transition-colors">
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id || msg.created_at} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">F</div>}
            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-red-200' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 font-bold">F</div>
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your case..." className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400" />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium disabled:opacity-40 transition-colors">Send</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* CASE FILING PROGRESS */
/* ============================================ */
function CaseFilingProgress({ caseData, user }) {
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [expandedPhase, setExpandedPhase] = useState(null);

  useEffect(() => { fetchFilingData(); }, [caseData.jurisdiction_id]);

  const fetchFilingData = async () => {
    if (!caseData.jurisdiction_id) return;
    const { data: phasesData } = await supabase.from('filing_phases').select('*').eq('jurisdiction_id', caseData.jurisdiction_id).order('display_order');
    const phaseIds = (phasesData || []).map(p => p.id);
    const { data: stepsData } = await supabase.from('filing_steps').select('*').in('phase_id', phaseIds).order('display_order');
    const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
    const phasesWithSteps = (phasesData || []).map(phase => ({
      ...phase, steps: (stepsData || []).filter(step => step.phase_id === phase.id)
    }));
    setPhases(phasesWithSteps);
    const progressMap = {};
    (progressData || []).forEach(p => { progressMap[p.step_id] = p.completed; });
    setProgress(progressMap);
    // Auto-expand first incomplete phase
    const firstIncomplete = phasesWithSteps.find(p => p.steps?.some(s => !progressMap[s.id]));
    if (firstIncomplete) setExpandedPhase(firstIncomplete.id);
  };

  const toggleStep = async (stepId) => {
    const isCompleted = !progress[stepId];
    setProgress(prev => ({ ...prev, [stepId]: isCompleted }));
    const { data: existing } = await supabase.from('user_progress').select('id').eq('user_id', user.id).eq('step_id', stepId).single();
    if (existing) {
      await supabase.from('user_progress').update({ completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }).eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert({ user_id: user.id, step_id: stepId, completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null });
    }
  };

  const totalSteps = phases.flatMap(p => p.steps || []).length;
  const completedSteps = phases.flatMap(p => p.steps || []).filter(s => progress[s.id]).length;
  const pct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (!caseData.jurisdiction_id) return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
      <p>No jurisdiction set for this case. Edit the case overview to set a jurisdiction.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 capitalize">Filing Progress — {caseData.jurisdiction_id?.replace(/_/g, ' ')}</span>
          <span className="text-red-600 font-medium">{completedSteps}/{totalSteps} steps ({pct}%)</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {phases.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
          <p>Filing guide not available for this jurisdiction yet.</p>
          <Link href="/filing" className="text-red-600 underline text-sm mt-2 inline-block">View all filing guides →</Link>
        </div>
      ) : (
        phases.map((phase, i) => {
          const phaseComplete = (phase.steps || []).every(s => progress[s.id]);
          const phaseStepsCompleted = (phase.steps || []).filter(s => progress[s.id]).length;
          const isExpanded = expandedPhase === phase.id;
          return (
            <div key={phase.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className="w-full p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${phaseComplete ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {phaseComplete ? '✓' : i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{phase.name}</div>
                  <div className="text-xs text-gray-500">{phaseStepsCompleted}/{(phase.steps || []).length} steps</div>
                </div>
                <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div className="p-3 space-y-2">
                  {phase.description && <p className="text-xs text-gray-500 mb-2 px-2">{phase.description}</p>}
                  {(phase.steps || []).map(step => (
                    <div key={step.id} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${progress[step.id] ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}
                      onClick={() => toggleStep(step.id)}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs transition-colors ${progress[step.id] ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 hover:border-red-500'}`}>
                        {progress[step.id] && '✓'}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${progress[step.id] ? 'text-green-800 line-through' : 'text-gray-900'}`}>{step.name}</div>
                        {step.description && <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

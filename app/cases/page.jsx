'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';

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
      <Header />
        <PageTitle title="My Case" subtitle="Documents, AI & filing progress" icon="📁" />

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
/* CASE DOCUMENTS — full featured               */
/* ============================================ */
function CaseDocuments({ caseData, user, userTier }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(null);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editName, setEditName] = useState('');
  const [viewingDoc, setViewingDoc] = useState(null);   // doc being previewed
  const [editingContent, setEditingContent] = useState(null); // doc being text-edited
  const [editContentText, setEditContentText] = useState('');
  const [savingContent, setSavingContent] = useState(false);
  const [noteDocId, setNoteDocId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [dragging, setDragging] = useState(null); // docId being dragged
  const fileInputRef = useRef(null);
  const canUseAI = true;
  const [compareDocA, setCompareDocA] = useState(null);
  const [compareDocB, setCompareDocB] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => { fetchDocuments(); }, [caseData.id]);

  const fetchDocuments = async () => {
    const { data } = await supabase.from('case_documents').select('*')
      .eq('case_id', caseData.id).order('display_order', { ascending: true });
    setDocuments(data || []);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const filePath = `cases/${caseData.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    const maxOrder = documents.length > 0 ? Math.max(...documents.map(d => d.display_order || 0)) + 1 : 0;
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      await supabase.from('case_documents').insert({
        case_id: caseData.id, user_id: user.id, file_name: file.name, file_type: file.type,
        file_size: file.size, file_url: urlData.publicUrl, storage_path: filePath,
        display_order: maxOrder,
      });
    } else {
      await supabase.from('case_documents').insert({
        case_id: caseData.id, user_id: user.id, file_name: file.name,
        file_type: file.type, file_size: file.size, display_order: maxOrder,
      });
    }
    await fetchDocuments();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Move order ────────────────────────────────────────────────────────────
  const moveDoc = async (docId, direction) => {
    const idx = documents.findIndex(d => d.id === docId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === documents.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newDocs = [...documents];
    const tempOrder = newDocs[idx].display_order;
    newDocs[idx] = { ...newDocs[idx], display_order: newDocs[swapIdx].display_order };
    newDocs[swapIdx] = { ...newDocs[swapIdx], display_order: tempOrder };
    setDocuments(newDocs.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    await supabase.from('case_documents').update({ display_order: newDocs[idx].display_order }).eq('id', newDocs[idx].id);
    await supabase.from('case_documents').update({ display_order: newDocs[swapIdx].display_order }).eq('id', newDocs[swapIdx].id);
  };

  // ── Rename ─────────────────────────────────────────────────────────────────
  const startRename = (doc) => { setEditingDocId(doc.id); setEditName(doc.file_name); };
  const saveRename = async (docId) => {
    const name = editName.trim();
    if (!name) return;
    await supabase.from('case_documents').update({ file_name: name }).eq('id', docId);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, file_name: name } : d));
    setEditingDocId(null);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteDocument = async (doc) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    if (doc.storage_path) {
      await supabase.storage.from('documents').remove([doc.storage_path]);
    }
    await supabase.from('case_documents').delete().eq('id', doc.id);
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const downloadDoc = async (doc) => {
    if (doc.file_url) {
      const a = document.createElement('a');
      a.href = doc.file_url;
      a.download = doc.file_name;
      a.target = '_blank';
      a.click();
    } else if (doc.storage_path) {
      const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
      if (data?.signedUrl) {
        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = doc.file_name;
        a.click();
      }
    } else {
      alert('No download URL available for this document.');
    }
  };

  // ── View ───────────────────────────────────────────────────────────────────
  const viewDoc = async (doc) => {
    let url = doc.file_url;
    if (!url && doc.storage_path) {
      const { data } = await supabase.storage.from('documents').createSignedUrl(doc.storage_path, 300);
      url = data?.signedUrl;
    }
    setViewingDoc({ ...doc, viewUrl: url });
  };

  // ── Text editor (for .txt / .doc content stored as text) ─────────────────
  const openTextEditor = async (doc) => {
    let content = doc.text_content || '';
    if (!content && doc.file_url && (doc.file_type?.includes('text') || doc.file_name?.endsWith('.txt'))) {
      try {
        const res = await fetch(doc.file_url);
        content = await res.text();
      } catch {}
    }
    setEditingContent(doc);
    setEditContentText(content || '');
  };

  const saveTextContent = async () => {
    if (!editingContent) return;
    setSavingContent(true);
    await supabase.from('case_documents').update({
      ai_summary: editContentText, // store edited text in ai_summary field as "notes/edited version"
      updated_at: new Date().toISOString(),
    }).eq('id', editingContent.id);
    setDocuments(prev => prev.map(d => d.id === editingContent.id ? { ...d, ai_summary: editContentText } : d));
    setSavingContent(false);
    setEditingContent(null);
  };

  // ── Notes ──────────────────────────────────────────────────────────────────
  const saveNote = async (docId) => {
    await supabase.from('case_documents').update({ notes: noteText }).eq('id', docId);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, notes: noteText } : d));
    setNoteDocId(null);
  };

  // ── AI Actions ─────────────────────────────────────────────────────────────
  const handleAIAction = async (doc, action) => {
    if (!canUseAI) return;
    setScanning(doc.id + '-' + action);
    try {
      let fileContent = '';
      if (doc.file_url) {
        try {
          const fileRes = await fetch(doc.file_url);
          const blob = await fileRes.blob();
          const fileType = doc.file_type || '';
          if (fileType.includes('text') || doc.file_name?.endsWith('.txt')) {
            fileContent = await blob.text();
            fileContent = fileContent.substring(0, 8000);
          }
        } catch {}
      }
      const hasContent = fileContent.length > 50;
      const jurisdiction = caseData.jurisdiction_id?.replace(/_/g, ' ') || 'Saskatchewan';
      const caseType = caseData.case_type || 'custody';
      let prompt;
      if (action === 'summarize') {
        prompt = hasContent
          ? `You are a legal document assistant for Foresight. A self-represented parent in ${jurisdiction} has shared the following document from their ${caseType} case. Read it carefully and provide: 1) A plain-language summary of what this document says, 2) Key dates, deadlines, or obligations mentioned, 3) What actions the parent needs to take based on this document, 4) Anything they should discuss with a lawyer.\n\nDocument filename: ${doc.file_name}\n\nDocument content:\n${fileContent}`
          : `You are a legal document assistant for Foresight. A parent in ${jurisdiction} has uploaded a document titled "${doc.file_name}" to their ${caseType} case. Based on the document name and type, explain: what this document typically contains, its purpose in family law proceedings, key things to watch for, and any deadlines or action items typically associated with this document type.`;
      } else if (action === 'scan') {
        prompt = hasContent
          ? `You are a legal document analyst for Foresight. Review this ${caseType} case document from ${jurisdiction} and identify: 1) Any red flags or concerning language, 2) Missing information that should be present, 3) Deadlines or response requirements, 4) Anything the parent may have overlooked or misunderstood, 5) Whether the document appears to be properly completed.\n\nDocument: ${doc.file_name}\n\nContent:\n${fileContent}`
          : `You are a legal document analyst for Foresight. Analyze a document titled "${doc.file_name}" in a ${caseType} case in ${jurisdiction}. Identify: potential issues, missing information, red flags, and things a self-represented parent should verify.`;
      } else {
        prompt = hasContent
          ? `You are a legal document comparator for Foresight. Compare this ${caseType} document from ${jurisdiction} against standard court requirements. Identify: 1) Whether it meets court standards, 2) Any deficiencies that could cause the court to reject it, 3) Whether all required sections are present, 4) Anything that needs to be fixed before filing.\n\nDocument: ${doc.file_name}\n\nContent:\n${fileContent}`
          : `You are a legal document comparator for Foresight. A parent uploaded "${doc.file_name}" in a ${caseType} case in ${jurisdiction}. Compare what this document likely contains against standard court requirements for this jurisdiction. Note typical deficiencies or areas needing attention.`;
      }
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

  // ── Compare Two Documents ──────────────────────────────────────────────────
  const compareDocuments = async () => {
    if (!compareDocA || !compareDocB) return;
    setComparing(true);
    setCompareResult(null);

    // Fetch content of both documents
    const fetchContent = async (doc) => {
      if (!doc.file_url) return null;
      try {
        const res = await fetch(doc.file_url);
        const blob = await res.blob();
        if (doc.file_type?.includes('text') || doc.file_name?.endsWith('.txt')) {
          const text = await blob.text();
          return text.substring(0, 6000);
        }
        return null; // PDF/image — filename only
      } catch { return null; }
    };

    const contentA = await fetchContent(compareDocA);
    const contentB = await fetchContent(compareDocB);
    const jurisdiction = caseData.jurisdiction_id?.replace(/_/g, ' ') || 'Saskatchewan';
    const caseType = caseData.case_type || 'custody';

    const hasA = contentA && contentA.length > 50;
    const hasB = contentB && contentB.length > 50;

    const prompt = `You are a family law document analyst for Foresight, helping a self-represented parent in ${jurisdiction} understand their ${caseType} case.

The parent has uploaded two documents and wants to understand how they compare — what each party is saying, where they agree, where they conflict, and what it means for their case.

Document A (labelled: "${compareDocA.file_name}"):
${hasA ? contentA : '[Content could not be extracted — analyze based on document name and type]'}

Document B (labelled: "${compareDocB.file_name}"):
${hasB ? contentB : '[Content could not be extracted — analyze based on document name and type]'}

Provide a clear, structured analysis covering:

## 1. What Each Document Says
Summarize the key positions, claims, or content of Document A and Document B separately in plain language.

## 2. Where They Agree
List any points, terms, or facts both documents appear to accept or align on.

## 3. Where They Conflict
List specific areas of disagreement, conflicting claims, or opposing positions. Be specific about what each party's position is.

## 4. Key Issues for Court
Identify the most important disputed points that a judge would focus on and explain why they matter.

## 5. What the Parent Should Know
Give practical, plain-language advice about what this comparison reveals — what is strong in their position, what needs addressing, and what they should discuss with a lawyer.

Be clear, specific, and helpful. Use plain language throughout. Do not provide legal advice — provide legal information and guidance.`;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, userId: user.id, jurisdiction: caseData.jurisdiction_id })
      });
      const data = await response.json();
      setCompareResult(data.content || 'Unable to compare documents.');
    } catch (err) {
      setCompareResult('Error comparing documents. Please try again.');
    }
    setComparing(false);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getDocIcon = (doc) => {
    if (doc.file_type?.includes('pdf') || doc.file_name?.endsWith('.pdf')) return '📕';
    if (doc.file_type?.includes('image')) return '🖼️';
    if (doc.file_type?.includes('word') || doc.file_name?.match(/\.docx?$/)) return '📘';
    if (doc.file_type?.includes('text') || doc.file_name?.endsWith('.txt')) return '📄';
    return '📄';
  };

  const canView = (doc) => doc.file_url || doc.storage_path;
  const canEdit = (doc) => doc.file_type?.includes('text') || doc.file_name?.endsWith('.txt');
  const isPDF = (doc) => doc.file_type?.includes('pdf') || doc.file_name?.endsWith('.pdf');
  const isImage = (doc) => doc.file_type?.includes('image');

  return (
    <div className="space-y-4">
      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setViewingDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="font-semibold text-gray-900 text-sm truncate flex-1">{getDocIcon(viewingDoc)} {viewingDoc.file_name}</div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => downloadDoc(viewingDoc)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700">⬇️ Download</button>
                <button onClick={() => setViewingDoc(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-gray-50 rounded-b-2xl">
              {viewingDoc.viewUrl ? (
                isPDF(viewingDoc) ? (
                  <iframe src={viewingDoc.viewUrl} className="w-full h-[70vh] rounded-xl border border-gray-200" title={viewingDoc.file_name} />
                ) : isImage(viewingDoc) ? (
                  <img src={viewingDoc.viewUrl} alt={viewingDoc.file_name} className="max-w-full max-h-[70vh] mx-auto rounded-xl shadow-sm" />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-5xl mb-3">{getDocIcon(viewingDoc)}</div>
                    <p className="text-sm mb-3">Preview not available for this file type.</p>
                    <button onClick={() => downloadDoc(viewingDoc)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium">⬇️ Download to view</button>
                  </div>
                )
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-3">🔒</div>
                  <p className="text-sm">File URL not available. Try re-uploading this document.</p>
                </div>
              )}
            </div>
            {/* Show AI summary in viewer if available */}
            {viewingDoc.ai_summary && (
              <div className="px-4 pb-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                  <div className="text-xs font-bold text-blue-700 mb-1">📝 AI Summary</div>
                  <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-wrap line-clamp-4">{viewingDoc.ai_summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      {editingContent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="font-semibold text-gray-900 text-sm">✏️ Edit — {editingContent.file_name}</div>
              <button onClick={() => setEditingContent(null)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <textarea
                value={editContentText}
                onChange={e => setEditContentText(e.target.value)}
                className="w-full h-[50vh] px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-red-300 resize-none"
                placeholder="Document content..."
              />
            </div>
            <div className="px-4 pb-4 flex gap-3">
              <button onClick={() => setEditingContent(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={saveTextContent} disabled={savingContent} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40">
                {savingContent ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Case Documents</h3>
            <p className="text-xs text-gray-400 mt-0.5">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors">
            {uploading ? '⏳ Uploading...' : '+ Upload'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt" onChange={handleUpload} className="hidden" />
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <span className="text-4xl block mb-2">📄</span>
            <p className="text-sm font-medium text-gray-500">No documents yet</p>
            <p className="text-xs mt-1">Upload court forms, affidavits, orders, agreements, and more</p>
            <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
              Upload your first document
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
                {/* Document header row */}
                <div className="flex items-start gap-3 p-3">
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0 mt-1">
                    <button onClick={() => moveDoc(doc.id, 'up')} disabled={idx === 0}
                      className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▲</button>
                    <button onClick={() => moveDoc(doc.id, 'down')} disabled={idx === documents.length - 1}
                      className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs leading-none">▼</button>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-gray-100">
                    {getDocIcon(doc)}
                  </div>

                  {/* Name + metadata */}
                  <div className="flex-1 min-w-0">
                    {editingDocId === doc.id ? (
                      <div className="flex items-center gap-1.5">
                        <input autoFocus type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveRename(doc.id); if (e.key === 'Escape') setEditingDocId(null); }}
                          className="flex-1 text-sm border border-red-300 rounded-lg px-2 py-1 outline-none focus:border-red-500 min-w-0" />
                        <button onClick={() => saveRename(doc.id)} className="text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded-lg">Save</button>
                        <button onClick={() => setEditingDocId(null)} className="text-gray-400 text-xs px-1">✕</button>
                      </div>
                    ) : (
                      <div className="font-semibold text-gray-900 text-sm truncate">{doc.file_name}</div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      {doc.file_size && <span>{formatSize(doc.file_size)}</span>}
                      <span>•</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {doc.ai_scanned && <span className="text-green-600 font-medium">• ✅ AI scanned</span>}
                    </div>
                    {doc.notes && (
                      <div className="mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">{doc.notes}</div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canView(doc) && (
                      <button onClick={() => viewDoc(doc)} title="View" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">👁️</button>
                    )}
                    <button onClick={() => downloadDoc(doc)} title="Download" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm">⬇️</button>
                    <button onClick={() => startRename(doc)} title="Rename" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm">✏️</button>
                    <button onClick={() => { setNoteDocId(doc.id); setNoteText(doc.notes || ''); }} title="Add note" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-sm">📌</button>
                    {canEdit(doc) && (
                      <button onClick={() => openTextEditor(doc)} title="Edit document" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-sm">📝</button>
                    )}
                    <button onClick={() => deleteDocument(doc)} title="Delete" className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">🗑️</button>
                  </div>
                </div>

                {/* Note editor inline */}
                {noteDocId === doc.id && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 bg-amber-50">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a note about this document..."
                      rows={2} className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs focus:outline-none focus:border-amber-400 resize-none" />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setNoteDocId(null)} className="flex-1 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg">Cancel</button>
                      <button onClick={() => saveNote(doc.id)} className="flex-1 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600">Save Note</button>
                    </div>
                  </div>
                )}

                {/* AI action buttons */}
                {canUseAI && (
                  <div className="px-3 pb-3 pt-1 border-t border-gray-100 flex gap-2 flex-wrap">
                    {[
                      { action: 'summarize', label: '📝 Summarize', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100' },
                      { action: 'scan', label: '🔍 Scan for Issues', color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100' },
                      { action: 'compare', label: '⚖️ Compare to Standards', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100' },
                    ].map(({ action, label, color }) => (
                      <button key={action} onClick={() => handleAIAction(doc, action)}
                        disabled={scanning === doc.id + '-' + action}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border disabled:opacity-40 transition-colors ${color}`}>
                        {scanning === doc.id + '-' + action ? '⏳ Working...' : label}
                      </button>
                    ))}
                    {(doc.ai_summary || doc.ai_comparison) && (
                      <button onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 ml-auto">
                        {expandedDoc === doc.id ? '▲ Hide AI' : '▼ Show AI Results'}
                      </button>
                    )}
                  </div>
                )}

                {/* AI results */}
                {expandedDoc === doc.id && (
                  <div className="border-t border-gray-100 space-y-2 p-3">
                    {doc.ai_summary && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <div className="text-xs font-bold text-blue-700 mb-1.5">📝 AI Summary</div>
                        <p className="text-xs text-blue-800 whitespace-pre-wrap leading-relaxed">{doc.ai_summary}</p>
                      </div>
                    )}
                    {doc.ai_comparison && (
                      <div className="bg-purple-50 rounded-xl p-3">
                        <div className="text-xs font-bold text-purple-700 mb-1.5">⚖️ Standards Comparison</div>
                        <p className="text-xs text-purple-800 whitespace-pre-wrap leading-relaxed">{doc.ai_comparison}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Compare Two Documents ──────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">⚖️ Compare Two Documents</h3>
              <p className="text-xs text-gray-500 mt-0.5">Select your document and the other party's document — AI will analyze both and explain what they mean for your case</p>
            </div>
            <button onClick={() => { setShowCompare(v => !v); setCompareResult(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
              {showCompare ? '▲ Hide' : '▼ Show'}
            </button>
          </div>

          {showCompare && (
            <div className="space-y-4">
              {documents.length < 2 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-sm text-gray-500">Upload at least 2 documents to compare them</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Doc A */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                        📄 Your Document
                      </label>
                      <select
                        value={compareDocA?.id || ''}
                        onChange={e => {
                          const doc = documents.find(d => d.id === e.target.value);
                          setCompareDocA(doc || null);
                          setCompareResult(null);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
                      >
                        <option value="">Select your document...</option>
                        {documents.filter(d => d.id !== compareDocB?.id).map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.file_name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Doc B */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                        📄 Other Party's Document
                      </label>
                      <select
                        value={compareDocB?.id || ''}
                        onChange={e => {
                          const doc = documents.find(d => d.id === e.target.value);
                          setCompareDocB(doc || null);
                          setCompareResult(null);
                        }}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-red-400"
                      >
                        <option value="">Select their document...</option>
                        {documents.filter(d => d.id !== compareDocA?.id).map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.file_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {compareDocA && compareDocB && (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Comparing <span className="font-semibold text-blue-700">{compareDocA.file_name}</span>
                        {' '}vs{' '}
                        <span className="font-semibold text-red-700">{compareDocB.file_name}</span>
                      </div>
                      <button
                        onClick={compareDocuments}
                        disabled={comparing}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                      >
                        {comparing ? '⏳ Analyzing...' : '⚖️ Compare Now'}
                      </button>
                    </div>
                  )}

                  {comparing && (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-gray-500 font-medium">AI is reading both documents...</p>
                      <p className="text-xs text-gray-400 mt-1">This takes about 15–30 seconds</p>
                    </div>
                  )}

                  {compareResult && !comparing && (
                    <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚖️</span>
                          <span className="text-white font-bold text-sm">AI Document Comparison</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-blue-300 font-medium truncate max-w-[120px]">{compareDocA?.file_name}</span>
                          <span className="text-slate-400">vs</span>
                          <span className="text-red-300 font-medium truncate max-w-[120px]">{compareDocB?.file_name}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        {compareResult.split('\n## ').map((section, idx) => {
                          if (!section.trim()) return null;
                          const secLines = section.split('\n');
                          const rawHead = secLines[0] || '';
                          const heading = (idx === 0 && !section.startsWith('#')) ? null : rawHead.replace(/^#+ ?/, '');
                          const body = heading ? secLines.slice(1).join('\n') : section;

                          const sectionColors = {
                            0: 'border-gray-200',
                            1: 'border-blue-200 bg-blue-50',
                            2: 'border-green-200 bg-green-50',
                            3: 'border-red-200 bg-red-50',
                            4: 'border-amber-200 bg-amber-50',
                            5: 'border-purple-200 bg-purple-50',
                          };
                          const color = sectionColors[idx] || 'border-gray-200';

                          return (
                            <div key={idx} className={`mb-3 rounded-xl border p-3 ${color}`}>
                              {heading && (
                                <div className="font-bold text-gray-900 text-sm mb-2">{heading}</div>
                              )}
                              <div className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{body.trim()}</div>
                            </div>
                          );
                        })}
                        <p className="text-[10px] text-gray-400 mt-3 text-center">
                          This is AI-generated analysis for educational purposes only — not legal advice. Always consult a lawyer for your specific situation.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
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
    // Map case type to situation
    const situationMap = { 'divorce': 'divorce', 'custody': 'parenting', 'support': 'parenting', 'protection': 'parenting', 'variation': 'variation' };
    const sit = situationMap[caseData.case_type] || 'divorce';
    const { data: phasesData } = await supabase.from('filing_phases').select('*').eq('jurisdiction_id', caseData.jurisdiction_id).eq('situation', sit).order('display_order');
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
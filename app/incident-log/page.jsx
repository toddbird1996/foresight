'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';
import Footer from '../components/Footer';

const CATEGORIES = [
  { id: 'missed_visit', label: 'Missed / Late Visit', icon: '⏰', color: 'bg-red-100 text-red-700' },
  { id: 'communication', label: 'Communication Issue', icon: '💬', color: 'bg-blue-100 text-blue-700' },
  { id: 'child_welfare', label: 'Child Welfare Concern', icon: '🛡️', color: 'bg-amber-100 text-amber-700' },
  { id: 'court_order', label: 'Court Order Violation', icon: '⚖️', color: 'bg-purple-100 text-purple-700' },
  { id: 'financial', label: 'Financial / Support', icon: '💰', color: 'bg-green-100 text-green-700' },
  { id: 'parental_alienation', label: 'Parental Alienation', icon: '🚫', color: 'bg-rose-100 text-rose-700' },
  { id: 'positive', label: 'Positive Event', icon: '✅', color: 'bg-teal-100 text-teal-700' },
  { id: 'general', label: 'General Note', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

const SEVERITIES = [
  { id: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

const EMPTY_FORM = {
  incident_date: new Date().toISOString().split('T')[0],
  incident_time: '',
  title: '',
  description: '',
  category: 'general',
  severity: 'medium',
  witnesses: '',
  evidence_notes: '',
  follow_up_required: false,
  follow_up_notes: '',
};

export default function IncidentLogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedCase, setSelectedCase] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await Promise.all([fetchIncidents(user.id), fetchCases(user.id)]);
      setLoading(false);
    };
    init();
  }, []);

  const fetchIncidents = async (uid) => {
    const { data } = await supabase.from('incident_log')
      .select('*').eq('user_id', uid)
      .order('incident_date', { ascending: false })
      .order('created_at', { ascending: false });
    setIncidents(data || []);
  };

  const fetchCases = async (uid) => {
    const { data } = await supabase.from('cases').select('id, name').eq('user_id', uid);
    setCases(data || []);
  };

  const saveIncident = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.incident_date) return;
    setSaving(true);
    const payload = { ...form, user_id: user.id, case_id: selectedCase || null };
    
    if (editingId) {
      await supabase.from('incident_log').update(payload).eq('id', editingId);
    } else {
      await supabase.from('incident_log').insert(payload);
    }
    
    await fetchIncidents(user.id);
    setForm(EMPTY_FORM);
    setSelectedCase('');
    setShowForm(false);
    setEditingId(null);
    setSaving(false);
  };

  const deleteIncident = async (id) => {
    if (!confirm('Delete this incident record?')) return;
    await supabase.from('incident_log').delete().eq('id', id);
    setIncidents(prev => prev.filter(i => i.id !== id));
  };

  const startEdit = (incident) => {
    setForm({
      incident_date: incident.incident_date,
      incident_time: incident.incident_time || '',
      title: incident.title,
      description: incident.description,
      category: incident.category,
      severity: incident.severity,
      witnesses: incident.witnesses || '',
      evidence_notes: incident.evidence_notes || '',
      follow_up_required: incident.follow_up_required || false,
      follow_up_notes: incident.follow_up_notes || '',
    });
    setSelectedCase(incident.case_id || '');
    setEditingId(incident.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const exportToPDF = () => {
    const filtered = filterCategory === 'all' ? incidents : incidents.filter(i => i.category === filterCategory);
    const text = filtered.map(i => {
      const cat = CATEGORIES.find(c => c.id === i.category);
      const sev = SEVERITIES.find(s => s.id === i.severity);
      return [
        `DATE: ${i.incident_date}${i.incident_time ? ' at ' + i.incident_time : ''}`,
        `CATEGORY: ${cat?.label || i.category} | SEVERITY: ${sev?.label || i.severity}`,
        `TITLE: ${i.title}`,
        `DESCRIPTION:\n${i.description}`,
        i.witnesses ? `WITNESSES: ${i.witnesses}` : '',
        i.evidence_notes ? `EVIDENCE NOTES: ${i.evidence_notes}` : '',
        i.follow_up_required ? `FOLLOW-UP REQUIRED: ${i.follow_up_notes || 'Yes'}` : '',
        '─'.repeat(60),
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    const header = `INCIDENT LOG\nGenerated: ${new Date().toLocaleDateString('en-CA')}\nTotal records: ${filtered.length}\n${'═'.repeat(60)}\n\n`;
    const blob = new Blob([header + text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const filtered = filterCategory === 'all' ? incidents : incidents.filter(i => i.category === filterCategory);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Incident Log" subtitle="Private timestamped record of events" icon="📓" />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-800">
            <strong>🔒 Private & Secure.</strong> Your incident log is visible only to you. It is never shared with the other party. Document events as they happen — courts give more weight to contemporaneous notes written close to the time of the incident.
          </p>
        </div>

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded</p>
            <p className="text-xs text-gray-500">Sorted by most recent</p>
          </div>
          <div className="flex gap-2">
            {incidents.length > 0 && (
              <button onClick={exportToPDF} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-gray-300">
                📥 Export
              </button>
            )}
            <button
              onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(v => !v); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold"
            >
              {showForm ? 'Cancel' : '+ Log Incident'}
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white border-2 border-red-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-gray-900">{editingId ? 'Edit Incident' : 'Log New Incident'}</h3>

            {/* Date / Time / Case */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                <input type="date" value={form.incident_date} onChange={e => setForm(p => ({ ...p, incident_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Time (approx.)</label>
                <input type="time" value={form.incident_time} onChange={e => setForm(p => ({ ...p, incident_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Title * <span className="text-gray-400 font-normal">— brief description</span></label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Children returned 2 hours late without notice"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            </div>

            {/* Category + Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-red-400">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Severity</label>
                <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-red-400">
                  {SEVERITIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Description * <span className="text-gray-400 font-normal">— be specific: who, what, where, when, exact words said</span>
              </label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={5} placeholder="Write exactly what happened in as much detail as you can remember. Use direct quotes where possible. Include the children's reactions if relevant."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400 leading-relaxed" />
            </div>

            {/* Witnesses */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Witnesses <span className="text-gray-400 font-normal">— names and relationship</span></label>
              <input type="text" value={form.witnesses} onChange={e => setForm(p => ({ ...p, witnesses: e.target.value }))}
                placeholder="e.g. My sister Jane (witnessed the late pickup)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Evidence <span className="text-gray-400 font-normal">— what you have or should preserve</span></label>
              <input type="text" value={form.evidence_notes} onChange={e => setForm(p => ({ ...p, evidence_notes: e.target.value }))}
                placeholder="e.g. Screenshot of texts at 8:47pm, photo of children when returned (file saved)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            </div>

            {/* Follow-up */}
            <div className="flex items-center gap-3">
              <input type="checkbox" id="followup" checked={form.follow_up_required} onChange={e => setForm(p => ({ ...p, follow_up_required: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-red-600" />
              <label htmlFor="followup" className="text-sm text-gray-700">Follow-up action required</label>
            </div>
            {form.follow_up_required && (
              <input type="text" value={form.follow_up_notes} onChange={e => setForm(p => ({ ...p, follow_up_notes: e.target.value }))}
                placeholder="What needs to happen next? e.g. Send warning text, document in co-parent chat"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
            )}

            {/* Case link */}
            {cases.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Link to case <span className="text-gray-400 font-normal">(optional)</span></label>
                <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-red-400">
                  <option value="">No specific case</option>
                  {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
              <button onClick={saveIncident} disabled={saving || !form.title.trim() || !form.description.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-40">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Save Incident'}
              </button>
            </div>
          </div>
        )}

        {/* Category filter */}
        {incidents.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilterCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCategory === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              All ({incidents.length})
            </button>
            {CATEGORIES.filter(c => incidents.some(i => i.category === c.id)).map(c => (
              <button key={c.id} onClick={() => setFilterCategory(c.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCategory === c.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {c.icon} {c.label} ({incidents.filter(i => i.category === c.id).length})
              </button>
            ))}
          </div>
        )}

        {/* Incident list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-3xl mb-3">📓</p>
            <p className="font-semibold text-gray-900 mb-1">No incidents logged yet</p>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Document events as they happen — late pickups, missed visits, things said in front of the children, welfare concerns. Courts give more weight to notes written close to the time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(incident => {
              const cat = CATEGORIES.find(c => c.id === incident.category);
              const sev = SEVERITIES.find(s => s.id === incident.severity);
              const isExpanded = expandedId === incident.id;
              return (
                <div key={incident.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-xl">{cat?.icon || '📝'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm">{incident.title}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sev?.color || 'bg-gray-100 text-gray-600'}`}>{sev?.label}</span>
                        {incident.follow_up_required && !incident.follow_up_notes?.includes('✓') && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">⚡ Follow-up</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{incident.incident_date}{incident.incident_time ? ' · ' + incident.incident_time : ''}</span>
                        <span>·</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${cat?.color || 'bg-gray-100 text-gray-700'}`}>{cat?.label || incident.category}</span>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm flex-shrink-0">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
                      </div>
                      {incident.witnesses && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">Witnesses</p>
                          <p className="text-sm text-gray-700">{incident.witnesses}</p>
                        </div>
                      )}
                      {incident.evidence_notes && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">Evidence</p>
                          <p className="text-sm text-gray-700">{incident.evidence_notes}</p>
                        </div>
                      )}
                      {incident.follow_up_required && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-amber-800">⚡ Follow-up required</p>
                          {incident.follow_up_notes && <p className="text-xs text-amber-700 mt-0.5">{incident.follow_up_notes}</p>}
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => startEdit(incident)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium">Edit</button>
                        <button onClick={() => deleteIncident(incident.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Court tip */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>💡 Court tip:</strong> When presenting incidents in court, judges want facts — dates, times, exact words, who was there. Avoid emotional language. Your log here can be exported and attached to your affidavit as an exhibit.
          </p>
        </div>

        <Footer />
      </main>
    </div>
  );
}

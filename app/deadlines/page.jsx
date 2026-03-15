'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const PRIORITIES = [
  { id: 'high', label: 'High', color: 'bg-red-500', dot: 'bg-red-500' },
  { id: 'medium', label: 'Medium', color: 'bg-amber-500', dot: 'bg-amber-400' },
  { id: 'low', label: 'Low', color: 'bg-blue-500', dot: 'bg-blue-400' },
];
const EVENT_TYPES = [
  { id: 'deadline', label: 'Deadline', dot: 'bg-red-500' },
  { id: 'parent_a', label: 'With Me', dot: 'bg-green-500' },
  { id: 'parent_b', label: 'With Other Parent', dot: 'bg-blue-500' },
  { id: 'exchange', label: 'Exchange', dot: 'bg-purple-500' },
  { id: 'hearing', label: 'Court Hearing', dot: 'bg-red-600' },
  { id: 'school', label: 'School', dot: 'bg-teal-500' },
  { id: 'medical', label: 'Medical', dot: 'bg-cyan-500' },
  { id: 'activity', label: 'Activity', dot: 'bg-pink-500' },
  { id: 'holiday', label: 'Holiday', dot: 'bg-amber-500' },
];

export default function DeadlinesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', due_time: '', priority: 'medium', event_type: 'deadline', reminder_days: [1, 3] });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await fetchDeadlines(user.id);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => { if (user) fetchDeadlines(user.id); }, [currentDate]);

  const fetchDeadlines = async (userId) => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const start = new Date(y, m - 1, 1).toISOString().split('T')[0];
    const end = new Date(y, m + 2, 0).toISOString().split('T')[0];
    const { data } = await supabase.from('deadlines').select('*').eq('user_id', userId)
      .gte('due_date', start).lte('due_date', end).order('due_date').order('due_time', { ascending: true, nullsFirst: false });
    setDeadlines(data || []);
  };

  const saveDeadline = async () => {
    if (!form.title.trim() || !form.due_date) return;
    const payload = {
      user_id: user.id, title: form.title.trim(), description: form.description.trim(),
      due_date: form.due_date, due_time: form.due_time || null, priority: form.priority,
      event_type: form.event_type || 'deadline', reminder_days: form.reminder_days, completed: false,
    };
    if (editing) {
      await supabase.from('deadlines').update(payload).eq('id', editing);
    } else {
      await supabase.from('deadlines').insert(payload);
    }
    resetForm();
    await fetchDeadlines(user.id);
  };

  const toggleComplete = async (id, current) => {
    await supabase.from('deadlines').update({ completed: !current, completed_at: !current ? new Date().toISOString() : null }).eq('id', id);
    await fetchDeadlines(user.id);
  };

  const deleteDeadline = async (id) => {
    await supabase.from('deadlines').delete().eq('id', id);
    await fetchDeadlines(user.id);
  };

  const startEdit = (d) => {
    setForm({ title: d.title, description: d.description || '', due_date: d.due_date, due_time: d.due_time || '', priority: d.priority || 'medium', event_type: d.event_type || 'deadline', reminder_days: d.reminder_days || [1, 3] });
    setEditing(d.id);
    setShowAdd(true);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', due_date: selectedDate, due_time: '', priority: 'medium', event_type: 'deadline', reminder_days: [1, 3] });
    setEditing(null);
    setShowAdd(false);
  };

  const toggleReminder = (day) => {
    setForm(prev => ({
      ...prev,
      reminder_days: prev.reminder_days.includes(day) ? prev.reminder_days.filter(d => d !== day) : [...prev.reminder_days, day].sort((a, b) => a - b),
    }));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getDeadlinesForDate = (dateStr) => deadlines.filter(d => d.due_date === dateStr);
  const selectedDeadlines = deadlines.filter(d => d.due_date === selectedDate);
  const daysLeft = (dateStr) => Math.ceil((new Date(dateStr) - new Date()) / 86400000);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <PageTitle title="Calendar & Deadlines" subtitle="Court dates, custody schedule, and reminders" icon="📅" />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50">←</button>
          <h2 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50">→</button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="min-h-[60px] sm:min-h-[72px] border-b border-r border-gray-100 bg-gray-50/30" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayDeadlines = getDeadlinesForDate(dateStr);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <button key={day} onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[60px] sm:min-h-[72px] border-b border-r border-gray-100 p-1 text-left transition-colors relative ${isSelected ? 'bg-red-50 ring-2 ring-red-400 ring-inset' : 'hover:bg-gray-50'}`}>
                  <div className={`text-xs font-medium mb-0.5 ${isToday ? 'w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto sm:mx-0' : 'text-gray-700 px-1'}`}>
                    {day}
                  </div>
                  {dayDeadlines.length > 0 && (
                    <div className="flex gap-0.5 px-1 flex-wrap">
                      {dayDeadlines.slice(0, 3).map(d => {
                        const et = EVENT_TYPES.find(e => e.id === d.event_type);
                        const p = PRIORITIES.find(pr => pr.id === d.priority);
                        return <div key={d.id} className={`w-1.5 h-1.5 rounded-full ${d.completed ? 'bg-green-400' : et?.dot || p?.dot || 'bg-gray-300'}`} />;
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 px-1 mb-4">
          {EVENT_TYPES.map(et => (
            <div key={et.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${et.dot}`} />
              <span className="text-[10px] text-gray-500">{et.label}</span>
            </div>
          ))}
        </div>

        {/* Selected Day View */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
              <p className="text-xs text-gray-500">{selectedDeadlines.length} deadline{selectedDeadlines.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => { setForm(prev => ({ ...prev, due_date: selectedDate })); setShowAdd(true); }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium">+ Add</button>
          </div>

          {selectedDeadlines.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No deadlines on this day</p>
              <button onClick={() => { setForm(prev => ({ ...prev, due_date: selectedDate })); setShowAdd(true); }}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">+ Add one</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {selectedDeadlines.map(d => {
                const p = PRIORITIES.find(pr => pr.id === d.priority);
                const days = daysLeft(d.due_date);
                return (
                  <div key={d.id} className={`px-4 py-3 flex items-start gap-3 ${d.completed ? 'opacity-50' : ''}`}>
                    <button onClick={() => toggleComplete(d.id, d.completed)}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${d.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-red-400'}`}>
                      {d.completed && <span className="text-[10px]">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${d.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{d.title}</span>
                        <span className={`w-2 h-2 rounded-full ${p?.dot}`} />
                      </div>
                      {d.due_time && <div className="text-xs text-gray-500 mt-0.5">🕐 {d.due_time.slice(0, 5)}</div>}
                      {d.description && <p className="text-xs text-gray-500 mt-1">{d.description}</p>}
                      {!d.completed && days <= 3 && days >= 0 && (
                        <div className={`text-[10px] font-medium mt-1 ${days === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {days === 0 ? '⚠️ Due today!' : days === 1 ? '⚠️ Due tomorrow' : `⚠️ ${days} days left`}
                        </div>
                      )}
                      {d.reminder_days && d.reminder_days.length > 0 && !d.completed && (
                        <div className="text-[10px] text-gray-400 mt-1">🔔 Reminders: {d.reminder_days.map(r => `${r}d before`).join(', ')}</div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(d)} className="text-xs text-gray-400 hover:text-gray-600 px-1">✏️</button>
                      <button onClick={() => deleteDeadline(d.id)} className="text-xs text-gray-400 hover:text-red-500 px-1">🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming list */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">All Upcoming</h3>
          {deadlines.filter(d => !d.completed && d.due_date >= today).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming deadlines</p>
          ) : (
            <div className="space-y-2">
              {deadlines.filter(d => !d.completed && d.due_date >= today).slice(0, 10).map(d => {
                const p = PRIORITIES.find(pr => pr.id === d.priority);
                const days = daysLeft(d.due_date);
                return (
                  <button key={d.id} onClick={() => setSelectedDate(d.due_date)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-left transition-colors">
                    <div className={`w-1 h-8 rounded-full ${p?.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{d.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(d.due_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        {d.due_time && ` at ${d.due_time.slice(0, 5)}`}
                        {' · '}{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={resetForm}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="font-bold text-gray-900 text-lg mb-4">{editing ? 'Edit Event' : 'Add Event'}</h3>
            <div className="space-y-3">
              {/* Event Type */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map(et => (
                    <button key={et.id} onClick={() => setForm(prev => ({ ...prev, event_type: et.id }))}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${form.event_type === et.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${et.dot}`} />{et.label}
                    </button>
                  ))}
                </div>
              </div>

              <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title *" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date *</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Time</label>
                  <input type="time" value={form.due_time} onChange={e => setForm(prev => ({ ...prev, due_time: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.id} onClick={() => setForm(prev => ({ ...prev, priority: p.id }))}
                      className={`py-2 rounded-xl text-xs font-medium ${form.priority === p.id ? `${p.color} text-white` : 'bg-gray-100 text-gray-600'}`}>{p.label}</button>
                  ))}
                </div>
              </div>

              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Notes (optional)" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">🔔 Remind me</label>
                <div className="flex flex-wrap gap-2">
                  {[{ d: 0, l: 'Day of' }, { d: 1, l: '1 day before' }, { d: 3, l: '3 days' }, { d: 7, l: '1 week' }, { d: 14, l: '2 weeks' }].map(r => (
                    <button key={r.d} onClick={() => toggleReminder(r.d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${form.reminder_days.includes(r.d) ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{r.l}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={resetForm} className="flex-1 py-3 text-gray-500 text-sm">Cancel</button>
                <button onClick={saveDeadline} disabled={!form.title.trim() || !form.due_date}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
                  {editing ? 'Save' : 'Add Deadline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

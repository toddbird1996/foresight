'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const EVENT_TYPES = [
  { id: 'parent_a', label: 'With Me', color: '#DC2626', bg: 'bg-red-100 text-red-700' },
  { id: 'parent_b', label: 'With Other Parent', color: '#2563EB', bg: 'bg-blue-100 text-blue-700' },
  { id: 'exchange', label: 'Custody Exchange', color: '#7C3AED', bg: 'bg-purple-100 text-purple-700' },
  { id: 'holiday', label: 'Holiday', color: '#D97706', bg: 'bg-amber-100 text-amber-700' },
  { id: 'school', label: 'School Event', color: '#059669', bg: 'bg-green-100 text-green-700' },
  { id: 'medical', label: 'Medical', color: '#0891B2', bg: 'bg-cyan-100 text-cyan-700' },
  { id: 'extracurricular', label: 'Activity', color: '#DB2777', bg: 'bg-pink-100 text-pink-700' },
  { id: 'other', label: 'Other', color: '#6B7280', bg: 'bg-gray-100 text-gray-600' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CustodyCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', event_type: 'parent_a', start_date: '', end_date: '', notes: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await fetchEvents(user.id);
    };
    init();
  }, []);

  useEffect(() => { if (user) fetchEvents(user.id); }, [currentDate]);

  const fetchEvents = async (userId) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const end = new Date(year, month + 2, 0).toISOString().split('T')[0];
    const { data } = await supabase.from('custody_events').select('*')
      .eq('user_id', userId).gte('start_date', start).lte('start_date', end).order('start_date');
    setEvents(data || []);
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.start_date) return;
    setSaving(true);
    await supabase.from('custody_events').insert({
      user_id: user.id, title: newEvent.title, event_type: newEvent.event_type,
      start_date: newEvent.start_date, end_date: newEvent.end_date || newEvent.start_date,
      notes: newEvent.notes, location: newEvent.location,
      color: EVENT_TYPES.find(t => t.id === newEvent.event_type)?.color || '#DC2626',
    });
    setNewEvent({ title: '', event_type: 'parent_a', start_date: '', end_date: '', notes: '', location: '' });
    setShowAdd(false);
    await fetchEvents(user.id);
    setSaving(false);
  };

  const deleteEvent = async (id) => {
    await supabase.from('custody_events').delete().eq('id', id);
    await fetchEvents(user.id);
  };

  // Calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      const start = e.start_date;
      const end = e.end_date || e.start_date;
      return dateStr >= start && dateStr <= end;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Custody Calendar" subtitle="Track parenting time and exchanges" icon="📅" />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50">← Prev</button>
          <h2 className="text-lg font-bold text-gray-900">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Next →</button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {EVENT_TYPES.slice(0, 4).map(t => (
            <span key={t.id} className={`px-2 py-1 rounded-full text-[10px] font-medium ${t.bg}`}>{t.label}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {DAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-100 bg-gray-50/50" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayEvents = getEventsForDate(day);
              const isToday = dateStr === today;

              return (
                <button key={day} onClick={() => {
                  setSelectedDate(dateStr);
                  setNewEvent(prev => ({ ...prev, start_date: dateStr, end_date: dateStr }));
                  setShowAdd(true);
                }}
                  className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-100 p-1 text-left hover:bg-gray-50 transition-colors ${isToday ? 'bg-red-50/50' : ''}`}>
                  <div className={`text-xs font-medium mb-0.5 ${isToday ? 'w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center' : 'text-gray-700 px-1'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => {
                      const type = EVENT_TYPES.find(t => t.id === e.event_type);
                      return (
                        <div key={e.id} className="text-[9px] sm:text-[10px] truncate rounded px-1 py-0.5" style={{ backgroundColor: type?.color + '20', color: type?.color }}>
                          {e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && <div className="text-[9px] text-gray-400 px-1">+{dayEvents.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Add Button */}
        <button onClick={() => { setNewEvent(prev => ({ ...prev, start_date: today, end_date: today })); setShowAdd(true); }}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm mb-4">
          + Add Calendar Event
        </button>

        {/* Upcoming Events List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Upcoming Events</h3>
          {events.filter(e => e.start_date >= today).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No upcoming events. Tap a date or the button above to add one.</p>
          ) : (
            <div className="space-y-2">
              {events.filter(e => e.start_date >= today).slice(0, 10).map(e => {
                const type = EVENT_TYPES.find(t => t.id === e.event_type);
                return (
                  <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: type?.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{e.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(e.start_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        {e.end_date && e.end_date !== e.start_date && ` – ${new Date(e.end_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}`}
                        {e.location && ` · ${e.location}`}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${type?.bg}`}>{type?.label}</span>
                    <button onClick={() => deleteEvent(e.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="font-bold text-gray-900 text-lg mb-4">Add Calendar Event</h3>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {EVENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setNewEvent(prev => ({ ...prev, event_type: t.id }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${newEvent.event_type === t.id ? t.bg : 'bg-gray-100 text-gray-500'}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <input type="text" value={newEvent.title} onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Event title" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input type="date" value={newEvent.start_date} onChange={e => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input type="date" value={newEvent.end_date} onChange={e => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                </div>
              </div>

              <input type="text" value={newEvent.location} onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Location (optional)" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />

              <textarea value={newEvent.notes} onChange={e => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes (optional)" rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 text-gray-500 text-sm">Cancel</button>
                <button onClick={addEvent} disabled={!newEvent.title || !newEvent.start_date || saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
                  {saving ? 'Saving...' : 'Add Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

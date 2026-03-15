'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const CATEGORIES = [
  { id: 'childcare', label: 'Childcare', icon: '👶' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'dental', label: 'Dental', icon: '🦷' },
  { id: 'school', label: 'School', icon: '🏫' },
  { id: 'extracurricular', label: 'Activities', icon: '⚽' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'food', label: 'Food', icon: '🍎' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'housing', label: 'Housing', icon: '🏠' },
  { id: 'other', label: 'Other', icon: '📦' },
];

export default function ExpensesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newExpense, setNewExpense] = useState({
    title: '', amount: '', category: 'childcare', paid_by: 'me',
    split_type: 'equal', my_share_percent: 50, expense_date: new Date().toISOString().split('T')[0], notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      await fetchExpenses(user.id);
    };
    init();
  }, []);

  const fetchExpenses = async (userId) => {
    const { data } = await supabase.from('shared_expenses').select('*').eq('user_id', userId).order('expense_date', { ascending: false });
    setExpenses(data || []);
  };

  const addExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    setSaving(true);
    await supabase.from('shared_expenses').insert({
      user_id: user.id, title: newExpense.title, amount: parseFloat(newExpense.amount),
      category: newExpense.category, paid_by: newExpense.paid_by, split_type: newExpense.split_type,
      my_share_percent: newExpense.split_type === 'equal' ? 50 : parseFloat(newExpense.my_share_percent),
      expense_date: newExpense.expense_date, notes: newExpense.notes,
    });
    setNewExpense({ title: '', amount: '', category: 'childcare', paid_by: 'me', split_type: 'equal', my_share_percent: 50, expense_date: new Date().toISOString().split('T')[0], notes: '' });
    setShowAdd(false);
    await fetchExpenses(user.id);
    setSaving(false);
  };

  const deleteExpense = async (id) => {
    await supabase.from('shared_expenses').delete().eq('id', id);
    await fetchExpenses(user.id);
  };

  // Calculate totals
  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const iPaid = expenses.filter(e => e.paid_by === 'me').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const theyPaid = expenses.filter(e => e.paid_by === 'other_parent').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const myShare = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) * (e.my_share_percent || 50) / 100), 0);
  const theirShare = totalSpent - myShare;
  const balance = iPaid - myShare; // positive = they owe me, negative = I owe them

  const fmt = (n) => '$' + Math.abs(n).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Expense Tracker" subtitle="Track and split shared child expenses" icon="💰" />

      <main className="max-w-3xl mx-auto px-4 py-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Total Expenses</div>
            <div className="text-xl font-bold text-gray-900">{fmt(totalSpent)}</div>
          </div>
          <div className={`border rounded-xl p-4 ${balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="text-xs text-gray-500 mb-1">{balance >= 0 ? 'They Owe You' : 'You Owe Them'}</div>
            <div className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(balance)}</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">I Paid</div>
              <div className="font-semibold text-gray-900">{fmt(iPaid)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">They Paid</div>
              <div className="font-semibold text-gray-900">{fmt(theyPaid)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">My Share</div>
              <div className="font-semibold text-gray-900">{fmt(myShare)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Their Share</div>
              <div className="font-semibold text-gray-900">{fmt(theirShare)}</div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button onClick={() => setShowAdd(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm mb-4">
          + Add Expense
        </button>

        {/* Category Filter */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === c.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Expense List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <span className="text-3xl block mb-2">💰</span>
              <p className="text-sm text-gray-500">No expenses yet. Tap the button above to log your first shared expense.</p>
            </div>
          ) : filtered.map(e => {
            const cat = CATEGORIES.find(c => c.id === e.category);
            const myPortion = parseFloat(e.amount) * (e.my_share_percent || 50) / 100;
            return (
              <div key={e.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{cat?.icon || '📦'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-gray-900 truncate">{e.title}</div>
                      <div className="font-bold text-sm text-gray-900">{fmt(parseFloat(e.amount))}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span>{new Date(e.expense_date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span className={e.paid_by === 'me' ? 'text-green-600' : 'text-blue-600'}>{e.paid_by === 'me' ? 'I paid' : 'They paid'}</span>
                      <span>·</span>
                      <span>My share: {fmt(myPortion)}</span>
                    </div>
                    {e.notes && <p className="text-xs text-gray-400 mt-1">{e.notes}</p>}
                  </div>
                  <button onClick={() => deleteExpense(e.id)} className="text-gray-300 hover:text-red-500 text-xs mt-1">✕</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export */}
        {expenses.length > 0 && (
          <button onClick={() => {
            const rows = expenses.map(e => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${e.expense_date}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${e.title}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:right">$${parseFloat(e.amount).toFixed(2)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${e.paid_by === 'me' ? 'I paid' : 'Other parent'}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px">${e.category}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;text-align:right">$${(parseFloat(e.amount) * (e.my_share_percent || 50) / 100).toFixed(2)}</td></tr>`);
            const html = `<html><head><title>Expense Report</title><style>body{font-family:Arial,sans-serif;font-size:13px;margin:40px;color:#333}h1{font-size:18px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:16px}th{text-align:left;padding:6px 8px;border-bottom:2px solid #333;font-size:10px;text-transform:uppercase;color:#666}.summary{display:flex;gap:24px;margin:12px 0;font-size:12px}.summary span{color:#666}.summary strong{color:#111}@media print{body{margin:20px}}</style></head><body><h1>Shared Expense Report</h1><p style="color:#666;font-size:12px">Exported: ${new Date().toLocaleDateString('en-CA')} | ${expenses.length} expenses</p><div class="summary"><span>Total: <strong>$${totalSpent.toFixed(2)}</strong></span><span>I Paid: <strong>$${iPaid.toFixed(2)}</strong></span><span>They Paid: <strong>$${theyPaid.toFixed(2)}</strong></span><span>Balance: <strong style="color:${balance >= 0 ? '#16a34a' : '#dc2626'}">${balance >= 0 ? 'They owe me' : 'I owe them'} $${Math.abs(balance).toFixed(2)}</strong></span></div><table><thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Amount</th><th>Paid By</th><th>Category</th><th style="text-align:right">My Share</th></tr></thead><tbody>${rows.join('')}</tbody></table><p style="color:#999;font-size:9px;margin-top:24px;text-align:center">Generated by Foresight. This is a record of shared expenses and is not legal advice.</p></body></html>`;
            const win = window.open('', '_blank'); win.document.write(html); win.document.close(); win.focus();
            setTimeout(() => win.print(), 500);
          }} className="w-full mt-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium text-sm">
            📄 Export Expense Report (PDF)
          </button>
        )}
      </main>

      {/* Add Expense Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
            <h3 className="font-bold text-gray-900 text-lg mb-4">Add Expense</h3>

            <div className="space-y-3">
              <input type="text" value={newExpense.title} onChange={e => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What was this expense for?" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input type="number" step="0.01" value={newExpense.amount} onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-lg font-semibold focus:outline-none focus:border-red-400" />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setNewExpense(prev => ({ ...prev, category: c.id }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${newExpense.category === c.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Who paid?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setNewExpense(prev => ({ ...prev, paid_by: 'me' }))}
                    className={`py-2.5 rounded-xl text-sm font-medium ${newExpense.paid_by === 'me' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>I Paid</button>
                  <button onClick={() => setNewExpense(prev => ({ ...prev, paid_by: 'other_parent' }))}
                    className={`py-2.5 rounded-xl text-sm font-medium ${newExpense.paid_by === 'other_parent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Other Parent</button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">How to split?</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'equal', label: '50/50' }, { id: 'proportional', label: 'By Income' }, { id: 'custom', label: 'Custom' }].map(s => (
                    <button key={s.id} onClick={() => setNewExpense(prev => ({ ...prev, split_type: s.id }))}
                      className={`py-2 rounded-xl text-xs font-medium ${newExpense.split_type === s.id ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s.label}</button>
                  ))}
                </div>
                {newExpense.split_type === 'custom' && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">My share: {newExpense.my_share_percent}%</label>
                    <input type="range" min="0" max="100" value={newExpense.my_share_percent}
                      onChange={e => setNewExpense(prev => ({ ...prev, my_share_percent: e.target.value }))}
                      className="w-full accent-red-600" />
                  </div>
                )}
              </div>

              <input type="date" value={newExpense.expense_date} onChange={e => setNewExpense(prev => ({ ...prev, expense_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />

              <textarea value={newExpense.notes} onChange={e => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes (optional)" rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400 resize-none" />

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 text-gray-500 text-sm">Cancel</button>
                <button onClick={addExpense} disabled={!newExpense.title || !newExpense.amount || saving}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
                  {saving ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

const FIELDS = [
  { section: 'Basic', fields: [
    { id: 'name', label: 'Child\'s Name *', placeholder: 'First and last name' },
    { id: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  ]},
  { section: 'Medical', fields: [
    { id: 'doctor_name', label: 'Doctor', placeholder: 'Dr. Smith' },
    { id: 'doctor_phone', label: 'Doctor Phone', placeholder: '306-555-1234' },
    { id: 'dentist_name', label: 'Dentist', placeholder: 'Dr. Jones' },
    { id: 'dentist_phone', label: 'Dentist Phone', placeholder: '306-555-5678' },
    { id: 'blood_type', label: 'Blood Type', placeholder: 'A+' },
    { id: 'health_card_number', label: 'Health Card #', placeholder: '123-456-789' },
    { id: 'allergies', label: 'Allergies', placeholder: 'Peanuts, penicillin, etc.' },
    { id: 'medications', label: 'Medications', placeholder: 'Inhaler, EpiPen, etc.' },
  ]},
  { section: 'School', fields: [
    { id: 'school_name', label: 'School Name', placeholder: 'Maple Elementary' },
    { id: 'school_phone', label: 'School Phone', placeholder: '306-555-9999' },
  ]},
  { section: 'Other', fields: [
    { id: 'clothing_size', label: 'Clothing Size', placeholder: 'Size 8' },
    { id: 'shoe_size', label: 'Shoe Size', placeholder: 'Size 2' },
    { id: 'emergency_contact_name', label: 'Emergency Contact', placeholder: 'Grandma Smith' },
    { id: 'emergency_contact_phone', label: 'Emergency Phone', placeholder: '306-555-0000' },
    { id: 'notes', label: 'Notes', placeholder: 'Any other important info...' },
  ]},
];

const EMPTY_FORM = { name: '', date_of_birth: '', school_name: '', school_phone: '', doctor_name: '', doctor_phone: '', dentist_name: '', dentist_phone: '', allergies: '', medications: '', blood_type: '', health_card_number: '', clothing_size: '', shoe_size: '', emergency_contact_name: '', emergency_contact_phone: '', notes: '' };

export default function ChildrenInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      const { data } = await supabase.from('children_info').select('*').eq('user_id', user.id).order('created_at');
      setChildren(data || []);
    };
    init();
  }, []);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const save = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await supabase.from('children_info').update(form).eq('id', editing);
    } else {
      await supabase.from('children_info').insert({ ...form, user_id: user.id });
    }
    const { data } = await supabase.from('children_info').select('*').eq('user_id', user.id).order('created_at');
    setChildren(data || []);
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowAdd(false);
  };

  const startEdit = (child) => {
    const f = { ...EMPTY_FORM };
    Object.keys(f).forEach(k => { if (child[k] !== undefined && child[k] !== null) f[k] = child[k]; });
    setForm(f);
    setEditing(child.id);
    setShowAdd(true);
  };

  const deleteChild = async (id) => {
    if (!confirm('Remove this child\'s info?')) return;
    await supabase.from('children_info').delete().eq('id', id);
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PageTitle title="Children's Info" subtitle="Medical, school, and emergency details" icon="👧" />

      <main className="max-w-3xl mx-auto px-4 py-4">
        {children.length === 0 && !showAdd ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-3">👧</span>
            <h3 className="font-bold text-gray-900 mb-2">No Children Added Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Store important information about your children — medical records, school contacts, allergies, and more.</p>
            <button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">+ Add a Child</button>
          </div>
        ) : (
          <>
            {children.map(child => {
              const age = child.date_of_birth ? Math.floor((Date.now() - new Date(child.date_of_birth)) / 31557600000) : null;
              const infoFields = [
                ['Date of Birth', child.date_of_birth], ['Health Card #', child.health_card_number],
                ['School', child.school_name], ['School Phone', child.school_phone],
                ['Doctor', child.doctor_name], ['Doctor Phone', child.doctor_phone],
                ['Dentist', child.dentist_name], ['Dentist Phone', child.dentist_phone],
                ['Clothing Size', child.clothing_size], ['Shoe Size', child.shoe_size],
                ['Emergency Contact', child.emergency_contact_name ? `${child.emergency_contact_name} (${child.emergency_contact_phone || ''})` : null],
              ].filter(([, v]) => v);

              return (
                <div key={child.id} className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                  <div className="bg-red-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg font-bold">{child.name[0].toUpperCase()}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{child.name}</h3>
                        <p className="text-xs text-gray-500">{age !== null ? `${age} years old` : ''}{child.blood_type ? ` · Blood: ${child.blood_type}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(child)} className="px-3 py-1.5 bg-white rounded-lg text-xs text-gray-600 hover:text-red-600">Edit</button>
                      <button onClick={() => deleteChild(child.id)} className="px-3 py-1.5 bg-white rounded-lg text-xs text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                  <div className="p-4">
                    {(child.allergies || child.medications) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                        {child.allergies && <div className="text-xs"><strong className="text-amber-800">Allergies:</strong> <span className="text-amber-700">{child.allergies}</span></div>}
                        {child.medications && <div className="text-xs mt-1"><strong className="text-amber-800">Medications:</strong> <span className="text-amber-700">{child.medications}</span></div>}
                      </div>
                    )}
                    {infoFields.map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
                      </div>
                    ))}
                    {child.notes && <div className="pt-2 text-xs text-gray-500">{child.notes}</div>}
                  </div>
                </div>
              );
            })}
            {!showAdd && <button onClick={() => setShowAdd(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">+ Add Another Child</button>}
          </>
        )}

        {showAdd && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
            <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Child' : 'Add a Child'}</h3>
            <div className="space-y-4">
              {FIELDS.map(section => (
                <div key={section.section}>
                  {section.section !== 'Basic' && <div className="border-t border-gray-100 pt-3"><h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{section.section}</h4></div>}
                  <div className={`grid ${section.fields.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                    {section.fields.map(f => (
                      <div key={f.id} className={f.id === 'name' || f.id === 'allergies' || f.id === 'medications' || f.id === 'notes' ? 'col-span-2' : ''}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                        <input type={f.type || 'text'} value={form[f.id] || ''} onChange={e => updateField(f.id, e.target.value)}
                          placeholder={f.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAdd(false); setEditing(null); setForm({ ...EMPTY_FORM }); }} className="flex-1 py-3 text-gray-500 text-sm">Cancel</button>
                <button onClick={save} disabled={!form.name.trim()} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm disabled:opacity-40">
                  {editing ? 'Save Changes' : 'Add Child'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

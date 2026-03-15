'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import PageTitle from '../components/PageTitle';

export default function ChildrenInfoPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', date_of_birth: '', school_name: '', school_phone: '', doctor_name: '', doctor_phone: '',
    dentist_name: '', dentist_phone: '', allergies: '', medications: '', blood_type: '', health_card_number: '',
    clothing_size: '', shoe_size: '', emergency_contact_name: '', emergency_contact_phone: '', notes: '',
  });

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

  const save = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await supabase.from('children_info').update(form).eq('id', editing);
    } else {
      await supabase.from('children_info').insert({ ...form, user_id: user.id });
    }
    const { data } = await supabase.from('children_info').select('*').eq('user_id', user.id).order('created_at');
    setChildren(data || []);
    resetForm();
  };

  const startEdit = (child) => {
    setForm({ ...child });
    setEditing(child.id);
    setShowAdd(true);
  };

  const deleteChild = async (id) => {
    if (!confirm('Remove this child\'s info?')) return;
    await supabase.from('children_info').delete().eq('id', id);
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setForm({ name: '', date_of_birth: '', school_name: '', school_phone: '', doctor_name: '', doctor_phone: '', dentist_name: '', dentist_phone: '', allergies: '', medications: '', blood_type: '', health_card_number: '', clothing_size: '', shoe_size: '', emergency_contact_name: '', emergency_contact_phone: '', notes: '' });
    setEditing(null);
    setShowAdd(false);
  };

  const Field = ({ label, value }) => value ? (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
    </div>
  ) : null;

  const Input = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input type={type} value={form[field] || ''} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
        placeholder={placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-red-400" />
    </div>
  );

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
            {/* Children Cards */}
            {children.map(child => {
              const age = child.date_of_birth ? Math.floor((Date.now() - new Date(child.date_of_birth)) / 31557600000) : null;
              return (
                <div key={child.id} className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
                  <div className="bg-red-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {child.name[0].toUpperCase()}
                      </div>
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
                  <div className="p-4 space-y-0">
                    {(child.allergies || child.medications) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                        {child.allergies && <div className="text-xs"><strong className="text-amber-800">Allergies:</strong> <span className="text-amber-700">{child.allergies}</span></div>}
                        {child.medications && <div className="text-xs mt-1"><strong className="text-amber-800">Medications:</strong> <span className="text-amber-700">{child.medications}</span></div>}
                      </div>
                    )}
                    <Field label="Date of Birth" value={child.date_of_birth} />
                    <Field label="Health Card #" value={child.health_card_number} />
                    <Field label="School" value={child.school_name} />
                    <Field label="School Phone" value={child.school_phone} />
                    <Field label="Doctor" value={child.doctor_name} />
                    <Field label="Doctor Phone" value={child.doctor_phone} />
                    <Field label="Dentist" value={child.dentist_name} />
                    <Field label="Dentist Phone" value={child.dentist_phone} />
                    <Field label="Clothing Size" value={child.clothing_size} />
                    <Field label="Shoe Size" value={child.shoe_size} />
                    <Field label="Emergency Contact" value={child.emergency_contact_name ? `${child.emergency_contact_name} (${child.emergency_contact_phone})` : null} />
                    {child.notes && <div className="pt-2 text-xs text-gray-500">{child.notes}</div>}
                  </div>
                </div>
              );
            })}

            {!showAdd && (
              <button onClick={() => setShowAdd(true)} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm">+ Add Another Child</button>
            )}
          </>
        )}

        {/* Add/Edit Form */}
        {showAdd && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
            <h3 className="font-bold text-gray-900 mb-4">{editing ? 'Edit Child' : 'Add a Child'}</h3>
            <div className="space-y-3">
              <Input label="Child's Name *" field="name" placeholder="First and last name" />
              <Input label="Date of Birth" field="date_of_birth" type="date" />

              <div className="border-t border-gray-100 pt-3 mt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medical</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Doctor" field="doctor_name" placeholder="Dr. Smith" />
                  <Input label="Doctor Phone" field="doctor_phone" placeholder="306-555-1234" />
                  <Input label="Dentist" field="dentist_name" placeholder="Dr. Jones" />
                  <Input label="Dentist Phone" field="dentist_phone" placeholder="306-555-5678" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Input label="Blood Type" field="blood_type" placeholder="A+" />
                  <Input label="Health Card #" field="health_card_number" placeholder="123-456-789" />
                </div>
                <div className="mt-3"><Input label="Allergies" field="allergies" placeholder="Peanuts, penicillin, etc." /></div>
                <div className="mt-3"><Input label="Medications" field="medications" placeholder="Inhaler, EpiPen, etc." /></div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">School</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="School Name" field="school_name" placeholder="Maple Elementary" />
                  <Input label="School Phone" field="school_phone" placeholder="306-555-9999" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Other</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Clothing Size" field="clothing_size" placeholder="Size 8" />
                  <Input label="Shoe Size" field="shoe_size" placeholder="Size 2" />
                  <Input label="Emergency Contact" field="emergency_contact_name" placeholder="Grandma Smith" />
                  <Input label="Emergency Phone" field="emergency_contact_phone" placeholder="306-555-0000" />
                </div>
                <div className="mt-3"><Input label="Notes" field="notes" placeholder="Any other important info..." /></div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={resetForm} className="flex-1 py-3 text-gray-500 text-sm">Cancel</button>
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

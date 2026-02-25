'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("");

  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);
      await fetchProfile(user.id);
      await fetchJurisdictions();
      setLoading(false);
    };

    init();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setSelectedJurisdiction(data.jurisdiction || "saskatchewan");
    }
  };

  const fetchJurisdictions = async () => {
    const { data } = await supabase
      .from("jurisdictions")
      .select("*")
      .order("display_order");

    if (data) {
      setJurisdictions(data);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        phone: phone,
        jurisdiction: selectedJurisdiction,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setProfile({ ...profile, full_name: fullName, phone, jurisdiction: selectedJurisdiction });
      setEditing(false);
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error signing out: " + error.message);
    } else {
      router.push("/auth/login");
    }
  };

  const getJurisdictionName = (id) => {
    const j = jurisdictions.find(j => j.id === id);
    return j ? j.name : id;
  };

  const getJurisdictionFlag = (id) => {
    const j = jurisdictions.find(j => j.id === id);
    return j ? j.flag : '🌍';
  };

  const canadianJurisdictions = jurisdictions.filter(j => j.country === 'Canada');
  const usJurisdictions = jurisdictions.filter(j => j.country === 'USA');

  const getTierInfo = (tier) => {
    switch (tier) {
      case 'gold':
        return { label: 'Gold', queries: 'Unlimited', docs: 'Unlimited' };
      case 'silver':
        return { label: 'Silver', queries: '25/day', docs: '5/month' };
      default:
        return { label: 'Bronze', queries: '5/day', docs: '1/month' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  const tierInfo = getTierInfo(profile?.tier);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-red-600">←</Link>
          <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-bold text-white">
              {fullName ? fullName[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{fullName || "No name set"}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium capitalize">
                  {profile?.tier || 'bronze'}
                </span>
                <span className="text-xs text-gray-500">
                  Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Jurisdiction */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📍 Jurisdiction</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getJurisdictionFlag(selectedJurisdiction)}</span>
              <span className="text-gray-900">{getJurisdictionName(selectedJurisdiction)}</span>
            </div>
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            >
              <optgroup label="🇨🇦 Canada">
                {canadianJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
              <optgroup label="🇺🇸 United States">
                {usJurisdictions.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </optgroup>
            </select>
            <button
              onClick={handleSave}
              className="text-red-600 text-sm hover:underline"
            >
              Save jurisdiction preference
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">⭐ Subscription</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-gray-900 capitalize">{tierInfo.label} Plan</div>
              <div className="text-sm text-gray-500">{tierInfo.queries} AI queries, {tierInfo.docs} docs</div>
            </div>
            <Link 
              href="/pricing"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              {profile?.tier === 'bronze' ? 'Upgrade' : 'Manage'}
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🔔 Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Reminders</div>
                <div className="text-sm text-gray-500">Deadline reminders via email</div>
              </div>
              <button 
                onClick={() => setEmailReminders(!emailReminders)}
                className={`w-12 h-6 rounded-full relative transition-colors ${emailReminders ? 'bg-red-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${emailReminders ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Weekly Digest</div>
                <div className="text-sm text-gray-500">Progress summary every Monday</div>
              </div>
              <button 
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                className={`w-12 h-6 rounded-full relative transition-colors ${weeklyDigest ? 'bg-red-600' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${weeklyDigest ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button 
          onClick={handleSignOut}
          className="w-full py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
        >
          Sign Out
        </button>
      </main>
    </div>
  );
    }

'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';

export default function UserProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { router.push('/community'); return; }
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setMe(user);

      // Fetch target user profile
      const { data: prof } = await supabase.from('users').select('id, full_name, tier, jurisdiction, is_mentor, created_at').eq('id', userId).single();
      if (!prof) { router.push('/community'); return; }
      setProfile(prof);

      // Check mentor
      if (prof.is_mentor) {
        const { data: mp } = await supabase.from('mentors').select('specialty, rating, review_count, total_sessions, bio').eq('user_id', userId).eq('status', 'approved').single();
        setMentorProfile(mp);
      }

      // Check if following
      const { data: fw } = await supabase.from('user_follows').select('id').eq('follower_id', user.id).eq('following_id', userId).single();
      setIsFollowing(!!fw);

      // Get follower/following counts and lists
      const { data: frs } = await supabase.from('user_follows').select('follower_id, users!user_follows_follower_id_fkey(full_name, is_mentor)').eq('following_id', userId);
      setFollowers(frs || []);
      const { data: fng } = await supabase.from('user_follows').select('following_id, users!user_follows_following_id_fkey(full_name, is_mentor)').eq('follower_id', userId);
      setFollowing(fng || []);

      // Post count
      const { count } = await supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      setPostCount(count || 0);

      setLoading(false);
    };
    init();
  }, [userId]);

  const toggleFollow = async () => {
    if (isFollowing) {
      await supabase.from('user_follows').delete().eq('follower_id', me.id).eq('following_id', userId);
      setIsFollowing(false);
      setFollowers(prev => prev.filter(f => f.follower_id !== me.id));
    } else {
      await supabase.from('user_follows').insert({ follower_id: me.id, following_id: userId });
      setIsFollowing(true);
      setFollowers(prev => [...prev, { follower_id: me.id, users: { full_name: 'You', is_mentor: false } }]);
    }
  };

  const SPEC_LABELS = { custody: 'Custody', divorce: 'Divorce', support: 'Child Support', cps: 'CPS', mediation: 'Mediation', self_rep: 'Self-Representation', high_conflict: 'High Conflict', relocation: 'Relocation' };
  const JURIS_NAMES = { saskatchewan: 'Saskatchewan', alberta: 'Alberta', ontario: 'Ontario', british_columbia: 'British Columbia', manitoba: 'Manitoba', quebec: 'Quebec', nova_scotia: 'Nova Scotia', new_brunswick: 'New Brunswick', newfoundland: 'Newfoundland', pei: 'PEI', northwest_territories: 'NWT', yukon: 'Yukon', nunavut: 'Nunavut' };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return null;

  const isMe = me?.id === userId;
  const name = profile.full_name || 'User';

  const UserListModal = ({ title, users, onClose, idKey, userKey }) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm mx-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">None yet</p>
        ) : (
          <div className="space-y-2">
            {users.map((u, i) => {
              const uName = u[userKey]?.full_name || 'User';
              const uId = u[idKey];
              const isMentor = u[userKey]?.is_mentor;
              return (
                <Link key={i} href={`/user?id=${uId}`} onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                  <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{uName[0].toUpperCase()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900">{uName}</span>
                      {isMentor && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold">MENTOR</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header bg */}
          <div className="h-20 bg-gradient-to-r from-red-500 to-red-700" />
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end justify-between mb-3">
              <div className="w-20 h-20 bg-red-600 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {name[0].toUpperCase()}
              </div>
              {!isMe && (
                <div className="flex gap-2 mb-1">
                  <Link href={`/dm?with=${userId}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-700 font-medium">Message</Link>
                  <button onClick={toggleFollow}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${isFollowing ? 'bg-gray-200 text-gray-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              )}
              {isMe && <Link href="/profile" className="px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600 mb-1">Edit Profile</Link>}
            </div>

            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              {profile.is_mentor && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">🧭 MENTOR</span>}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {profile.jurisdiction && <span>{JURIS_NAMES[profile.jurisdiction] || profile.jurisdiction}</span>}
              <span>·</span>
              <span>Joined {new Date(profile.created_at).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mt-4">
              <button onClick={() => setShowFollowers(true)} className="text-center hover:bg-gray-50 rounded-lg px-2 py-1">
                <div className="text-lg font-bold text-gray-900">{followers.length}</div>
                <div className="text-[10px] text-gray-500">Followers</div>
              </button>
              <button onClick={() => setShowFollowing(true)} className="text-center hover:bg-gray-50 rounded-lg px-2 py-1">
                <div className="text-lg font-bold text-gray-900">{following.length}</div>
                <div className="text-[10px] text-gray-500">Following</div>
              </button>
              <div className="text-center px-2 py-1">
                <div className="text-lg font-bold text-gray-900">{postCount}</div>
                <div className="text-[10px] text-gray-500">Posts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor Card */}
        {mentorProfile && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🧭</span>
              <h3 className="font-bold text-gray-900 text-sm">Mentor Profile</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-gray-50 rounded-xl p-2 text-center"><div className="font-bold text-gray-900">⭐ {mentorProfile.rating?.toFixed(1)}</div><div className="text-[10px] text-gray-500">Rating</div></div>
              <div className="bg-gray-50 rounded-xl p-2 text-center"><div className="font-bold text-gray-900">{mentorProfile.review_count || 0}</div><div className="text-[10px] text-gray-500">Reviews</div></div>
              <div className="bg-gray-50 rounded-xl p-2 text-center"><div className="font-bold text-gray-900">{mentorProfile.total_sessions || 0}</div><div className="text-[10px] text-gray-500">Sessions</div></div>
            </div>
            <div className="text-xs text-gray-500 mb-1">Specialty: <span className="text-gray-700 font-medium">{SPEC_LABELS[mentorProfile.specialty] || mentorProfile.specialty}</span></div>
            <p className="text-sm text-gray-600 mt-2">{mentorProfile.bio}</p>
          </div>
        )}

        {showFollowers && <UserListModal title="Followers" users={followers} onClose={() => setShowFollowers(false)} idKey="follower_id" userKey="users" />}
        {showFollowing && <UserListModal title="Following" users={following} onClose={() => setShowFollowing(false)} idKey="following_id" userKey="users" />}
      </main>
    </div>
  );
}

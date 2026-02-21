// ============================================
// FORESIGHT - ADMIN DASHBOARD
// ============================================

import React, { useState, useEffect } from 'react';
import { supabase } from './supabase-client';

// ============================================
// ADMIN SERVICE
// ============================================

export const adminService = {
  // ============ USERS ============
  async getUsers({ page = 1, limit = 20, search = '', tier = null, sortBy = 'created_at' }) {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (tier) {
      query = query.eq('tier', tier);
    }

    const { data, count, error } = await query;
    if (error) throw error;
    return { users: data, total: count };
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        documents(count),
        deadlines(count),
        ai_conversations(count)
      `)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  // ============ MENTORS ============
  async getMentors({ status = null }) {
    let query = supabase
      .from('mentors')
      .select(`
        *,
        user:users(id, full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async approveMentor(mentorId, adminId) {
    const { data, error } = await supabase
      .from('mentors')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId
      })
      .eq('id', mentorId)
      .select()
      .single();

    if (error) throw error;

    // Update user role
    await supabase
      .from('users')
      .update({ role: 'mentor' })
      .eq('id', data.user_id);

    return data;
  },

  async rejectMentor(mentorId, reason = '') {
    const { data, error } = await supabase
      .from('mentors')
      .update({
        status: 'rejected',
        rejection_reason: reason
      })
      .eq('id', mentorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async suspendMentor(mentorId) {
    const { data, error } = await supabase
      .from('mentors')
      .update({ status: 'suspended', is_available: false })
      .eq('id', mentorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ============ ANALYTICS ============
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

    // Total users by tier
    const { data: usersByTier } = await supabase
      .from('users')
      .select('tier')
      .then(res => {
        const counts = { bronze: 0, silver: 0, gold: 0 };
        res.data?.forEach(u => counts[u.tier]++);
        return { data: counts };
      });

    // New users this week
    const { count: newUsersWeek } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    // Total messages
    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // AI queries this month
    const { count: aiQueries } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', thirtyDaysAgo);

    // Documents analyzed
    const { count: docsAnalyzed } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'analyzed');

    // Active mentors
    const { count: activeMentors } = await supabase
      .from('mentors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('is_available', true);

    // Pending mentor applications
    const { count: pendingMentors } = await supabase
      .from('mentors')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      usersByTier,
      totalUsers: usersByTier.bronze + usersByTier.silver + usersByTier.gold,
      newUsersWeek,
      totalMessages,
      aiQueries,
      docsAnalyzed,
      activeMentors,
      pendingMentors
    };
  },

  async getUserGrowth(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at');

    if (error) throw error;

    // Group by day
    const grouped = {};
    data.forEach(user => {
      const day = user.created_at.split('T')[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  },

  // ============ CONTENT ============
  async getReportedMessages() {
    // Would need a reports table - simplified for now
    return [];
  },

  async getPinnedMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(full_name),
        channel:channels(name)
      `)
      .eq('is_pinned', true)
      .order('pinned_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // ============ AUDIT ============
  async getAuditLog({ page = 1, limit = 50 }) {
    const { data, error } = await supabase
      .from('audit_log')
      .select(`
        *,
        user:users(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return data;
  }
};

// ============================================
// ADMIN LAYOUT
// ============================================

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
    { id: 'users', label: 'Users', icon: '👥', href: '/admin/users' },
    { id: 'mentors', label: 'Mentors', icon: '🤝', href: '/admin/mentors' },
    { id: 'content', label: 'Content', icon: '📝', href: '/admin/content' },
    { id: 'analytics', label: 'Analytics', icon: '📈', href: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} border-r border-slate-800 flex flex-col transition-all`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            👁️
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-orange-400">Foresight</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mb-1"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-slate-800 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE
// ============================================

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="New This Week"
          value={stats?.newUsersWeek || 0}
          icon="📈"
          color="green"
          change="+12%"
        />
        <StatCard
          title="AI Queries (30d)"
          value={stats?.aiQueries || 0}
          icon="🤖"
          color="purple"
        />
        <StatCard
          title="Docs Analyzed"
          value={stats?.docsAnalyzed || 0}
          icon="📄"
          color="orange"
        />
      </div>

      {/* Users by Tier */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Users by Tier</h2>
          <div className="space-y-3">
            <TierBar label="Bronze" count={stats?.usersByTier?.bronze || 0} total={stats?.totalUsers || 1} color="#CD7F32" />
            <TierBar label="Silver" count={stats?.usersByTier?.silver || 0} total={stats?.totalUsers || 1} color="#C0C0C0" />
            <TierBar label="Gold" count={stats?.usersByTier?.gold || 0} total={stats?.totalUsers || 1} color="#FFD700" />
          </div>
        </div>

        {/* Mentors */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Mentors</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{stats?.activeMentors || 0}</div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">{stats?.pendingMentors || 0}</div>
              <div className="text-sm text-slate-400">Pending Review</div>
            </div>
          </div>
          {stats?.pendingMentors > 0 && (
            <a
              href="/admin/mentors?status=pending"
              className="mt-4 block text-center py-2 bg-orange-500 rounded-lg font-medium hover:bg-orange-600"
            >
              Review Applications
            </a>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <QuickAction
          title="Send Announcement"
          description="Post to all channels"
          icon="📢"
          href="/admin/content/announcement"
        />
        <QuickAction
          title="Export Users"
          description="Download CSV"
          icon="📥"
          onClick={() => {/* export logic */}}
        />
        <QuickAction
          title="View Audit Log"
          description="Recent activity"
          icon="📋"
          href="/admin/audit"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, change }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

function TierBar({ label, count, total, color }) {
  const percentage = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color }}>{label}</span>
        <span className="text-slate-400">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function QuickAction({ title, description, icon, href, onClick }) {
  const Component = href ? 'a' : 'button';
  return (
    <Component
      href={href}
      onClick={onClick}
      className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-colors"
    >
      <span className="text-2xl mb-2 block">{icon}</span>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-slate-400">{description}</div>
    </Component>
  );
}

// ============================================
// USERS MANAGEMENT PAGE
// ============================================

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page, search, tierFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { users, total } = await adminService.getUsers({
        page,
        search,
        tier: tierFilter
      });
      setUsers(users);
      setTotal(total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTier = async (userId, newTier) => {
    try {
      await adminService.updateUser(userId, { tier: newTier });
      loadUsers();
    } catch (error) {
      console.error('Failed to update tier:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-slate-400">{total} total users</span>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500"
        />
        <select
          value={tierFilter || ''}
          onChange={(e) => setTierFilter(e.target.value || null)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
        >
          <option value="">All Tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Jurisdiction</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Tier</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Joined</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm">
                      {user.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {user.jurisdiction || '-'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.tier}
                    onChange={(e) => handleUpdateTier(user.id, e.target.value)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-sm"
                  >
                    <option value="bronze">🥉 Bronze</option>
                    <option value="silver">🥈 Silver</option>
                    <option value="gold">🥇 Gold</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-orange-400 hover:text-orange-300 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={users.length < 20}
          className="px-4 py-2 bg-slate-800 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
}

function UserDetailModal({ user, onClose, onUpdate }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold">User Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-2xl font-bold">
              {user.full_name?.[0] || '?'}
            </div>
            <div>
              <div className="text-xl font-semibold">{user.full_name}</div>
              <div className="text-slate-400">{user.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-800">
              <div className="text-sm text-slate-400">Tier</div>
              <div className="font-medium capitalize">{user.tier}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800">
              <div className="text-sm text-slate-400">Jurisdiction</div>
              <div className="font-medium capitalize">{user.jurisdiction || 'Not set'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800">
              <div className="text-sm text-slate-400">Joined</div>
              <div className="font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800">
              <div className="text-sm text-slate-400">Last Active</div>
              <div className="font-medium">
                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800">
            <div className="text-sm text-slate-400 mb-2">Usage This Period</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>AI Queries: {user.daily_queries_used || 0}/day</div>
              <div>Docs: {user.monthly_docs_used || 0}/month</div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MENTORS MANAGEMENT PAGE
// ============================================

export function AdminMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    loadMentors();
  }, [statusFilter]);

  const loadMentors = async () => {
    setLoading(true);
    try {
      const data = await adminService.getMentors({ status: statusFilter });
      setMentors(data);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId) => {
    try {
      await adminService.approveMentor(mentorId, 'current-admin-id');
      loadMentors();
    } catch (error) {
      console.error('Failed to approve mentor:', error);
    }
  };

  const handleReject = async (mentorId) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await adminService.rejectMentor(mentorId, reason || '');
      loadMentors();
    } catch (error) {
      console.error('Failed to reject mentor:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mentor Management</h1>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'suspended'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              statusFilter === status
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Mentors List */}
      <div className="space-y-4">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                {mentor.user?.full_name?.[0] || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{mentor.user?.full_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    mentor.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    mentor.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    mentor.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {mentor.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{mentor.user?.email}</p>
                <p className="text-sm text-slate-300 mb-2">{mentor.specialty}</p>
                <p className="text-sm text-slate-400">{mentor.bio}</p>
              </div>

              {mentor.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(mentor.id)}
                    className="px-4 py-2 bg-green-500 rounded-lg text-white hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(mentor.id)}
                    className="px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}

              {mentor.status === 'approved' && (
                <div className="text-right">
                  <div className="text-sm text-slate-400">Rating</div>
                  <div className="font-semibold">⭐ {mentor.rating?.toFixed(1) || 'N/A'}</div>
                  <div className="text-xs text-slate-500">{mentor.review_count || 0} reviews</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {mentors.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-400">
            No {statusFilter} mentor applications
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  adminService,
  AdminLayout,
  AdminDashboard,
  AdminUsers,
  AdminMentors
};

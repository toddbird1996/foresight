// ============================================
// FORESIGHT - ANALYTICS DASHBOARD
// ============================================

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from "../../lib/supabaseClient";

// ============================================
// ANALYTICS SERVICE
// ============================================

export const analyticsService = {
  // ============ USER METRICS ============
  async getUserMetrics(dateRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    const startDateStr = startDate.toISOString();

    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // New users in period
    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    // Active users (logged in during period)
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', startDateStr);

    // Users by tier
    const { data: tierData } = await supabase
      .from('users')
      .select('tier');
    
    const usersByTier = tierData?.reduce((acc, user) => {
      acc[user.tier] = (acc[user.tier] || 0) + 1;
      return acc;
    }, {}) || {};

    // Users by jurisdiction
    const { data: jurisdictionData } = await supabase
      .from('users')
      .select('jurisdiction');
    
    const usersByJurisdiction = jurisdictionData?.reduce((acc, user) => {
      const jur = user.jurisdiction || 'Not Set';
      acc[jur] = (acc[jur] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      totalUsers,
      newUsers,
      activeUsers,
      usersByTier,
      usersByJurisdiction,
      growthRate: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(1) : 0
    };
  },

  // ============ ENGAGEMENT METRICS ============
  async getEngagementMetrics(dateRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    const startDateStr = startDate.toISOString();

    // AI queries
    const { count: aiQueries } = await supabase
      .from('ai_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', startDateStr);

    // Community messages
    const { count: communityMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    // Documents uploaded
    const { count: documentsUploaded } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    // Documents analyzed
    const { count: documentsAnalyzed } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'analyzed')
      .gte('created_at', startDateStr);

    // Steps completed
    const { count: stepsCompleted } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('completed', true)
      .gte('completed_at', startDateStr);

    // Deadlines created
    const { count: deadlinesCreated } = await supabase
      .from('deadlines')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    // Mentor conversations
    const { count: mentorConversations } = await supabase
      .from('mentor_conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDateStr);

    return {
      aiQueries,
      communityMessages,
      documentsUploaded,
      documentsAnalyzed,
      stepsCompleted,
      deadlinesCreated,
      mentorConversations
    };
  },

  // ============ REVENUE METRICS ============
  async getRevenueMetrics(dateRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Count paying users
    const { count: payingUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('tier', ['silver', 'gold'])
      .eq('subscription_status', 'active');

    // Count by tier
    const { data: tierData } = await supabase
      .from('users')
      .select('tier')
      .in('tier', ['silver', 'gold'])
      .eq('subscription_status', 'active');

    const silverUsers = tierData?.filter(u => u.tier === 'silver').length || 0;
    const goldUsers = tierData?.filter(u => u.tier === 'gold').length || 0;

    // Calculate MRR (Monthly Recurring Revenue)
    const silverMRR = silverUsers * 9.99;
    const goldMRR = goldUsers * 19.99;
    const totalMRR = silverMRR + goldMRR;

    // Calculate ARR (Annual Recurring Revenue)
    const totalARR = totalMRR * 12;

    return {
      payingUsers,
      silverUsers,
      goldUsers,
      silverMRR,
      goldMRR,
      totalMRR,
      totalARR,
      arpu: payingUsers > 0 ? (totalMRR / payingUsers).toFixed(2) : 0
    };
  },

  // ============ TIME SERIES DATA ============
  async getTimeSeriesData(metric, dateRange = 30, interval = 'day') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    const startDateStr = startDate.toISOString();

    let tableName, dateField;
    
    switch (metric) {
      case 'signups':
        tableName = 'users';
        dateField = 'created_at';
        break;
      case 'ai_queries':
        tableName = 'ai_messages';
        dateField = 'created_at';
        break;
      case 'messages':
        tableName = 'messages';
        dateField = 'created_at';
        break;
      case 'documents':
        tableName = 'documents';
        dateField = 'created_at';
        break;
      default:
        tableName = 'users';
        dateField = 'created_at';
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(dateField)
      .gte(dateField, startDateStr)
      .order(dateField);

    if (error) throw error;

    // Group by day
    const grouped = {};
    data?.forEach(item => {
      const date = item[dateField].split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });

    // Fill in missing days
    const result = [];
    const current = new Date(startDate);
    const end = new Date();
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        value: grouped[dateStr] || 0
      });
      current.setDate(current.getDate() + 1);
    }

    return result;
  },

  // ============ CONVERSION METRICS ============
  async getConversionMetrics() {
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: completedOnboarding } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('onboarding_completed', true);

    const { count: usedAI } = await supabase
      .from('ai_conversations')
      .select('user_id', { count: 'exact', head: true });

    const { count: joinedCommunity } = await supabase
      .from('channel_members')
      .select('user_id', { count: 'exact', head: true });

    const { count: uploadedDoc } = await supabase
      .from('documents')
      .select('user_id', { count: 'exact', head: true });

    const { count: paidUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('tier', ['silver', 'gold']);

    return {
      totalUsers,
      onboardingRate: totalUsers > 0 ? ((completedOnboarding / totalUsers) * 100).toFixed(1) : 0,
      aiAdoptionRate: totalUsers > 0 ? ((usedAI / totalUsers) * 100).toFixed(1) : 0,
      communityRate: totalUsers > 0 ? ((joinedCommunity / totalUsers) * 100).toFixed(1) : 0,
      documentRate: totalUsers > 0 ? ((uploadedDoc / totalUsers) * 100).toFixed(1) : 0,
      conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : 0
    };
  },

  // ============ TOP CONTENT ============
  async getTopContent() {
    // Most active channels
    const { data: channels } = await supabase
      .from('channels')
      .select('name, message_count')
      .order('message_count', { ascending: false })
      .limit(5);

    // Most common AI questions (would need to implement topic extraction)
    // For now, return most active AI users
    const { data: topAIUsers } = await supabase
      .from('users')
      .select('id, full_name, daily_queries_used')
      .order('daily_queries_used', { ascending: false })
      .limit(5);

    return {
      topChannels: channels || [],
      topAIUsers: topAIUsers || []
    };
  }
};

// ============================================
// ANALYTICS DASHBOARD COMPONENT
// ============================================

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    users: null,
    engagement: null,
    revenue: null,
    conversion: null,
    timeSeries: null
  });

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [users, engagement, revenue, conversion, signups] = await Promise.all([
        analyticsService.getUserMetrics(dateRange),
        analyticsService.getEngagementMetrics(dateRange),
        analyticsService.getRevenueMetrics(dateRange),
        analyticsService.getConversionMetrics(),
        analyticsService.getTimeSeriesData('signups', dateRange)
      ]);

      setMetrics({ users, engagement, revenue, conversion, timeSeries: signups });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-400">Track your platform's growth and engagement</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={metrics.users?.totalUsers?.toLocaleString() || 0}
            change={`+${metrics.users?.newUsers || 0} new`}
            icon="👥"
            color="blue"
          />
          <MetricCard
            title="Active Users"
            value={metrics.users?.activeUsers?.toLocaleString() || 0}
            subtitle={`${((metrics.users?.activeUsers / metrics.users?.totalUsers) * 100 || 0).toFixed(0)}% of total`}
            icon="📈"
            color="green"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics.revenue?.totalMRR?.toFixed(2) || '0.00'}`}
            subtitle={`${metrics.revenue?.payingUsers || 0} paying users`}
            icon="💰"
            color="yellow"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${metrics.conversion?.conversionRate || 0}%`}
            subtitle="Free to paid"
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Signups Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">User Signups</h3>
            <SimpleLineChart data={metrics.timeSeries || []} />
          </div>

          {/* Users by Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Users by Tier</h3>
            <div className="space-y-4">
              <TierBar 
                label="Bronze (Free)" 
                value={metrics.users?.usersByTier?.bronze || 0}
                total={metrics.users?.totalUsers || 1}
                color="#CD7F32"
              />
              <TierBar 
                label="Silver ($9.99)" 
                value={metrics.users?.usersByTier?.silver || 0}
                total={metrics.users?.totalUsers || 1}
                color="#C0C0C0"
              />
              <TierBar 
                label="Gold ($19.99)" 
                value={metrics.users?.usersByTier?.gold || 0}
                total={metrics.users?.totalUsers || 1}
                color="#FFD700"
              />
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Engagement (Last {dateRange} Days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <EngagementStat label="AI Queries" value={metrics.engagement?.aiQueries || 0} icon="🤖" />
            <EngagementStat label="Messages" value={metrics.engagement?.communityMessages || 0} icon="💬" />
            <EngagementStat label="Docs Uploaded" value={metrics.engagement?.documentsUploaded || 0} icon="📄" />
            <EngagementStat label="Docs Analyzed" value={metrics.engagement?.documentsAnalyzed || 0} icon="🔍" />
            <EngagementStat label="Steps Done" value={metrics.engagement?.stepsCompleted || 0} icon="✅" />
            <EngagementStat label="Deadlines" value={metrics.engagement?.deadlinesCreated || 0} icon="📅" />
            <EngagementStat label="Mentor Chats" value={metrics.engagement?.mentorConversations || 0} icon="🤝" />
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            <FunnelStep 
              label="Signed Up" 
              value={metrics.conversion?.totalUsers || 0}
              percent={100}
            />
            <FunnelStep 
              label="Completed Onboarding" 
              value={Math.round((metrics.conversion?.onboardingRate / 100) * metrics.conversion?.totalUsers) || 0}
              percent={parseFloat(metrics.conversion?.onboardingRate) || 0}
            />
            <FunnelStep 
              label="Used AI Assistant" 
              value={Math.round((metrics.conversion?.aiAdoptionRate / 100) * metrics.conversion?.totalUsers) || 0}
              percent={parseFloat(metrics.conversion?.aiAdoptionRate) || 0}
            />
            <FunnelStep 
              label="Joined Community" 
              value={Math.round((metrics.conversion?.communityRate / 100) * metrics.conversion?.totalUsers) || 0}
              percent={parseFloat(metrics.conversion?.communityRate) || 0}
            />
            <FunnelStep 
              label="Uploaded Document" 
              value={Math.round((metrics.conversion?.documentRate / 100) * metrics.conversion?.totalUsers) || 0}
              percent={parseFloat(metrics.conversion?.documentRate) || 0}
            />
            <FunnelStep 
              label="Became Paying User" 
              value={Math.round((metrics.conversion?.conversionRate / 100) * metrics.conversion?.totalUsers) || 0}
              percent={parseFloat(metrics.conversion?.conversionRate) || 0}
              highlight
            />
          </div>
        </div>

        {/* Revenue Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
                <div>
                  <div className="font-medium">Silver Tier MRR</div>
                  <div className="text-sm text-slate-400">{metrics.revenue?.silverUsers || 0} users × $9.99</div>
                </div>
                <div className="text-xl font-bold text-slate-300">
                  ${metrics.revenue?.silverMRR?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-slate-800/50">
                <div>
                  <div className="font-medium">Gold Tier MRR</div>
                  <div className="text-sm text-slate-400">{metrics.revenue?.goldUsers || 0} users × $19.99</div>
                </div>
                <div className="text-xl font-bold text-yellow-400">
                  ${metrics.revenue?.goldMRR?.toFixed(2) || '0.00'}
                </div>
              </div>
              <hr className="border-slate-700" />
              <div className="flex justify-between items-center p-4">
                <div className="font-semibold">Total MRR</div>
                <div className="text-2xl font-bold text-green-400">
                  ${metrics.revenue?.totalMRR?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="font-semibold text-green-400">Projected ARR</div>
                <div className="text-2xl font-bold text-green-400">
                  ${metrics.revenue?.totalARR?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Users by Jurisdiction</h3>
            <div className="space-y-2">
              {Object.entries(metrics.users?.usersByJurisdiction || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([jurisdiction, count]) => (
                  <div key={jurisdiction} className="flex items-center justify-between p-2">
                    <span className="capitalize">{jurisdiction.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500"
                          style={{ width: `${(count / metrics.users?.totalUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CHART COMPONENTS
// ============================================

function SimpleLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No data</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-48 relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.5" />
        ))}
        
        {/* Line */}
        <polyline
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Area fill */}
        <polygon
          fill="url(#gradient)"
          points={`0,100 ${points} 100,100`}
          opacity="0.3"
        />
        
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, subtitle, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {change && <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">{change}</span>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-400">{subtitle || title}</div>
    </div>
  );
}

function TierBar({ label, value, total, color }) {
  const percent = ((value / total) * 100).toFixed(1);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color }}>{label}</span>
        <span className="text-slate-400">{value} ({percent}%)</span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function EngagementStat({ label, value, icon }) {
  return (
    <div className="text-center p-3 rounded-lg bg-slate-800/50">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function FunnelStep({ label, value, percent, highlight }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${highlight ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-slate-800/30'}`}>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className={highlight ? 'font-semibold text-orange-400' : ''}>{label}</span>
          <span className="text-slate-400">{value.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${highlight ? 'bg-orange-500' : 'bg-blue-500'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className={`text-lg font-bold w-16 text-right ${highlight ? 'text-orange-400' : 'text-slate-400'}`}>
        {percent}%
      </div>
    </div>
  );
}

// ============================================
// EMBEDDABLE WIDGETS
// ============================================

export function QuickStatsWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const users = await analyticsService.getUserMetrics(7);
    const engagement = await analyticsService.getEngagementMetrics(7);
    setStats({ users, engagement });
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-400">{stats.users?.newUsers || 0}</div>
        <div className="text-xs text-slate-500">New Users (7d)</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">{stats.engagement?.aiQueries || 0}</div>
        <div className="text-xs text-slate-500">AI Queries</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-400">{stats.engagement?.communityMessages || 0}</div>
        <div className="text-xs text-slate-500">Messages</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-400">{stats.engagement?.stepsCompleted || 0}</div>
        <div className="text-xs text-slate-500">Steps Done</div>
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  analyticsService,
  AnalyticsDashboard,
  QuickStatsWidget
};

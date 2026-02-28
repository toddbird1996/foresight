// ============================================
// FORESIGHT - SUPABASE SERVICES
// ============================================

import { supabase } from '../../lib/supabaseClient'; // import the client

// ============================================
// TYPES & TIER LIMITS
// ============================================

/**
 * @typedef {'bronze' | 'silver' | 'gold'} MembershipTier
 * @typedef {'user' | 'mentor' | 'admin'} UserRole
 * @typedef {'uploaded' | 'processing' | 'analyzed' | 'failed'} DocumentStatus
 * @typedef {'filing' | 'hearing' | 'meeting' | 'deadline' | 'other'} DeadlineType
 * @typedef {'low' | 'medium' | 'high'} DeadlinePriority
 */

export const TIER_LIMITS = {
  bronze: { dailyQueries: 10, monthlyDocs: 1, jurisdictions: 1, mentorAccess: false },
  silver: { dailyQueries: 25, monthlyDocs: 5, jurisdictions: 3, mentorAccess: 'limited' },
  gold: { dailyQueries: 50, monthlyDocs: 10, jurisdictions: 'all', mentorAccess: 'unlimited' }
};

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  async signUp({ email, password, fullName, jurisdiction = 'saskatchewan' }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, jurisdiction } }
    });
    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({ id: authData.user.id, email, full_name: fullName, jurisdiction, tier: 'bronze' });
      if (profileError) throw profileError;
    }

    return authData;
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    return { ...user, profile };
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// USER SERVICE
// ============================================

export const userService = {
  async getProfile(userId) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async getDashboardStats(userId) {
    const { data, error } = await supabase.from('user_dashboard_stats').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data;
  },

  async incrementQueryCount(userId) {
    const { data: user, error: fetchError } = await supabase.from('users').select('daily_queries_used, tier').eq('id', userId).single();
    if (fetchError) throw fetchError;

    const limit = TIER_LIMITS[user.tier].dailyQueries;
    if (user.daily_queries_used >= limit) throw new Error('Daily query limit reached');

    const { error } = await supabase.from('users').update({ daily_queries_used: user.daily_queries_used + 1 }).eq('id', userId);
    if (error) throw error;

    return { queriesUsed: user.daily_queries_used + 1, limit };
  },

  async incrementDocCount(userId) {
    const { data: user, error: fetchError } = await supabase.from('users').select('monthly_docs_used, tier').eq('id', userId).single();
    if (fetchError) throw fetchError;

    const limit = TIER_LIMITS[user.tier].monthlyDocs;
    if (user.monthly_docs_used >= limit) throw new Error('Monthly document limit reached');

    const { error } = await supabase.from('users').update({ monthly_docs_used: user.monthly_docs_used + 1 }).eq('id', userId);
    if (error) throw error;

    return { docsUsed: user.monthly_docs_used + 1, limit };
  }
};

// ============================================
// JURISDICTION SERVICE
// ============================================

export const jurisdictionService = {
  async getAll() {
    const { data, error } = await supabase.from('jurisdictions').select('*').order('display_order');
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase.from('jurisdictions').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async getFilingGuide(jurisdictionId) {
    const { data: phases, error } = await supabase
      .from('filing_phases')
      .select(`*, steps:filing_steps(*)`)
      .eq('jurisdiction_id', jurisdictionId)
      .order('display_order')
      .order('display_order', { foreignTable: 'filing_steps' });
    if (error) throw error;
    return phases;
  }
};

// ============================================
// PROGRESS SERVICE
// ============================================

export const progressService = {
  async getUserProgress(userId, jurisdictionId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`*, step:filing_steps(*, phase:filing_phases(*))`)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async toggleStep(userId, stepId, completed) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, step_id: stepId, completed, completed_at: completed ? new Date().toISOString() : null }, { onConflict: 'user_id,step_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStepNotes(userId, stepId, notes) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, step_id: stepId, notes }, { onConflict: 'user_id,step_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ============================================
// DOCUMENT SERVICE
// ============================================

export const documentService = {
  async getUserDocuments(userId) {
    const { data, error } = await supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async upload(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from('documents').insert({
      user_id: userId,
      name: file.name,
      original_name: file.name,
      file_type: fileExt,
      file_size: file.size,
      storage_path: fileName,
      status: 'uploaded'
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateWithAnalysis(documentId, insights) {
    const { data, error } = await supabase.from('documents').update({
      status: 'analyzed',
      ai_insights: insights,
      analyzed_at: new Date().toISOString()
    }).eq('id', documentId).select().single();
    if (error) throw error;
    return data;
  },

  async delete(documentId, storagePath) {
    const { error: storageError } = await supabase.storage.from('documents').remove([storagePath]);
    if (storageError) throw storageError;

    const { error } = await supabase.from('documents').delete().eq('id', documentId);
    if (error) throw error;
  },

  async getDownloadUrl(storagePath) {
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(storagePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
};

// ============================================
// DEADLINE SERVICE
// ============================================

export const deadlineService = {
  async getUserDeadlines(userId, includeCompleted = true) {
    let query = supabase.from('deadlines').select('*').eq('user_id', userId).order('due_date');
    if (!includeCompleted) query = query.eq('completed', false);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getUpcoming(userId, days = 7) {
    const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + days);
    const { data, error } = await supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date');
    if (error) throw error;
    return data;
  },

  async create(userId, deadline) {
    const { data, error } = await supabase.from('deadlines').insert({ user_id: userId, ...deadline }).select().single();
    if (error) throw error;
    return data;
  },

  async update(deadlineId, updates) {
    const { data, error } = await supabase.from('deadlines').update(updates).eq('id', deadlineId).select().single();
    if (error) throw error;
    return data;
  },

  async toggleComplete(deadlineId, completed) {
    const { data, error } = await supabase.from('deadlines').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', deadlineId).select().single();
    if (error) throw error;
    return data;
  },

  async delete(deadlineId) {
    const { error } = await supabase.from('deadlines').delete().eq('id', deadlineId);
    if (error) throw error;
  }
};

// ============================================
// CHANNEL SERVICE
// ============================================

export const channelService = {
  async getChannelsForUser(userId) {
    const { data, error } = await supabase.rpc('get_channels_for_user', { p_user_id: userId });
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase.from('channels').select('*').order('display_order');
    if (error) throw error;
    return data;
  },

  async join(userId, channelId) {
    const { data, error } = await supabase.from('channel_members').insert({ user_id: userId, channel_id: channelId }).select().single();
    if (error && error.code !== '23505') throw error; // ignore duplicate
    return data;
  },

  async leave(userId, channelId) {
    const { error } = await supabase.from('channel_members').delete().eq('user_id', userId).eq('channel_id', channelId);
    if (error) throw error;
  },

  async markAsRead(userId, channelId) {
    const { error } = await supabase.from('channel_members').update({ last_read_at: new Date().toISOString() }).eq('user_id', userId).eq('channel_id', channelId);
    if (error) throw error;
  }
};

// ============================================
// MESSAGE SERVICE
// ============================================

export const messageService = {
  async getChannelMessages(channelId, limit = 50, before = null) {
    let query = supabase.from('messages')
      .select(`*, user:users(id, full_name, avatar_url, role), reactions:message_reactions(emoji, user_id)`)
      .eq('channel_id', channelId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) query = query.lt('created_at', before);
    const { data, error } = await query;
    if (error) throw error;
    return data?.reverse() || [];
  },

  async send(channelId, userId, content) {
    const { data, error } = await supabase.from('messages').insert({ channel_id: channelId, user_id: userId, content }).select(`*, user:users(id, full_name, avatar_url, role)`).single();
    if (error) throw error;
    return data;
  },

  async edit(messageId, userId, content) {
    const { data, error } = await supabase.from('messages').update({ content, is_edited: true, edited_at: new Date().toISOString() }).eq('id', messageId).eq('user_id', userId).select().single();
    if (error) throw error;
    return data;
  },

  async delete(messageId, userId) {
    const { error } = await supabase.from('messages').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', messageId).eq('user_id', userId);
    if (error) throw error;
  },

  async togglePin(messageId, userId, pinned) {
    const { data, error } = await supabase.from('messages').update({ is_pinned: pinned, pinned_by: pinned ? userId : null, pinned_at: pinned ? new Date().toISOString() : null }).eq('id', messageId).select().single();
    if (error) throw error;
    return data;
  },

  async addReaction(messageId, userId, emoji) {
    const { data, error } = await supabase.from('message_reactions').insert({ message_id: messageId, user_id, emoji }).select().single();
    if (error && error.code !== '23505') throw error;
    return data;
  },

  async removeReaction(messageId, userId, emoji) {
    const { error } = await supabase.from('message_reactions').delete().eq('message_id', messageId).eq('user_id', userId).eq('emoji', emoji);
    if (error) throw error;
  },

  subscribeToChannel(channelId, callback) {
    return supabase.channel(`messages:${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, (payload) => { callback(payload.new); })
      .subscribe();
  }
};

// ============================================
// MENTOR SERVICE
// ============================================

export const mentorService = {
  async getApproved(filters = {}) {
    let query = supabase.from('mentors')
      .select(`*, user:users(id, full_name, avatar_url), jurisdiction:jurisdictions(id, name)`)
      .eq('status', 'approved');

    if (filters.jurisdiction) query = query.eq('jurisdiction_id', filters.jurisdiction);
    if (filters.available) query = query.eq('is_available', true);

    const { data, error } = await query.order('rating', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(mentorId) {
    const { data, error } = await supabase.from('mentors')
      .select(`*, user:users(id, full_name, avatar_url, email), jurisdiction:jurisdictions(id, name), reviews:mentor_reviews(id, rating, review, created_at, user:users(full_name))`)
      .eq('id', mentorId)
      .single();
    if (error) throw error;
    return data;
  },

  async apply(userId, application) {
    const { data, error } = await supabase.from('mentors').insert({ user_id: userId, ...application, status: 'pending' }).select().single();
    if (error) throw error;
    return data;
  },

  async setAvailability(mentorId, isAvailable) {
    const { data, error } = await supabase.from('mentors').update({ is_available: isAvailable }).eq('id', mentorId).select().single();
    if (error) throw error;
    return data;
  },

  async startConversation(mentorId, userId) {
    const { data: existing } = await supabase.from('mentor_conversations').select('*').eq('mentor_id', mentorId).eq('user_id', userId).single();
    if (existing) return existing;

    const { data, error } = await supabase.from('mentor_conversations').insert({ mentor_id: mentorId, user_id: userId }).select().single();
    if (error) throw error;
    return data;
  },

  async getConversationMessages

  async getConversationMessages(conversationId, limit = 50, before = null) {
    let query = supabase.from('mentor_messages')
      .select(`*, user:users(id, full_name, avatar_url)`)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (before) query = query.lt('created_at', before);
    const { data, error } = await query;
    if (error) throw error;
    return data?.reverse() || [];
  },

  async sendMessage(conversationId, userId, content) {
    const { data, error } = await supabase.from('mentor_messages')
      .insert({ conversation_id: conversationId, user_id: userId, content })
      .select(`*, user:users(id, full_name, avatar_url)`)
      .single();
    if (error) throw error;
    return data;
  }
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  async getUserNotifications(userId, limit = 50) {
    const { data, error } = await supabase.from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId) {
    const { data, error } = await supabase.from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAllAsRead(userId) {
    const { error } = await supabase.from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (error) throw error;
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  authService,
  userService,
  jurisdictionService,
  progressService,
  documentService,
  deadlineService,
  channelService,
  messageService,
  mentorService,
  notificationService
};

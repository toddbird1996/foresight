// ============================================
// FORESIGHT - SUPABASE CLIENT & API SERVICES
// ============================================

import { createClient } from '@supabase/supabase-js';

// ============================================
// CLIENT SETUP
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ============================================
// TYPES
// ============================================

/**
 * @typedef {'bronze' | 'silver' | 'gold'} MembershipTier
 * @typedef {'user' | 'mentor' | 'admin'} UserRole
 * @typedef {'uploaded' | 'processing' | 'analyzed' | 'failed'} DocumentStatus
 * @typedef {'filing' | 'hearing' | 'meeting' | 'deadline' | 'other'} DeadlineType
 * @typedef {'low' | 'medium' | 'high'} DeadlinePriority
 */

// Tier limits configuration
export const TIER_LIMITS = {
  bronze: { dailyQueries: 10, monthlyDocs: 1, jurisdictions: 1, mentorAccess: false },
  silver: { dailyQueries: 25, monthlyDocs: 5, jurisdictions: 3, mentorAccess: 'limited' },
  gold: { dailyQueries: 50, monthlyDocs: 10, jurisdictions: 'all', mentorAccess: 'unlimited' }
};

// ============================================
// AUTH SERVICE
// ============================================

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, fullName, jurisdiction = 'saskatchewan' }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          jurisdiction
        }
      }
    });

    if (authError) throw authError;

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          jurisdiction,
          tier: 'bronze'
        });

      if (profileError) throw profileError;
    }

    return authData;
  },

  /**
   * Sign in existing user
   */
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user with profile
   */
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

  /**
   * Reset password
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// ============================================
// USER SERVICE
// ============================================

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get dashboard stats
   */
  async getDashboardStats(userId) {
    const { data, error } = await supabase
      .from('user_dashboard_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Increment daily query count
   */
  async incrementQueryCount(userId) {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('daily_queries_used, tier')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const limit = TIER_LIMITS[user.tier].dailyQueries;
    if (user.daily_queries_used >= limit) {
      throw new Error('Daily query limit reached');
    }

    const { error } = await supabase
      .from('users')
      .update({ daily_queries_used: user.daily_queries_used + 1 })
      .eq('id', userId);

    if (error) throw error;
    return { queriesUsed: user.daily_queries_used + 1, limit };
  },

  /**
   * Increment monthly document count
   */
  async incrementDocCount(userId) {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('monthly_docs_used, tier')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const limit = TIER_LIMITS[user.tier].monthlyDocs;
    if (user.monthly_docs_used >= limit) {
      throw new Error('Monthly document limit reached');
    }

    const { error } = await supabase
      .from('users')
      .update({ monthly_docs_used: user.monthly_docs_used + 1 })
      .eq('id', userId);

    if (error) throw error;
    return { docsUsed: user.monthly_docs_used + 1, limit };
  }
};

// ============================================
// JURISDICTION SERVICE
// ============================================

export const jurisdictionService = {
  /**
   * Get all jurisdictions
   */
  async getAll() {
    const { data, error } = await supabase
      .from('jurisdictions')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data;
  },

  /**
   * Get jurisdiction by ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get filing phases and steps for jurisdiction
   */
  async getFilingGuide(jurisdictionId) {
    const { data: phases, error } = await supabase
      .from('filing_phases')
      .select(`
        *,
        steps:filing_steps(*)
      `)
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
  /**
   * Get user's progress on all steps
   */
  async getUserProgress(userId, jurisdictionId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        step:filing_steps(
          *,
          phase:filing_phases(*)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  /**
   * Mark step as complete/incomplete
   */
  async toggleStep(userId, stepId, completed) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        step_id: stepId,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,step_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add notes to a step
   */
  async updateStepNotes(userId, stepId, notes) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        step_id: stepId,
        notes
      }, {
        onConflict: 'user_id,step_id'
      })
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
  /**
   * Get user's documents
   */
  async getUserDocuments(userId) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Upload document
   */
  async upload(userId, file) {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create database record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        name: file.name,
        original_name: file.name,
        file_type: fileExt,
        file_size: file.size,
        storage_path: fileName,
        status: 'uploaded'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update document with AI analysis
   */
  async updateWithAnalysis(documentId, insights) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'analyzed',
        ai_insights: insights,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete document
   */
  async delete(documentId, storagePath) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  },

  /**
   * Get download URL
   */
  async getDownloadUrl(storagePath) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }
};

// ============================================
// DEADLINE SERVICE
// ============================================

export const deadlineService = {
  /**
   * Get user's deadlines
   */
  async getUserDeadlines(userId, includeCompleted = true) {
    let query = supabase
      .from('deadlines')
      .select('*')
      .eq('user_id', userId)
      .order('due_date');

    if (!includeCompleted) {
      query = query.eq('completed', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get upcoming deadlines (next 7 days)
   */
  async getUpcoming(userId, days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

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

  /**
   * Create deadline
   */
  async create(userId, deadline) {
    const { data, error } = await supabase
      .from('deadlines')
      .insert({
        user_id: userId,
        ...deadline
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update deadline
   */
  async update(deadlineId, updates) {
    const { data, error } = await supabase
      .from('deadlines')
      .update(updates)
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Toggle deadline completion
   */
  async toggleComplete(deadlineId, completed) {
    const { data, error } = await supabase
      .from('deadlines')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('id', deadlineId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete deadline
   */
  async delete(deadlineId) {
    const { error } = await supabase
      .from('deadlines')
      .delete()
      .eq('id', deadlineId);

    if (error) throw error;
  }
};

// ============================================
// CHANNEL SERVICE
// ============================================

export const channelService = {
  /**
   * Get all channels with unread counts for user
   */
  async getChannelsForUser(userId) {
    const { data, error } = await supabase
      .rpc('get_channels_for_user', { p_user_id: userId });

    if (error) throw error;
    return data;
  },

  /**
   * Get all channels (simple)
   */
  async getAll() {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data;
  },

  /**
   * Join channel
   */
  async join(userId, channelId) {
    const { data, error } = await supabase
      .from('channel_members')
      .insert({
        user_id: userId,
        channel_id: channelId
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // Ignore duplicate
    return data;
  },

  /**
   * Leave channel
   */
  async leave(userId, channelId) {
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('user_id', userId)
      .eq('channel_id', channelId);

    if (error) throw error;
  },

  /**
   * Mark channel as read
   */
  async markAsRead(userId, channelId) {
    const { error } = await supabase
      .from('channel_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('channel_id', channelId);

    if (error) throw error;
  }
};

// ============================================
// MESSAGE SERVICE
// ============================================

export const messageService = {
  /**
   * Get messages for channel
   */
  async getChannelMessages(channelId, limit = 50, before = null) {
    let query = supabase
      .from('messages')
      .select(`
        *,
        user:users(id, full_name, avatar_url, role),
        reactions:message_reactions(emoji, user_id)
      `)
      .eq('channel_id', channelId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.reverse() || [];
  },

  /**
   * Send message
   */
  async send(channelId, userId, content) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content
      })
      .select(`
        *,
        user:users(id, full_name, avatar_url, role)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Edit message
   */
  async edit(messageId, userId, content) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete message (soft delete)
   */
  async delete(messageId, userId) {
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Pin/unpin message
   */
  async togglePin(messageId, userId, pinned) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_pinned: pinned,
        pinned_by: pinned ? userId : null,
        pinned_at: pinned ? new Date().toISOString() : null
      })
      .eq('id', messageId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add reaction
   */
  async addReaction(messageId, userId, emoji) {
    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      })
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return data;
  },

  /**
   * Remove reaction
   */
  async removeReaction(messageId, userId, emoji) {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji);

    if (error) throw error;
  },

  /**
   * Subscribe to new messages in channel
   */
  subscribeToChannel(channelId, callback) {
    return supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  }
};

// ============================================
// MENTOR SERVICE
// ============================================

export const mentorService = {
  /**
   * Get approved mentors
   */
  async getApproved(filters = {}) {
    let query = supabase
      .from('mentors')
      .select(`
        *,
        user:users(id, full_name, avatar_url),
        jurisdiction:jurisdictions(id, name)
      `)
      .eq('status', 'approved');

    if (filters.jurisdiction) {
      query = query.eq('jurisdiction_id', filters.jurisdiction);
    }

    if (filters.available) {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query.order('rating', { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Get mentor by ID
   */
  async getById(mentorId) {
    const { data, error } = await supabase
      .from('mentors')
      .select(`
        *,
        user:users(id, full_name, avatar_url, email),
        jurisdiction:jurisdictions(id, name),
        reviews:mentor_reviews(
          id, rating, review, created_at,
          user:users(full_name)
        )
      `)
      .eq('id', mentorId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Apply to become mentor
   */
  async apply(userId, application) {
    const { data, error } = await supabase
      .from('mentors')
      .insert({
        user_id: userId,
        ...application,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update mentor availability
   */
  async setAvailability(mentorId, isAvailable) {
    const { data, error } = await supabase
      .from('mentors')
      .update({ is_available: isAvailable })
      .eq('id', mentorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Start conversation with mentor
   */
  async startConversation(mentorId, userId) {
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('mentor_conversations')
      .select('*')
      .eq('mentor_id', mentorId)
      .eq('user_id', userId)
      .single();

    if (existing) return existing;

    // Create new conversation
    const { data, error } = await supabase
      .from('mentor_conversations')
      .insert({
        mentor_id: mentorId,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId, limit = 50) {
    const { data, error } = await supabase
      .from('mentor_messages')
      .select(`
        *,
        sender:users(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.reverse() || [];
  },

  /**
   * Send message in mentor conversation
   */
  async sendMessage(conversationId, senderId, content) {
    const { data, error } = await supabase
      .from('mentor_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select(`
        *,
        sender:users(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from('mentor_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: supabase.rpc('increment', { row_id: conversationId })
      })
      .eq('id', conversationId);

    return data;
  },

  /**
   * Leave review for mentor
   */
  async leaveReview(mentorId, userId, rating, review) {
    const { data, error } = await supabase
      .from('mentor_reviews')
      .insert({
        mentor_id: mentorId,
        user_id: userId,
        rating,
        review
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============================================
// AI SERVICE
// ============================================

export const aiService = {
  /**
   * Get user's AI conversations
   */
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get conversation with messages
   */
  async getConversation(conversationId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        messages:ai_messages(*)
      `)
      .eq('id', conversationId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create new conversation
   */
  async createConversation(userId, jurisdictionId, title = null) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: userId,
        jurisdiction_id: jurisdictionId,
        title
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add message to conversation
   */
  async addMessage(conversationId, role, content, tokensUsed = null) {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  }
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export const notificationService = {
  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  /**
   * Create notification
   */
  async create(userId, notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Subscribe to new notifications
   */
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new);
      })
      .subscribe();
  }
};

// ============================================
// FORMS SERVICE
// ============================================

export const formsService = {
  /**
   * Get forms for jurisdiction
   */
  async getForJurisdiction(jurisdictionId) {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('jurisdiction_id', jurisdictionId)
      .order('display_order');

    if (error) throw error;
    return data;
  },

  /**
   * Search forms
   */
  async search(query, jurisdictionId = null) {
    let dbQuery = supabase
      .from('forms')
      .select('*')
      .or(`name.ilike.%${query}%,form_number.ilike.%${query}%,description.ilike.%${query}%`);

    if (jurisdictionId) {
      dbQuery = dbQuery.eq('jurisdiction_id', jurisdictionId);
    }

    const { data, error } = await dbQuery.limit(20);
    if (error) throw error;
    return data;
  }
};

// ============================================
// EXPORT ALL SERVICES
// ============================================

export default {
  supabase,
  auth: authService,
  user: userService,
  jurisdiction: jurisdictionService,
  progress: progressService,
  document: documentService,
  deadline: deadlineService,
  channel: channelService,
  message: messageService,
  mentor: mentorService,
  ai: aiService,
  notification: notificationService,
  forms: formsService
};

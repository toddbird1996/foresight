// ============================================
// FORESIGHT - REACT HOOKS
// ============================================

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import {
  supabase,
  authService,
  userService,
  jurisdictionService,
  progressService,
  documentService,
  deadlineService,
  channelService,
  messageService,
  mentorService,
  aiService,
  notificationService,
  formsService,
  TIER_LIMITS
} from './supabase-client';

// ============================================
// AUTH CONTEXT & PROVIDER
// ============================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
          const userProfile = await userService.getProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const userProfile = await userService.getProfile(session.user.id);
        setProfile(userProfile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await userService.getProfile(user.id);
      setProfile(userProfile);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    isAuthenticated: !!user,
    tier: profile?.tier || 'bronze',
    tierLimits: TIER_LIMITS[profile?.tier || 'bronze']
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// GENERIC DATA FETCHING HOOK
// ============================================

function useAsyncData(fetchFn, deps = [], options = {}) {
  const [data, setData] = useState(options.initialData || null);
  const [loading, setLoading] = useState(!options.initialData);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (!options.skip) {
      fetch();
    }
  }, [fetch, options.skip]);

  return { data, loading, error, refetch: fetch, setData };
}

// ============================================
// USER HOOKS
// ============================================

export function useProfile() {
  const { user } = useAuth();
  return useAsyncData(
    () => userService.getProfile(user.id),
    [user?.id],
    { skip: !user }
  );
}

export function useDashboardStats() {
  const { user } = useAuth();
  return useAsyncData(
    () => userService.getDashboardStats(user.id),
    [user?.id],
    { skip: !user }
  );
}

export function useUpdateProfile() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);
    try {
      await userService.updateProfile(user.id, updates);
      await refreshProfile();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
}

// ============================================
// JURISDICTION HOOKS
// ============================================

export function useJurisdictions() {
  return useAsyncData(() => jurisdictionService.getAll(), []);
}

export function useJurisdiction(id) {
  return useAsyncData(
    () => jurisdictionService.getById(id),
    [id],
    { skip: !id }
  );
}

export function useFilingGuide(jurisdictionId) {
  return useAsyncData(
    () => jurisdictionService.getFilingGuide(jurisdictionId),
    [jurisdictionId],
    { skip: !jurisdictionId }
  );
}

// ============================================
// PROGRESS HOOKS
// ============================================

export function useUserProgress(jurisdictionId) {
  const { user } = useAuth();
  return useAsyncData(
    () => progressService.getUserProgress(user.id, jurisdictionId),
    [user?.id, jurisdictionId],
    { skip: !user }
  );
}

export function useToggleStep() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleStep = async (stepId, completed) => {
    setLoading(true);
    try {
      await progressService.toggleStep(user.id, stepId, completed);
    } finally {
      setLoading(false);
    }
  };

  return { toggleStep, loading };
}

// ============================================
// DOCUMENT HOOKS
// ============================================

export function useDocuments() {
  const { user } = useAuth();
  return useAsyncData(
    () => documentService.getUserDocuments(user.id),
    [user?.id],
    { skip: !user }
  );
}

export function useUploadDocument() {
  const { user, refreshProfile, tierLimits, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const upload = async (file) => {
    // Check limit
    if (profile.monthly_docs_used >= tierLimits.monthlyDocs) {
      throw new Error('Monthly document limit reached. Please upgrade your plan.');
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Upload file
      setProgress(30);
      const doc = await documentService.upload(user.id, file);
      
      // Increment count
      setProgress(60);
      await userService.incrementDocCount(user.id);
      
      // Refresh profile to get updated count
      await refreshProfile();
      setProgress(100);
      
      return doc;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, error, progress };
}

export function useDeleteDocument() {
  const [loading, setLoading] = useState(false);

  const deleteDoc = async (documentId, storagePath) => {
    setLoading(true);
    try {
      await documentService.delete(documentId, storagePath);
    } finally {
      setLoading(false);
    }
  };

  return { deleteDoc, loading };
}

// ============================================
// DEADLINE HOOKS
// ============================================

export function useDeadlines(includeCompleted = true) {
  const { user } = useAuth();
  return useAsyncData(
    () => deadlineService.getUserDeadlines(user.id, includeCompleted),
    [user?.id, includeCompleted],
    { skip: !user }
  );
}

export function useUpcomingDeadlines(days = 7) {
  const { user } = useAuth();
  return useAsyncData(
    () => deadlineService.getUpcoming(user.id, days),
    [user?.id, days],
    { skip: !user }
  );
}

export function useDeadlineMutations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createDeadline = async (deadline) => {
    setLoading(true);
    try {
      return await deadlineService.create(user.id, deadline);
    } finally {
      setLoading(false);
    }
  };

  const updateDeadline = async (deadlineId, updates) => {
    setLoading(true);
    try {
      return await deadlineService.update(deadlineId, updates);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (deadlineId, completed) => {
    setLoading(true);
    try {
      return await deadlineService.toggleComplete(deadlineId, completed);
    } finally {
      setLoading(false);
    }
  };

  const deleteDeadline = async (deadlineId) => {
    setLoading(true);
    try {
      await deadlineService.delete(deadlineId);
    } finally {
      setLoading(false);
    }
  };

  return { createDeadline, updateDeadline, toggleComplete, deleteDeadline, loading };
}

// ============================================
// CHANNEL & MESSAGE HOOKS
// ============================================

export function useChannels() {
  const { user } = useAuth();
  return useAsyncData(
    () => user ? channelService.getChannelsForUser(user.id) : channelService.getAll(),
    [user?.id]
  );
}

export function useMessages(channelId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial messages
  useEffect(() => {
    if (!channelId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await messageService.getChannelMessages(channelId);
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!channelId) return;

    const subscription = messageService.subscribeToChannel(channelId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [channelId]);

  return { messages, loading, error, setMessages };
}

export function useSendMessage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (channelId, content) => {
    setLoading(true);
    try {
      return await messageService.send(channelId, user.id, content);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
}

export function useMessageReactions() {
  const { user } = useAuth();

  const addReaction = async (messageId, emoji) => {
    await messageService.addReaction(messageId, user.id, emoji);
  };

  const removeReaction = async (messageId, emoji) => {
    await messageService.removeReaction(messageId, user.id, emoji);
  };

  return { addReaction, removeReaction };
}

// ============================================
// MENTOR HOOKS
// ============================================

export function useMentors(filters = {}) {
  return useAsyncData(
    () => mentorService.getApproved(filters),
    [JSON.stringify(filters)]
  );
}

export function useMentor(mentorId) {
  return useAsyncData(
    () => mentorService.getById(mentorId),
    [mentorId],
    { skip: !mentorId }
  );
}

export function useMentorConversation(mentorId) {
  const { user, tierLimits } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check access
  const hasAccess = tierLimits.mentorAccess !== false;

  const startConversation = async () => {
    if (!hasAccess) {
      throw new Error('Upgrade to access mentor chat');
    }

    setLoading(true);
    try {
      const convo = await mentorService.startConversation(mentorId, user.id);
      setConversation(convo);
      const msgs = await mentorService.getConversationMessages(convo.id);
      setMessages(msgs);
      return convo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content) => {
    if (!conversation) {
      await startConversation();
    }

    setLoading(true);
    try {
      const msg = await mentorService.sendMessage(conversation.id, user.id, content);
      setMessages((prev) => [...prev, msg]);
      return msg;
    } finally {
      setLoading(false);
    }
  };

  return {
    conversation,
    messages,
    loading,
    error,
    hasAccess,
    startConversation,
    sendMessage
  };
}

export function useApplyAsMentor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apply = async (application) => {
    setLoading(true);
    setError(null);
    try {
      return await mentorService.apply(user.id, application);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apply, loading, error };
}

// ============================================
// AI CHAT HOOKS
// ============================================

export function useAIConversations() {
  const { user } = useAuth();
  return useAsyncData(
    () => aiService.getConversations(user.id),
    [user?.id],
    { skip: !user }
  );
}

export function useAIChat(conversationId = null) {
  const { user, profile, refreshProfile, tierLimits } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing conversation
  useEffect(() => {
    if (conversationId) {
      const loadConversation = async () => {
        setLoading(true);
        try {
          const data = await aiService.getConversation(conversationId);
          setConversation(data);
          setMessages(data.messages || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      loadConversation();
    }
  }, [conversationId]);

  const startNewConversation = async (title = null) => {
    setLoading(true);
    try {
      const convo = await aiService.createConversation(user.id, profile.jurisdiction, title);
      setConversation(convo);
      setMessages([]);
      return convo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content, getAIResponse) => {
    // Check limit
    if (profile.daily_queries_used >= tierLimits.dailyQueries) {
      throw new Error('Daily query limit reached. Please upgrade your plan.');
    }

    // Create conversation if needed
    let convo = conversation;
    if (!convo) {
      convo = await startNewConversation();
    }

    setLoading(true);
    try {
      // Add user message
      const userMsg = await aiService.addMessage(convo.id, 'user', content);
      setMessages((prev) => [...prev, userMsg]);

      // Increment query count
      await userService.incrementQueryCount(user.id);
      await refreshProfile();

      // Get AI response (this would call your AI endpoint)
      const aiResponse = await getAIResponse(content, messages);
      
      // Add AI message
      const aiMsg = await aiService.addMessage(convo.id, 'assistant', aiResponse.content, aiResponse.tokensUsed);
      setMessages((prev) => [...prev, aiMsg]);

      return aiMsg;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const queriesRemaining = tierLimits.dailyQueries - (profile?.daily_queries_used || 0);

  return {
    conversation,
    messages,
    loading,
    error,
    queriesRemaining,
    startNewConversation,
    sendMessage
  };
}

// ============================================
// NOTIFICATION HOOKS
// ============================================

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getUserNotifications(user.id),
          notificationService.getUnreadCount(user.id)
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return;

    const subscription = notificationService.subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const markAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}

// ============================================
// FORMS HOOKS
// ============================================

export function useForms(jurisdictionId) {
  return useAsyncData(
    () => formsService.getForJurisdiction(jurisdictionId),
    [jurisdictionId],
    { skip: !jurisdictionId }
  );
}

export function useSearchForms() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (query, jurisdictionId = null) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await formsService.search(query, jurisdictionId);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, search };
}

// ============================================
// UTILITY HOOKS
// ============================================

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// ============================================
// EXPORT ALL HOOKS
// ============================================

export default {
  // Auth
  AuthProvider,
  useAuth,
  
  // User
  useProfile,
  useDashboardStats,
  useUpdateProfile,
  
  // Jurisdiction
  useJurisdictions,
  useJurisdiction,
  useFilingGuide,
  
  // Progress
  useUserProgress,
  useToggleStep,
  
  // Documents
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
  
  // Deadlines
  useDeadlines,
  useUpcomingDeadlines,
  useDeadlineMutations,
  
  // Community
  useChannels,
  useMessages,
  useSendMessage,
  useMessageReactions,
  
  // Mentors
  useMentors,
  useMentor,
  useMentorConversation,
  useApplyAsMentor,
  
  // AI
  useAIConversations,
  useAIChat,
  
  // Notifications
  useNotifications,
  
  // Forms
  useForms,
  useSearchForms,
  
  // Utilities
  useDebounce,
  useLocalStorage
};

-- ============================================
-- FORESIGHT DATABASE SCHEMA
-- Platform: Supabase (PostgreSQL)
-- Version: 1.0
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE membership_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE user_role AS ENUM ('user', 'mentor', 'admin');
CREATE TYPE document_status AS ENUM ('uploaded', 'processing', 'analyzed', 'failed');
CREATE TYPE deadline_type AS ENUM ('filing', 'hearing', 'meeting', 'deadline', 'other');
CREATE TYPE deadline_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE mentor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE message_type AS ENUM ('text', 'system', 'announcement');
CREATE TYPE notification_type AS ENUM ('deadline', 'mention', 'mentor', 'system', 'message');

-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255),
    
    -- Profile
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    
    -- Settings
    jurisdiction VARCHAR(50) DEFAULT 'saskatchewan',
    tier membership_tier DEFAULT 'bronze',
    role user_role DEFAULT 'user',
    
    -- Usage tracking
    daily_queries_used INTEGER DEFAULT 0,
    daily_queries_reset_at TIMESTAMP WITH TIME ZONE,
    monthly_docs_used INTEGER DEFAULT 0,
    monthly_docs_reset_at TIMESTAMP WITH TIME ZONE,
    
    -- Subscription
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_status VARCHAR(50),
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    email_verified BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_jurisdiction ON users(jurisdiction);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================
-- JURISDICTIONS
-- ============================================

CREATE TABLE jurisdictions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL DEFAULT 'Canada',
    flag VARCHAR(10) DEFAULT '🇨🇦',
    status VARCHAR(20) DEFAULT 'beta', -- 'live', 'beta', 'coming_soon'
    court_name VARCHAR(255),
    
    -- Filing info
    filing_fees JSONB DEFAULT '{}',
    response_time_days INTEGER DEFAULT 30,
    international_response_days INTEGER DEFAULT 60,
    
    -- Legislation
    legislation TEXT[],
    
    -- Metadata
    display_order INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FILING PHASES & STEPS
-- ============================================

CREATE TABLE filing_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_filing_phases_jurisdiction ON filing_phases(jurisdiction_id);

CREATE TABLE filing_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phase_id UUID REFERENCES filing_phases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Requirements
    required VARCHAR(20) DEFAULT 'true', -- 'true', 'false', 'conditional', 'self-rep', 'regional'
    condition_description TEXT,
    
    -- Forms
    forms TEXT[],
    form_links JSONB DEFAULT '[]',
    
    -- Tips
    tips TEXT[],
    
    -- Metadata
    display_order INTEGER NOT NULL,
    estimated_time_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_filing_steps_phase ON filing_steps(phase_id);

-- ============================================
-- USER PROGRESS
-- ============================================

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    step_id UUID REFERENCES filing_steps(id) ON DELETE CASCADE,
    
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, step_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_completed ON user_progress(user_id, completed);

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- File info
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_type VARCHAR(50),
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    
    -- Classification
    document_type VARCHAR(50), -- 'petition', 'financial', 'evidence', 'correspondence', 'other'
    
    -- AI Analysis
    status document_status DEFAULT 'uploaded',
    ai_insights JSONB DEFAULT '[]',
    extracted_text TEXT,
    extracted_dates JSONB DEFAULT '[]',
    analyzed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================
-- DEADLINES
-- ============================================

CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timing
    due_date DATE NOT NULL,
    due_time TIME,
    reminder_days INTEGER[] DEFAULT '{7, 3, 1}',
    
    -- Classification
    type deadline_type DEFAULT 'deadline',
    priority deadline_priority DEFAULT 'medium',
    
    -- Status
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Links
    related_step_id UUID REFERENCES filing_steps(id),
    related_document_id UUID REFERENCES documents(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_deadlines_user ON deadlines(user_id);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_completed ON deadlines(user_id, completed);

-- ============================================
-- COMMUNITY CHANNELS
-- ============================================

CREATE TABLE channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'legal', 'support', 'hobbies'
    
    -- Settings
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id),
    is_private BOOLEAN DEFAULT FALSE,
    members_only_post BOOLEAN DEFAULT FALSE,
    
    -- Stats
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    
    -- Metadata
    icon VARCHAR(10),
    display_order INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CHANNEL MEMBERSHIPS
-- ============================================

CREATE TABLE channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(50) REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Settings
    notifications_enabled BOOLEAN DEFAULT TRUE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);

-- ============================================
-- MESSAGES
-- ============================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(50) REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Content
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    
    -- Features
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_by UUID REFERENCES users(id),
    pinned_at TIMESTAMP WITH TIME ZONE,
    
    -- Reply
    reply_to_id UUID REFERENCES messages(id),
    
    -- Edit/Delete
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_pinned ON messages(channel_id, is_pinned) WHERE is_pinned = TRUE;

-- ============================================
-- MESSAGE REACTIONS
-- ============================================

CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX idx_reactions_message ON message_reactions(message_id);

-- ============================================
-- MENTORS
-- ============================================

CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Profile
    bio TEXT,
    specialty VARCHAR(255),
    experience TEXT,
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id),
    
    -- Status
    status mentor_status DEFAULT 'pending',
    is_available BOOLEAN DEFAULT TRUE,
    response_time VARCHAR(50), -- '2 hours', '1 day', etc.
    
    -- Stats
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    
    -- Metadata
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mentors_status ON mentors(status);
CREATE INDEX idx_mentors_jurisdiction ON mentors(jurisdiction_id);
CREATE INDEX idx_mentors_available ON mentors(is_available) WHERE is_available = TRUE;

-- ============================================
-- MENTOR REVIEWS
-- ============================================

CREATE TABLE mentor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mentor_reviews_mentor ON mentor_reviews(mentor_id);

-- ============================================
-- MENTOR CONVERSATIONS
-- ============================================

CREATE TABLE mentor_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(mentor_id, user_id)
);

CREATE INDEX idx_mentor_convos_mentor ON mentor_conversations(mentor_id);
CREATE INDEX idx_mentor_convos_user ON mentor_conversations(user_id);

-- ============================================
-- MENTOR MESSAGES (Private DMs)
-- ============================================

CREATE TABLE mentor_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES mentor_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    content TEXT NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_mentor_messages_convo ON mentor_messages(conversation_id);
CREATE INDEX idx_mentor_messages_created ON mentor_messages(conversation_id, created_at DESC);

-- ============================================
-- AI CHAT HISTORY
-- ============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255),
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id),
    
    -- Stats
    message_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_convos_user ON ai_conversations(user_id);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    
    -- Token tracking
    tokens_used INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_convo ON ai_messages(conversation_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    
    -- Links
    link_type VARCHAR(50), -- 'deadline', 'channel', 'mentor', 'document'
    link_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- FORMS DATABASE
-- ============================================

CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jurisdiction_id VARCHAR(50) REFERENCES jurisdictions(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    form_number VARCHAR(50),
    description TEXT,
    
    -- Links
    download_url TEXT,
    info_url TEXT,
    file_type VARCHAR(10) DEFAULT 'pdf', -- 'pdf', 'docx', 'link'
    
    -- Classification
    category VARCHAR(100),
    related_step_ids UUID[],
    
    -- Metadata
    last_updated DATE,
    display_order INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forms_jurisdiction ON forms(jurisdiction_id);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_jurisdictions_updated_at BEFORE UPDATE ON jurisdictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON deadlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Reset daily query count
CREATE OR REPLACE FUNCTION reset_daily_queries()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.daily_queries_reset_at IS NULL OR NEW.daily_queries_reset_at < CURRENT_DATE THEN
        NEW.daily_queries_used = 0;
        NEW.daily_queries_reset_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_user_daily_queries BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION reset_daily_queries();

-- Update channel member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE channels SET member_count = member_count + 1 WHERE id = NEW.channel_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE channels SET member_count = member_count - 1 WHERE id = OLD.channel_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_members_count
    AFTER INSERT OR DELETE ON channel_members
    FOR EACH ROW EXECUTE FUNCTION update_channel_member_count();

-- Update mentor rating
CREATE OR REPLACE FUNCTION update_mentor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE mentors SET 
        rating = (SELECT AVG(rating) FROM mentor_reviews WHERE mentor_id = NEW.mentor_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM mentor_reviews WHERE mentor_id = NEW.mentor_id AND is_approved = TRUE)
    WHERE id = NEW.mentor_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mentor_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON mentor_reviews
    FOR EACH ROW EXECUTE FUNCTION update_mentor_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY documents_own_data ON documents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY deadlines_own_data ON deadlines
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY progress_own_data ON user_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY notifications_own_data ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY ai_convos_own_data ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY ai_messages_own_data ON ai_messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM ai_conversations WHERE user_id = auth.uid()
        )
    );

-- Mentor conversations - both parties can see
CREATE POLICY mentor_convos_access ON mentor_conversations
    FOR ALL USING (
        user_id = auth.uid() OR 
        mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
    );

CREATE POLICY mentor_messages_access ON mentor_messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM mentor_conversations 
            WHERE user_id = auth.uid() 
            OR mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- SEED DATA: JURISDICTIONS
-- ============================================

INSERT INTO jurisdictions (id, name, country, flag, status, court_name, filing_fees, response_time_days, legislation, display_order) VALUES
('saskatchewan', 'Saskatchewan', 'Canada', '🇨🇦', 'live', 'Court of King''s Bench', 
    '{"contested": 300, "uncontested": 500, "other": 200}', 30,
    ARRAY['The Children''s Law Act, 2020', 'The Family Maintenance Act', 'Divorce Act (Federal)'], 1),

('alberta', 'Alberta', 'Canada', '🇨🇦', 'live', 'Court of King''s Bench / Alberta Court of Justice',
    '{"contested": 260, "uncontested": 400, "other": 200}', 30,
    ARRAY['Family Law Act', 'Divorce Act (Federal)'], 2),

('ontario', 'Ontario', 'Canada', '🇨🇦', 'live', 'Superior Court of Justice / Ontario Court of Justice',
    '{"application": 202, "divorce_registration": 10, "divorce_review": 400}', 30,
    ARRAY['Family Law Act', 'Children''s Law Reform Act', 'Divorce Act (Federal)'], 3),

('bc', 'British Columbia', 'Canada', '🇨🇦', 'live', 'Provincial Court / Supreme Court',
    '{"provincial": 0, "supreme": 200}', 30,
    ARRAY['Family Law Act', 'Divorce Act (Federal)'], 4),

('manitoba', 'Manitoba', 'Canada', '🇨🇦', 'beta', 'Court of King''s Bench',
    '{"petition": 200}', 30,
    ARRAY['Family Maintenance Act', 'Divorce Act (Federal)'], 5);

-- ============================================
-- SEED DATA: CHANNELS
-- ============================================

INSERT INTO channels (id, name, description, category, jurisdiction_id, icon, display_order) VALUES
('sk-parents', 'Saskatchewan Parents', 'Support for SK parents navigating custody', 'legal', 'saskatchewan', '⚖️', 1),
('ab-parents', 'Alberta Parents', 'Support for AB parents navigating custody', 'legal', 'alberta', '⚖️', 2),
('on-parents', 'Ontario Parents', 'Support for ON parents navigating custody', 'legal', 'ontario', '⚖️', 3),
('bc-parents', 'BC Parents', 'Support for BC parents navigating custody', 'legal', 'bc', '⚖️', 4),
('high-conflict', 'High Conflict', 'Strategies for high-conflict custody situations', 'support', NULL, '🔥', 10),
('mental-health', 'Mental Health', 'Self-care and mental wellness during custody battles', 'support', NULL, '💚', 11),
('dads-corner', 'Dads Corner', 'Support space for fathers', 'support', NULL, '👨', 12),
('moms-circle', 'Moms Circle', 'Support space for mothers', 'support', NULL, '👩', 13),
('gaming', 'Gaming Lounge', 'Take a break and connect over games', 'hobbies', NULL, '🎮', 20),
('outdoors', 'Outdoors & Nature', 'Hiking, camping, and outdoor activities', 'hobbies', NULL, '🏕️', 21),
('books', 'Book Club', 'Reading recommendations and discussions', 'hobbies', NULL, '📚', 22);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- User dashboard stats
CREATE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.tier,
    u.daily_queries_used,
    u.monthly_docs_used,
    CASE u.tier 
        WHEN 'bronze' THEN 10
        WHEN 'silver' THEN 25
        WHEN 'gold' THEN 50
    END as daily_query_limit,
    CASE u.tier
        WHEN 'bronze' THEN 1
        WHEN 'silver' THEN 5
        WHEN 'gold' THEN 10
    END as monthly_doc_limit,
    (SELECT COUNT(*) FROM deadlines d WHERE d.user_id = u.id AND d.completed = FALSE AND d.due_date >= CURRENT_DATE) as upcoming_deadlines,
    (SELECT COUNT(*) FROM user_progress p WHERE p.user_id = u.id AND p.completed = TRUE) as completed_steps,
    (SELECT COUNT(*) FROM notifications n WHERE n.user_id = u.id AND n.is_read = FALSE) as unread_notifications
FROM users u;

-- Channel with unread count for user
CREATE OR REPLACE FUNCTION get_channels_for_user(p_user_id UUID)
RETURNS TABLE (
    channel_id VARCHAR(50),
    name VARCHAR(100),
    category VARCHAR(50),
    member_count INTEGER,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.category,
        c.member_count,
        (SELECT COUNT(*) FROM messages m 
         WHERE m.channel_id = c.id 
         AND m.created_at > COALESCE(
             (SELECT last_read_at FROM channel_members cm WHERE cm.channel_id = c.id AND cm.user_id = p_user_id),
             '1970-01-01'::timestamp
         )
        ) as unread_count
    FROM channels c
    ORDER BY c.display_order;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_deadlines_user_upcoming ON deadlines(user_id, due_date) WHERE completed = FALSE;
CREATE INDEX idx_notifications_user_recent ON notifications(user_id, created_at DESC);

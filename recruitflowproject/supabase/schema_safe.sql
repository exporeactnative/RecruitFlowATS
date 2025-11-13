-- RecruitFlow ATS/CRM Database Schema - SAFE VERSION
-- This version checks if objects exist before creating them

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing indexes if they exist (to recreate them)
DROP INDEX IF EXISTS idx_candidates_status;
DROP INDEX IF EXISTS idx_candidates_recruiter;
DROP INDEX IF EXISTS idx_notes_candidate;
DROP INDEX IF EXISTS idx_tasks_candidate;
DROP INDEX IF EXISTS idx_tasks_assigned;
DROP INDEX IF EXISTS idx_events_candidate;
DROP INDEX IF EXISTS idx_events_start;
DROP INDEX IF EXISTS idx_calls_candidate;
DROP INDEX IF EXISTS idx_sms_candidate;
DROP INDEX IF EXISTS idx_emails_candidate;
DROP INDEX IF EXISTS idx_activities_candidate;

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    location VARCHAR(255),
    
    -- Professional Info
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    years_of_experience INTEGER,
    
    -- Application Info
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    stage VARCHAR(100) DEFAULT 'Applied',
    applied_date DATE DEFAULT CURRENT_DATE,
    source VARCHAR(100),
    
    -- Profile
    avatar_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    
    -- Engagement
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Metadata
    recruiter_id UUID,
    hiring_manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_level VARCHAR(50) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience Table
CREATE TABLE IF NOT EXISTS candidate_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Table
CREATE TABLE IF NOT EXISTS candidate_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    graduation_year VARCHAR(4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes Table (with realtime support)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'interview', 'phone_screen', 'reference', 'follow_up')),
    created_by UUID NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    assigned_to UUID NOT NULL,
    assigned_to_name VARCHAR(255),
    google_task_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'interview' CHECK (event_type IN ('interview', 'phone_screen', 'meeting', 'follow_up')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    meeting_link TEXT,
    attendees JSONB,
    google_event_id VARCHAR(255),
    created_by UUID NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calls Table (Twilio integration)
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    call_type VARCHAR(20) CHECK (call_type IN ('inbound', 'outbound')),
    phone_number VARCHAR(20) NOT NULL,
    duration INTEGER,
    status VARCHAR(50),
    recording_url TEXT,
    notes TEXT,
    twilio_call_sid VARCHAR(255) UNIQUE,
    created_by UUID NOT NULL,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Messages Table (Twilio integration)
CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    phone_number VARCHAR(20) NOT NULL,
    message_body TEXT NOT NULL,
    status VARCHAR(50),
    twilio_message_sid VARCHAR(255) UNIQUE,
    created_by UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails Table
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    html_body TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    created_by UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log Table (for timeline)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_by UUID,
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_notes_candidate ON notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_tasks_candidate ON tasks(candidate_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_candidate ON calendar_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calls_candidate ON calls(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sms_candidate ON sms_messages(candidate_id);
CREATE INDEX IF NOT EXISTS idx_emails_candidate ON emails(candidate_id);
CREATE INDEX IF NOT EXISTS idx_activities_candidate ON activities(candidate_id);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users full access to candidates" ON candidates;
DROP POLICY IF EXISTS "Allow authenticated users full access to skills" ON candidate_skills;
DROP POLICY IF EXISTS "Allow authenticated users full access to experience" ON candidate_experience;
DROP POLICY IF EXISTS "Allow authenticated users full access to education" ON candidate_education;
DROP POLICY IF EXISTS "Allow authenticated users full access to notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated users full access to tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users full access to events" ON calendar_events;
DROP POLICY IF EXISTS "Allow authenticated users full access to calls" ON calls;
DROP POLICY IF EXISTS "Allow authenticated users full access to sms" ON sms_messages;
DROP POLICY IF EXISTS "Allow authenticated users full access to emails" ON emails;
DROP POLICY IF EXISTS "Allow authenticated users full access to activities" ON activities;

-- RLS Policies (Allow authenticated users to read/write)
CREATE POLICY "Allow authenticated users full access to candidates"
    ON candidates FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to skills"
    ON candidate_skills FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to experience"
    ON candidate_experience FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to education"
    ON candidate_education FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to notes"
    ON notes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to tasks"
    ON tasks FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to events"
    ON calendar_events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to calls"
    ON calls FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to sms"
    ON sms_messages FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to emails"
    ON emails FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to activities"
    ON activities FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_events_updated_at ON calendar_events;

-- Triggers for updated_at
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for notes, tasks, and activities
-- Note: This might fail if tables are already in publication, but it's safe to ignore
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notes;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activities;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

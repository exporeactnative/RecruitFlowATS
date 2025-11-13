-- Update RLS policies to allow anonymous (anon) access
-- This allows your app to work without authentication
-- Run this in Supabase SQL Editor

-- Drop existing policies
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

-- Create new policies that allow both authenticated AND anonymous users
CREATE POLICY "Allow all users full access to candidates"
    ON candidates FOR ALL
    TO public  -- ← Changed from 'authenticated' to 'public'
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to skills"
    ON candidate_skills FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to experience"
    ON candidate_experience FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to education"
    ON candidate_education FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to notes"
    ON notes FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to tasks"
    ON tasks FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to events"
    ON calendar_events FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to calls"
    ON calls FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to sms"
    ON sms_messages FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to emails"
    ON emails FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users full access to activities"
    ON activities FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Note: RLS is still enabled, but now allows anonymous access
-- This is good for development and internal tools
-- For production with external users, you'd want proper authentication

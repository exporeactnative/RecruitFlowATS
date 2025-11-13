-- TEMPORARY: Disable RLS for development/testing
-- Run this in Supabase SQL Editor to allow unauthenticated access

-- WARNING: This makes your data publicly accessible!
-- Only use for development. Re-enable RLS for production.

-- Disable RLS on all tables
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_experience DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_education DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Note: This allows anyone with your anon key to read/write data
-- Perfect for development, but you'll want authentication for production

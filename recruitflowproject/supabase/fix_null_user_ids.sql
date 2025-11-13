-- Fix NOT NULL constraints on user ID fields
-- Run this in Supabase SQL Editor to allow NULL user IDs (for development without auth)

-- Update notes table
ALTER TABLE notes ALTER COLUMN created_by DROP NOT NULL;

-- Update tasks table (only has assigned_to, not created_by)
ALTER TABLE tasks ALTER COLUMN assigned_to DROP NOT NULL;

-- Update calendar_events table
ALTER TABLE calendar_events ALTER COLUMN created_by DROP NOT NULL;

-- Update calls table
ALTER TABLE calls ALTER COLUMN created_by DROP NOT NULL;

-- Update sms_messages table (created_by might be NULL already)
ALTER TABLE sms_messages ALTER COLUMN created_by DROP NOT NULL;

-- Update emails table (created_by might be NULL already)
ALTER TABLE emails ALTER COLUMN created_by DROP NOT NULL;

-- Update activities table (created_by might be NULL already)
ALTER TABLE activities ALTER COLUMN created_by DROP NOT NULL;

-- Note: This allows the app to work without authentication
-- In production with auth, you'd want these to be NOT NULL
-- Some of these might already allow NULL, which is fine - the command will just be ignored

-- Add new fields to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS expected_salary TEXT,
ADD COLUMN IF NOT EXISTS citizenship TEXT,
ADD COLUMN IF NOT EXISTS resume_received BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qualified TEXT CHECK (qualified IN ('qualified', 'not_qualified', 'pending')) DEFAULT 'pending';

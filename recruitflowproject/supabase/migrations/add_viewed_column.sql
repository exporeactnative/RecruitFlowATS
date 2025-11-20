-- Add viewed column to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT FALSE;

-- Set existing candidates as viewed (optional - you can remove this line if you want all existing candidates to show as "new")
-- UPDATE candidates SET viewed = TRUE WHERE created_at < NOW();

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_viewed ON candidates(viewed);

-- Create calls table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('inbound', 'outbound')),
  phone_number TEXT NOT NULL,
  duration INTEGER, -- in seconds
  status TEXT, -- 'initiated', 'completed', 'missed', 'voicemail'
  recording_url TEXT,
  notes TEXT,
  twilio_call_sid TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create SMS messages table
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status TEXT, -- 'sent', 'delivered', 'failed'
  twilio_message_sid TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  html_body TEXT,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'failed'
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calls_candidate_id ON calls(candidate_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_candidate_id ON sms_messages(candidate_id);
CREATE INDEX IF NOT EXISTS idx_sms_created_at ON sms_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_candidate_id ON emails(candidate_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails(created_at DESC);

-- Enable Row Level Security
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies for calls
CREATE POLICY "Enable read access for all users" ON calls FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON calls FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON calls FOR DELETE USING (true);

-- Create policies for sms_messages
CREATE POLICY "Enable read access for all users" ON sms_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sms_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sms_messages FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON sms_messages FOR DELETE USING (true);

-- Create policies for emails
CREATE POLICY "Enable read access for all users" ON emails FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON emails FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON emails FOR DELETE USING (true);

-- Enable real-time for all communication tables
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE sms_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE emails;

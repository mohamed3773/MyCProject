-- Run this in your Supabase SQL Editor to fix the RLS error

-- 1. Enable RLS on users table (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows all operations for now
-- Note: In production, you should restrict this to authenticated users or specific logic
CREATE POLICY "Enable all access for users table" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

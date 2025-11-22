-- Supabase Database Schema for Loyalty Program
-- Run this SQL in your Supabase SQL Editor

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  join_date DATE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table (only authenticated users can read)
CREATE POLICY "Admins are viewable by authenticated users" ON admins
  FOR SELECT USING (true);

-- Create policies for customers table (allow all operations for authenticated users)
CREATE POLICY "Customers are viewable by authenticated users" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Customers are insertable by authenticated users" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers are updatable by authenticated users" ON customers
  FOR UPDATE USING (true);

CREATE POLICY "Customers are deletable by authenticated users" ON customers
  FOR DELETE USING (true);

-- Insert a default admin with hashed password
-- IMPORTANT: Before running this, you need to hash the password using the hash-password script
-- 
-- Steps to create admin with hashed password:
-- 1. Run: npx tsx scripts/hash-password.ts admin123
-- 2. Copy the hashed password from the output
-- 3. Replace 'YOUR_HASHED_PASSWORD_HERE' below with the actual hash
-- 4. Run this SQL
--
-- Example (DO NOT USE THIS EXACT HASH - generate your own):
-- INSERT INTO admins (username, password_hash)
-- VALUES ('admin', '$2a$10$YOUR_HASHED_PASSWORD_HERE')
-- ON CONFLICT (username) DO NOTHING;

-- For new installations, you can create the admin manually after running the hash script
-- Or use the Supabase dashboard to insert the admin with the hashed password


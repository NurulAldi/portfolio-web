-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUTHENTICATION SETUP
-- ============================================
-- This schema uses Supabase Email/Password Authentication
-- 
-- Setup Instructions:
-- 1. Run this schema file in Supabase SQL Editor
-- 2. Create admin users in Supabase Dashboard:
--    - Go to Authentication > Users
--    - Click "Add user" 
--    - Enter email and password
--    - User can now login at /admin/login
-- 
-- All authenticated users can access the admin panel.
-- There is no email whitelist - authentication is sufficient.

-- ============================================
-- TABLES
-- ============================================

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image TEXT NOT NULL,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('paragraph', 'heading', 'quote', 'image', 'list')),
  content JSONB NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_project_order UNIQUE (project_id, order_index)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_content_blocks_project_id ON content_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_order ON content_blocks(project_id, order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON content_blocks
  FOR SELECT USING (true);

-- Create policies for authenticated write access (admin only)
-- For now, we'll allow all authenticated users. Later, you can add role-based checks.
CREATE POLICY "Enable insert for authenticated users only" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON projects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON projects
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON content_blocks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON content_blocks
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON content_blocks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for project images (execute in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true);

-- Storage policies (execute in Supabase Dashboard > Storage)
-- For project-images bucket:
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- For content-images bucket:
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');

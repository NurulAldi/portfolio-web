# Supabase Integration Setup Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase dashboard

## Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New project"
3. Fill in project details and create

### 2. Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create:
   - `projects` table
   - `content_blocks` table
   - Indexes for performance
   - Row Level Security policies

### 3. Create Storage Buckets
1. In Supabase Dashboard, go to **Storage**
2. Create two new buckets:
   - **project-images** (Public bucket)
   - **content-images** (Public bucket)
3. Make both buckets **Public**

### 4. Configure Storage Policies
For each bucket, add these policies in **Storage > Policies**:

**Public read access:**
```sql
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-images');
```

**Authenticated users can upload:**
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');
```

**Authenticated users can update:**
```sql
CREATE POLICY "Authenticated users can update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');
```

**Authenticated users can delete:**
```sql
CREATE POLICY "Authenticated users can delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');
```

Repeat for `content-images` bucket (replace bucket name in policies).

### 5. Get API Credentials
1. In Supabase Dashboard, go to **Settings > API**
2. Copy:
   - Project URL
   - anon/public key

### 6. Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 7. Migrate Existing Data (Optional)
If you have existing projects in localStorage, run the migration utility:
```bash
npm run dev
```
Then visit: http://localhost:3000/admin/migrate

### 8. Test the Integration
1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000/admin/projects
3. Try:
   - Creating a new project
   - Uploading images
   - Editing projects
   - Deleting projects

## Architecture Overview

### Database Schema
- **projects**: Main project data (title, summary, tags, etc.)
- **content_blocks**: Description blocks (related to projects)

### Storage Buckets
- **project-images**: Thumbnail images
- **content-images**: Content block images

### API Routes
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get single project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### File Structure
```
lib/
  supabase/
    client.ts         # Supabase client setup
  storage.ts          # Image upload/delete functions
  projects.ts         # Project CRUD functions (calls API)
app/
  api/
    projects/
      route.ts        # Main projects API
      [id]/route.ts   # Single project API
```

## Security Notes

### Row Level Security (RLS)
- **Read**: Public access (anyone can view projects)
- **Write**: Authenticated users only (admin)

### Future Enhancements
- Add proper admin authentication with Supabase Auth
- Implement role-based access control
- Add email verification for admin
- Implement rate limiting

## Troubleshooting

### Images not uploading?
- Check storage buckets are created
- Verify storage policies are set
- Check browser console for errors

### Projects not saving?
- Verify database schema is created
- Check RLS policies are active
- Look at Network tab for API errors

### Connection errors?
- Verify environment variables are set
- Check Supabase project is active
- Ensure `.env.local` is in project root

## Support
For issues, check:
- Supabase docs: https://supabase.com/docs
- This project's GitHub issues

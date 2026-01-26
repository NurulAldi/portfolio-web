import { createBrowserClient } from '@supabase/ssr';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client for browser (client components)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          tags: string[];
          image: string;
          github_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary: string;
          tags: string[];
          image: string;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string;
          tags?: string[];
          image?: string;
          github_url?: string | null;
          updated_at?: string;
        };
      };
      content_blocks: {
        Row: {
          id: string;
          project_id: string;
          type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
          content: string | string[];
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
          content: string | string[];
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
          content?: string | string[];
          order_index?: number;
        };
      };
    };
  };
}

// Typed Supabase client
export type TypedSupabaseClient = typeof supabase;

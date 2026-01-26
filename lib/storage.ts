/**
 * Storage Service for Image Upload
 * 
 * Supabase Storage Implementation
 * Handles image uploads to Supabase Storage buckets
 */

import { supabase } from './supabase/client';

export interface UploadResult {
  url: string;
  error?: string;
}

// Storage bucket names
const BUCKETS = {
  PROJECT_IMAGES: 'project-images',
  CONTENT_IMAGES: 'content-images',
} as const;

/**
 * Upload image file to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: keyof typeof BUCKETS = 'PROJECT_IMAGES'
): Promise<UploadResult> {
  try {
    const bucketName = BUCKETS[bucket];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return {
        url: '',
        error: uploadError.message,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return { url: publicUrl };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract bucket and path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('storage') + 2; // After /storage/v1/object/public/
    const bucket = pathParts[bucketIndex];
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    if (!bucket || !filePath) {
      console.error('Invalid URL format:', url);
      return false;
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

/**
 * Get public URL for an image
 */
export function getPublicUrl(bucket: keyof typeof BUCKETS, path: string): string {
  const { data } = supabase.storage
    .from(BUCKETS[bucket])
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Validate if a string is a valid image URL or base64
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  // Check if base64
  if (url.startsWith('data:image/')) return true;
  
  // Check if valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if URL is from Supabase Storage
 */
export function isSupabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/storage/v1/object/public/');
  } catch {
    return false;
  }
}

'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  bucketType?: 'PROJECT_IMAGES' | 'CONTENT_IMAGES';
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  required = false,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif'],
  bucketType = 'PROJECT_IMAGES',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(value);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Unsupported format. Use: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size too large. Maximum ${maxSizeMB}MB (Your file: ${formatBytes(file.size)})`;
    }

    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Import storage service dynamically to avoid build issues
      const { uploadImage } = await import('@/lib/storage');
      
      // Upload to Supabase Storage
      const result = await uploadImage(file, bucketType);
      
      if (result.error) {
        setError(result.error);
        setIsUploading(false);
        return;
      }

      setPreview(result.url);
      onChange(result.url);
      setIsUploading(false);
    } catch (err) {
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-900">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {!preview ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
            required={required && !preview}
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-600">Uploading image...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Click to select image or drag & drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Format: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} (Max: {maxSizeMB}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="flex items-start gap-4">
            <div 
              className="relative w-32 h-32 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowPreview(true)}
              title="Click to view full size"
            >
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                sizes="128px"
                quality={90}
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 mb-3">Image uploaded successfully</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClick}
                  className="text-xs px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs px-3 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {showPreview && preview && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full max-w-6xl max-h-screen">
              <Image
                src={preview}
                alt="Full size preview"
                fill
                className="object-contain"
                sizes="(max-width: 1536px) 100vw, 1536px"
                quality={90}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

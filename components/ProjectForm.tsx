'use client';

import { FormEvent, useState, useEffect } from 'react';
import type { Project } from '@/lib/projects';
import { generateSlug } from '@/lib/projects';

interface ProjectFormProps {
  project?: Project; // If provided, form is in edit mode
  onSubmit: (projectData: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    slug: project?.slug || '',
    title: project?.title || '',
    summary: project?.summary || '',
    description: project?.description || '',
    tags: project?.tags.join(', ') || '',
    image: project?.image || '/placeholder-project.jpg',
    githubUrl: project?.githubUrl || '',
    liveUrl: project?.liveUrl || '',
    published: project?.published ?? true,
    featured: project?.featured ?? false,
    completedAt: project?.completedAt || new Date().toISOString().split('T')[0],
  });

  const [autoSlug, setAutoSlug] = useState(!project);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, autoSlug]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse tags
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const projectData: Omit<Project, 'id'> = {
      slug: formData.slug,
      title: formData.title,
      summary: formData.summary,
      description: formData.description,
      tags: tagsArray,
      image: formData.image,
      githubUrl: formData.githubUrl || undefined,
      liveUrl: formData.liveUrl || undefined,
      published: formData.published,
      featured: formData.featured,
      completedAt: formData.completedAt,
    };
    
    onSubmit(projectData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border-2 border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {project ? 'Edit Project' : 'Add New Project'}
      </h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="E-Commerce Platform"
          />
        </div>

        {/* Slug */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-900">
              Slug *
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              Auto-generate
            </label>
          </div>
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => {
              setAutoSlug(false);
              setFormData({ ...formData, slug: e.target.value });
            }}
            className="input-field"
            placeholder="ecommerce-platform"
          />
          <p className="text-xs text-slate-500 mt-1">URL: /projects/{formData.slug}</p>
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-semibold text-slate-900 mb-2">
            Summary *
          </label>
          <input
            type="text"
            id="summary"
            required
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="input-field"
            placeholder="A modern, full-featured online shopping platform"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="input-field resize-none"
            placeholder="Detailed description of the project, features, and technologies used..."
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-slate-900 mb-2">
            Tags *
          </label>
          <input
            type="text"
            id="tags"
            required
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="input-field"
            placeholder="Next.js, TypeScript, Stripe, Tailwind CSS"
          />
          <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
        </div>

        {/* Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="githubUrl" className="block text-sm font-semibold text-slate-900 mb-2">
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              className="input-field"
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div>
            <label htmlFor="liveUrl" className="block text-sm font-semibold text-slate-900 mb-2">
              Live URL
            </label>
            <input
              type="url"
              id="liveUrl"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              className="input-field"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Completed Date */}
        <div>
          <label htmlFor="completedAt" className="block text-sm font-semibold text-slate-900 mb-2">
            Completion Date *
          </label>
          <input
            type="date"
            id="completedAt"
            required
            value={formData.completedAt}
            onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
            className="input-field"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-900">Published</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-slate-900">Featured</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="btn-primary flex-1 md:flex-none"
          >
            {project ? 'Update Project' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 md:flex-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

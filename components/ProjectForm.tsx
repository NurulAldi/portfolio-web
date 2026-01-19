'use client';

import { FormEvent, useState } from 'react';
import type { Project, ContentBlock } from '@/lib/projects';
import { generateSlug } from '@/lib/projects';
import BlockEditor from './BlockEditor';

interface ProjectFormProps {
  project?: Project; // If provided, form is in edit mode
  onSubmit: (projectData: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    summary: project?.summary || '',
    tags: project?.tags.join(', ') || '',
    image: project?.image || '/placeholder-project.jpg',
    githubUrl: project?.githubUrl || '',
  });
  
  const [descriptionBlocks, setDescriptionBlocks] = useState<ContentBlock[]>(
    project?.description || []
  );

  // Auto-generate slug from title (always enabled)
  const slug = generateSlug(formData.title);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Parse tags
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const projectData: Omit<Project, 'id'> = {
      slug: slug,
      title: formData.title,
      summary: formData.summary,
      description: descriptionBlocks,
      tags: tagsArray,
      image: formData.image,
      githubUrl: formData.githubUrl || undefined,
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

        {/* Block Editor for Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Description (Block Editor) *
          </label>
          <BlockEditor 
            blocks={descriptionBlocks}
            onChange={setDescriptionBlocks}
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-slate-900 mb-2">
            Image URL *
          </label>
          <input
            type="url"
            id="image"
            required
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="input-field"
            placeholder="https://example.com/image.jpg or /project-image.jpg"
          />
          <p className="text-xs text-slate-500 mt-1">Enter a URL to an image or path to local image in public folder</p>
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

        {/* GitHub URL */}
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

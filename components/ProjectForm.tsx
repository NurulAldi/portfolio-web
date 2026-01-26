'use client';

import { FormEvent, useState } from 'react';
import type { Project, ContentBlock } from '@/lib/projects';
import { generateSlug } from '@/lib/projects';
import BlockEditor from './BlockEditor';
import ImageUploader from './ImageUploader';

interface ProjectFormProps {
  project?: Project; // If provided, form is in edit mode
  onSubmit: (projectData: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    summary: project?.summary || '',
    image: project?.image || '',
    githubUrl: project?.githubUrl || '',
  });
  
  const [tags, setTags] = useState<string[]>(project?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [descriptionBlocks, setDescriptionBlocks] = useState<ContentBlock[]>(
    Array.isArray(project?.description) ? project.description : []
  );

  // Auto-generate slug from title (always enabled)
  const slug = generateSlug(formData.title);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const projectData: Omit<Project, 'id'> = {
      slug: slug,
      title: formData.title,
      summary: formData.summary,
      description: descriptionBlocks,
      tags: tags,
      image: formData.image,
      githubUrl: formData.githubUrl || undefined,
    };
    
    onSubmit(projectData);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
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

        {/* Thumbnail Image */}
        <div>
          <ImageUploader
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            label="Thumbnail Image"
            required
            bucketType="PROJECT_IMAGES"
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

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-slate-900 mb-2">
            Tags * (Maximum 5 tags)
          </label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="input-field"
            placeholder="Enter tag (e.g., Python, Machine Learning, Data Analysis)"
            disabled={tags.length >= 5}
          />
          {tags.length < 5 && (
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
              className="mt-2 text-sm text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add
            </button>
          )}
          
          {/* Tag Chips */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm border border-slate-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-red-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
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

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
  
  const [customButtons, setCustomButtons] = useState<{ label: string; url: string }[]>(
    project?.customButtons || []
  );
  
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
      customButtons: customButtons,
    };
    
    onSubmit(projectData);
  };

  const handleAddButton = () => {
    if (customButtons.length < 2) {
      setCustomButtons([...customButtons, { label: 'Demo', url: 'https://' }]);
    }
  };

  const handleUpdateButton = (index: number, key: 'label' | 'url', value: string) => {
    const newButtons = [...customButtons];
    newButtons[index] = { ...newButtons[index], [key]: value };
    setCustomButtons(newButtons);
  };

  const handleRemoveButton = (index: number) => {
    setCustomButtons(customButtons.filter((_, i) => i !== index));
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

        {/* Custom Buttons */}
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Custom Buttons (Max 2)
          </label>
          <div className="space-y-3">
            {customButtons.map((btn, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-slate-50">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => handleUpdateButton(index, 'label', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Button Label"
                  />
                  <input
                    type="url"
                    value={btn.url}
                    onChange={(e) => handleUpdateButton(index, 'url', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Button URL (https://...)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveButton(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove Button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {customButtons.length < 2 && (
              <button
                type="button"
                onClick={handleAddButton}
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Button
              </button>
            )}
          </div>
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

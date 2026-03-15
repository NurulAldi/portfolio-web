'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectBySlug } from '@/lib/projects';
import { RichText } from '@/components/RichText';
import { useEffect, useState, use } from 'react';
import type { Project } from '@/lib/projects';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project data from API
    const fetchProject = async () => {
      try {
        const projectData = await getProjectBySlug(slug);
        setProject(projectData || null);
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Back Button */}
      <Link 
        href="/projects"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-8 group"
      >
        <svg 
          className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 break-words tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 mb-8 break-words leading-relaxed">
          {project.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tags && Array.isArray(project.tags) && project.tags.map((tag) => (
            <span
              key={tag}
              className="text-sm font-medium text-slate-700 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 break-words"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4 mb-12 flex-wrap">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              View Code
            </a>
          )}
          
          {project.customButtons && project.customButtons.map((btn, index) => (
            <a
              key={index}
              href={btn.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <span>{btn.label}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Project Image */}
      <div className="mb-12 flex justify-center">
        {project.image ? (
          <div className="inline-block max-w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="w-auto h-auto max-w-full max-h-[70vh] object-contain"
            />
          </div>
        ) : (
          <div className="inline-block w-full max-w-3xl aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
            <div className="text-slate-400">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Project Description */}
      <div>
        <div className="prose prose-lg md:prose-xl prose-slate max-w-none">
          {Array.isArray(project.description) ? project.description.map((block) => {
            switch (block.type) {
              case 'paragraph':
                return (
                  <p key={block.id} className="text-slate-800 leading-loose break-words whitespace-pre-wrap mb-8">
                    <RichText content={block.content as string} />
                  </p>
                );
              case 'heading':
                return (
                  <h2 key={block.id} className="text-2xl md:text-3xl font-bold text-slate-900 mt-12 mb-6 break-words tracking-tight">
                    {block.content}
                  </h2>
                );
              case 'quote':
                return (
                  <blockquote key={block.id} className="border-l-4 border-slate-800 pl-6 py-2 my-8 italic text-slate-700 bg-transparent break-words text-xl md:text-2xl font-light">
                    {block.content}
                  </blockquote>
                );
              case 'image':
                return (
                  <figure key={block.id} className="my-12 flex justify-center">
                    <div className="inline-block max-w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={block.content as string}
                        alt="Project content"
                        className="w-auto h-auto max-w-full max-h-[70vh] object-contain"
                      />
                    </div>
                  </figure>
                );
              case 'list':
                return (
                  <ul key={block.id} className="list-disc pl-6 space-y-3 mb-8 text-slate-800 leading-relaxed">
                    {(block.content as string[]).map((item, index) => (
                      <li key={index} className="break-words">{item}</li>
                    ))}
                  </ul>
                );
              default:
                return null;
            }
          }) : (
            <p className="text-slate-800 leading-loose whitespace-pre-wrap break-words">
              {project.description as any}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

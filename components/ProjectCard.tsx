import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/lib/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link 
      href={`/projects/${project.slug}`}
      className="group block bg-white border-2 border-slate-200 rounded-lg overflow-hidden hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* Project Image */}
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px"
            quality={80}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
            <svg 
              className="w-16 h-16 transition-transform group-hover:scale-110" 
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
        )}
      </div>

      {/* Project Content */}
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors break-words">
          {project.title}
        </h3>
        <p className="text-sm md:text-base text-slate-600 mb-4 line-clamp-2 break-words">
          {project.summary}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags && Array.isArray(project.tags) && project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all break-words"
            >
              {tag}
            </span>
          ))}
          {project.tags && project.tags.length > 3 && (
            <span className="text-xs font-medium text-slate-500">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* View Project Arrow */}
        <div className="flex items-center text-primary font-medium text-sm">
          <span className="transition-all">View Project</span>
          <svg 
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

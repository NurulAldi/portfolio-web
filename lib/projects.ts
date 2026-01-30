import projectsData from '@/content/projects.json';

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'list';
  content: string | string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: ContentBlock[];
  tags: string[];
  image: string;
  githubUrl?: string;
  customButtons?: { label: string; url: string }[];
}

/*
 * This implementation now uses Supabase for storage via API routes.
 * All CRUD operations go through Next.js API routes for server-side execution.
 */

// Cache for projects (client-side only)
let projectsCache: Project[] | null = null;

// PUBLIC METHODS (for frontend display)

export async function getAllProjects(): Promise<Project[]> {
  try {
    // Use cache if available
    if (projectsCache) {
      return projectsCache;
    }

    const response = await fetch('/api/projects', {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch projects');
      return [];
    }

    const projects = await response.json();
    projectsCache = projects;
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const projects = await getAllProjects();
    return projects.find(project => project.slug === slug);
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return undefined;
  }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const projects = await getAllProjects();
    return projects.map(project => project.slug);
  } catch (error) {
    console.error('Error fetching project slugs:', error);
    return [];
  }
}

// ADMIN METHODS (for management - require authentication in components)

export async function getAllProjectsAdmin(): Promise<Project[]> {
  // Clear cache to ensure fresh data
  projectsCache = null;
  return getAllProjects();
}

export async function getProjectByIdAdmin(id: string): Promise<Project | undefined> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch project');
      return undefined;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return undefined;
  }
}

export async function createProject(projectData: Omit<Project, 'id'>): Promise<Project | null> {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to create project:', error);
      return null;
    }

    const newProject = await response.json();
    
    // Clear cache
    projectsCache = null;
    
    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to update project:', error);
      return null;
    }

    const updatedProject = await response.json();
    
    // Clear cache
    projectsCache = null;
    
    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to delete project');
      return false;
    }

    // Clear cache
    projectsCache = null;
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Utility to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

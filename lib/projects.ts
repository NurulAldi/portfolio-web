import projectsData from '@/content/projects.json';

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  image: string;
  githubUrl?: string;
  liveUrl?: string;
  published: boolean;
  featured: boolean;
  completedAt: string;
}

// Storage key for localStorage override
const STORAGE_KEY = 'portfolio_projects_override';

/*
 * NOTE: This implementation uses localStorage for temporary storage.
 * In production, replace with proper database operations via API routes.
 */

// Load projects from localStorage or fall back to JSON file
function loadProjects(): Project[] {
  if (typeof window === 'undefined') {
    return projectsData;
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return projectsData;
    }
  }
  return projectsData;
}

// Save projects to localStorage
function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// PUBLIC METHODS (for frontend display)

export function getAllProjects(): Project[] {
  return loadProjects().filter(project => project.published);
}

export function getFeaturedProjects(): Project[] {
  return loadProjects().filter(project => project.published && project.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return loadProjects().find(project => project.slug === slug && project.published);
}

export function getAllProjectSlugs(): string[] {
  return loadProjects()
    .filter(project => project.published)
    .map(project => project.slug);
}

// ADMIN METHODS (for management - require authentication in components)

export function getAllProjectsAdmin(): Project[] {
  // Returns ALL projects including unpublished for admin view
  return loadProjects();
}

export function getProjectByIdAdmin(id: string): Project | undefined {
  return loadProjects().find(project => project.id === id);
}

export function createProject(projectData: Omit<Project, 'id'>): Project {
  const projects = loadProjects();
  
  // Generate new ID
  const maxId = projects.reduce((max, p) => {
    const numId = parseInt(p.id);
    return numId > max ? numId : max;
  }, 0);
  
  const newProject: Project = {
    ...projectData,
    id: String(maxId + 1),
  };
  
  projects.push(newProject);
  saveProjects(projects);
  
  return newProject;
}

export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  // Prevent ID changes
  delete (updates as any).id;
  
  projects[index] = { ...projects[index], ...updates };
  saveProjects(projects);
  
  return projects[index];
}

export function deleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  if (filtered.length === projects.length) {
    return false; // Project not found
  }
  
  saveProjects(filtered);
  return true;
}

// Utility to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import { 
  getAllProjectsAdmin, 
  getProjectByIdAdmin,
  createProject, 
  updateProject, 
  deleteProject,
  type Project 
} from '@/lib/projects';
import ProjectForm from '@/components/ProjectForm';
import Toast, { type ToastType } from '@/components/Toast';
import Link from 'next/link';

type ViewMode = 'list' | 'add' | 'edit';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Load projects
  const loadProjects = async () => {
    setIsLoading(true);
    const allProjects = await getAllProjectsAdmin();
    setProjects(allProjects);
    setIsLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleAddProject = async (projectData: Omit<Project, 'id'>) => {
    setIsLoading(true);
    try {
      await createProject(projectData);
      await loadProjects();
      setViewMode('list');
      showToast('Project added successfully!', 'success');
    } catch (error) {
      showToast('Failed to add project. Please try again.', 'error');
    }
    setIsLoading(false);
  };

  const handleEditProject = async (projectData: Omit<Project, 'id'>) => {
    if (editingProjectId) {
      setIsLoading(true);
      try {
        await updateProject(editingProjectId, projectData);
        await loadProjects();
        setViewMode('list');
        setEditingProjectId(null);
        showToast('Project updated successfully!', 'success');
      } catch (error) {
        showToast('Failed to update project. Please try again.', 'error');
      }
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await deleteProject(id);
        await loadProjects();
        showToast('Project deleted successfully!', 'success');
      } catch (error) {
        showToast('Failed to delete project. Please try again.', 'error');
      }
      setIsLoading(false);
    }
  };

  const startEdit = async (id: string) => {
    setEditingProjectId(id);
    setIsLoading(true);
    const project = await getProjectByIdAdmin(id);
    setEditingProject(project || null);
    setIsLoading(false);
    setViewMode('edit');
  };

  const cancelEdit = () => {
    setViewMode('list');
    setEditingProjectId(null);
    setEditingProject(null);
  };

  return (
    <div className="section-container py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Manage Projects</h1>
          <p className="text-slate-600">Add, edit, or remove portfolio projects</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="btn-secondary">
            ← Dashboard
          </Link>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'list' && (
        <>
          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => setViewMode('add')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Project
            </button>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-lg border-2 border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                        No projects found. Add your first project to get started.
                      </td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{project.title}</p>
                            <p className="text-sm text-slate-500 line-clamp-1">{project.summary}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/projects/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                              title="View"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                            <button
                              onClick={() => startEdit(project.id)}
                              className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 text-sm text-slate-600">
            <div>Total Projects: <strong className="text-slate-900">{projects.length}</strong></div>
          </div>
        </>
      )}

      {viewMode === 'add' && (
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setViewMode('list')}
        />
      )}

      {viewMode === 'edit' && editingProjectId && editingProject && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleEditProject}
          onCancel={cancelEdit}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

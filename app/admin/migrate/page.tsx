'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Project } from '@/lib/projects';

export default function MigratePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  const [migrationResults, setMigrationResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const analyzeLocalStorage = () => {
    setIsAnalyzing(true);
    try {
      const stored = localStorage.getItem('portfolio_projects_override');
      if (stored) {
        const projects = JSON.parse(stored);
        setLocalProjects(Array.isArray(projects) ? projects : []);
      } else {
        setLocalProjects([]);
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
      setLocalProjects([]);
    }
    setIsAnalyzing(false);
  };

  const migrateData = async () => {
    if (localProjects.length === 0) return;

    setIsMigrating(true);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const project of localProjects) {
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: project.slug,
            title: project.title,
            summary: project.summary,
            description: project.description,
            tags: project.tags,
            image: project.image,
            githubUrl: project.githubUrl,
          }),
        });

        if (response.ok) {
          results.success++;
        } else {
          results.failed++;
          const error = await response.json();
          results.errors.push(`${project.title}: ${error.error || 'Unknown error'}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${project.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setMigrationResults(results);
    setIsMigrating(false);
  };

  const clearLocalStorage = () => {
    if (confirm('Are you sure you want to clear localStorage? This will remove all local project data.')) {
      localStorage.removeItem('portfolio_projects_override');
      setLocalProjects([]);
      setMigrationResults(null);
      alert('localStorage cleared!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Data Migration</h1>
          <p className="text-slate-600">
            Migrate projects from localStorage to Supabase database
          </p>
        </div>

        {/* Warning */}
        <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notes:</p>
              <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                <li>Make sure Supabase is configured before migrating</li>
                <li>Base64 images will be migrated as-is (you may want to re-upload them later)</li>
                <li>This process may take a few moments depending on the number of projects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 1: Analyze */}
        <div className="bg-white rounded-lg border-2 border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 1: Analyze Local Data</h2>
          <p className="text-slate-600 mb-4">
            Check if you have any projects stored in localStorage that need to be migrated.
          </p>
          <button
            onClick={analyzeLocalStorage}
            disabled={isAnalyzing}
            className="btn-primary"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze localStorage'}
          </button>

          {localProjects.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-900 mb-3">
                Found {localProjects.length} project(s) in localStorage:
              </p>
              <ul className="space-y-2">
                {localProjects.map((project) => (
                  <li key={project.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="font-medium text-slate-900">{project.title}</p>
                    <p className="text-sm text-slate-500">{project.summary}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {localProjects.length === 0 && !isAnalyzing && (
            <p className="mt-4 text-sm text-slate-500">
              No projects found in localStorage. Either they've already been migrated or none exist.
            </p>
          )}
        </div>

        {/* Step 2: Migrate */}
        {localProjects.length > 0 && (
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 2: Migrate to Supabase</h2>
            <p className="text-slate-600 mb-4">
              This will copy all projects from localStorage to your Supabase database.
            </p>
            <button
              onClick={migrateData}
              disabled={isMigrating || migrationResults !== null}
              className="btn-primary"
            >
              {isMigrating ? 'Migrating...' : migrationResults ? 'Migration Complete' : 'Start Migration'}
            </button>

            {migrationResults && (
              <div className="mt-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm font-semibold text-green-800">
                    ✓ Successfully migrated: {migrationResults.success} project(s)
                  </p>
                </div>

                {migrationResults.failed > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 mb-2">
                      ✗ Failed: {migrationResults.failed} project(s)
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {migrationResults.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Cleanup */}
        {migrationResults && migrationResults.success > 0 && (
          <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 3: Cleanup (Optional)</h2>
            <p className="text-slate-600 mb-4">
              After successful migration, you can clear the localStorage data. This is optional but recommended to avoid confusion.
            </p>
            <button
              onClick={clearLocalStorage}
              className="btn-secondary"
            >
              Clear localStorage
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Link href="/admin/projects" className="btn-primary">
            Go to Projects Manager
          </Link>
          <Link href="/admin" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

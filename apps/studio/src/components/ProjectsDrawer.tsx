'use client';

import React, { useEffect, useState } from 'react';
import { useStudioStore } from '../lib/store';
import { deleteCloudProject, CloudProjectRecord } from '../lib/insforge';

export const ProjectsDrawer: React.FC = () => {
  const {
    isProjectsDrawerOpen,
    setProjectsDrawerOpen,
    userProjects,
    loadProjectsList,
    loadProject,
    newBlankProject,
    currentProjectId,
    currentUser,
    setAuthModalOpen,
  } = useStudioStore();

  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isProjectsDrawerOpen) {
      setLoading(true);
      loadProjectsList().finally(() => setLoading(false));
    }
  }, [isProjectsDrawerOpen, loadProjectsList]);

  if (!isProjectsDrawerOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCloudProject(id);
      await loadProjectsList();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete project failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={() => setProjectsDrawerOpen(false)} />

      {/* Drawer panel */}
      <div 
        className="w-full max-w-md bg-surface-primary dark:bg-surface-elevated border-l border-border-subtle h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-drawer-title"
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-border-subtle flex items-center justify-between">
          <div>
            <h2 id="projects-drawer-title" className="text-base font-semibold text-text-primary">
              Your Globe Projects
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Saved cloud globes and local drafts
            </p>
          </div>
          <button
            onClick={() => setProjectsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 border-b border-border-subtle flex gap-2">
          <button
            onClick={() => {
              newBlankProject();
              setProjectsDrawerOpen(false);
            }}
            className="flex-1 py-2 px-3 rounded-xl bg-accent text-white font-semibold text-xs shadow-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
          <button
            onClick={() => {
              setLoading(true);
              loadProjectsList().finally(() => setLoading(false));
            }}
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            title="Refresh list"
            aria-label="Refresh list"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Projects list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!currentUser && (
            <div className="p-3.5 mb-3 rounded-xl bg-accent-glow/50 border border-accent/20 text-xs">
              <p className="font-semibold text-text-primary">Cloud Sync Disabled</p>
              <p className="text-text-secondary mt-0.5">
                Sign in with InsForge to save and access your projects from any machine.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="mt-2 text-xs font-semibold text-accent hover:underline"
              >
                Sign In or Sign Up &rarr;
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-xs text-text-secondary">
              <div className="w-6 h-6 mx-auto mb-2 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Loading your cloud projects...
            </div>
          ) : userProjects.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-secondary">
              <p className="font-medium text-text-primary">No saved cloud projects yet</p>
              <p className="mt-1">Click "New Project" or edit your current canvas to get started.</p>
            </div>
          ) : (
            userProjects.map((p) => {
              const isCurrent = p.id === currentProjectId;
              const markerCount = p.scene_config?.markers?.length || 0;
              const arcCount = p.scene_config?.arcs?.length || 0;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    loadProject(p);
                    setProjectsDrawerOpen(false);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'border-accent bg-accent-glow/30 shadow-sm'
                      : 'border-border-subtle bg-surface-secondary/40 hover:bg-surface-secondary hover:border-border-strong'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text-primary">
                          {p.name || 'Untitled Globe'}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-tertiary mt-1">
                        Updated {new Date(p.updated_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {deleteConfirmId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(p.id, e)}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-0.5 rounded text-[11px] text-text-tertiary hover:bg-surface-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(p.id);
                          }}
                          className="p-1 rounded text-text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete project"
                          aria-label="Delete project"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-text-tertiary font-mono">
                    <span>{markerCount} markers</span>
                    <span>•</span>
                    <span>{arcCount} arcs</span>
                    {p.preset_id && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{p.preset_id}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border-subtle bg-surface-secondary text-[11px] text-text-tertiary flex items-center justify-between">
          <span>Powered by InsForge BaaS</span>
          <span>PostgreSQL + RLS</span>
        </div>
      </div>
    </div>
  );
};

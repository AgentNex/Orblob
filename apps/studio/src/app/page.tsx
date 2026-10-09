'use client';

import React, { useEffect, useState } from 'react';
import { useStudioStore } from '../lib/store';
import Header from '../components/Header';
import LayersPanel from '../components/LayersPanel';
import InspectorPanel from '../components/InspectorPanel';
import Viewport from '../components/Viewport';
import CodeEditorView from '../components/CodeEditorView';
import { AuthModal } from '../components/AuthModal';
import { ExportModal } from '../components/ExportModal';
import { ProjectsDrawer } from '../components/ProjectsDrawer';
import { CommandPalette } from '../components/CommandPalette';
import { TimelineDrawer } from '../components/TimelineDrawer';

export default function StudioPage() {
  const {
    studioMode,
    theme,
    refreshAuth,
    loadProjectsList,
    devicePreview,
  } = useStudioStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshAuth();
    loadProjectsList();
  }, [refreshAuth, loadProjectsList]);

  // Synchronize dark mode class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090a0f] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-zinc-400">Loading Orblob Studio...</span>
        </div>
      </div>
    );
  }

  const isCodeMode = studioMode === 'code';
  const isPreviewMode = studioMode === 'preview';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-primary dark:bg-surface-elevated text-text-primary select-none transition-colors duration-200">
      {/* Top Application Bar */}
      <Header />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Layer Hierarchy & Objects (hidden in preview mode) */}
        {!isPreviewMode && !isCodeMode && (
          <aside className="w-72 flex-shrink-0 border-r border-border-subtle bg-surface-primary dark:bg-surface-elevated flex flex-col z-10">
            <LayersPanel />
          </aside>
        )}

        {/* Center: Interactive 3D Viewport or Code Inspector */}
        <section className="flex-1 flex flex-col relative overflow-hidden bg-surface-secondary/50">
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {isCodeMode ? (
              <div className="w-full h-full p-4 overflow-hidden">
                <CodeEditorView />
              </div>
            ) : (
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  devicePreview === 'mobile'
                    ? 'w-[375px] h-[720px] rounded-[36px] border-[8px] border-zinc-800 shadow-2xl overflow-hidden'
                    : devicePreview === 'tablet'
                    ? 'w-[768px] h-[920px] rounded-[24px] border-[6px] border-zinc-800 shadow-2xl overflow-hidden'
                    : 'w-full h-full'
                }`}
              >
                <Viewport />
              </div>
            )}
          </div>

          {/* Bottom Animation & Scrubber Bar (only in studio mode) */}
          {!isPreviewMode && !isCodeMode && <TimelineDrawer />}
        </section>

        {/* Right Side: Property Inspector (hidden in preview mode) */}
        {!isPreviewMode && !isCodeMode && (
          <aside className="w-80 flex-shrink-0 border-l border-border-subtle bg-surface-primary dark:bg-surface-elevated flex flex-col z-10">
            <InspectorPanel />
          </aside>
        )}
      </main>

      {/* Overlays, Drawers & Modals */}
      <AuthModal />
      <ExportModal />
      <ProjectsDrawer />
      <CommandPalette />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  Globe as GlobeIcon,
  FolderOpen,
  Undo2,
  Redo2,
  Code2,
  Eye,
  Sliders,
  Download,
  Moon,
  Sun,
  User,
  LogOut,
  Command,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStudioStore, StudioMode, DevicePreview } from '../lib/store';
import { insforge } from '../lib/insforge';

export default function Header() {
  const {
    currentProjectName,
    setProjectName,
    saveStatus,
    saveErrorMessage,
    saveCurrentProject,
    studioMode,
    setStudioMode,
    devicePreview,
    setDevicePreview,
    theme,
    toggleTheme,
    undo,
    redo,
    history,
    future,
    setAuthModalOpen,
    setExportModalOpen,
    setProjectsDrawerOpen,
    setCommandPaletteOpen,
    currentUser,
    refreshAuth,
  } = useStudioStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const handleSignOut = async () => {
    await insforge.auth.signOut();
    refreshAuth();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="h-12 border-b border-border bg-surface flex items-center justify-between px-3 select-none z-30 sticky top-0">
      {/* Left: Brand & Project */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono font-bold tracking-tight text-ink text-sm">
          <div className="w-5 h-5 rounded-full border border-ink flex items-center justify-center bg-ink/5">
            <div className="w-2.5 h-2.5 rounded-full bg-ink animate-pulse" />
          </div>
          <span>ORBLOB</span>
          <span className="text-3xs px-1.5 py-0.5 rounded border border-border text-text-dim font-sans">
            v1.0
          </span>
        </div>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Project Name & Drawer */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setProjectsDrawerOpen(true)}
            className="p-1.5 rounded hover:bg-surface-elevated text-text-dim hover:text-text transition-colors"
            title="Open Projects (Cloud & Local)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <input
            type="text"
            value={currentProjectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-xs font-medium border border-transparent hover:border-border focus:border-ink rounded px-1.5 py-0.5 outline-none max-w-[150px] sm:max-w-[200px]"
          />
        </div>

        {/* Save Status */}
        <div className="hidden md:flex items-center text-3xs font-mono text-text-dim">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-ink">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Saved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <button
              onClick={saveCurrentProject}
              className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
              title="Click to save project"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unsaved
            </button>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-rose-500" title={saveErrorMessage || 'Save failed'}>
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          )}
        </div>
      </div>

      {/* Center: Modes & Viewport Switchers */}
      <div className="flex items-center gap-2">
        {/* Studio Modes */}
        <div className="flex items-center p-0.5 rounded-md border border-border bg-surface-elevated text-xs font-mono">
          <button
            onClick={() => setStudioMode('studio')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-2xs transition-colors ${
              studioMode === 'studio'
                ? 'bg-surface text-ink font-semibold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Design</span>
          </button>
          <button
            onClick={() => setStudioMode('code')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-2xs transition-colors ${
              studioMode === 'code'
                ? 'bg-surface text-ink font-semibold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span className="hidden sm:inline">Code</span>
          </button>
          <button
            onClick={() => setStudioMode('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-2xs transition-colors ${
              studioMode === 'preview'
                ? 'bg-surface text-ink font-semibold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>

        {/* Device Preview (Visible in Studio/Preview mode) */}
        {studioMode !== 'code' && (
          <div className="hidden lg:flex items-center border border-border rounded-md bg-surface-elevated p-0.5 text-text-dim">
            <button
              onClick={() => setDevicePreview('desktop')}
              className={`p-1 rounded ${devicePreview === 'desktop' ? 'bg-surface text-ink' : 'hover:text-text'}`}
              title="Desktop Viewport"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDevicePreview('tablet')}
              className={`p-1 rounded ${devicePreview === 'tablet' ? 'bg-surface text-ink' : 'hover:text-text'}`}
              title="Tablet Viewport"
            >
              <Tablet className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDevicePreview('mobile')}
              className={`p-1 rounded ${devicePreview === 'mobile' ? 'bg-surface text-ink' : 'hover:text-text'}`}
              title="Mobile Viewport"
            >
              <Smartphone className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Right: History, Palette, Theme, Auth, Export */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-surface-elevated text-text-dim disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded hover:bg-surface-elevated text-text-dim disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded border border-border text-2xs font-mono text-text-dim hover:border-ink hover:text-ink transition-colors"
          title="Command Palette"
        >
          <Command className="w-3 h-3" />
          <span>Cmd+K</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-surface-elevated text-text-dim hover:text-text transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        <div className="h-4 w-[1px] bg-border mx-0.5" />

        {/* User Auth */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-border text-2xs font-medium hover:border-ink transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-ink text-white flex items-center justify-center text-3xs font-bold">
                {currentUser.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline max-w-[80px] truncate">{currentUser.email}</span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-md shadow-lg p-1.5 text-xs z-50">
                <div className="px-2 py-1 border-b border-border text-3xs font-mono text-text-dim">
                  Signed in as:
                  <div className="text-text font-sans font-medium truncate">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    setProjectsDrawerOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-surface-elevated flex items-center gap-2 text-text"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> My Cloud Projects
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-border hover:border-ink text-text text-2xs font-mono transition-colors"
          >
            <User className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        )}

        {/* Export CTA Button */}
        <button
          onClick={() => setExportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-ink hover:bg-ink-hover text-white text-2xs font-mono font-medium shadow-sm transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}

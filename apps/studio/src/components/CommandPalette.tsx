'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStudioStore } from '../lib/store';
import { PRESETS } from '@orblob/config';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Presets' | 'Navigation' | 'Action' | 'Focus City';
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    applyPreset,
    setStudioMode,
    toggleTheme,
    setExportModalOpen,
    setProjectsDrawerOpen,
    setAuthModalOpen,
    saveCurrentProject,
    updateTransform,
    addMarker,
  } = useStudioStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Actions
      {
        id: 'act-export',
        title: 'Export Globe Code & Assets',
        subtitle: 'React, Vue, Svelte, Vanilla or ZIP download',
        category: 'Action',
        action: () => setExportModalOpen(true),
      },
      {
        id: 'act-save',
        title: 'Save to InsForge Cloud',
        subtitle: 'Persist current scene to PostgreSQL backend',
        category: 'Action',
        action: () => saveCurrentProject(),
      },
      {
        id: 'act-projects',
        title: 'Open Projects Library',
        subtitle: 'View saved cloud globes and local drafts',
        category: 'Action',
        action: () => setProjectsDrawerOpen(true),
      },
      {
        id: 'act-theme',
        title: 'Toggle Color Theme',
        subtitle: 'Switch between light and dark duality modes',
        category: 'Action',
        action: () => toggleTheme(),
      },
      {
        id: 'act-auth',
        title: 'Account & Cloud Sync',
        subtitle: 'Sign in or create an InsForge account',
        category: 'Action',
        action: () => setAuthModalOpen(true),
      },
      // Modes
      {
        id: 'mode-studio',
        title: 'Switch to Studio Viewport',
        subtitle: 'Visual interactive 3D editor',
        category: 'Navigation',
        action: () => setStudioMode('studio'),
      },
      {
        id: 'mode-code',
        title: 'Switch to Code Inspector',
        subtitle: 'Real-time bidirectional JSON & framework codegen',
        category: 'Navigation',
        action: () => setStudioMode('code'),
      },
      {
        id: 'mode-preview',
        title: 'Switch to Fullscreen Preview',
        subtitle: 'Uncluttered presentation view',
        category: 'Navigation',
        action: () => setStudioMode('preview'),
      },
      // Focus Cities
      {
        id: 'focus-tokyo',
        title: 'Focus Camera: Tokyo',
        subtitle: 'Lat: 35.6762, Lon: 139.6503',
        category: 'Focus City',
        action: () => {
          updateTransform({ phi: 0.62, theta: 2.43 });
        },
      },
      {
        id: 'focus-sf',
        title: 'Focus Camera: San Francisco',
        subtitle: 'Lat: 37.7749, Lon: -122.4194',
        category: 'Focus City',
        action: () => {
          updateTransform({ phi: 0.65, theta: -2.13 });
        },
      },
      {
        id: 'focus-london',
        title: 'Focus Camera: London',
        subtitle: 'Lat: 51.5074, Lon: -0.1278',
        category: 'Focus City',
        action: () => {
          updateTransform({ phi: 0.89, theta: 0.0 });
        },
      },
      {
        id: 'focus-singapore',
        title: 'Focus Camera: Singapore',
        subtitle: 'Lat: 1.3521, Lon: 103.8198',
        category: 'Focus City',
        action: () => {
          updateTransform({ phi: 0.02, theta: 1.81 });
        },
      },
    ];

    // Presets
    Object.entries(PRESETS).forEach(([key, preset]) => {
      list.push({
        id: `preset-${key}`,
        title: `Apply Preset: ${preset.name}`,
        subtitle: preset.description,
        category: 'Presets',
        action: () => applyPreset(key),
      });
    });

    return list;
  }, [
    applyPreset,
    saveCurrentProject,
    setAuthModalOpen,
    setExportModalOpen,
    setProjectsDrawerOpen,
    setStudioMode,
    toggleTheme,
    updateTransform,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.subtitle.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-surface-primary dark:bg-surface-elevated rounded-2xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-search"
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle bg-surface-secondary/40">
          <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="command-palette-search"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search presets, or navigate..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-surface-tertiary text-text-tertiary border border-border-subtle">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-secondary">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-semibold truncate">{item.title}</div>
                    <div className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                      {item.subtitle}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-secondary text-text-tertiary border border-border-subtle'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-secondary flex items-center justify-between text-[11px] text-text-tertiary">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono font-bold">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono font-bold">↵</kbd> select</span>
          </div>
          <span>Orblob Command Palette</span>
        </div>
      </div>
    </div>
  );
};

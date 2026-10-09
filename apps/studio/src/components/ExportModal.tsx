'use client';

import React, { useState } from 'react';
import { useStudioStore } from '../lib/store';
import { generateCode, generateProjectZip, FrameworkTarget } from '@orblob/codegen';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setExportModalOpen, scene } = useStudioStore();
  const [target, setTarget] = useState<FrameworkTarget>('react-ts');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tab, setTab] = useState<'code' | 'cli' | 'download'>('code');

  if (!isExportModalOpen) return null;

  const code = generateCode(scene, target);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateProjectZip(scene, target, 'orblob-starter');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orblob-starter-${target}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const frameworks: { id: FrameworkTarget; label: string }[] = [
    { id: 'react-ts', label: 'React (TS)' },
    { id: 'react-js', label: 'React (JS)' },
    { id: 'nextjs', label: 'Next.js' },
    { id: 'vue', label: 'Vue 3' },
    { id: 'svelte', label: 'Svelte' },
    { id: 'vanilla-ts', label: 'Vanilla TS' },
    { id: 'vanilla-js', label: 'Vanilla JS' },
    { id: 'core-webgl', label: 'Core WebGL2' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-surface-primary dark:bg-surface-elevated rounded-2xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div>
            <h2 id="export-modal-title" className="text-lg font-bold text-text-primary">
              Export & Integrate Orblob
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Production-ready WebGL2 globe code tailored for your preferred framework
            </p>
          </div>
          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 flex gap-2 border-b border-border-subtle bg-surface-secondary/40">
          <button
            onClick={() => setTab('code')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'code'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Framework Code
          </button>
          <button
            onClick={() => setTab('cli')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'cli'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Installation & CLI
          </button>
          <button
            onClick={() => setTab('download')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'download'
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Project Download (.zip)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'code' && (
            <>
              {/* Framework pill selector */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-surface-secondary rounded-xl">
                {frameworks.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTarget(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      target === f.id
                        ? 'bg-surface-primary dark:bg-surface-elevated text-text-primary shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Code Preview Card */}
              <div className="relative rounded-xl border border-border-subtle bg-black/90 dark:bg-black/80 p-4 font-mono text-xs overflow-x-auto text-emerald-300 max-h-[400px]">
                <pre>{code}</pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-surface-elevated/80 hover:bg-surface-elevated text-white text-xs font-sans font-medium flex items-center gap-1.5 shadow transition-all border border-white/10"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Snippet
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {tab === 'cli' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border-subtle bg-surface-secondary">
                <span className="text-xs font-semibold text-text-primary">Install via Package Manager</span>
                <p className="text-xs text-text-secondary mt-1 mb-2">
                  Add Orblob packages to your existing frontend project:
                </p>
                <div className="p-3 bg-black/90 rounded-lg font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <code>npm install @orblob/react @orblob/config</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('npm install @orblob/react @orblob/config');
                    }}
                    className="text-text-tertiary hover:text-white text-xs font-sans px-2 py-1 rounded bg-white/10"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border-subtle bg-surface-secondary">
                <span className="text-xs font-semibold text-text-primary">Orblob CLI Generator</span>
                <p className="text-xs text-text-secondary mt-1 mb-2">
                  Scaffold a globe directly from your terminal using our zero-config CLI:
                </p>
                <div className="p-3 bg-black/90 rounded-lg font-mono text-xs text-emerald-300 flex items-center justify-between">
                  <code>npx @orblob/cli create my-globe --preset dark-space</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('npx @orblob/cli create my-globe --preset dark-space');
                    }}
                    className="text-text-tertiary hover:text-white text-xs font-sans px-2 py-1 rounded bg-white/10"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'download' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-glow text-accent flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-semibold text-text-primary">
                  Download Full Starter Project
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Includes full Vite setup, package.json with dependencies, current globe configuration, and framework bindings.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="py-2.5 px-6 rounded-xl font-semibold text-sm bg-accent text-white shadow-md hover:bg-accent-hover transition-all flex items-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating ZIP archive...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download .ZIP Package
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-surface-secondary flex items-center justify-between text-xs text-text-secondary">
          <span>Target: <strong className="text-text-primary font-mono">{target}</strong></span>
          <button
            onClick={() => setExportModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-surface-primary dark:bg-surface-elevated text-text-primary border border-border-subtle hover:bg-surface-secondary transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

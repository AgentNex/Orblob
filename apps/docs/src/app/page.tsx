'use client';

import React, { useState } from 'react';
import { Globe } from '@orblob/react';
import { PRESETS, SceneConfig, createDefaultScene } from '@orblob/config';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  Terminal,
  Zap,
  Globe2,
  Shield,
  Box,
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [activePreset, setActivePreset] = useState<string>('minimal');
  const [currentScene, setCurrentScene] = useState<SceneConfig>(() => PRESETS.minimal?.config || createDefaultScene());
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleSelectPreset = (key: string) => {
    setActivePreset(key);
    if (PRESETS[key]) {
      setCurrentScene(PRESETS[key].config);
    }
  };

  const sections = [
    { id: 'overview', title: 'Overview & Philosophy', icon: Globe2 },
    { id: 'installation', title: 'Installation', icon: Terminal },
    { id: 'quickstart', title: 'Quick Start', icon: Zap },
    { id: 'react', title: 'React & Next.js', icon: Code2 },
    { id: 'vue-svelte', title: 'Vue & Svelte', icon: Layers },
    { id: 'vanilla', title: 'Vanilla & Core WebGL2', icon: Cpu },
    { id: 'config', title: 'Configuration API', icon: BookOpen },
    { id: 'presets', title: '13 Presets Catalog', icon: Sparkles },
    { id: 'insforge', title: 'InsForge BaaS & Cloud', icon: Shield },
    { id: 'performance', title: 'Performance & 60fps', icon: Box },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-base shadow-sm">
            O
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-text">Orblob</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-accent-glow text-accent">
                v1.0.0
              </span>
            </div>
            <span className="text-[11px] text-text-dim block -mt-0.5">WebGL2 Globe Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/AgentNex/Orblob"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-dim hover:text-text hover:bg-surface-elevated transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-sm"
          >
            <span>Launch Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 border-r border-border p-6 hidden md:block flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="text-2xs font-mono uppercase tracking-wider text-text-muted mb-3 font-semibold">
            Documentation
          </div>
          <nav className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-glow text-accent font-semibold'
                      : 'text-text-dim hover:text-text hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3.5 rounded-xl border border-border bg-surface-elevated text-2xs space-y-1.5">
            <div className="font-semibold text-text flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" /> Zero Three.js
            </div>
            <p className="text-text-dim leading-relaxed">
              Native WebGL2 fragment shaders with raymarched Fibonacci dots and quadratic Bézier arc geometry.
            </p>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-16 overflow-y-auto">
          {/* Hero Section */}
          <section className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-glow text-accent text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Direct WebGL2 Architecture
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text">
              High-performance 3D globes for the modern web.
            </h1>
            <p className="text-base text-text-dim leading-relaxed">
              Orblob is a featherweight, hardware-accelerated globe engine designed as a drop-in component.
              Featuring mathematically perfect Fibonacci dot distribution, instanced Bézier arc ribbons, 
              DOM-anchored labels, and cloud project sync via InsForge BaaS.
            </p>

            {/* Live Interactive Globe Showcase */}
            <div className="mt-6 p-6 rounded-2xl border border-border bg-surface-elevated/80 flex flex-col items-center">
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {Object.keys(PRESETS).slice(0, 6).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                      activePreset === key
                        ? 'bg-accent text-white shadow-sm font-semibold'
                        : 'border border-border bg-surface text-text-dim hover:text-text'
                    }`}
                  >
                    {PRESETS[key].name}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                <Globe config={currentScene} autoRotate={true} />
              </div>

              <p className="text-xs text-text-muted mt-4 font-mono">
                Interactive WebGL2 Canvas • Preset: {PRESETS[activePreset]?.name || 'Minimal'}
              </p>
            </div>
          </section>

          {/* Quickstart Section */}
          <section id="quickstart" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text">Quick Start</h2>
            <p className="text-sm text-text-dim">
              Get an interactive globe running in your React or Next.js project in under two minutes:
            </p>

            <div className="relative rounded-xl border border-border bg-black/90 p-4 font-mono text-xs text-emerald-300">
              <pre>{`npm install @orblob/react @orblob/config`}</pre>
              <button
                onClick={() => handleCopy(`npm install @orblob/react @orblob/config`, 'npm-install')}
                className="absolute top-3 right-3 p-1.5 rounded bg-white/10 text-white hover:bg-white/20"
              >
                {copiedSnippet === 'npm-install' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="relative rounded-xl border border-border bg-black/90 p-4 font-mono text-xs text-emerald-300">
              <pre>{`import { Globe } from '@orblob/react';
import { PRESETS } from '@orblob/config';

export default function MyPage() {
  return (
    <div className="w-[500px] h-[500px]">
      <Globe config={PRESETS.minimal.config} autoRotate={true} />
    </div>
  );
}`}</pre>
              <button
                onClick={() =>
                  handleCopy(
                    `import { Globe } from '@orblob/react';\nimport { PRESETS } from '@orblob/config';\n\nexport default function MyPage() {\n  return (\n    <div className="w-[500px] h-[500px]">\n      <Globe config={PRESETS.minimal.config} autoRotate={true} />\n    </div>\n  );\n}`,
                    'react-quickstart'
                  )
                }
                className="absolute top-3 right-3 p-1.5 rounded bg-white/10 text-white hover:bg-white/20"
              >
                {copiedSnippet === 'react-quickstart' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </section>

          {/* Multi-framework Section */}
          <section id="react" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text">Framework Integrations</h2>
            <p className="text-sm text-text-dim">
              Orblob provides native first-class wrappers for all leading modern frameworks:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                <span className="font-semibold text-xs text-text block mb-1">React & Next.js</span>
                <code className="text-2xs font-mono text-accent block mb-2">@orblob/react</code>
                <p className="text-xs text-text-dim">
                  Includes <code>&lt;Globe /&gt;</code> and <code>useGlobe</code> hook with SSR-safe canvas hydration.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                <span className="font-semibold text-xs text-text block mb-1">Vue 3</span>
                <code className="text-2xs font-mono text-accent block mb-2">@orblob/vue</code>
                <p className="text-xs text-text-dim">
                  Composition API composable <code>useGlobe</code> and reactive <code>&lt;Globe /&gt;</code> component.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                <span className="font-semibold text-xs text-text block mb-1">Svelte 5</span>
                <code className="text-2xs font-mono text-accent block mb-2">@orblob/svelte</code>
                <p className="text-xs text-text-dim">
                  Lightweight Svelte action <code>use:globe</code> for zero-overhead lifecycle management.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-elevated">
                <span className="font-semibold text-xs text-text block mb-1">Vanilla JS & Core WebGL2</span>
                <code className="text-2xs font-mono text-accent block mb-2">@orblob/core</code>
                <p className="text-xs text-text-dim">
                  Direct shader pipeline with zero external runtime dependencies.
                </p>
              </div>
            </div>
          </section>

          {/* InsForge BaaS Section */}
          <section id="insforge" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text">InsForge Cloud Persistence & RLS</h2>
            <p className="text-sm text-text-dim">
              Orblob Studio connects seamlessly to InsForge BaaS for cloud project storage:
            </p>

            <ul className="list-disc pl-5 text-xs text-text-dim space-y-2">
              <li>
                <strong className="text-text">PostgreSQL Database:</strong> Schema with <code>projects</code>, <code>project_members</code>, and <code>project_versions</code>.
              </li>
              <li>
                <strong className="text-text">Row-Level Security (RLS):</strong> Projects are owned by authenticated InsForge user IDs and isolated per user.
              </li>
              <li>
                <strong className="text-text">Instant Sync & Autosave:</strong> Debounced autosave mechanism syncs canvas modifications directly to the cloud.
              </li>
            </ul>
          </section>

          {/* Performance Section */}
          <section id="performance" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text">Performance & 60 FPS Guarantees</h2>
            <p className="text-sm text-text-dim">
              Architectural decisions ensuring silky smooth frame rates across desktop and mobile devices:
            </p>
            <div className="p-4 rounded-xl border border-border bg-surface-elevated text-xs space-y-2 text-text-dim">
              <p>
                • <strong>Device Pixel Ratio Clamping:</strong> Automatically caps DPR to 2.0 to prevent mobile GPU thermal throttling on retina displays.
              </p>
              <p>
                • <strong>Zero Garbage Collection:</strong> Preallocated typed arrays for raymarching uniforms and arc vertex matrices.
              </p>
              <p>
                • <strong>CSS Anchor Projection:</strong> Text labels and pills are rendered in regular DOM layers projected via 3D matrix math, allowing full CSS styling without rasterizing text into WebGL textures.
              </p>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-elevated py-6 px-6 text-center text-xs text-text-muted">
        <p>Orblob • Open-Source WebGL2 Globe Studio & Library • Released under MIT License</p>
      </footer>
    </div>
  );
}

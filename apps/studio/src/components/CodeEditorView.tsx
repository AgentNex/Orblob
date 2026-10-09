'use client';

import React, { useState } from 'react';
import { useStudioStore } from '../lib/store';
import { generateCode, FrameworkTarget } from '@orblob/codegen';
import { validateSceneConfig } from '@orblob/config';
import { Copy, Check, Download, AlertCircle, FileCode, Braces } from 'lucide-react';

export default function CodeEditorView() {
  const { scene, setScene } = useStudioStore();
  const [selectedTarget, setSelectedTarget] = useState<FrameworkTarget>('react-ts');
  const [viewMode, setViewMode] = useState<'component' | 'json'>('component');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(scene, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatedCode = generateCode(scene, selectedTarget);

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    try {
      const parsed = JSON.parse(val);
      const res = validateSceneConfig(parsed);
      if (res.success) {
        setJsonError(null);
        setScene(res.data);
      } else {
        setJsonError(res.error);
      }
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleCopy = () => {
    const textToCopy = viewMode === 'component' ? generatedCode : jsonText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface select-none">
      {/* Top Code Bar */}
      <div className="h-11 border-b border-border bg-surface-elevated px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center border border-border rounded bg-surface p-0.5 text-2xs font-mono">
            <button
              onClick={() => setViewMode('component')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'component' ? 'bg-ink text-white font-medium' : 'text-text-dim hover:text-text'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>Component Code</span>
            </button>
            <button
              onClick={() => {
                setViewMode('json');
                setJsonText(JSON.stringify(scene, null, 2));
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'json' ? 'bg-ink text-white font-medium' : 'text-text-dim hover:text-text'
              }`}
            >
              <Braces className="w-3 h-3" />
              <span>Live JSON Config</span>
            </button>
          </div>

          {/* Framework Target selector */}
          {viewMode === 'component' && (
            <div className="hidden sm:flex items-center gap-1 border-l border-border pl-3">
              {(
                [
                  ['react-ts', 'React (TS)'],
                  ['nextjs', 'Next.js'],
                  ['vue', 'Vue 3'],
                  ['svelte', 'Svelte'],
                  ['vanilla-ts', 'Vanilla'],
                  ['core-webgl', 'WebGL2 API'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setSelectedTarget(id)}
                  className={`px-2 py-1 rounded text-2xs font-mono transition-colors ${
                    selectedTarget === id
                      ? 'bg-ink/10 text-ink border border-ink/30 font-semibold'
                      : 'text-text-dim hover:text-text hover:bg-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded border border-border hover:border-ink bg-surface text-2xs font-mono text-text transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-text-dim" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-surface">
        {jsonError && viewMode === 'json' && (
          <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-500 px-4 py-1.5 text-2xs font-mono flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{jsonError}</span>
          </div>
        )}

        <div className="flex-1 p-4 overflow-auto">
          {viewMode === 'component' ? (
            <pre className="font-mono text-xs leading-relaxed text-text select-text whitespace-pre overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          ) : (
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full h-full font-mono text-xs leading-relaxed bg-transparent text-text outline-none resize-none border-0 select-text"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

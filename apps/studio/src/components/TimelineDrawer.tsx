'use client';

import React, { useState } from 'react';
import { useStudioStore } from '../lib/store';

export const TimelineDrawer: React.FC = () => {
  const { scene, updateTransform } = useStudioStore();
  const [isOpen, setIsOpen] = useState(false);

  const isAutoRotate = scene.transform.autoRotate;
  const speed = scene.transform.autoRotateSpeed;
  const phi = scene.transform.phi;
  const theta = scene.transform.theta;

  return (
    <div className="border-t border-border-subtle bg-surface-primary dark:bg-surface-elevated/95 backdrop-blur z-20 transition-all duration-200">
      {/* Toggle header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/50 text-xs text-text-secondary select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 font-semibold text-text-primary hover:text-accent transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span>Animation & Timeline</span>
          </button>
          <span className="text-[11px] text-text-tertiary">
            {isAutoRotate ? '• Running' : '• Paused'}
          </span>
        </div>

        {/* Quick transport controls inline */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateTransform({ autoRotate: !isAutoRotate })}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isAutoRotate
                ? 'bg-accent text-white border-accent'
                : 'border-border-subtle hover:bg-surface-secondary text-text-secondary'
            }`}
            title={isAutoRotate ? 'Pause Rotation' : 'Play Auto-Rotation'}
          >
            {isAutoRotate ? (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            <span className="text-[11px] font-semibold">{isAutoRotate ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => updateTransform({ phi: 0, theta: 0 })}
            className="p-1.5 rounded-lg border border-border-subtle text-text-tertiary hover:text-text-primary hover:bg-surface-secondary text-[11px]"
            title="Reset Angle"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Expanded scrubber and controls */}
      {isOpen && (
        <div className="p-4 px-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-200">
          {/* Phi / Latitude scrub */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-secondary">Pitch / Phi (Latitude)</span>
              <span className="font-mono text-text-primary text-[11px]">{phi.toFixed(2)} rad</span>
            </div>
            <input
              type="range"
              min={-Math.PI / 2}
              max={Math.PI / 2}
              step={0.01}
              value={phi}
              onChange={(e) => updateTransform({ phi: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Theta / Longitude scrub */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-secondary">Yaw / Theta (Longitude)</span>
              <span className="font-mono text-text-primary text-[11px]">{theta.toFixed(2)} rad</span>
            </div>
            <input
              type="range"
              min={-Math.PI * 2}
              max={Math.PI * 2}
              step={0.01}
              value={theta}
              onChange={(e) => updateTransform({ theta: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Speed scrub */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-secondary">Rotation Speed</span>
              <span className="font-mono text-text-primary text-[11px]">{(speed * 1000).toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.05}
              step={0.001}
              value={speed}
              onChange={(e) => updateTransform({ autoRotateSpeed: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-surface-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

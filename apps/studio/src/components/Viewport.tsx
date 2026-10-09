'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Globe } from '@orblob/react';
import { GlobeInstance } from '@orblob/core';
import { useStudioStore } from '../lib/store';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
} from 'lucide-react';

export default function Viewport() {
  const {
    scene,
    devicePreview,
    updateTransform,
    updateAppearance,
    activeMarkerId,
    setActiveMarker,
  } = useStudioStore();

  const globeRef = useRef<GlobeInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [projectedLabels, setProjectedLabels] = useState<
    Array<{ id: string; text: string; subtitle?: string; style: string; x: number; y: number; visible: boolean }>
  >([]);

  // Update label screen projections on render or frame tick
  useEffect(() => {
    let animId: number;

    const syncLabels = () => {
      if (globeRef.current && scene.labels.length > 0) {
        const list = scene.labels
          .map((label) => {
            let loc: [number, number] | undefined;
            if (label.targetType === 'marker') {
              const m = scene.markers.find((item) => item.id === label.targetId);
              loc = m?.location;
            } else {
              loc = label.location;
            }

            if (!loc) return null;

            const coords = globeRef.current!.getScreenCoordinates(loc, 0.06);
            return {
              id: label.id,
              text: label.text,
              subtitle: label.subtitle,
              style: label.style,
              x: coords.x * 100,
              y: coords.y * 100,
              visible: coords.visible && label.visible,
            };
          })
          .filter(Boolean) as any[];

        setProjectedLabels(list);
      }
      animId = requestAnimationFrame(syncLabels);
    };

    animId = requestAnimationFrame(syncLabels);
    return () => cancelAnimationFrame(animId);
  }, [scene.labels, scene.markers]);

  const handleResetCamera = () => {
    updateTransform({ phi: 0, theta: 0.2 });
    updateAppearance({ scale: 1 });
  };

  const handleFocusCity = (lat: number, lon: number) => {
    globeRef.current?.focusLocation(lat, lon, 1200);
  };

  // Determine viewport width based on device preview
  let containerWidthClass = 'w-full h-full max-w-[680px]';
  if (devicePreview === 'tablet') {
    containerWidthClass = 'w-[600px] h-[600px] border border-border shadow-md rounded-xl p-4 bg-surface';
  } else if (devicePreview === 'mobile') {
    containerWidthClass = 'w-[360px] h-[360px] border border-border shadow-md rounded-2xl p-2 bg-surface';
  }

  return (
    <main className="flex-1 bg-surface-sunken flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
      {/* Top HUD Toolbar */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 bg-surface/90 backdrop-blur border border-border rounded-md px-2 py-1 text-2xs font-mono text-text-dim shadow-sm">
        <Compass className="w-3.5 h-3.5 text-ink" />
        <span>
          Φ: {(scene.transform.phi % (Math.PI * 2)).toFixed(2)} rad · Θ: {scene.transform.theta.toFixed(2)} rad
        </span>
      </div>

      {/* City Focus Pills */}
      <div className="absolute top-3 right-4 z-20 hidden sm:flex items-center gap-1 bg-surface/90 backdrop-blur border border-border rounded-md p-1 text-3xs font-mono shadow-sm">
        <span className="text-text-dim px-1">Focus:</span>
        <button
          onClick={() => handleFocusCity(37.77, -122.42)}
          className="px-2 py-0.5 rounded hover:bg-surface-elevated text-text hover:text-ink transition-colors"
        >
          SF
        </button>
        <button
          onClick={() => handleFocusCity(40.71, -74.01)}
          className="px-2 py-0.5 rounded hover:bg-surface-elevated text-text hover:text-ink transition-colors"
        >
          NYC
        </button>
        <button
          onClick={() => handleFocusCity(51.51, -0.13)}
          className="px-2 py-0.5 rounded hover:bg-surface-elevated text-text hover:text-ink transition-colors"
        >
          London
        </button>
        <button
          onClick={() => handleFocusCity(35.68, 139.69)}
          className="px-2 py-0.5 rounded hover:bg-surface-elevated text-text hover:text-ink transition-colors"
        >
          Tokyo
        </button>
      </div>

      {/* Main Viewport Container */}
      <div
        ref={containerRef}
        className={`relative flex items-center justify-center aspect-square transition-all duration-300 ${containerWidthClass}`}
      >
        {/* Orbit Text Ring (Derived from COBE reference) */}
        {scene.atmosphere.showOrbitRing && (
          <div
            className="absolute inset-[-4%] pointer-events-none z-10"
            style={{
              maskImage: 'linear-gradient(rgba(0,0,0,0.1) 40%, #000 50%, #000 100%)',
              WebkitMaskImage: 'linear-gradient(rgba(0,0,0,0.1) 40%, #000 50%, #000 100%)',
            }}
          >
            <svg className="orbit-svg w-full h-full" viewBox="0 0 300 300">
              <defs>
                <path
                  id="studioOrbitPath"
                  d="M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0"
                />
              </defs>
              <text className="font-mono text-[6.5px] uppercase tracking-[0.14em] fill-ink font-semibold">
                <textPath href="#studioOrbitPath">
                  {scene.atmosphere.orbitRingText.repeat(3)}
                </textPath>
              </text>
            </svg>
          </div>
        )}

        {/* Live WebGL2 Globe */}
        <div className="w-full h-full relative">
          <Globe
            ref={globeRef}
            config={scene}
            interactive={true}
            autoRotate={scene.transform.autoRotate}
            className="rounded-full overflow-hidden"
          />

          {/* Anchored DOM Labels */}
          {projectedLabels.map((lbl) => {
            if (!lbl.visible) return null;
            return (
              <div
                key={lbl.id}
                style={{
                  left: `${lbl.x}%`,
                  top: `${lbl.y}%`,
                }}
                className={lbl.style === 'card' ? 'marker-card' : 'marker-pill'}
              >
                <div>{lbl.text}</div>
                {lbl.subtitle && lbl.style === 'card' && (
                  <div className="marker-card-subtitle">{lbl.subtitle}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom HUD Controls */}
      <div className="absolute bottom-4 z-20 flex items-center gap-1.5 bg-surface/90 backdrop-blur border border-border rounded-lg p-1 text-xs shadow-md">
        <button
          onClick={() => updateTransform({ autoRotate: !scene.transform.autoRotate })}
          className={`p-1.5 rounded transition-colors ${
            scene.transform.autoRotate ? 'bg-ink text-white' : 'hover:bg-surface-elevated text-text'
          }`}
          title={scene.transform.autoRotate ? 'Pause Rotation' : 'Auto-Rotate'}
        >
          {scene.transform.autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded hover:bg-surface-elevated text-text-dim hover:text-text transition-colors"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-0.5" />

        <button
          onClick={() => updateAppearance({ scale: Math.min(2.5, scene.appearance.scale + 0.15) })}
          className="p-1.5 rounded hover:bg-surface-elevated text-text-dim hover:text-text transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => updateAppearance({ scale: Math.max(0.4, scene.appearance.scale - 0.15) })}
          className="p-1.5 rounded hover:bg-surface-elevated text-text-dim hover:text-text transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </main>
  );
}

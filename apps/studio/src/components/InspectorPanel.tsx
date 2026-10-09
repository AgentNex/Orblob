'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Palette,
  RotateCw,
  Sparkles,
  MapPin,
  Route,
  Tag,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useStudioStore } from '../lib/store';
import { PRESETS } from '@orblob/config';
import { hexToRgb, rgbToHex } from '@orblob/core';

export default function InspectorPanel() {
  const {
    scene,
    updateAppearance,
    updateTransform,
    updateAtmosphere,
    activeMarkerId,
    updateMarker,
    deleteMarker,
    activeArcId,
    updateArc,
    deleteArc,
    activeLabelId,
    updateLabel,
    deleteLabel,
    applyPreset,
  } = useStudioStore();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    presets: true,
    transform: true,
    appearance: true,
    atmosphere: false,
    selected: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeMarker = scene.markers.find((m) => m.id === activeMarkerId);
  const activeArc = scene.arcs.find((a) => a.id === activeArcId);
  const activeLabel = scene.labels.find((l) => l.id === activeLabelId);

  return (
    <aside className="w-80 border-l border-border bg-surface flex flex-col h-full select-none text-xs overflow-y-auto">
      {/* Header */}
      <div className="h-9 px-3 border-b border-border flex items-center justify-between text-2xs font-mono font-semibold tracking-wider text-text-dim uppercase sticky top-0 bg-surface z-10">
        <span>Inspector</span>
        <span className="text-3xs text-ink font-mono lowercase">live sync</span>
      </div>

      <div className="p-3 space-y-4">
        {/* Presets Quick Strip */}
        <div className="border border-border rounded-md overflow-hidden bg-surface-elevated">
          <div
            onClick={() => toggleSection('presets')}
            className="p-2 flex items-center justify-between cursor-pointer font-mono text-2xs font-semibold text-text uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5 text-ink">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presets & Themes</span>
            </div>
            {openSections.presets ? <ChevronDown className="w-3 h-3 text-text-dim" /> : <ChevronRight className="w-3 h-3 text-text-dim" />}
          </div>

          {openSections.presets && (
            <div className="p-2 pt-0 grid grid-cols-2 gap-1.5">
              {Object.entries(PRESETS).map(([id, def]) => (
                <button
                  key={id}
                  onClick={() => applyPreset(id)}
                  className="text-left px-2 py-1.5 rounded border border-border/80 hover:border-ink hover:bg-surface text-2xs font-mono transition-colors truncate"
                  title={def.description}
                >
                  <span className="font-semibold block truncate text-text">{def.name}</span>
                  <span className="text-3xs text-text-dim truncate block">{def.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Element Editor (if any is active) */}
        {(activeMarker || activeArc || activeLabel) && (
          <div className="border border-ink/40 rounded-md overflow-hidden bg-ink/5 p-2.5 space-y-3">
            {/* Active Marker */}
            {activeMarker && (
              <>
                <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-2xs font-semibold text-ink">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Marker: {activeMarker.name}</span>
                  </div>
                  <button
                    onClick={() => deleteMarker(activeMarker.id)}
                    className="text-3xs text-rose-500 hover:underline font-mono"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-3xs font-mono text-text-dim">Name</label>
                    <input
                      type="text"
                      value={activeMarker.name}
                      onChange={(e) => updateMarker(activeMarker.id, { name: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-3xs font-mono text-text-dim">Latitude (°)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={activeMarker.location[0]}
                        onChange={(e) =>
                          updateMarker(activeMarker.id, {
                            location: [parseFloat(e.target.value) || 0, activeMarker.location[1]],
                          })
                        }
                        className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-3xs font-mono text-text-dim">Longitude (°)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={activeMarker.location[1]}
                        onChange={(e) =>
                          updateMarker(activeMarker.id, {
                            location: [activeMarker.location[0], parseFloat(e.target.value) || 0],
                          })
                        }
                        className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-mono text-text-dim">Size ({activeMarker.size.toFixed(3)})</label>
                    <input
                      type="range"
                      min="0.01"
                      max="0.1"
                      step="0.005"
                      value={activeMarker.size}
                      onChange={(e) => updateMarker(activeMarker.id, { size: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-mono text-text-dim">Color</label>
                    <input
                      type="color"
                      value={rgbToHex(activeMarker.color || [0.2, 0.4, 1])}
                      onChange={(e) => updateMarker(activeMarker.id, { color: hexToRgb(e.target.value) })}
                      className="w-7 h-6 rounded border border-border cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-3xs font-mono text-text">Pulsing Beacon</span>
                    <input
                      type="checkbox"
                      checked={activeMarker.pulse ?? true}
                      onChange={(e) => updateMarker(activeMarker.id, { pulse: e.target.checked })}
                      className="rounded accent-ink"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Active Arc */}
            {activeArc && (
              <>
                <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-2xs font-semibold text-ink">
                    <Route className="w-3.5 h-3.5" />
                    <span>Arc: {activeArc.name}</span>
                  </div>
                  <button
                    onClick={() => deleteArc(activeArc.id)}
                    className="text-3xs text-rose-500 hover:underline font-mono"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-3xs font-mono text-text-dim">Name</label>
                    <input
                      type="text"
                      value={activeArc.name}
                      onChange={(e) => updateArc(activeArc.id, { name: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-mono text-text-dim">Curve Height ({activeArc.height?.toFixed(2) ?? '0.30'})</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={activeArc.height ?? 0.3}
                      onChange={(e) => updateArc(activeArc.id, { height: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-mono text-text-dim">Thickness ({activeArc.width?.toFixed(1) ?? '0.5'})</label>
                    <input
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.1"
                      value={activeArc.width ?? 0.5}
                      onChange={(e) => updateArc(activeArc.id, { width: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-3xs font-mono text-text-dim">Color</label>
                    <input
                      type="color"
                      value={rgbToHex(activeArc.color || [0.3, 0.5, 1])}
                      onChange={(e) => updateArc(activeArc.id, { color: hexToRgb(e.target.value) })}
                      className="w-7 h-6 rounded border border-border cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Active Label */}
            {activeLabel && (
              <>
                <div className="flex items-center justify-between border-b border-ink/20 pb-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-2xs font-semibold text-ink">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Label: {activeLabel.text}</span>
                  </div>
                  <button
                    onClick={() => deleteLabel(activeLabel.id)}
                    className="text-3xs text-rose-500 hover:underline font-mono"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-3xs font-mono text-text-dim">Text</label>
                    <input
                      type="text"
                      value={activeLabel.text}
                      onChange={(e) => updateLabel(activeLabel.id, { text: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-mono text-text-dim">Subtitle</label>
                    <input
                      type="text"
                      value={activeLabel.subtitle || ''}
                      onChange={(e) => updateLabel(activeLabel.id, { subtitle: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-3xs font-mono text-text-dim">Style</label>
                    <select
                      value={activeLabel.style}
                      onChange={(e) => updateLabel(activeLabel.id, { style: e.target.value as any })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs"
                    >
                      <option value="pill">Pill (Minimal)</option>
                      <option value="card">Card (Technical)</option>
                      <option value="minimal">Minimal Text</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Transform & Motion */}
        <div className="border border-border rounded-md overflow-hidden bg-surface-elevated">
          <div
            onClick={() => toggleSection('transform')}
            className="p-2.5 flex items-center justify-between cursor-pointer font-mono text-2xs font-semibold text-text uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5 text-text">
              <RotateCw className="w-3.5 h-3.5 text-ink" />
              <span>Rotation & Camera</span>
            </div>
            {openSections.transform ? <ChevronDown className="w-3 h-3 text-text-dim" /> : <ChevronRight className="w-3 h-3 text-text-dim" />}
          </div>

          {openSections.transform && (
            <div className="p-3 pt-0 space-y-2.5 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Auto-Rotate</span>
                <input
                  type="checkbox"
                  checked={scene.transform.autoRotate}
                  onChange={(e) => updateTransform({ autoRotate: e.target.checked })}
                  className="rounded accent-ink"
                />
              </div>

              {scene.transform.autoRotate && (
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-mono text-text-dim">Speed ({(scene.transform.autoRotateSpeed * 1000).toFixed(1)})</span>
                  <input
                    type="range"
                    min="0.001"
                    max="0.015"
                    step="0.001"
                    value={scene.transform.autoRotateSpeed}
                    onChange={(e) => updateTransform({ autoRotateSpeed: parseFloat(e.target.value) })}
                    className="w-32"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Tilt Theta ({scene.transform.theta.toFixed(2)})</span>
                <input
                  type="range"
                  min="-1.2"
                  max="1.2"
                  step="0.05"
                  value={scene.transform.theta}
                  onChange={(e) => updateTransform({ theta: parseFloat(e.target.value) })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Scale ({scene.appearance.scale.toFixed(2)})</span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={scene.appearance.scale}
                  onChange={(e) => updateAppearance({ scale: parseFloat(e.target.value) })}
                  className="w-32"
                />
              </div>
            </div>
          )}
        </div>

        {/* Appearance & Lighting */}
        <div className="border border-border rounded-md overflow-hidden bg-surface-elevated">
          <div
            onClick={() => toggleSection('appearance')}
            className="p-2.5 flex items-center justify-between cursor-pointer font-mono text-2xs font-semibold text-text uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5 text-text">
              <Palette className="w-3.5 h-3.5 text-ink" />
              <span>Appearance & Shaders</span>
            </div>
            {openSections.appearance ? <ChevronDown className="w-3 h-3 text-text-dim" /> : <ChevronRight className="w-3 h-3 text-text-dim" />}
          </div>

          {openSections.appearance && (
            <div className="p-3 pt-0 space-y-2.5 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Globe Shading (Dark: {scene.appearance.dark})</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={scene.appearance.dark}
                  onChange={(e) => updateAppearance({ dark: parseFloat(e.target.value) })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Map Samples ({scene.appearance.mapSamples.toLocaleString()})</span>
                <input
                  type="range"
                  min="2000"
                  max="32000"
                  step="1000"
                  value={scene.appearance.mapSamples}
                  onChange={(e) => updateAppearance({ mapSamples: parseInt(e.target.value) })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Map Brightness ({scene.appearance.mapBrightness.toFixed(1)})</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={scene.appearance.mapBrightness}
                  onChange={(e) => updateAppearance({ mapBrightness: parseFloat(e.target.value) })}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Diffuse Light ({scene.appearance.diffuse.toFixed(1)})</span>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.1"
                  value={scene.appearance.diffuse}
                  onChange={(e) => updateAppearance({ diffuse: parseFloat(e.target.value) })}
                  className="w-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between bg-surface p-1.5 rounded border border-border">
                  <span className="text-3xs font-mono text-text-dim">Base Color</span>
                  <input
                    type="color"
                    value={rgbToHex(scene.appearance.baseColor)}
                    onChange={(e) => updateAppearance({ baseColor: hexToRgb(e.target.value) })}
                    className="w-5 h-5 rounded border border-border cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between bg-surface p-1.5 rounded border border-border">
                  <span className="text-3xs font-mono text-text-dim">Glow Color</span>
                  <input
                    type="color"
                    value={rgbToHex(scene.appearance.glowColor)}
                    onChange={(e) => updateAppearance({ glowColor: hexToRgb(e.target.value) })}
                    className="w-5 h-5 rounded border border-border cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between bg-surface p-1.5 rounded border border-border">
                  <span className="text-3xs font-mono text-text-dim">Marker Color</span>
                  <input
                    type="color"
                    value={rgbToHex(scene.appearance.markerColor)}
                    onChange={(e) => updateAppearance({ markerColor: hexToRgb(e.target.value) })}
                    className="w-5 h-5 rounded border border-border cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between bg-surface p-1.5 rounded border border-border">
                  <span className="text-3xs font-mono text-text-dim">Arc Color</span>
                  <input
                    type="color"
                    value={rgbToHex(scene.appearance.arcColor)}
                    onChange={(e) => updateAppearance({ arcColor: hexToRgb(e.target.value) })}
                    className="w-5 h-5 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Atmosphere & Orbit Ring */}
        <div className="border border-border rounded-md overflow-hidden bg-surface-elevated">
          <div
            onClick={() => toggleSection('atmosphere')}
            className="p-2.5 flex items-center justify-between cursor-pointer font-mono text-2xs font-semibold text-text uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5 text-text">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>Atmosphere & Ring</span>
            </div>
            {openSections.atmosphere ? <ChevronDown className="w-3 h-3 text-text-dim" /> : <ChevronRight className="w-3 h-3 text-text-dim" />}
          </div>

          {openSections.atmosphere && (
            <div className="p-3 pt-0 space-y-2.5 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-mono text-text-dim">Orbit Text Ring</span>
                <input
                  type="checkbox"
                  checked={scene.atmosphere.showOrbitRing}
                  onChange={(e) => updateAtmosphere({ showOrbitRing: e.target.checked })}
                  className="rounded accent-ink"
                />
              </div>

              {scene.atmosphere.showOrbitRing && (
                <div>
                  <label className="text-3xs font-mono text-text-dim">Orbit Text</label>
                  <input
                    type="text"
                    value={scene.atmosphere.orbitRingText}
                    onChange={(e) => updateAtmosphere({ orbitRingText: e.target.value })}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

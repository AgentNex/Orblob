'use client';

import React from 'react';
import {
  Globe,
  Wind,
  MapPin,
  Route,
  Tag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useStudioStore } from '../lib/store';
import { MarkerConfig, ArcConfig, LabelConfig } from '@orblob/config';

export default function LayersPanel() {
  const {
    scene,
    activeLayerId,
    setActiveLayer,
    activeMarkerId,
    setActiveMarker,
    activeArcId,
    setActiveArc,
    activeLabelId,
    setActiveLabel,
    addMarker,
    deleteMarker,
    updateMarker,
    addArc,
    deleteArc,
    updateArc,
    addLabel,
    deleteLabel,
    updateLabel,
    updateAtmosphere,
    setScene,
  } = useStudioStore();

  const handleAddNewMarker = () => {
    const id = `marker-${Date.now().toString(36)}`;
    const newMarker: MarkerConfig = {
      id,
      name: `Marker ${scene.markers.length + 1}`,
      location: [parseFloat((Math.random() * 120 - 60).toFixed(2)), parseFloat((Math.random() * 360 - 180).toFixed(2))],
      size: 0.035,
      color: [0.0, 0.27, 0.96],
      elevation: 0.05,
      visible: true,
      pulse: true,
      pulseSpeed: 1,
      glow: false,
    };
    addMarker(newMarker);
    setActiveLayer('layer-markers');
  };

  const handleAddNewArc = () => {
    const id = `arc-${Date.now().toString(36)}`;
    const newArc: ArcConfig = {
      id,
      name: `Arc ${scene.arcs.length + 1}`,
      from: [parseFloat((Math.random() * 80 - 40).toFixed(2)), parseFloat((Math.random() * 360 - 180).toFixed(2))],
      to: [parseFloat((Math.random() * 80 - 40).toFixed(2)), parseFloat((Math.random() * 360 - 180).toFixed(2))],
      color: [0.2, 0.6, 1.0],
      width: 0.5,
      height: 0.3,
      opacity: 1,
      speed: 1,
      direction: 'forward',
      visible: true,
    };
    addArc(newArc);
    setActiveLayer('layer-arcs');
  };

  const handleAddNewLabel = () => {
    const id = `label-${Date.now().toString(36)}`;
    const targetMarker = scene.markers[0];
    const newLabel: LabelConfig = {
      id,
      targetType: targetMarker ? 'marker' : 'location',
      targetId: targetMarker?.id,
      location: targetMarker ? undefined : [0, 0],
      text: `Label ${scene.labels.length + 1}`,
      subtitle: 'Anchored Tag',
      style: 'pill',
      anchorOffset: [0, 0],
      visible: true,
      hideOnBack: true,
    };
    addLabel(newLabel);
    setActiveLayer('layer-labels');
  };

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full select-none text-xs">
      {/* Panel Title */}
      <div className="h-9 px-3 border-b border-border flex items-center justify-between text-2xs font-mono font-semibold tracking-wider text-text-dim uppercase">
        <span>Scene Layers</span>
        <span className="text-3xs lowercase font-normal">
          {scene.markers.length + scene.arcs.length + scene.labels.length + 2} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Core Globe Layer */}
        <div
          onClick={() => {
            setActiveLayer('layer-globe');
            setActiveMarker(null);
            setActiveArc(null);
            setActiveLabel(null);
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
            activeLayerId === 'layer-globe' && !activeMarkerId && !activeArcId && !activeLabelId
              ? 'bg-ink/10 text-ink font-medium border border-ink/20'
              : 'hover:bg-surface-elevated text-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-ink" />
            <span>Globe Core</span>
          </div>
          <span className="text-3xs font-mono text-text-dim">WebGL2</span>
        </div>

        {/* Atmosphere Layer */}
        <div
          onClick={() => {
            setActiveLayer('layer-atmosphere');
            setActiveMarker(null);
            setActiveArc(null);
            setActiveLabel(null);
          }}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors ${
            activeLayerId === 'layer-atmosphere' && !activeMarkerId && !activeArcId && !activeLabelId
              ? 'bg-ink/10 text-ink font-medium border border-ink/20'
              : 'hover:bg-surface-elevated text-text'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-sky-500" />
            <span>Atmosphere & Ring</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateAtmosphere({ enabled: !scene.atmosphere.enabled });
            }}
            className="p-1 rounded text-text-dim hover:text-text"
          >
            {scene.atmosphere.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-text-dim/50" />}
          </button>
        </div>

        {/* Section Divider */}
        <div className="pt-2 pb-1 px-1 flex items-center justify-between text-3xs font-mono text-text-dim uppercase tracking-wider">
          <span>Markers ({scene.markers.length})</span>
          <button
            onClick={handleAddNewMarker}
            className="p-1 rounded hover:bg-surface-elevated text-ink flex items-center gap-0.5"
            title="Add Marker"
          >
            <Plus className="w-3 h-3" />
            <span className="text-3xs lowercase">Add</span>
          </button>
        </div>

        {/* Markers List */}
        {scene.markers.map((m) => (
          <div
            key={m.id}
            onClick={() => {
              setActiveLayer('layer-markers');
              setActiveMarker(m.id);
              setActiveArc(null);
              setActiveLabel(null);
            }}
            className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors pl-5 ${
              activeMarkerId === m.id
                ? 'bg-ink/10 text-ink font-medium border border-ink/20'
                : 'hover:bg-surface-elevated text-text'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: m.color
                    ? `rgb(${m.color[0] * 255},${m.color[1] * 255},${m.color[2] * 255})`
                    : 'var(--ink)',
                }}
              />
              <span className="truncate">{m.name || m.id}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateMarker(m.id, { visible: !m.visible });
                }}
                className="p-0.5 hover:text-ink text-text-dim"
              >
                {m.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-text-dim/40" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMarker(m.id);
                }}
                className="p-0.5 hover:text-rose-500 text-text-dim"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Arcs Section */}
        <div className="pt-2 pb-1 px-1 flex items-center justify-between text-3xs font-mono text-text-dim uppercase tracking-wider">
          <span>Arcs ({scene.arcs.length})</span>
          <button
            onClick={handleAddNewArc}
            className="p-1 rounded hover:bg-surface-elevated text-ink flex items-center gap-0.5"
            title="Add Arc"
          >
            <Plus className="w-3 h-3" />
            <span className="text-3xs lowercase">Add</span>
          </button>
        </div>

        {/* Arcs List */}
        {scene.arcs.map((a) => (
          <div
            key={a.id}
            onClick={() => {
              setActiveLayer('layer-arcs');
              setActiveArc(a.id);
              setActiveMarker(null);
              setActiveLabel(null);
            }}
            className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors pl-5 ${
              activeArcId === a.id
                ? 'bg-ink/10 text-ink font-medium border border-ink/20'
                : 'hover:bg-surface-elevated text-text'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Route className="w-3 h-3 text-sky-500 flex-shrink-0" />
              <span className="truncate">{a.name || a.id}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateArc(a.id, { visible: !a.visible });
                }}
                className="p-0.5 hover:text-ink text-text-dim"
              >
                {a.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-text-dim/40" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteArc(a.id);
                }}
                className="p-0.5 hover:text-rose-500 text-text-dim"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Labels Section */}
        <div className="pt-2 pb-1 px-1 flex items-center justify-between text-3xs font-mono text-text-dim uppercase tracking-wider">
          <span>Labels ({scene.labels.length})</span>
          <button
            onClick={handleAddNewLabel}
            className="p-1 rounded hover:bg-surface-elevated text-ink flex items-center gap-0.5"
            title="Add Label"
          >
            <Plus className="w-3 h-3" />
            <span className="text-3xs lowercase">Add</span>
          </button>
        </div>

        {/* Labels List */}
        {scene.labels.map((l) => (
          <div
            key={l.id}
            onClick={() => {
              setActiveLayer('layer-labels');
              setActiveLabel(l.id);
              setActiveMarker(null);
              setActiveArc(null);
            }}
            className={`group flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-colors pl-5 ${
              activeLabelId === l.id
                ? 'bg-ink/10 text-ink font-medium border border-ink/20'
                : 'hover:bg-surface-elevated text-text'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Tag className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="truncate">{l.text || l.id}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateLabel(l.id, { visible: !l.visible });
                }}
                className="p-0.5 hover:text-ink text-text-dim"
              >
                {l.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-text-dim/40" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLabel(l.id);
                }}
                className="p-0.5 hover:text-rose-500 text-text-dim"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

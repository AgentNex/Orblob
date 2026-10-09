# Orblob 🌐

> **Next-Generation Lightweight WebGL2 Interactive Globe Engine & Visual Studio**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![WebGL2](https://img.shields.io/badge/WebGL2-Hardware%20Accelerated-emerald.svg)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![InsForge BaaS](https://img.shields.io/badge/Backend-InsForge%20Postgres-purple.svg)](https://insforge.dev)

**Orblob** is an ultra-fast, hardware-accelerated 3D globe library and visual design studio built for modern web applications. Featuring pure WebGL2 raymarching with zero heavy 3D engine overhead (No Three.js required), Orblob delivers silky 60 FPS performance across desktop and mobile devices.

Inspired by [COBE](https://cobe.vercel.app), Orblob expands the paradigm with rich instanced quadratic Bézier flight arcs, 3D-to-2D projected DOM labels, multi-framework bindings (React, Vue, Svelte, Vanilla), and cloud project persistence powered by **InsForge BaaS**.

---

## ⚡ Highlights

- **Pure WebGL2 Fragment Shader:** Raymarched Fibonacci spiral dot-sphere with landmask sampling and dual-pass glow diffusion.
- **Instanced Bézier Ribbon Arcs:** 66-vertex instanced quadratic ribbons with animated dashed pulses and spherical elevation curvature.
- **First-Class Multi-Framework Support:**
  - `@orblob/react` — React 19 / Next.js client component with SSR-safe canvas hydration.
  - `@orblob/vue` — Vue 3 Composition API `<Globe />` and `useGlobe` composable.
  - `@orblob/svelte` — Svelte 5 zero-overhead `use:globe` action.
  - `@orblob/vanilla` — Zero-dependency DOM mounting helper with automatic ResizeObserver.
  - `@orblob/core` — Low-level pure WebGL2 engine.
  - `@orblob/config` — Strongly-typed Zod schemas with 13 built-in production presets.
  - `@orblob/codegen` — Real-time multi-target code generator & one-click standalone ZIP exporter.
- **Orblob Visual Studio (`apps/studio`):** Complete visual environment with layer hierarchy, property inspector, HUD camera controls, Cmd+K command palette, and InsForge cloud sync.
- **InsForge BaaS Persistence:** Full PostgreSQL backend integration with Row-Level Security (RLS) for cloud project saves, user drafts, and team sharing.
- **Performance First:** Automatic DPR clamping, zero GC allocations per frame, and matrix projection for sharp HTML labels without canvas text rendering overhead.

---

## 📦 Monorepo Structure

```
Orblob/
├── apps/
│   ├── studio/       # Next.js 15 App Router visual studio editor
│   └── docs/         # Interactive documentation & live demo portal
├── packages/
│   ├── config/       # Zod schemas, type definitions & 13 production presets
│   ├── core/         # Direct WebGL2 raymarching engine & math projection
│   ├── react/        # React 19 & Next.js <Globe /> component
│   ├── vue/          # Vue 3 component & composable
│   ├── svelte/       # Svelte 5 action & component
│   ├── vanilla/      # Vanilla JS mounting helper
│   └── codegen/      # Multi-framework code generator & JSZip packager
└── tests/            # Vitest unit test suite
```

---

## 🚀 Quick Start

### 1. Installation

```bash
# React / Next.js
npm install @orblob/react @orblob/config

# Vue 3
npm install @orblob/vue @orblob/config

# Svelte
npm install @orblob/svelte @orblob/config

# Vanilla JS
npm install @orblob/vanilla @orblob/config
```

### 2. Basic React Usage

```tsx
import React from 'react';
import { Globe } from '@orblob/react';
import { PRESETS } from '@orblob/config';

export default function App() {
  return (
    <div style={{ width: 600, height: 600 }}>
      <Globe 
        config={PRESETS.minimal.config} 
        autoRotate={true} 
      />
    </div>
  );
}
```

### 3. Custom Markers & Flight Arcs

```tsx
import { Globe } from '@orblob/react';
import { SceneConfigSchema } from '@orblob/config';

const customScene = SceneConfigSchema.parse({
  metadata: { title: 'Global Network' },
  appearance: {
    dark: 1,
    baseColor: [0.1, 0.1, 0.15],
    markerColor: [0.2, 0.6, 1.0],
    glowColor: [0.1, 0.2, 0.4],
    arcColor: [0.0, 0.8, 1.0],
    mapSamples: 16000,
    diffuse: 1.2,
  },
  transform: {
    phi: 0,
    theta: 0.3,
    autoRotate: true,
  },
  markers: [
    { id: 'tokyo', location: [35.6762, 139.6503], size: 0.08 },
    { id: 'sf', location: [37.7749, -122.4194], size: 0.08 },
  ],
  arcs: [
    { id: 'flight-1', start: [37.7749, -122.4194], end: [35.6762, 139.6503], height: 0.3 },
  ],
});

export default function GlobeView() {
  return <Globe config={customScene} />;
}
```

---

## 🎨 Presets Catalog

Orblob ships with 13 hand-tuned presets:
1. **Minimal Light:** Clean high-contrast dots with cobalt blue accents.
2. **Dark Space:** Deep void background with luminescent neon blue points.
3. **Enterprise:** Corporate slate with crisp navy blue markers and data telemetry.
4. **Satellite:** Earth telemetry with gold atmospheric rim lighting.
5. **Network:** Cyberpunk high-density arcs with pulsing node interconnects.
6. **Editorial:** Minimalist publication style with monochrome palette.
7. **Data Heatmap:** Crimson and amber density visualization.
8. **Travel:** Tropical coral palette with wandering flight paths.
9. **Flight Tracker:** Global aviation corridors with animated dashed flight arcs.
10. **Weather:** Oceanic emerald tones with dynamic front markers.
11. **AI Network:** Violet and cyan synaptic connections.
12. **Monochrome:** Pure black and white architectural contrast.
13. **Blueprint:** Technical drafting grid aesthetic with CAD-inspired geometry.

---

## 🛠 Local Development

```bash
# Clone the repository
git clone https://github.com/AgentNex/Orblob.git
cd Orblob

# Install workspace dependencies
pnpm install

# Run unit test suite
pnpm test:unit

# Build all packages and applications
pnpm build

# Start Studio dev server
pnpm --filter @orblob/studio dev
```

---

## 📄 License

MIT © [AgentNex](https://github.com/AgentNex)

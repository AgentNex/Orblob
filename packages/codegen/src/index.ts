import JSZip from 'jszip';
import { SceneConfig } from '@orblob/config';

export type FrameworkTarget =
  | 'react-ts'
  | 'react-js'
  | 'nextjs'
  | 'vue'
  | 'svelte'
  | 'vanilla-ts'
  | 'vanilla-js'
  | 'core-webgl';

export interface CodegenOptions {
  componentName?: string;
  embedConfig?: boolean;
}

export function generateCode(
  config: SceneConfig,
  target: FrameworkTarget = 'react-ts',
  options: CodegenOptions = {}
): string {
  const componentName = options.componentName || 'InteractiveGlobe';
  const configJson = JSON.stringify(config, null, 2);

  switch (target) {
    case 'react-ts':
      return `import React from 'react';
import { Globe } from '@orblob/react';
import type { SceneConfig } from '@orblob/config';

const globeConfig: SceneConfig = ${configJson};

export interface ${componentName}Props {
  className?: string;
  style?: React.CSSProperties;
}

export default function ${componentName}({ className = '', style = {} }: ${componentName}Props) {
  return (
    <div className={\`relative w-full max-w-[600px] aspect-square mx-auto \${className}\`} style={style}>
      <Globe config={globeConfig} autoRotate={${config.transform.autoRotate}} />
    </div>
  );
}
`;

    case 'react-js':
      return `import React from 'react';
import { Globe } from '@orblob/react';

const globeConfig = ${configJson};

export default function ${componentName}({ className = '', style = {} }) {
  return (
    <div className={\`relative w-full max-w-[600px] aspect-square mx-auto \${className}\`} style={style}>
      <Globe config={globeConfig} autoRotate={${config.transform.autoRotate}} />
    </div>
  );
}
`;

    case 'nextjs':
      return `'use client';

import React from 'react';
import { Globe } from '@orblob/react';
import type { SceneConfig } from '@orblob/config';

const globeConfig: SceneConfig = ${configJson};

export default function ${componentName}() {
  return (
    <section className="relative flex flex-col items-center justify-center p-8 min-h-[500px]">
      <div className="relative w-full max-w-[640px] aspect-square">
        <Globe config={globeConfig} autoRotate={${config.transform.autoRotate}} />
      </div>
    </section>
  );
}
`;

    case 'vue':
      return `<script setup lang="ts">
import { Globe } from '@orblob/vue';
import type { SceneConfig } from '@orblob/config';

const config: SceneConfig = ${configJson};
</script>

<template>
  <div class="relative w-full max-w-[600px] aspect-square mx-auto">
    <Globe :config="config" :autoRotate="${config.transform.autoRotate}" />
  </div>
</template>
`;

    case 'svelte':
      return `<script lang="ts">
  import { globe } from '@orblob/svelte';
  import type { SceneConfig } from '@orblob/config';

  const config: SceneConfig = ${configJson};
</script>

<div class="relative w-full max-w-[600px] aspect-square mx-auto">
  <canvas
    use:globe={{ config, autoRotate: ${config.transform.autoRotate} }}
    class="w-full h-full block cursor-grab active:cursor-grabbing"
  />
</div>
`;

    case 'vanilla-ts':
      return `import { mountGlobe } from '@orblob/vanilla';
import type { SceneConfig } from '@orblob/config';

const config: SceneConfig = ${configJson};

export function initGlobe(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(\`Container #\${containerId} not found\`);

  const handle = mountGlobe(container, {
    config,
    autoRotate: ${config.transform.autoRotate},
  });

  return handle;
}
`;

    case 'vanilla-js':
      return `import { mountGlobe } from '@orblob/vanilla';

const config = ${configJson};

export function initGlobe(containerId) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('Container #' + containerId + ' not found');

  return mountGlobe(container, {
    config,
    autoRotate: ${config.transform.autoRotate},
  });
}
`;

    case 'core-webgl':
      return `import createGlobe from '@orblob/core';

const canvas = document.getElementById('globe-canvas');

const globe = createGlobe(canvas, {
  width: 600,
  height: 600,
  devicePixelRatio: ${config.appearance.devicePixelRatio},
  phi: ${config.transform.phi},
  theta: ${config.transform.theta},
  dark: ${config.appearance.dark},
  diffuse: ${config.appearance.diffuse},
  mapSamples: ${config.appearance.mapSamples},
  mapBrightness: ${config.appearance.mapBrightness},
  baseColor: ${JSON.stringify(config.appearance.baseColor)},
  markerColor: ${JSON.stringify(config.appearance.markerColor)},
  glowColor: ${JSON.stringify(config.appearance.glowColor)},
  arcColor: ${JSON.stringify(config.appearance.arcColor)},
  markers: ${JSON.stringify(config.markers, null, 2)},
  arcs: ${JSON.stringify(config.arcs, null, 2)},
  autoRotate: ${config.transform.autoRotate},
});

// To cleanup when done:
// globe.destroy();
`;

    default:
      return generateCode(config, 'react-ts', options);
  }
}

/**
 * Generates a full downloadable project zip file using JSZip.
 */
export async function generateProjectZip(
  config: SceneConfig,
  target: FrameworkTarget = 'react-ts',
  projectName = 'orblob-globe-app'
): Promise<Blob> {
  const zip = new JSZip();

  const isReact = target.startsWith('react') || target === 'nextjs';
  const isVue = target === 'vue';
  const isSvelte = target === 'svelte';

  const pkgJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: isReact ? 'vite' : isVue ? 'vite' : isSvelte ? 'vite' : 'vite',
      build: 'vite build',
    },
    dependencies: {
      '@orblob/config': '^1.0.0',
      '@orblob/core': '^1.0.0',
      ...(isReact ? { '@orblob/react': '^1.0.0', react: '^19.0.0', 'react-dom': '^19.0.0' } : {}),
      ...(isVue ? { '@orblob/vue': '^1.0.0', vue: '^3.5.0' } : {}),
      ...(isSvelte ? { '@orblob/svelte': '^1.0.0', svelte: '^5.0.0' } : {}),
      ...(!isReact && !isVue && !isSvelte ? { '@orblob/vanilla': '^1.0.0' } : {}),
    },
    devDependencies: {
      typescript: '^5.8.0',
      vite: '^6.2.0',
    },
  };

  zip.file('package.json', JSON.stringify(pkgJson, null, 2));
  zip.file('scene-config.json', JSON.stringify(config, null, 2));

  const ext = target === 'vue' ? 'vue' : target === 'svelte' ? 'svelte' : isReact ? 'tsx' : 'ts';
  const componentSource = generateCode(config, target);
  zip.file(`src/Globe.${ext}`, componentSource);

  zip.file(
    'README.md',
    `# ${projectName}

Exported from [Orblob Studio](https://cobe.vercel.app).

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

## Documentation & Customization
Read the official docs at https://orblob.dev.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

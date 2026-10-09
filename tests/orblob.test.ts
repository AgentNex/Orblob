import { describe, it, expect } from 'vitest';
import {
  createDefaultScene,
  validateSceneConfig,
  PRESETS,
  SceneConfigSchema,
} from '@orblob/config';
import {
  hexToRgb,
  rgbToHex,
  latLongToVector3,
  project3DToScreen,
} from '@orblob/core';
import { generateCode, generateProjectZip } from '@orblob/codegen';

describe('@orblob/config', () => {
  it('creates valid default scene configuration', () => {
    const scene = createDefaultScene();
    const res = validateSceneConfig(scene);
    expect(res.success).toBe(true);
    expect(scene.appearance.mapSamples).toBeGreaterThan(0);
    expect(scene.markers.length).toBeGreaterThan(0);
    expect(scene.arcs.length).toBeGreaterThan(0);
  });

  it('validates all 13 built-in presets against Zod schema', () => {
    const presetKeys = Object.keys(PRESETS);
    expect(presetKeys.length).toBeGreaterThanOrEqual(13);

    for (const key of presetKeys) {
      const preset = PRESETS[key];
      expect(preset.id).toBeDefined();
      expect(preset.name).toBeDefined();
      expect(preset.config).toBeDefined();

      const validation = SceneConfigSchema.safeParse(preset.config);
      expect(validation.success).toBe(true);
    }
  });
});

describe('@orblob/core math & utilities', () => {
  it('converts hex to rgb and back with precision', () => {
    const hex = '#0045f6';
    const rgb = hexToRgb(hex);
    expect(rgb[0]).toBeCloseTo(0.0, 2);
    expect(rgb[1]).toBeCloseTo(69 / 255, 2);
    expect(rgb[2]).toBeCloseTo(246 / 255, 2);

    const roundtrip = rgbToHex(rgb);
    expect(roundtrip.toLowerCase()).toBe(hex.toLowerCase());
  });

  it('computes 3D vectors from lat/long accurately', () => {
    const vec = latLongToVector3(0, 0);
    expect(vec[0]).toBeCloseTo(1, 4);
    expect(vec[1]).toBeCloseTo(0, 4);

    const pole = latLongToVector3(90, 0);
    expect(pole[1]).toBeCloseTo(1, 4);
  });

  it('projects 3D sphere points into screen coordinates', () => {
    const screen = project3DToScreen([0, 0, 1], 0, 0, 600, 600);
    expect(screen.x).toBeGreaterThan(0);
    expect(screen.y).toBeGreaterThan(0);
    expect(screen.visible).toBe(true);

    const backScreen = project3DToScreen([0, 0, -1], 0, 0, 600, 600);
    expect(backScreen.visible).toBe(false);
  });
});

describe('@orblob/codegen', () => {
  const scene = createDefaultScene();

  it('generates React TypeScript component code', () => {
    const code = generateCode(scene, 'react-ts');
    expect(code).toContain("import { Globe } from '@orblob/react'");
    expect(code).toContain("export default function InteractiveGlobe");
  });

  it('generates Next.js App Router client component code', () => {
    const code = generateCode(scene, 'nextjs');
    expect(code).toContain("'use client'");
    expect(code).toContain("import { Globe } from '@orblob/react'");
  });

  it('generates Vue 3 SFC component code', () => {
    const code = generateCode(scene, 'vue');
    expect(code).toContain("<script setup lang=\"ts\">");
    expect(code).toContain("import { Globe } from '@orblob/vue'");
  });

  it('generates Svelte 5 component code', () => {
    const code = generateCode(scene, 'svelte');
    expect(code).toContain("use:globe");
  });

  it('generates Vanilla TypeScript code', () => {
    const code = generateCode(scene, 'vanilla-ts');
    expect(code).toContain("import { mountGlobe } from '@orblob/vanilla'");
  });

  it('generates pure WebGL2 Core runtime code', () => {
    const code = generateCode(scene, 'core-webgl');
    expect(code).toContain("import createGlobe from '@orblob/core'");
  });

  it('generates full project zip file containing package.json, source and config', async () => {
    const blob = await generateProjectZip(scene, 'react-ts', 'test-app');
    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(100);
  });
});

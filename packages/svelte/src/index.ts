import { createGlobe, GlobeInstance, GlobeOptions } from '@orblob/core';
import { SceneConfig } from '@orblob/config';

export interface SvelteGlobeOptions extends Partial<GlobeOptions> {
  config?: Partial<SceneConfig>;
}

/**
 * Svelte Action for mounting and controlling an Orblob globe canvas.
 * Usage: `<canvas use:globe={options} />`
 */
export function globe(
  canvas: HTMLCanvasElement,
  initialOptions: SvelteGlobeOptions = {}
) {
  let instance: GlobeInstance | null = null;

  function buildMergedOptions(opts: SvelteGlobeOptions): GlobeOptions {
    const cfg = opts.config;
    const appearance = cfg?.appearance;
    const transform = cfg?.transform;

    const width = opts.width || canvas.clientWidth || 600;
    const height = opts.height || canvas.clientHeight || 600;

    return {
      width,
      height,
      devicePixelRatio: appearance?.devicePixelRatio ?? opts.devicePixelRatio ?? 2,
      phi: transform?.phi ?? opts.phi ?? 0,
      theta: transform?.theta ?? opts.theta ?? 0.2,
      dark: appearance?.dark ?? opts.dark ?? 0,
      diffuse: appearance?.diffuse ?? opts.diffuse ?? 1.2,
      mapSamples: appearance?.mapSamples ?? opts.mapSamples ?? 16000,
      mapBrightness: appearance?.mapBrightness ?? opts.mapBrightness ?? 6,
      mapBaseBrightness: appearance?.mapBaseBrightness ?? opts.mapBaseBrightness ?? 0,
      baseColor: appearance?.baseColor ?? opts.baseColor ?? [1, 1, 1],
      markerColor: appearance?.markerColor ?? opts.markerColor ?? [0.2, 0.4, 1],
      glowColor: appearance?.glowColor ?? opts.glowColor ?? [1, 1, 1],
      arcColor: appearance?.arcColor ?? opts.arcColor ?? [0.3, 0.5, 1],
      scale: appearance?.scale ?? opts.scale ?? 1,
      offset: appearance?.offset ?? opts.offset ?? [0, 0],
      opacity: appearance?.opacity ?? opts.opacity ?? 1,
      autoRotate: transform?.autoRotate ?? opts.autoRotate ?? false,
      autoRotateSpeed: transform?.autoRotateSpeed ?? opts.autoRotateSpeed ?? 0.003,
      markers: (cfg?.markers as any) || opts.markers || [],
      arcs: (cfg?.arcs as any) || opts.arcs || [],
      ...opts,
    };
  }

  instance = createGlobe(canvas, buildMergedOptions(initialOptions));

  return {
    update(newOptions: SvelteGlobeOptions) {
      if (!instance) return;
      instance.update(buildMergedOptions(newOptions));
    },
    destroy() {
      instance?.destroy();
      instance = null;
    },
  };
}

export * from '@orblob/core';
export default globe;

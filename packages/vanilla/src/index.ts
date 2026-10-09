import { createGlobe, GlobeInstance, GlobeOptions } from '@orblob/core';
import { SceneConfig } from '@orblob/config';

export interface VanillaGlobeMountOptions extends Partial<GlobeOptions> {
  config?: Partial<SceneConfig>;
  className?: string;
}

export interface VanillaGlobeHandle {
  globe: GlobeInstance;
  canvas: HTMLCanvasElement;
  destroy: () => void;
  update: (opts: Partial<GlobeOptions>) => void;
}

/**
 * Mounts a full WebGL2 Orblob Globe into an arbitrary HTML container element.
 * Automatically manages canvas element creation, high-DPI scaling, and ResizeObserver.
 */
export function mountGlobe(
  container: HTMLElement,
  mountOptions: VanillaGlobeMountOptions = {}
): VanillaGlobeHandle {
  const canvas = document.createElement('canvas');
  canvas.className = `orblob-canvas ${mountOptions.className || ''}`.trim();
  canvas.style.cssText = 'width: 100%; height: 100%; display: block; cursor: grab;';

  container.style.position = container.style.position || 'relative';
  container.appendChild(canvas);

  const initialWidth = container.clientWidth || 600;
  const initialHeight = container.clientHeight || 600;

  const cfg = mountOptions.config;
  const appearance = cfg?.appearance;
  const transform = cfg?.transform;

  const options: GlobeOptions = {
    width: mountOptions.width || initialWidth,
    height: mountOptions.height || initialHeight,
    devicePixelRatio: appearance?.devicePixelRatio ?? mountOptions.devicePixelRatio ?? 2,
    phi: transform?.phi ?? mountOptions.phi ?? 0,
    theta: transform?.theta ?? mountOptions.theta ?? 0.2,
    dark: appearance?.dark ?? mountOptions.dark ?? 0,
    diffuse: appearance?.diffuse ?? mountOptions.diffuse ?? 1.2,
    mapSamples: appearance?.mapSamples ?? mountOptions.mapSamples ?? 16000,
    mapBrightness: appearance?.mapBrightness ?? mountOptions.mapBrightness ?? 6,
    mapBaseBrightness: appearance?.mapBaseBrightness ?? mountOptions.mapBaseBrightness ?? 0,
    baseColor: appearance?.baseColor ?? mountOptions.baseColor ?? [1, 1, 1],
    markerColor: appearance?.markerColor ?? mountOptions.markerColor ?? [0.2, 0.4, 1],
    glowColor: appearance?.glowColor ?? mountOptions.glowColor ?? [1, 1, 1],
    arcColor: appearance?.arcColor ?? mountOptions.arcColor ?? [0.3, 0.5, 1],
    scale: appearance?.scale ?? mountOptions.scale ?? 1,
    offset: appearance?.offset ?? mountOptions.offset ?? [0, 0],
    opacity: appearance?.opacity ?? mountOptions.opacity ?? 1,
    autoRotate: transform?.autoRotate ?? mountOptions.autoRotate ?? false,
    autoRotateSpeed: transform?.autoRotateSpeed ?? mountOptions.autoRotateSpeed ?? 0.003,
    markers: (cfg?.markers as any) || mountOptions.markers || [],
    arcs: (cfg?.arcs as any) || mountOptions.arcs || [],
    ...mountOptions,
  };

  const globe = createGlobe(canvas, options);

  let resizeObserver: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          globe.update({ width, height });
        }
      }
    });
    resizeObserver.observe(container);
  }

  return {
    globe,
    canvas,
    update: (opts) => globe.update(opts),
    destroy: () => {
      resizeObserver?.disconnect();
      globe.destroy();
      canvas.remove();
    },
  };
}

export * from '@orblob/core';
export default mountGlobe;

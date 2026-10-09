import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react';
import { createGlobe, GlobeInstance, GlobeOptions, MarkerOption, ArcOption } from '@orblob/core';
import { SceneConfig } from '@orblob/config';

export interface GlobeProps {
  config?: Partial<SceneConfig>;
  options?: Partial<GlobeOptions>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  interactive?: boolean;
  autoRotate?: boolean;
  onRender?: (state: GlobeInstance['getState']) => void;
}

export function useGlobe(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: Partial<GlobeOptions> = {}
) {
  const globeRef = useRef<GlobeInstance | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = options.width || canvas.clientWidth || 600;
    const height = options.height || canvas.clientHeight || 600;

    const globe = createGlobe(canvas, {
      width,
      height,
      ...options,
    });
    globeRef.current = globe;

    return () => {
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  return globeRef;
}

export const Globe = forwardRef<GlobeInstance, GlobeProps>(function Globe(
  {
    config,
    options = {},
    className = '',
    style = {},
    children,
    interactive = true,
    autoRotate,
    onRender,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeInstanceRef = useRef<GlobeInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Expose instance methods via ref
  useImperativeHandle(ref, () => globeInstanceRef.current as GlobeInstance, []);

  // Compute merged options
  const getMergedOptions = useCallback((): GlobeOptions => {
    const appearance = config?.appearance;
    const transform = config?.transform;
    const markers = (config?.markers || options.markers || []) as MarkerOption[];
    const arcs = (config?.arcs || options.arcs || []) as ArcOption[];

    const container = containerRef.current;
    const width = options.width || (container ? container.clientWidth : 600);
    const height = options.height || (container ? container.clientHeight : 600);

    return {
      width,
      height,
      devicePixelRatio: appearance?.devicePixelRatio ?? options.devicePixelRatio ?? 2,
      phi: transform?.phi ?? options.phi ?? 0,
      theta: transform?.theta ?? options.theta ?? 0.2,
      dark: appearance?.dark ?? options.dark ?? 0,
      diffuse: appearance?.diffuse ?? options.diffuse ?? 1.2,
      mapSamples: appearance?.mapSamples ?? options.mapSamples ?? 16000,
      mapBrightness: appearance?.mapBrightness ?? options.mapBrightness ?? 6,
      mapBaseBrightness: appearance?.mapBaseBrightness ?? options.mapBaseBrightness ?? 0,
      baseColor: appearance?.baseColor ?? options.baseColor ?? [1, 1, 1],
      markerColor: appearance?.markerColor ?? options.markerColor ?? [0.2, 0.4, 1],
      glowColor: appearance?.glowColor ?? options.glowColor ?? [1, 1, 1],
      arcColor: appearance?.arcColor ?? options.arcColor ?? [0.3, 0.5, 1],
      scale: appearance?.scale ?? options.scale ?? 1,
      offset: appearance?.offset ?? options.offset ?? [0, 0],
      opacity: appearance?.opacity ?? options.opacity ?? 1,
      autoRotate: autoRotate ?? transform?.autoRotate ?? options.autoRotate ?? false,
      autoRotateSpeed: transform?.autoRotateSpeed ?? options.autoRotateSpeed ?? 0.003,
      interactive: interactive ?? options.interactive ?? true,
      markers,
      arcs,
      onRender,
      ...options,
    };
  }, [config, options, interactive, autoRotate, onRender]);

  // Initial mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const merged = getMergedOptions();
    const instance = createGlobe(canvas, merged);
    globeInstanceRef.current = instance;
    setIsReady(true);

    // Handle container resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            instance.update({ width, height });
          }
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      instance.destroy();
      globeInstanceRef.current = null;
      setIsReady(false);
    };
  }, []);

  // Update when config/options change
  useEffect(() => {
    if (!globeInstanceRef.current || !isReady) return;
    const merged = getMergedOptions();
    globeInstanceRef.current.update(merged);
  }, [config, options, getMergedOptions, isReady]);

  return (
    <div
      ref={containerRef}
      className={`orblob-container relative w-full h-full select-none ${className}`}
      style={{
        aspectRatio: '1',
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        className="orblob-canvas w-full h-full block cursor-grab active:cursor-grabbing"
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </div>
  );
});

export default Globe;

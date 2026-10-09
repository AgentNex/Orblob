import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  watch,
  h,
  PropType,
  shallowRef,
} from 'vue';
import { createGlobe, GlobeInstance, GlobeOptions, MarkerOption, ArcOption } from '@orblob/core';
import { SceneConfig } from '@orblob/config';

export function useGlobe(
  canvasRef: { value: HTMLCanvasElement | null },
  options: Partial<GlobeOptions> = {}
) {
  const globeInstance = shallowRef<GlobeInstance | null>(null);

  onMounted(() => {
    if (!canvasRef.value) return;
    const width = options.width || canvasRef.value.clientWidth || 600;
    const height = options.height || canvasRef.value.clientHeight || 600;

    globeInstance.value = createGlobe(canvasRef.value, {
      width,
      height,
      ...options,
    });
  });

  onUnmounted(() => {
    globeInstance.value?.destroy();
    globeInstance.value = null;
  });

  return globeInstance;
}

export const Globe = defineComponent({
  name: 'OrblobGlobe',
  props: {
    config: {
      type: Object as PropType<Partial<SceneConfig>>,
      default: () => ({}),
    },
    options: {
      type: Object as PropType<Partial<GlobeOptions>>,
      default: () => ({}),
    },
    className: {
      type: String,
      default: '',
    },
    autoRotate: {
      type: Boolean,
      default: undefined,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { expose, slots }) {
    const containerRef = ref<HTMLDivElement | null>(null);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const globeInstance = shallowRef<GlobeInstance | null>(null);

    expose({
      getGlobe: () => globeInstance.value,
      focusLocation: (lat: number, lon: number) => globeInstance.value?.focusLocation(lat, lon),
    });

    const getMergedOptions = (): GlobeOptions => {
      const cfg = props.config;
      const opt = props.options;
      const appearance = cfg?.appearance;
      const transform = cfg?.transform;

      const container = containerRef.value;
      const width = opt.width || (container ? container.clientWidth : 600);
      const height = opt.height || (container ? container.clientHeight : 600);

      return {
        width,
        height,
        devicePixelRatio: appearance?.devicePixelRatio ?? opt.devicePixelRatio ?? 2,
        phi: transform?.phi ?? opt.phi ?? 0,
        theta: transform?.theta ?? opt.theta ?? 0.2,
        dark: appearance?.dark ?? opt.dark ?? 0,
        diffuse: appearance?.diffuse ?? opt.diffuse ?? 1.2,
        mapSamples: appearance?.mapSamples ?? opt.mapSamples ?? 16000,
        mapBrightness: appearance?.mapBrightness ?? opt.mapBrightness ?? 6,
        mapBaseBrightness: appearance?.mapBaseBrightness ?? opt.mapBaseBrightness ?? 0,
        baseColor: appearance?.baseColor ?? opt.baseColor ?? [1, 1, 1],
        markerColor: appearance?.markerColor ?? opt.markerColor ?? [0.2, 0.4, 1],
        glowColor: appearance?.glowColor ?? opt.glowColor ?? [1, 1, 1],
        arcColor: appearance?.arcColor ?? opt.arcColor ?? [0.3, 0.5, 1],
        scale: appearance?.scale ?? opt.scale ?? 1,
        offset: appearance?.offset ?? opt.offset ?? [0, 0],
        opacity: appearance?.opacity ?? opt.opacity ?? 1,
        autoRotate: props.autoRotate ?? transform?.autoRotate ?? opt.autoRotate ?? false,
        autoRotateSpeed: transform?.autoRotateSpeed ?? opt.autoRotateSpeed ?? 0.003,
        interactive: props.interactive,
        markers: (cfg?.markers || opt.markers || []) as MarkerOption[],
        arcs: (cfg?.arcs || opt.arcs || []) as ArcOption[],
        ...opt,
      };
    };

    onMounted(() => {
      if (!canvasRef.value) return;
      const merged = getMergedOptions();
      const instance = createGlobe(canvasRef.value, merged);
      globeInstance.value = instance;

      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && containerRef.value) {
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              instance.update({ width, height });
            }
          }
        });
        ro.observe(containerRef.value);
      }

      onUnmounted(() => {
        ro?.disconnect();
        instance.destroy();
        globeInstance.value = null;
      });
    });

    watch(
      () => [props.config, props.options, props.autoRotate],
      () => {
        if (!globeInstance.value) return;
        globeInstance.value.update(getMergedOptions());
      },
      { deep: true }
    );

    return () =>
      h(
        'div',
        {
          ref: containerRef,
          class: `orblob-vue-container relative w-full h-full ${props.className}`,
          style: { aspectRatio: '1', position: 'relative' },
        },
        [
          h('canvas', {
            ref: canvasRef,
            class: 'orblob-canvas w-full h-full block cursor-grab active:cursor-grabbing',
            style: { width: '100%', height: '100%' },
          }),
          slots.default ? slots.default() : null,
        ]
      );
  },
});

export default Globe;

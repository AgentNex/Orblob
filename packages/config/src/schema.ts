import { z } from 'zod';

export const Vec3ColorSchema = z.tuple([
  z.number().min(0).max(1),
  z.number().min(0).max(1),
  z.number().min(0).max(1),
]);
export type Vec3Color = z.infer<typeof Vec3ColorSchema>;

export const CoordinatesSchema = z.tuple([
  z.number().min(-90).max(90),
  z.number().min(-180).max(180),
]);
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const Vec2OffsetSchema = z.tuple([z.number(), z.number()]);
export type Vec2Offset = z.infer<typeof Vec2OffsetSchema>;

export const MarkerConfigSchema = z.object({
  id: z.string(),
  name: z.string().default('Marker'),
  location: CoordinatesSchema,
  size: z.number().min(0.005).max(0.2).default(0.03),
  color: Vec3ColorSchema.optional(),
  elevation: z.number().min(0).max(0.3).default(0.05),
  visible: z.boolean().default(true),
  pulse: z.boolean().default(false),
  pulseSpeed: z.number().min(0.1).max(5).default(1),
  glow: z.boolean().default(false),
});
export type MarkerConfig = z.infer<typeof MarkerConfigSchema>;

export const ArcConfigSchema = z.object({
  id: z.string(),
  name: z.string().default('Arc'),
  from: CoordinatesSchema,
  to: CoordinatesSchema,
  color: Vec3ColorSchema.optional(),
  width: z.number().min(0.1).max(3).default(0.5),
  height: z.number().min(0.05).max(1).default(0.3),
  opacity: z.number().min(0).max(1).default(1),
  speed: z.number().min(0).max(5).default(1),
  direction: z.enum(['forward', 'backward', 'bidirectional']).default('forward'),
  visible: z.boolean().default(true),
});
export type ArcConfig = z.infer<typeof ArcConfigSchema>;

export const LabelConfigSchema = z.object({
  id: z.string(),
  targetType: z.enum(['marker', 'arc', 'location']).default('marker'),
  targetId: z.string().optional(),
  location: CoordinatesSchema.optional(),
  text: z.string(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  style: z.enum(['default', 'card', 'pill', 'minimal']).default('default'),
  anchorOffset: Vec2OffsetSchema.default([0, 0]),
  visible: z.boolean().default(true),
  hideOnBack: z.boolean().default(true),
});
export type LabelConfig = z.infer<typeof LabelConfigSchema>;

export const GlobeAppearanceSchema = z.object({
  dark: z.number().min(0).max(1).default(0),
  baseColor: Vec3ColorSchema.default([1, 1, 1]),
  markerColor: Vec3ColorSchema.default([0.2, 0.4, 1]),
  glowColor: Vec3ColorSchema.default([1, 1, 1]),
  arcColor: Vec3ColorSchema.default([0.3, 0.5, 1]),
  diffuse: z.number().min(0.1).max(5).default(1.2),
  mapSamples: z.number().min(1000).max(50000).default(16000),
  mapBrightness: z.number().min(0.5).max(30).default(6),
  mapBaseBrightness: z.number().min(0).max(1).default(0),
  opacity: z.number().min(0).max(1).default(1),
  devicePixelRatio: z.number().min(1).max(3).default(2),
  scale: z.number().min(0.2).max(3).default(1),
  offset: Vec2OffsetSchema.default([0, 0]),
});
export type GlobeAppearance = z.infer<typeof GlobeAppearanceSchema>;

export const GlobeTransformSchema = z.object({
  phi: z.number().default(0),
  theta: z.number().default(0.2),
  autoRotate: z.boolean().default(true),
  autoRotateSpeed: z.number().default(0.003),
  dragSensitivity: z.number().min(0.1).max(5).default(1),
  friction: z.number().min(0.5).max(0.99).default(0.92),
});
export type GlobeTransform = z.infer<typeof GlobeTransformSchema>;

export const AtmosphereSchema = z.object({
  enabled: z.boolean().default(true),
  color: Vec3ColorSchema.default([0.15, 0.45, 1]),
  intensity: z.number().min(0).max(2).default(1),
  glowSpread: z.number().min(0.1).max(2).default(1),
  showOrbitRing: z.boolean().default(true),
  orbitRingText: z.string().default('Orblob · Next-Gen WebGL Globe · Realtime 3D · '),
});
export type AtmosphereConfig = z.infer<typeof AtmosphereSchema>;

export const KeyframeSchema = z.object({
  id: z.string(),
  time: z.number().min(0),
  phi: z.number(),
  theta: z.number(),
  scale: z.number().default(1),
  easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).default('easeInOut'),
});
export type Keyframe = z.infer<typeof KeyframeSchema>;

export const TimelineSchema = z.object({
  duration: z.number().min(1).max(60).default(10),
  loop: z.boolean().default(true),
  isPlaying: z.boolean().default(false),
  currentTime: z.number().min(0).default(0),
  keyframes: z.array(KeyframeSchema).default([]),
});
export type TimelineConfig = z.infer<typeof TimelineSchema>;

export const LayerItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['globe', 'atmosphere', 'markers', 'arcs', 'labels', 'effects']),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
});
export type LayerItem = z.infer<typeof LayerItemSchema>;

export const SceneConfigSchema = z.object({
  version: z.number().default(1),
  metadata: z.object({
    title: z.string().default('Untitled Globe Scene'),
    author: z.string().default('Anonymous'),
    description: z.string().default('Built with Orblob Studio'),
    tags: z.array(z.string()).default(['globe', 'webgl']),
    createdAt: z.string().default(() => new Date().toISOString()),
    updatedAt: z.string().default(() => new Date().toISOString()),
  }).default({}),
  appearance: GlobeAppearanceSchema.default({}),
  transform: GlobeTransformSchema.default({}),
  atmosphere: AtmosphereSchema.default({}),
  markers: z.array(MarkerConfigSchema).default([]),
  arcs: z.array(ArcConfigSchema).default([]),
  labels: z.array(LabelConfigSchema).default([]),
  layers: z.array(LayerItemSchema).default([
    { id: 'layer-globe', name: 'Globe Core', type: 'globe', visible: true, locked: false },
    { id: 'layer-atmosphere', name: 'Atmosphere & Orbit', type: 'atmosphere', visible: true, locked: false },
    { id: 'layer-markers', name: 'Geographic Markers', type: 'markers', visible: true, locked: false },
    { id: 'layer-arcs', name: 'Connection Arcs', type: 'arcs', visible: true, locked: false },
    { id: 'layer-labels', name: 'Anchored Labels', type: 'labels', visible: true, locked: false },
  ]),
  timeline: TimelineSchema.default({}),
  responsive: z.object({
    mobileScale: z.number().default(0.85),
    tabletScale: z.number().default(0.95),
    desktopScale: z.number().default(1),
  }).default({}),
});
export type SceneConfig = z.infer<typeof SceneConfigSchema>;

export const CloudProjectSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  scene_config: SceneConfigSchema,
  is_public: z.boolean().default(false),
  preset_id: z.string().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type CloudProject = z.infer<typeof CloudProjectSchema>;

export function createDefaultScene(): SceneConfig {
  return SceneConfigSchema.parse({
    markers: [
      { id: 'sf', name: 'San Francisco', location: [37.7749, -122.4194], size: 0.035, color: [0.2, 0.5, 1], elevation: 0.05, visible: true, pulse: true },
      { id: 'nyc', name: 'New York', location: [40.7128, -74.006], size: 0.035, color: [0.2, 0.5, 1], elevation: 0.05, visible: true, pulse: false },
      { id: 'tokyo', name: 'Tokyo', location: [35.6762, 139.6503], size: 0.035, color: [1, 0.3, 0.4], elevation: 0.05, visible: true, pulse: true },
      { id: 'london', name: 'London', location: [51.5074, -0.1278], size: 0.035, color: [0.2, 0.8, 0.4], elevation: 0.05, visible: true, pulse: false },
    ],
    arcs: [
      { id: 'arc-sf-tokyo', name: 'SF → Tokyo', from: [37.7749, -122.4194], to: [35.6762, 139.6503], color: [0.2, 0.6, 1], width: 0.6, height: 0.35, visible: true },
      { id: 'arc-nyc-london', name: 'NYC → London', from: [40.7128, -74.006], to: [51.5074, -0.1278], color: [0.4, 0.8, 1], width: 0.5, height: 0.25, visible: true },
    ],
    labels: [
      { id: 'lbl-sf', targetType: 'marker', targetId: 'sf', text: 'San Francisco', subtitle: 'HQ Hub', style: 'pill', visible: true, hideOnBack: true },
      { id: 'lbl-tokyo', targetType: 'marker', targetId: 'tokyo', text: 'Tokyo', subtitle: 'APAC Node', style: 'pill', visible: true, hideOnBack: true },
    ],
  });
}

export * from './schema';
export * from './presets';

import { SceneConfig, SceneConfigSchema } from './schema';

export function validateSceneConfig(data: unknown): { success: true; data: SceneConfig } | { success: false; error: string } {
  const result = SceneConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
}

export function parseSceneConfig(data: unknown): SceneConfig {
  return SceneConfigSchema.parse(data);
}

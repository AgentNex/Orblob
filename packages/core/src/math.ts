import { PI } from './constants';

export type Vector3 = [number, number, number];
export type Vector2 = [number, number];

/**
 * Converts latitude and longitude in degrees to a 3D Cartesian vector on the unit sphere.
 */
export function latLongToVector3(lat: number, lon: number): Vector3 {
  const phi = (lat * PI) / 180;
  const theta = (lon * PI) / 180 - PI;
  const cosPhi = Math.cos(phi);
  return [-cosPhi * Math.cos(theta), Math.sin(phi), cosPhi * Math.sin(theta)];
}

/**
 * Projects a 3D point on the globe onto 2D screen coordinates (normalized 0..1)
 * along with a visibility flag (false if culled on back side of the sphere).
 */
export function project3DToScreen(
  point: Vector3,
  phi: number,
  theta: number,
  width: number,
  height: number,
  scale: number = 1,
  offset: Vector2 = [0, 0],
  dpr: number = 1
): { x: number; y: number; visible: boolean } {
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const rotX = cosPhi * point[0] + sinPhi * point[2];
  const rotY = sinPhi * sinTheta * point[0] + cosTheta * point[1] - cosPhi * sinTheta * point[2];
  const rotZ = -sinPhi * cosTheta * point[0] + sinTheta * point[1] + cosPhi * cosTheta * point[2];

  const aspect = width / height;
  const x = (rotX / aspect * scale + (offset[0] * scale * dpr) / width + 1) / 2;
  const y = (-rotY * scale + (offset[1] * scale * dpr) / height + 1) / 2;

  // Visible if on front hemisphere or near horizon edge
  const isFront = rotZ >= 0 || rotX * rotX + rotY * rotY >= 0.64;

  return { x, y, visible: isFront };
}

/**
 * Parses a hex color string (#rrggbb or #rgb) to a normalized [r, g, b] array (0..1).
 */
export function hexToRgb(hex: string): Vector3 {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return [1, 1, 1];
}

/**
 * Converts a normalized [r, g, b] array (0..1) to a hex string (#rrggbb).
 */
export function rgbToHex(rgb: Vector3): string {
  const toHex = (c: number) => {
    const clamped = Math.round(Math.max(0, Math.min(1, c)) * 255);
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

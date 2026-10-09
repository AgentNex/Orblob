import {
  GLOBE_RADIUS,
  LANDMASK_BASE64,
  PI,
  TWO_PI,
} from './constants';
import {
  ARC_FRAGMENT_SHADER,
  ARC_VERTEX_SHADER,
  MARKER_FRAGMENT_SHADER,
  MARKER_VERTEX_SHADER,
  SPHERE_FRAGMENT_SHADER,
  SPHERE_VERTEX_SHADER,
} from './shaders';
import {
  Vector3,
  Vector2,
  latLongToVector3,
  project3DToScreen,
} from './math';
import { createAnchorManager, AnchorManager } from './anchors';

export interface MarkerOption {
  id?: string;
  location: [number, number]; // [lat, lon]
  size: number;
  color?: [number, number, number];
  elevation?: number;
  pulse?: boolean;
}

export interface ArcOption {
  id?: string;
  from: [number, number]; // [lat, lon]
  to: [number, number];   // [lat, lon]
  color?: [number, number, number];
  width?: number;
  height?: number;
}

export interface GlobeOptions {
  width: number;
  height: number;
  devicePixelRatio?: number;
  phi?: number;
  theta?: number;
  dark?: number;
  diffuse?: number;
  mapSamples?: number;
  mapBrightness?: number;
  mapBaseBrightness?: number;
  baseColor?: [number, number, number];
  markerColor?: [number, number, number];
  glowColor?: [number, number, number];
  arcColor?: [number, number, number];
  arcWidth?: number;
  arcHeight?: number;
  markerElevation?: number;
  scale?: number;
  offset?: [number, number];
  opacity?: number;
  markers?: MarkerOption[];
  arcs?: ArcOption[];
  mapTextureUrl?: string;
  context?: WebGLContextAttributes;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  interactive?: boolean;
  onRender?: (state: GlobeInstance['getState']) => void;
}

export interface GlobeInstance {
  update: (options: Partial<GlobeOptions>) => void;
  destroy: () => void;
  getState: () => {
    phi: number;
    theta: number;
    width: number;
    height: number;
    scale: number;
  };
  getScreenCoordinates: (
    location: [number, number],
    elevation?: number
  ) => { x: number; y: number; visible: boolean };
  focusLocation: (lat: number, lon: number, durationMs?: number) => void;
}

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexSrc: string,
  fragmentSrc: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function createGlobe(
  canvas: HTMLCanvasElement,
  initialOptions: GlobeOptions
): GlobeInstance {
  const contextAttrs: WebGLContextAttributes = {
    alpha: true,
    stencil: false,
    antialias: true,
    depth: false,
    preserveDrawingBuffer: false,
    ...initialOptions.context,
  };

  let rawGl = canvas.getContext('webgl2', contextAttrs) as WebGL2RenderingContext | null;
  const isWebGL2 = Boolean(rawGl);
  let extInstanced: ANGLE_instanced_arrays | null = null;

  if (!rawGl) {
    const gl1 = canvas.getContext('webgl', contextAttrs) as WebGLRenderingContext | null;
    if (gl1) {
      extInstanced = gl1.getExtension('ANGLE_instanced_arrays');
      rawGl = gl1 as any;
    }
  }

  if (!rawGl) {
    console.error('WebGL is not supported in this browser/environment.');
    return {
      update: () => {},
      destroy: () => {},
      getState: () => ({ phi: 0, theta: 0, width: 0, height: 0, scale: 1 }),
      getScreenCoordinates: () => ({ x: 0, y: 0, visible: false }),
      focusLocation: () => {},
    };
  }

  const gl: WebGLRenderingContext | WebGL2RenderingContext = rawGl;

  const dpr = initialOptions.devicePixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
  let width = initialOptions.width * dpr;
  let height = initialOptions.height * dpr;
  canvas.width = width;
  canvas.height = height;

  let phi = initialOptions.phi ?? 0;
  let theta = initialOptions.theta ?? 0.2;
  let dark = initialOptions.dark ?? 0;
  let diffuse = initialOptions.diffuse ?? 1.2;
  let mapSamples = initialOptions.mapSamples ?? 16000;
  let mapBrightness = initialOptions.mapBrightness ?? 6;
  let mapBaseBrightness = initialOptions.mapBaseBrightness ?? 0;
  let baseColor = initialOptions.baseColor ?? [1, 1, 1];
  let markerColor = initialOptions.markerColor ?? [0.2, 0.4, 1];
  let glowColor = initialOptions.glowColor ?? [1, 1, 1];
  let arcColor = initialOptions.arcColor ?? [0.3, 0.5, 1];
  let arcWidth = initialOptions.arcWidth ?? 0.5;
  let arcHeight = initialOptions.arcHeight ?? 0.3;
  let markerElevation = initialOptions.markerElevation ?? 0.05;
  let scale = initialOptions.scale ?? 1;
  let offset: [number, number] = initialOptions.offset ?? [0, 0];
  let opacity = initialOptions.opacity ?? 1;
  let markers: MarkerOption[] = initialOptions.markers ?? [];
  let arcs: ArcOption[] = initialOptions.arcs ?? [];
  let autoRotate = initialOptions.autoRotate ?? false;
  let autoRotateSpeed = initialOptions.autoRotateSpeed ?? 0.003;

  // Compile shaders
  const sphereProgram = createProgram(gl, SPHERE_VERTEX_SHADER, SPHERE_FRAGMENT_SHADER);
  const markerProgram = createProgram(gl, MARKER_VERTEX_SHADER, MARKER_FRAGMENT_SHADER);
  const arcProgram = createProgram(gl, ARC_VERTEX_SHADER, ARC_FRAGMENT_SHADER);

  if (!sphereProgram) {
    console.error('Failed to initialize Sphere WebGL program');
    return {
      update: () => {},
      destroy: () => {},
      getState: () => ({ phi, theta, width, height, scale }),
      getScreenCoordinates: () => ({ x: 0, y: 0, visible: false }),
      focusLocation: () => {},
    };
  }

  // Sphere quad buffer
  const quadBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  // Arc segment strip buffer (33 segments => 66 vertices)
  const arcSegmentsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arcSegmentsBuffer);
  const arcStripVertices: number[] = [];
  const ARC_SEGMENTS = 32;
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const progress = i / ARC_SEGMENTS;
    arcStripVertices.push(progress, -1, progress, 1);
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arcStripVertices), gl.STATIC_DRAW);

  // Dynamic buffers
  const markerInstanceBuffer = gl.createBuffer();
  const arcInstanceBuffer = gl.createBuffer();

  // Uniform and Attribute Locations
  const sphereUniforms = {
    resolution: gl.getUniformLocation(sphereProgram, 'u_resolution'),
    offset: gl.getUniformLocation(sphereProgram, 'u_offset'),
    rotation: gl.getUniformLocation(sphereProgram, 'u_rotation'),
    baseColor: gl.getUniformLocation(sphereProgram, 'u_baseColor'),
    glowColor: gl.getUniformLocation(sphereProgram, 'u_glowColor'),
    params: gl.getUniformLocation(sphereProgram, 'u_params'),
    samples: gl.getUniformLocation(sphereProgram, 'u_samples'),
    scale: gl.getUniformLocation(sphereProgram, 'u_scale'),
    baseBrightness: gl.getUniformLocation(sphereProgram, 'u_baseBrightness'),
    mapTexture: gl.getUniformLocation(sphereProgram, 'u_mapTexture'),
  };
  const sphereAttribPos = gl.getAttribLocation(sphereProgram, 'a_position');

  const markerUniforms = markerProgram
    ? {
        resolution: gl.getUniformLocation(markerProgram, 'u_resolution'),
        offset: gl.getUniformLocation(markerProgram, 'u_offset'),
        phi: gl.getUniformLocation(markerProgram, 'u_phi'),
        theta: gl.getUniformLocation(markerProgram, 'u_theta'),
        scale: gl.getUniformLocation(markerProgram, 'u_scale'),
        elevation: gl.getUniformLocation(markerProgram, 'u_elevation'),
        defaultColor: gl.getUniformLocation(markerProgram, 'u_defaultColor'),
      }
    : null;

  const markerAttribs = markerProgram
    ? {
        corner: gl.getAttribLocation(markerProgram, 'a_corner'),
        position: gl.getAttribLocation(markerProgram, 'a_position'),
        size: gl.getAttribLocation(markerProgram, 'a_size'),
        color: gl.getAttribLocation(markerProgram, 'a_color'),
        hasColor: gl.getAttribLocation(markerProgram, 'a_hasColor'),
      }
    : null;

  const arcUniforms = arcProgram
    ? {
        resolution: gl.getUniformLocation(arcProgram, 'u_resolution'),
        offset: gl.getUniformLocation(arcProgram, 'u_offset'),
        phi: gl.getUniformLocation(arcProgram, 'u_phi'),
        theta: gl.getUniformLocation(arcProgram, 'u_theta'),
        scale: gl.getUniformLocation(arcProgram, 'u_scale'),
        elevation: gl.getUniformLocation(arcProgram, 'u_elevation'),
        defaultColor: gl.getUniformLocation(arcProgram, 'u_defaultColor'),
      }
    : null;

  const arcAttribs = arcProgram
    ? {
        segment: gl.getAttribLocation(arcProgram, 'a_segment'),
        from: gl.getAttribLocation(arcProgram, 'a_from'),
        to: gl.getAttribLocation(arcProgram, 'a_to'),
        height: gl.getAttribLocation(arcProgram, 'a_height'),
        width: gl.getAttribLocation(arcProgram, 'a_width'),
        color: gl.getAttribLocation(arcProgram, 'a_color'),
        hasColor: gl.getAttribLocation(arcProgram, 'a_hasColor'),
      }
    : null;

  // Texture creation
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    1,
    1,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0])
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    render();
  };
  img.src = initialOptions.mapTextureUrl || LANDMASK_BASE64;

  // Helper for instanced attribute divisor
  function vertexAttribDivisor(index: number, divisor: number) {
    if (index < 0) return;
    if (isWebGL2) {
      (gl as WebGL2RenderingContext).vertexAttribDivisor(index, divisor);
    } else if (extInstanced) {
      extInstanced.vertexAttribDivisorANGLE(index, divisor);
    }
  }

  function drawArraysInstanced(mode: number, first: number, count: number, primcount: number) {
    if (isWebGL2) {
      (gl as WebGL2RenderingContext).drawArraysInstanced(mode, first, count, primcount);
    } else if (extInstanced) {
      extInstanced.drawArraysInstancedANGLE(mode, first, count, primcount);
    } else {
      for (let i = 0; i < primcount; i++) {
        gl.drawArrays(mode, first, count);
      }
    }
  }

  // Anchor manager setup
  let anchorManager: AnchorManager | null = null;
  if (canvas.parentElement) {
    anchorManager = createAnchorManager(canvas.parentElement);
  }

  function updateMarkerBuffers() {
    if (!markerInstanceBuffer || markers.length === 0) return;
    // Format: [x, y, z, size, r, g, b, hasColor] = 8 floats = 32 bytes per marker
    const data = new Float32Array(8 * markers.length);
    markers.forEach((m, idx) => {
      const v = latLongToVector3(m.location[0], m.location[1]);
      data.set(
        [
          v[0],
          v[1],
          v[2],
          m.size,
          ...(m.color || [0, 0, 0]),
          m.color ? 1 : 0,
        ],
        8 * idx
      );
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, markerInstanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }

  function updateArcBuffers() {
    if (!arcInstanceBuffer || arcs.length === 0) return;
    // Format: [fromX, fromY, fromZ, toX, toY, toZ, height, width, r, g, b, hasColor] = 12 floats = 48 bytes
    const data = new Float32Array(12 * arcs.length);
    arcs.forEach((a, idx) => {
      const vFrom = latLongToVector3(a.from[0], a.from[1]);
      const vTo = latLongToVector3(a.to[0], a.to[1]);
      data.set(
        [
          vFrom[0],
          vFrom[1],
          vFrom[2],
          vTo[0],
          vTo[1],
          vTo[2],
          a.height ?? arcHeight,
          0.005 * (a.width ?? arcWidth),
          ...(a.color || [0, 0, 0]),
          a.color ? 1 : 0,
        ],
        12 * idx
      );
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, arcInstanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
  }

  function projectLocation(
    loc: [number, number],
    elevation: number = markerElevation
  ): { x: number; y: number; visible: boolean } {
    const v = latLongToVector3(loc[0], loc[1]);
    const r = GLOBE_RADIUS + elevation;
    return project3DToScreen(
      [v[0] * r, v[1] * r, v[2] * r],
      phi,
      theta,
      canvas.width,
      canvas.height,
      scale,
      offset,
      dpr
    );
  }

  function projectArc(
    arc: { from: [number, number]; to: [number, number] },
    arcHeightVal: number = arcHeight
  ): { x: number; y: number; visible: boolean } | null {
    const vFrom = latLongToVector3(arc.from[0], arc.from[1]);
    const vTo = latLongToVector3(arc.to[0], arc.to[1]);
    const mid = [vFrom[0] + vTo[0], vFrom[1] + vTo[1], vFrom[2] + vTo[2]];
    const midLen = Math.hypot(mid[0], mid[1], mid[2]);
    if (midLen < 0.001) return null;

    const r = 0.25 * (GLOBE_RADIUS + markerElevation) + 0.5 * (GLOBE_RADIUS + arcHeightVal + markerElevation) / midLen;
    return project3DToScreen(
      [mid[0] * r, mid[1] * r, mid[2] * r],
      phi,
      theta,
      canvas.width,
      canvas.height,
      scale,
      offset,
      dpr
    );
  }

  function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 1. Draw Globe Sphere
    gl.useProgram(sphereProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(sphereAttribPos);
    gl.vertexAttribPointer(sphereAttribPos, 2, gl.FLOAT, false, 0, 0);
    vertexAttribDivisor(sphereAttribPos, 0);

    gl.uniform2f(sphereUniforms.resolution, canvas.width, canvas.height);
    gl.uniform2f(sphereUniforms.offset, offset[0] * dpr, offset[1] * dpr);
    gl.uniform2f(sphereUniforms.rotation, phi, theta);
    gl.uniform3fv(sphereUniforms.baseColor, baseColor);
    gl.uniform3fv(sphereUniforms.glowColor, glowColor);
    gl.uniform4f(sphereUniforms.params, mapBrightness, diffuse, dark, opacity);
    gl.uniform1f(sphereUniforms.samples, mapSamples);
    gl.uniform1f(sphereUniforms.scale, scale);
    gl.uniform1f(sphereUniforms.baseBrightness, mapBaseBrightness);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(sphereUniforms.mapTexture, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 2. Draw Arcs
    if (arcProgram && arcs.length > 0 && arcUniforms && arcAttribs) {
      gl.useProgram(arcProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, arcSegmentsBuffer);
      if (arcAttribs.segment >= 0) {
        gl.enableVertexAttribArray(arcAttribs.segment);
        gl.vertexAttribPointer(arcAttribs.segment, 2, gl.FLOAT, false, 0, 0);
        vertexAttribDivisor(arcAttribs.segment, 0);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, arcInstanceBuffer);
      const stride = 48; // 12 * 4 bytes
      const setupInstancedAttrib = (loc: number, size: number, byteOffset: number) => {
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, byteOffset);
          vertexAttribDivisor(loc, 1);
        }
      };

      setupInstancedAttrib(arcAttribs.from, 3, 0);
      setupInstancedAttrib(arcAttribs.to, 3, 12);
      setupInstancedAttrib(arcAttribs.height, 1, 24);
      setupInstancedAttrib(arcAttribs.width, 1, 28);
      setupInstancedAttrib(arcAttribs.color, 3, 32);
      setupInstancedAttrib(arcAttribs.hasColor, 1, 44);

      gl.uniform2f(arcUniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(arcUniforms.offset, offset[0] * dpr, offset[1] * dpr);
      gl.uniform1f(arcUniforms.phi, phi);
      gl.uniform1f(arcUniforms.theta, theta);
      gl.uniform1f(arcUniforms.scale, scale);
      gl.uniform1f(arcUniforms.elevation, markerElevation);
      gl.uniform3fv(arcUniforms.defaultColor, arcColor);

      drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 66, arcs.length);
    }

    // 3. Draw Markers
    if (markerProgram && markers.length > 0 && markerUniforms && markerAttribs) {
      gl.useProgram(markerProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      if (markerAttribs.corner >= 0) {
        gl.enableVertexAttribArray(markerAttribs.corner);
        gl.vertexAttribPointer(markerAttribs.corner, 2, gl.FLOAT, false, 0, 0);
        vertexAttribDivisor(markerAttribs.corner, 0);
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, markerInstanceBuffer);
      const stride = 32; // 8 * 4 bytes
      const setupInstancedAttrib = (loc: number, size: number, byteOffset: number) => {
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, byteOffset);
          vertexAttribDivisor(loc, 1);
        }
      };

      setupInstancedAttrib(markerAttribs.position, 3, 0);
      setupInstancedAttrib(markerAttribs.size, 1, 12);
      setupInstancedAttrib(markerAttribs.color, 3, 16);
      setupInstancedAttrib(markerAttribs.hasColor, 1, 28);

      gl.uniform2f(markerUniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(markerUniforms.offset, offset[0] * dpr, offset[1] * dpr);
      gl.uniform1f(markerUniforms.phi, phi);
      gl.uniform1f(markerUniforms.theta, theta);
      gl.uniform1f(markerUniforms.scale, scale);
      gl.uniform1f(markerUniforms.elevation, markerElevation);
      gl.uniform3fv(markerUniforms.defaultColor, markerColor);

      drawArraysInstanced(gl.TRIANGLES, 0, 6, markers.length);
    }

    // 4. Update CSS Anchors
    if (anchorManager) {
      anchorManager.updateMarkers(markers as any, (loc) => projectLocation(loc));
      anchorManager.updateArcs(arcs as any, (arc) => projectArc(arc));
      anchorManager.sync();
    }
  }

  // Animation frame loop
  let animationFrameId: number | null = null;
  let isDestroyed = false;

  function loop() {
    if (isDestroyed) return;
    if (autoRotate) {
      phi = (phi + autoRotateSpeed) % TWO_PI;
    }
    render();
    animationFrameId = requestAnimationFrame(loop);
  }

  // Interaction handlers
  let isPointerDown = false;
  let startX = 0;
  let startY = 0;
  let velocityX = 0;
  let velocityY = 0;

  function onPointerDown(e: PointerEvent) {
    if (!initialOptions.interactive) return;
    isPointerDown = true;
    startX = e.clientX;
    startY = e.clientY;
    velocityX = 0;
    velocityY = 0;
    canvas.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;

    velocityX = dx * 0.005;
    velocityY = dy * 0.005;

    phi = (phi + velocityX) % TWO_PI;
    theta = Math.max(-1.4, Math.min(1.4, theta - velocityY));
    render();
  }

  function onPointerUp(e: PointerEvent) {
    isPointerDown = false;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  if (initialOptions.interactive !== false && typeof window !== 'undefined') {
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
  }

  // Initial buffer uploads
  updateMarkerBuffers();
  updateArcBuffers();

  // Start loop
  loop();

  return {
    update(opts: Partial<GlobeOptions>) {
      if (isDestroyed) return;
      if (opts.width !== undefined && opts.height !== undefined) {
        width = opts.width * dpr;
        height = opts.height * dpr;
        canvas.width = width;
        canvas.height = height;
      }
      if (opts.phi !== undefined) phi = opts.phi;
      if (opts.theta !== undefined) theta = opts.theta;
      if (opts.dark !== undefined) dark = opts.dark;
      if (opts.diffuse !== undefined) diffuse = opts.diffuse;
      if (opts.mapSamples !== undefined) mapSamples = opts.mapSamples;
      if (opts.mapBrightness !== undefined) mapBrightness = opts.mapBrightness;
      if (opts.mapBaseBrightness !== undefined) mapBaseBrightness = opts.mapBaseBrightness;
      if (opts.baseColor !== undefined) baseColor = opts.baseColor;
      if (opts.markerColor !== undefined) markerColor = opts.markerColor;
      if (opts.glowColor !== undefined) glowColor = opts.glowColor;
      if (opts.arcColor !== undefined) arcColor = opts.arcColor;
      if (opts.arcWidth !== undefined) arcWidth = opts.arcWidth;
      if (opts.arcHeight !== undefined) arcHeight = opts.arcHeight;
      if (opts.markerElevation !== undefined) markerElevation = opts.markerElevation;
      if (opts.scale !== undefined) scale = opts.scale;
      if (opts.offset !== undefined) offset = opts.offset;
      if (opts.opacity !== undefined) opacity = opts.opacity;
      if (opts.autoRotate !== undefined) autoRotate = opts.autoRotate;
      if (opts.autoRotateSpeed !== undefined) autoRotateSpeed = opts.autoRotateSpeed;

      if (opts.markers !== undefined) {
        markers = opts.markers;
        updateMarkerBuffers();
      }
      if (opts.arcs !== undefined) {
        arcs = opts.arcs;
        updateArcBuffers();
      }

      render();
    },

    destroy() {
      isDestroyed = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (typeof window !== 'undefined') {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
      }
      if (anchorManager) {
        anchorManager.destroy();
      }

      gl.deleteBuffer(quadBuffer);
      gl.deleteBuffer(arcSegmentsBuffer);
      gl.deleteBuffer(markerInstanceBuffer);
      gl.deleteBuffer(arcInstanceBuffer);
      gl.deleteProgram(sphereProgram);
      if (markerProgram) gl.deleteProgram(markerProgram);
      if (arcProgram) gl.deleteProgram(arcProgram);
      gl.deleteTexture(texture);
    },

    getState() {
      return { phi, theta, width, height, scale };
    },

    getScreenCoordinates(location, elevation) {
      return projectLocation(location, elevation);
    },

    focusLocation(lat: number, lon: number, durationMs = 1000) {
      const targetPhi = (-lon * PI) / 180 + PI / 2;
      const targetTheta = (lat * PI) / 180;
      const startPhi = phi;
      const startTheta = theta;
      const startTime = performance.now();

      function animateStep(now: number) {
        if (isDestroyed) return;
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const ease = 0.5 - Math.cos(progress * PI) / 2; // smooth easeInOut

        phi = startPhi + (targetPhi - startPhi) * ease;
        theta = startTheta + (targetTheta - startTheta) * ease;
        render();

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        }
      }
      requestAnimationFrame(animateStep);
    },
  };
}

export default createGlobe;

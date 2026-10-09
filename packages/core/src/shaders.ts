export const SPHERE_VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const SPHERE_FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform vec2 u_rotation;
uniform vec3 u_baseColor;
uniform vec3 u_glowColor;
uniform vec4 u_params; // mapBrightness, diffuse, dark, opacity
uniform float u_samples;
uniform float u_scale;
uniform float u_baseBrightness;
uniform sampler2D u_mapTexture;

mat3 getRotationMatrix(float theta, float phi) {
  float c1 = cos(theta);
  float c2 = cos(phi);
  float s1 = sin(theta);
  float s2 = sin(phi);
  return mat3(
    c2, s2 * s1, -s2 * c1,
    0.0, c1, s1,
    s2, -c2 * s1, c2 * c1
  );
}

vec3 getNearestDot(vec3 dir, out float dist) {
  vec3 p = dir.xzy;
  float k = u_samples;
  float q = max(2.0, floor(log2(2.236068 * k * 3.141593 * (1.0 - p.z * p.z)) * 0.72021));
  vec2 g = floor(pow(1.618034, q) / 2.236068 * vec2(1.0, 1.618034) + 0.5);
  vec2 d = fract((g + 1.0) * 0.618034) * 6.283185 - 3.883222;
  vec2 e = -2.0 * g;
  vec2 f = vec2(atan(p.y, p.x), p.z - 1.0);
  vec2 r = floor(vec2(
    e.y * f.x - d.y * (f.y * k + 1.0),
    -e.x * f.x + d.x * (f.y * k + 1.0)
  ) / (d.x * e.y - e.x * d.y));

  float minDist = 3.141593;
  vec3 nearest = vec3(0.0);
  float invK = 1.0 / k;

  for (float h = 0.0; h < 4.0; h += 1.0) {
    vec2 offset = vec2(mod(h, 2.0), floor(h * 0.5));
    float j = dot(g, r + offset);
    if (j > k) continue;

    float a = j;
    float b = 0.0;
    if (a >= 16384.0) { a -= 16384.0; b += 0.868872; }
    if (a >= 8192.0)  { a -= 8192.0;  b += 0.934436; }
    if (a >= 4096.0)  { a -= 4096.0;  b += 0.467218; }
    if (a >= 2048.0)  { a -= 2048.0;  b += 0.733609; }
    if (a >= 1024.0)  { a -= 1024.0;  b += 0.866804; }
    if (a >= 512.0)   { a -= 512.0;   b += 0.433402; }
    if (a >= 256.0)   { a -= 256.0;   b += 0.216701; }
    if (a >= 128.0)   { a -= 128.0;   b += 0.108351; }
    if (a >= 64.0)    { a -= 64.0;    b += 0.554175; }
    if (a >= 32.0)    { a -= 32.0;    b += 0.777088; }
    if (a >= 16.0)    { a -= 16.0;    b += 0.888544; }
    if (a >= 8.0)     { a -= 8.0;     b += 0.944272; }
    if (a >= 4.0)     { a -= 4.0;     b += 0.472136; }
    if (a >= 2.0)     { a -= 2.0;     b += 0.236068; }
    if (a >= 1.0)     { a -= 1.0;     b += 0.618034; }

    float phiAngle = fract(b) * 6.283185;
    float zCoord = 1.0 - 2.0 * j * invK;
    float radius = sqrt(max(0.0, 1.0 - zCoord * zCoord));
    vec3 pt = vec3(cos(phiAngle) * radius, sin(phiAngle) * radius, zCoord);
    float curDist = length(p - pt);
    if (curDist < minDist) {
      minDist = curDist;
      nearest = pt;
    }
  }

  dist = minDist;
  return nearest.xzy;
}

void main() {
  vec2 invRes = 1.0 / u_resolution;
  vec2 coord = (gl_FragCoord.xy * invRes * 2.0 - 1.0) / u_scale - u_offset * vec2(1.0, -1.0) * invRes;
  coord.x *= u_resolution.x * invRes.y;
  
  float distSq = dot(coord, coord);
  float glowAlpha = 0.0;
  vec4 color = vec4(0.0);
  
  float mapBrightness = u_params.x;
  float diffuse = u_params.y;
  float dark = u_params.z;
  float opacity = u_params.w;

  if (distSq <= 0.64) {
    float nearestDist;
    vec3 normal = normalize(vec3(coord, sqrt(0.64 - distSq)));
    mat3 rot = getRotationMatrix(u_rotation.y, u_rotation.x);
    float zNormal = normal.z;
    
    vec3 nearestPt = getNearestDot(normal * rot, nearestDist);
    float lat = asin(nearestPt.y);
    float lon = acos(clamp(-nearestPt.x / cos(lat), -1.0, 1.0));
    lon = nearestPt.z < 0.0 ? -lon : lon;

    vec2 uv = vec2(lon * 0.5 / 3.141593, -(lat / 3.141593 + 0.5));
    float landMask = max(texture2D(u_mapTexture, uv).x, u_baseBrightness);
    float dotFactor = landMask * smoothstep(0.008, 0.0, nearestDist) * pow(zNormal, diffuse) * mapBrightness;

    vec3 surfaceColor = u_baseColor * (mix((1.0 - dotFactor) * pow(zNormal, 0.4), dotFactor, dark) + 0.1) 
                        + pow(1.0 - zNormal, 4.0) * u_glowColor;
    vec4 surfaceWithAlpha = vec4(surfaceColor, 1.0) * (1.0 + opacity) * 0.5;
    
    glowAlpha = (1.0 - distSq) * (1.0 - distSq) * smoothstep(0.0, 1.0, 0.2 / (distSq - 0.64));
    color = surfaceWithAlpha;
  } else {
    float r = sqrt(0.2 / (distSq - 0.64));
    glowAlpha = smoothstep(0.5, 1.0, r / (r + 1.0));
  }

  gl_FragColor = color + vec4(glowAlpha * u_glowColor, glowAlpha);
}
`;

export const MARKER_VERTEX_SHADER = `
attribute vec2 a_corner;
attribute vec3 a_position;
attribute float a_size;
attribute vec3 a_color;
attribute float a_hasColor;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_phi;
uniform float u_theta;
uniform float u_scale;
uniform float u_elevation;

varying vec2 v_corner;
varying vec3 v_color;
varying float v_hasColor;

void main() {
  float ct = cos(u_theta);
  float st = sin(u_theta);
  float cp = cos(u_phi);
  float sp = sin(u_phi);

  vec3 pos = a_position * (0.8 + u_elevation);
  vec3 rotated = vec3(
    cp * pos.x + sp * pos.z,
    sp * st * pos.x + ct * pos.y - cp * st * pos.z,
    -sp * ct * pos.x + st * pos.y + cp * ct * pos.z
  );

  if (rotated.z < 0.0 && length(rotated.xy) < 0.8) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    return;
  }

  float aspect = u_resolution.y / u_resolution.x;
  vec2 screenPos = (rotated.xy + a_corner * a_size * 2.0) * vec2(aspect, 1.0) * u_scale + u_offset * vec2(1.0, -1.0) * u_scale / u_resolution;
  gl_Position = vec4(screenPos, 0.0, 1.0);

  v_corner = a_corner;
  v_color = a_color;
  v_hasColor = a_hasColor;
}
`;

export const MARKER_FRAGMENT_SHADER = `
precision highp float;

uniform vec3 u_defaultColor;

varying vec2 v_corner;
varying vec3 v_color;
varying float v_hasColor;

void main() {
  float distSq = dot(v_corner, v_corner);
  if (distSq > 0.25) discard;
  
  float alpha = smoothstep(0.25, 0.20, distSq);
  vec3 finalColor = v_hasColor > 0.5 ? v_color : u_defaultColor;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

export const ARC_VERTEX_SHADER = `
attribute vec2 a_segment; // x: progress 0..1, y: side -1..1
attribute vec3 a_from;
attribute vec3 a_to;
attribute float a_height;
attribute float a_width;
attribute vec3 a_color;
attribute float a_hasColor;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_phi;
uniform float u_theta;
uniform float u_scale;
uniform float u_elevation;

varying vec3 v_color;
varying float v_hasColor;
varying float v_depth;
varying float v_radius;

mat3 getRotationMatrix(float theta, float phi) {
  float c1 = cos(theta);
  float c2 = cos(phi);
  float s1 = sin(theta);
  float s2 = sin(phi);
  return mat3(
    c2, s2 * s1, -s2 * c1,
    0.0, c1, s1,
    s2, -c2 * s1, c2 * c1
  );
}

vec3 evalBezier(vec3 p0, vec3 pControl, vec3 p1, float t) {
  float invT = 1.0 - t;
  return invT * invT * p0 + 2.0 * invT * t * pControl + t * t * p1;
}

vec3 evalBezierDeriv(vec3 p0, vec3 pControl, vec3 p1, float t) {
  float invT = 1.0 - t;
  return 2.0 * invT * (pControl - p0) + 2.0 * t * (p1 - pControl);
}

void main() {
  mat3 rot = getRotationMatrix(u_theta, u_phi);
  float baseR = 0.8 + u_elevation;
  vec3 p0 = a_from * baseR;
  vec3 p1 = a_to * baseR;
  vec3 mid = a_from + a_to;
  float midLen = length(mid);
  vec3 midNorm = midLen > 0.001 ? mid / midLen : vec3(0.0, 1.0, 0.0);
  vec3 pControl = midNorm * (0.8 + a_height);

  float t = a_segment.x;
  vec3 curvePos = evalBezier(p0, pControl, p1, t);
  vec3 rotPos = rot * curvePos;
  vec3 tangent = evalBezierDeriv(p0, pControl, p1, t);
  vec3 rotTangent = rot * tangent;

  vec2 tangent2D = rotTangent.xy;
  float tLen = length(tangent2D);
  vec2 normal2D = tLen > 0.001 ? vec2(-tangent2D.y, tangent2D.x) / tLen : vec2(1.0, 0.0);

  float aspect = u_resolution.x / u_resolution.y;
  vec2 baseScreen = rotPos.xy * vec2(1.0 / aspect, 1.0) * u_scale + u_offset * vec2(1.0, -1.0) * u_scale / u_resolution;
  vec2 offsetPos = baseScreen + normal2D * a_width * a_segment.y * u_scale;

  gl_Position = vec4(offsetPos, 0.0, 1.0);
  v_color = a_color;
  v_hasColor = a_hasColor;
  v_depth = rotPos.z;
  v_radius = length(rotPos.xy);
}
`;

export const ARC_FRAGMENT_SHADER = `
precision highp float;

uniform vec3 u_defaultColor;

varying vec3 v_color;
varying float v_hasColor;
varying float v_depth;
varying float v_radius;

void main() {
  if (v_depth < 0.0 && v_radius < 0.8) {
    discard;
  }
  vec3 finalColor = v_hasColor > 0.5 ? v_color : u_defaultColor;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

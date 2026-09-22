/**
 * Shaders ported from the 3D Interactive Gallery by Arun Kumar Bind.
 * https://github.com/abx15/3d-interactive-gallery  (stated MIT in its README)
 *
 * Inlined as template literals rather than imported from .glsl files: the
 * original project used `vite-plugin-glsl`, which has no equivalent in this
 * project's Turbopack build. They are short enough that inlining beats wiring
 * up a custom loader.
 */

/**
 * Bends each plane as it moves. `uOffset` curves the plane in the direction of
 * travel; `uStrength` pushes it in z based on its screen position, so images
 * near the edges of the viewport lean away from the camera while scrolling.
 */
export const galleryVertexShader = /* glsl */ `
precision highp float;
precision highp int;

uniform vec2 uOffset;
uniform vec2 uStrength;
uniform vec2 uViewportSizes;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
  position.x = position.x + (sin(uv.y * M_PI) * offset.x);
  position.y = position.y + (sin(uv.x * M_PI) * offset.y);
  return position;
}

void main() {
  vUv = uv;
  vec3 pos = deformationCurve(position, vUv, uOffset);

  vec4 newPosition = modelViewMatrix * vec4(pos, 1.0);
  newPosition.z += sin(newPosition.x / uViewportSizes.x * M_PI + M_PI / 2.0) * uStrength.x;
  newPosition.z += sin(newPosition.y / uViewportSizes.y * M_PI + M_PI / 2.0) * uStrength.y;

  gl_Position = projectionMatrix * newPosition;
}
`;

/**
 * Samples the texture with aspect-ratio-preserving "cover" behaviour, a slight
 * parallax offset, and a zoom. On hover it eases in a subtle inward push plus
 * a small RGB channel split.
 */
export const galleryFragmentShader = /* glsl */ `
precision highp float;
precision highp int;

uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uParallax;
uniform float uZoom;
uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform float uHover;

varying vec2 vUv;

float exponentialInOut(float t) {
  return t == 0.0 || t == 1.0
    ? t
    : t < 0.5
      ? 0.5 * pow(2.0, (20.0 * t) - 10.0)
      : -0.5 * pow(2.0, 10.0 - (20.0 * t)) + 1.0;
}

void main() {
  // "background-size: cover" in shader form.
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5 + uParallax.x,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5 + uParallax.y
  );

  vec2 zoomedUv = mix(vec2(0.5), uv, uZoom);

  float hoverLevel = exponentialInOut(min(1.0, distance(vec2(0.5), zoomedUv) * uHover + uHover));
  zoomedUv *= 1.0 - 0.2 * hoverLevel;
  zoomedUv += 0.1 * hoverLevel;
  zoomedUv = clamp(zoomedUv, 0.0, 1.0);

  vec4 color = texture2D(uTexture, zoomedUv);

  if (uHover > 0.0) {
    float h = 1.0 - abs(hoverLevel - 0.5) * 2.0;
    zoomedUv.y += color.r * h * 0.05;
    color = texture2D(uTexture, zoomedUv);
    color.r = texture2D(uTexture, zoomedUv + h * 0.01).r;
    color.g = texture2D(uTexture, zoomedUv - h * 0.01).g;
  }

  gl_FragColor = mix(vec4(1.0, 1.0, 1.0, uAlpha), color, uAlpha);
}
`;

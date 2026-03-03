// Space-Warp Transition — Fragment Shader
// Cinematic hyperspace effect: radial UV distortion + RGB split + star streaks + energy flash
precision highp float;

uniform float u_time;       // elapsed seconds
uniform float u_progress;   // 0→1→0 animation drive
uniform vec2  u_resolution; // viewport px

varying vec2 vUv;

// ── Hash / noise ──────────────────────────────────────────────────────────────
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

// ── Radial warp UV distortion ─────────────────────────────────────────────────
vec2 warpUV(vec2 uv, float strength) {
  vec2 center = vec2(0.5);
  vec2 diff   = uv - center;
  float dist  = length(diff);

  // Black-hole pull: pull UV toward center, more near edges when strength peaks
  float pullPow = 2.2;
  float pull    = pow(dist, pullPow) * strength * 3.8;
  vec2 warped   = uv - normalize(diff) * pull * dist;

  // Radial stretch: elongate along the pull direction
  float stretch = 1.0 + strength * 2.4 * (1.0 - dist);
  warped        = center + (warped - center) * mix(1.0, stretch, strength * 0.6);

  return warped;
}

// ── Star streaks ──────────────────────────────────────────────────────────────
float starStreak(vec2 uv, float progress) {
  vec2 center = vec2(0.5);
  vec2 dir    = normalize(uv - center + 0.0001);
  float rad   = length(uv - center);

  // Streak lives in an annular band
  float band  = smoothstep(0.05, 0.48, rad) * smoothstep(0.70, 0.45, rad);

  // Polar angle quantised into N beams
  float angle = atan(dir.y, dir.x);
  float beams = 0.0;
  for (int i = 0; i < 32; i++) {
    float fi    = float(i);
    float phase = fi * 0.19635 /* PI*2/32 */ + hash(vec2(fi, 0.0)) * 1.2;
    float w     = 0.012 + hash(vec2(fi, 1.0)) * 0.018;
    float d     = abs(mod(angle - phase + 3.14159, 6.28318) - 3.14159);
    beams      += smoothstep(w, 0.0, d) * (0.5 + hash(vec2(fi, 2.0)) * 0.5);
  }

  // Speed: streaks appear sharply at peak, fade on settle
  float appear  = smoothstep(0.30, 0.65, progress);
  float fadeOut = smoothstep(0.85, 0.72, progress);

  return beams * band * appear * fadeOut * (0.6 + 0.4 * noise(dir * 8.0 + u_time));
}

// ── Vignette helper ───────────────────────────────────────────────────────────
float vignette(vec2 uv, float strength) {
  vec2 d = abs(uv - 0.5) * 2.0;
  return 1.0 - smoothstep(0.2, 1.4, length(d) * strength);
}

void main() {
  // Cubic ease in-out on [0,1] → [1,0] → [0,0] — peak at ~0.5
  // progress 0→1 = entering, 1→0 = settling
  float p       = u_progress;
  float peak    = sin(p * 3.14159);         // 0…1…0 bell across full anim
  float entering = step(0.5, p);            // 1 during second half

  // ── UV distortion ───────────────────────────────────────────────────────
  float warpStr = peak * 0.82;
  vec2  warpedR = warpUV(vUv, warpStr * 1.05);
  vec2  warpedG = warpUV(vUv, warpStr);
  vec2  warpedB = warpUV(vUv, warpStr * 0.95);

  // Chromatic aberration offset on top of warp
  vec2 center    = vec2(0.5);
  vec2 aberrOff  = normalize(vUv - center + 0.0001) * peak * 0.018;
  warpedR       += aberrOff;
  warpedB       -= aberrOff;

  // ── Sample colour ────────────────────────────────────────────────────────
  // We don't have a scene texture, so we build the OVERLAY colour from scratch.
  // Overlay is additive on top of whatever is beneath (blending in React).
  // Deep-space black base with starfield noise
  float baseNoise = noise((vUv - center) * 6.0 + u_time * 0.4) * 0.06;
  vec3  spaceBg   = vec3(0.0, 0.01, 0.02) + baseNoise;

  // Star streaks
  float streaks   = starStreak(vUv, p);
  vec3  streakCol = mix(
    vec3(0.55, 0.88, 1.0),          // cool ice-blue
    vec3(0.85, 0.60, 1.0),          // violet fringe
    noise(vUv * 12.0 + u_time)
  );

  vec3 colour = spaceBg + streakCol * streaks;

  // Central glow orb (the "black hole singularity")
  float centreDist = length(vUv - 0.5);
  float singularity = smoothstep(0.12, 0.0, centreDist) * peak * 1.4;
  colour += vec3(0.3, 0.7, 1.0) * singularity;

  // Energy flash at ~80% of path (peak ≈ 0.8 progress)
  float flashCurve = smoothstep(0.70, 0.80, p) * smoothstep(1.0, 0.85, p);
  colour += vec3(0.6, 0.9, 1.0) * flashCurve * 2.2;
  colour += vec3(0.9, 0.7, 1.0) * flashCurve * 0.8;

  // ── Alpha ─────────────────────────────────────────────────────────────────
  // Screen goes mostly black during peak warp, then fades clear.
  float blackout = smoothstep(0.0, 0.55, p) * smoothstep(1.0, 0.60, p);
  float fade     = smoothstep(0.75, 1.0, p);  // fade out on settle

  float alpha = blackout * (1.0 - fade * 0.95);
  alpha       = clamp(alpha, 0.0, 1.0);

  // Edge vignette keeps UI corners from popping
  alpha *= vignette(vUv, 1.0) * 0.94 + 0.06;

  // Add streaks & singularity to alpha so they show even without blackout
  alpha = max(alpha, streaks * 0.55);
  alpha = max(alpha, singularity * 0.75);
  alpha = max(alpha, flashCurve * 0.85);
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(colour, alpha);
}

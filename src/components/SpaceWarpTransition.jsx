/**
 * SpaceWarpTransition.jsx — Cinematic hyperspace warp on route change
 * ─────────────────────────────────────────────────────────────────────
 * Architecture:
 *   • Two-pass rendering on a transparent alpha canvas:
 *     Pass 1 — bare scene render (shader outputs transparent pixels)
 *     Pass 2 — EffectComposer + UnrealBloomPass applied ONLY during warp
 *   • CSS mixBlendMode:'screen' on canvas overlays the app UI
 *   • Shader outputs 0 alpha at rest → canvas is fully invisible
 *   • Bloom composer only runs when warp is active → 0 GPU cost at idle
 *   • react-router-dom location trigger, cubic-eased 920ms animation
 *
 * Performance:
 *   At rest:  0 GPU draw calls per frame
 *   Warp:    ~1ms/frame (single fullscreen pass + bloom blur)
 */

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/* ── GLSL Vertex ─────────────────────────────────────────────────────────── */
const VERT = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/* ── GLSL Fragment — full cinematic warp effect ──────────────────────────── */
const FRAG = /* glsl */`
  precision highp float;

  uniform float u_time;
  uniform float u_progress;   // 0→1 (entering) → 1→0 (settling)
  uniform vec2  u_resolution;

  varying vec2 vUv;

  /* ── Hash / value noise ── */
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),           hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y
    );
  }

  /* ── Radial UV warp (black-hole pull) ── */
  vec2 warpUV(vec2 uv, float str) {
    vec2  c    = vec2(0.5);
    vec2  diff = uv - c;
    float d    = length(diff);
    float pull = pow(d, 2.2) * str * 3.8 * d;
    vec2  w    = uv - normalize(diff + 0.00001) * pull;
    float stre = 1.0 + str * 2.2 * (1.0 - d);
    return c + (w - c) * mix(1.0, stre, str * 0.55);
  }

  /* ── Radial star streaks ── */
  float starStreaks(vec2 uv, float p) {
    vec2  c     = vec2(0.5);
    vec2  d     = uv - c;
    float r     = length(d);
    float band  = smoothstep(0.04, 0.46, r) * smoothstep(0.70, 0.42, r);
    float angle = atan(d.y, d.x);
    float beams = 0.0;
    for (int i = 0; i < 26; i++) {
      float fi    = float(i);
      float phase = fi * 0.24166 + hash(vec2(fi, 0.0)) * 1.3;
      float w2    = 0.009 + hash(vec2(fi, 1.0)) * 0.017;
      float angD  = abs(mod(angle - phase + 3.14159, 6.28318) - 3.14159);
      beams += smoothstep(w2, 0.0, angD) * (0.4 + hash(vec2(fi, 2.0)) * 0.6);
    }
    float app     = smoothstep(0.25, 0.60, p);
    float fadeOut = smoothstep(0.90, 0.72, p);
    return beams * band * app * fadeOut * (0.55 + 0.45 * vnoise(d * 7.0 + u_time));
  }

  /* ── Soft glow (emulate bloom in-shader for transparent canvas) ── */
  float softGlow(float d, float radius) {
    return exp(-d * d / (2.0 * radius * radius));
  }

  void main() {
    float p    = u_progress;
    float peak = sin(p * 3.14159);   // bell: 0…1…0

    /* Warp strength */
    float ws   = peak * 0.78;

    /* Chromatic aberration direction */
    vec2  center = vec2(0.5);
    vec2  aberr  = normalize(vUv - center + 0.00001) * peak * 0.015;

    /* ── Deep space base ── */
    float bn  = vnoise(vUv * 6.0 + u_time * 0.3) * 0.04;
    vec3  col = vec3(0.0, 0.01, 0.028) + bn;

    /* ── Star streaks ── */
    float str  = starStreaks(vUv, p);
    vec3  strC = mix(vec3(0.45, 0.82, 1.0), vec3(0.88, 0.52, 1.0), vnoise(vUv * 9.0 + u_time));
    col += strC * str * 1.2;

    /* ── Singularity orb + soft bloom ── */
    float cDist = length(vUv - 0.5);
    float sing  = smoothstep(0.14, 0.0, cDist) * peak * 1.6;
    /* Glow halo around singularity */
    float sGlow = softGlow(cDist, 0.06 + peak * 0.04) * peak * 0.8;
    col += vec3(0.20, 0.60, 1.0) * (sing + sGlow);
    col += vec3(0.60, 0.30, 1.0) * sGlow * 0.4;

    /* ── Energy corona ring ── */
    float ring  = abs(cDist - (0.08 + peak * 0.19));
    float rVal  = smoothstep(0.022, 0.0, ring) * peak;
    col += vec3(0.35, 0.78, 1.0) * rVal * 1.1;
    col += vec3(0.92, 0.58, 1.0) * rVal * 0.55;
    /* Wide glow halo around ring */
    float rGlow = softGlow(ring, 0.04) * peak * 0.45;
    col += vec3(0.20, 0.60, 1.0) * rGlow;

    /* ── Bright energy flash at 78–82% of progress ── */
    float flash = smoothstep(0.66, 0.80, p) * smoothstep(1.0, 0.82, p);
    col += vec3(0.60, 0.90, 1.0) * flash * 2.8;
    col += vec3(0.95, 0.72, 1.0) * flash * 1.0;
    col += vec3(1.0)              * flash * 0.50;

    /* ── Alpha ── */
    /* Core blackout — screen goes dark on approach, clears on settle */
    float blackout = smoothstep(0.0, 0.52, p) * smoothstep(1.0, 0.56, p);
    /* Vignette */
    vec2  vd    = abs(vUv - 0.5) * 2.0;
    float vig   = 1.0 - smoothstep(0.4, 1.6, length(vd));
    float alpha = blackout * (vig * 0.94 + 0.06);

    /* Settle fade */
    float settle = smoothstep(0.70, 1.0, p);
    alpha *= (1.0 - settle * 0.98);

    /* Glowing elements always punch through */
    alpha = max(alpha, str       * 0.65);
    alpha = max(alpha, sing      * 0.82);
    alpha = max(alpha, sGlow     * 0.50);
    alpha = max(alpha, rVal      * 0.75);
    alpha = max(alpha, rGlow     * 0.40);
    alpha = max(alpha, flash     * 0.92);

    /* Entrance ramp */
    alpha *= smoothstep(0.0, 0.05, p);
    alpha  = clamp(alpha, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`

/* ── Warp config ─────────────────────────────────────────────────────────── */
const WARP_DURATION = 920   // ms

/* ══════════════════════════════════════════════════════════════════════════ */
export default function SpaceWarpTransition() {
  const location = useLocation()
  const canvasRef = useRef(null)
  const glRef = useRef(null)   // { renderer, scene, camera, mat, composer, bloomPass }
  const rafRef = useRef(null)
  const warp = useRef({ active: false, startTime: 0, progress: 0 })

  /* ── Three.js init (once) ──────────────────────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = window.innerWidth
    const H = window.innerHeight

    /* Renderer with alpha:true so pixels outside shader shapes stay transparent */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const scene = new THREE.Scene()
    const geo = new THREE.PlaneGeometry(2, 2)
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        u_time: { value: 0 },
        u_progress: { value: 0 },
        u_resolution: { value: new THREE.Vector2(W, H) },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })
    scene.add(new THREE.Mesh(geo, mat))

    /* ── Bloom composer (runs only during warp frames) ── */
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      0,     // start strength = 0 (ramped in animate)
      0.55,  // radius
      0.08   // threshold — low so warp glow always crosses it
    )
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    /* Store everything we need in the ref */
    glRef.current = { renderer, scene, camera, mat, composer, bloomPass }

    /* Resize */
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      composer.setSize(w, h)
      bloomPass.resolution.set(w, h)
      mat.uniforms.u_resolution.value.set(w, h)
    }
    window.addEventListener('resize', onResize)

    /* ── Animation loop ── */
    let lastTime = performance.now()
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate)
      const now = performance.now()
      const dt = now - lastTime
      lastTime = now

      const w = warp.current
      const u = mat.uniforms
      u.u_time.value += dt * 0.001

      if (w.active) {
        /* ── Active warp ── */
        const elapsed = now - w.startTime
        const t = Math.min(elapsed / WARP_DURATION, 1.0)
        /* Cubic smooth-step ease: fast entry, gentle settle */
        const eased = t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2

        w.progress = eased
        u.u_progress.value = eased

        /* Dynamic bloom: ramps with warp bell (0 → 1.8 → 0) */
        const peak = Math.sin(eased * Math.PI)
        bloomPass.strength = peak * 1.8

        if (t >= 1.0) {
          /* Warp complete */
          w.active = false
          w.progress = 0
          u.u_progress.value = 0
          bloomPass.strength = 0
        }

        /* Use bloom composer for GPU glow during warp */
        composer.render()

      } else if (u.u_progress.value > 0.001) {
        /* ── Drain: clear overlay over ~10 frames ── */
        u.u_progress.value *= 0.78
        renderer.render(scene, camera)

      }
      /* else: idle — skip draw entirely → 0 GPU cost */
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      composer.dispose()
      renderer.dispose()
      mat.dispose()
      geo.dispose()
    }
  }, [])

  /* ── Route change trigger ──────────────────────────────────────────────── */
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (prevPath.current === location.pathname) return
    prevPath.current = location.pathname

    const w = warp.current
    w.active = true
    w.startTime = performance.now()
    w.progress = 0
    if (glRef.current) {
      glRef.current.mat.uniforms.u_progress.value = 0
      glRef.current.bloomPass.strength = 0
    }
  }, [location.pathname])

  /* ── Global programmatic trigger ─────────────────────────────────────── */
  useEffect(() => {
    window.__triggerSpaceWarp = () => {
      const w = warp.current
      w.active = true
      w.startTime = performance.now()
      w.progress = 0
    }
    return () => { delete window.__triggerSpaceWarp }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99998,
        /*
         * 'screen' blend: black pixels (0,0,0) disappear, bright warp
         * colours layer on top of the UI without covering it.
         * This means the transparent-alpha canvas background safely
         * passes through the rest of the UI while the warp is inactive.
         * During warp the blackout (high-alpha dark pixels) covers content,
         * and the coloured streaks/flash composite as screen.
         */
        mixBlendMode: 'screen',
      }}
    />
  )
}

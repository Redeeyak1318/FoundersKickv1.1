/**
 * lib/postprocessing.js — Phase 6
 * ─────────────────────────────────
 * Advanced EffectComposer pipeline:
 *
 *   1. RenderPass          — base scene
 *   2. UnrealBloomPass     — selective GPU glow
 *   3. ChromaticAberration — RGB split ShaderPass
 *   4. FilmGrain           — very subtle noise grain
 *   5. Vignette            — minimal edge darkening
 *   6. OutputPass          — gamma / tone mapping
 *
 * Usage:
 *   const pipeline = createPipeline(renderer, scene, camera)
 *   // in animate loop:
 *   pipeline.render(dt)
 *   // on resize:
 *   pipeline.resize(w, h)
 *   // cleanup:
 *   pipeline.dispose()
 */

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/* ── Chromatic Aberration ─────────────────────────────────────────────── */
export const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0.0007 },
    uTime: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float     uStrength;
    uniform float     uTime;
    varying vec2      vUv;
    void main() {
      vec2 off = (vUv - .5) * uStrength;
      /* Subtle radial falloff — only strong at edges */
      off *= length(vUv - .5) * 2.2;
      float r = texture2D(tDiffuse, vUv - off).r;
      float g = texture2D(tDiffuse, vUv      ).g;
      float b = texture2D(tDiffuse, vUv + off).b;
      float a = texture2D(tDiffuse, vUv      ).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
}

/* ── Film Grain ───────────────────────────────────────────────────────── */
export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uStrength: { value: 0.032 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float     uTime;
    uniform float     uStrength;
    varying vec2      vUv;
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    void main() {
      vec4 col  = texture2D(tDiffuse, vUv);
      float g   = rand(vUv + fract(uTime * .017)) - .5;
      col.rgb  += g * uStrength;
      gl_FragColor = col;
    }
  `,
}

/* ── Vignette ─────────────────────────────────────────────────────────── */
export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uStrength: { value: 0.38 },
    uSmoothness: { value: 0.55 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform float     uStrength;
    uniform float     uSmoothness;
    varying vec2      vUv;
    void main() {
      vec4  col  = texture2D(tDiffuse, vUv);
      vec2  uv2  = vUv * (1. - vUv.yx);
      float vig  = uv2.x * uv2.y * 15.;
      vig        = pow(vig, uStrength);
      vig        = smoothstep(0., uSmoothness, vig);
      col.rgb   *= vig;
      gl_FragColor = col;
    }
  `,
}

/* ── Pipeline factory ─────────────────────────────────────────────────── */
export function createPipeline(renderer, scene, camera, options = {}) {
  const {
    bloomStrength = 1.35,
    bloomRadius = 0.60,
    bloomThreshold = 0.22,
    grainStrength = 0.028,
    vigStrength = 0.32,
    chromaStrength = 0.0007,
  } = options

  const size = renderer.getSize(new THREE.Vector2())

  const composer = new EffectComposer(renderer)

  /* 1. Base render */
  composer.addPass(new RenderPass(scene, camera))

  /* 2. UnrealBloom — cinematic glow */
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(size.x, size.y),
    bloomStrength,
    bloomRadius,
    bloomThreshold
  )
  composer.addPass(bloom)

  /* 3. Chromatic aberration */
  const chroma = new ShaderPass(ChromaticAberrationShader)
  chroma.uniforms.uStrength.value = chromaStrength
  composer.addPass(chroma)

  /* 4. Film grain */
  const grain = new ShaderPass(FilmGrainShader)
  grain.uniforms.uStrength.value = grainStrength
  composer.addPass(grain)

  /* 5. Vignette */
  const vignette = new ShaderPass(VignetteShader)
  vignette.uniforms.uStrength.value = vigStrength
  composer.addPass(vignette)

  /* 6. Output (gamma + tone mapping) */
  composer.addPass(new OutputPass())

  /* Public API */
  let _t = 0
  return {
    composer,
    bloom,
    chroma,
    grain,
    vignette,

    render(dt = .016) {
      _t += dt
      chroma.uniforms.uTime.value = _t
      grain.uniforms.uTime.value = _t
      composer.render()
    },

    setBloomStrength(v) { bloom.strength = v },

    resize(w, h) {
      composer.setSize(w, h)
      bloom.resolution.set(w, h)
    },

    dispose() {
      composer.dispose()
    },
  }
}

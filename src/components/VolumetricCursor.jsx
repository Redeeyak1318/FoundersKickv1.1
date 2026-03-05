/**
 * VolumetricCursor.jsx — Phase 1 + 2
 * ────────────────────────────────────
 * True 3D volumetric plasma orb via GLSL raymarching.
 *
 * Phases implemented:
 *   ► Phase 1  — Signed Distance Field raymarching, 3D simplex noise,
 *                plasma veins, Fresnel edges, volumetric fog falloff,
 *                depth-based light scattering, camera parallax
 *   ► Phase 2  — Black hole hover (accretion disk, UV warp, lensing),
 *                singularity burst on click, chromatic shockwave,
 *                snow spiral via window.__quantumCursor
 *
 * Performance:
 *   – Analytic ray-sphere bounds test skips march for off-cursor pixels
 *   – 40-step adaptive march (step ≥ 0.012 min)
 *   – Early-discard if pixel > 8×R from cursor
 *   – Runs bare renderer.render() — no extra EffectComposer overhead
 *   – cusor canvas mixBlendMode:'screen' → GPU compositing for free bloom
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useScrollVelocity } from '../hooks/useScrollVelocity'
import { useAudioReactive } from '../hooks/useAudioReactive'

/* ══════════════════════════════════════════════════════════════════════════
   GLSL VERTEX
══════════════════════════════════════════════════════════════════════════ */
const VERTEX = /* glsl */`
  uniform float uDepthX;
  uniform float uDepthY;
  varying vec2  vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += sin(uv.x * 3.14159) * uDepthX * 0.06
           + sin(uv.y * 3.14159) * uDepthY * 0.06;
    gl_Position = vec4(pos, 1.0);
  }
`

/* ══════════════════════════════════════════════════════════════════════════
   GLSL FRAGMENT — Volumetric Raymarching
══════════════════════════════════════════════════════════════════════════ */
const FRAGMENT = /* glsl */`
  precision highp float;

  /* ── Core uniforms ── */
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uVelocity;
  uniform float uHover;
  uniform float uBlackHole;    // 0..1 collapse intensity
  uniform float uClick;
  uniform vec2  uResolution;
  uniform float uFadeIn;
  uniform float uScrollVel;
  uniform float uAudioBass;
  uniform float uAudioMid;
  uniform float uAudioHigh;
  uniform float uPulse;
  uniform float uPulseRing;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uDepthX;
  uniform float uDepthY;

  varying vec2 vUv;

  /* ── 3D Simplex Noise (proper Gustavson impl) ── */
  vec3 mod289v3(vec3 x) { return x - floor(x*(1./289.))*289.; }
  vec4 mod289v4(vec4 x) { return x - floor(x*(1./289.))*289.; }
  vec4 permute(vec4 x) { return mod289v4(((x*34.)+1.)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float snoise3(vec3 v) {
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0., 0.5, 1., 2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0., i1.z, i2.z, 1.))
      + i.y + vec4(0., i1.y, i2.y, 1.))
      + i.x + vec4(0., i1.x, i2.x, 1.));
    float n_ = .142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.*floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.*x_);
    vec4 x = x_*ns.x + ns.yyyy;
    vec4 y = y_*ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.+1.;
    vec4 s1 = floor(b1)*2.+1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
    m = m*m;
    return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  /* ── 3D FBM ── */
  float fbm3(vec3 p) {
    float v = 0., a = 0.5;
    for(int i = 0; i < 4; i++) {
      v += a * snoise3(p);
      p *= 2.05; a *= 0.5;
    }
    return v;
  }

  /* ── SDF: turbulent plasma sphere ── */
  float orbSDF(vec3 p, float r, float audio) {
    float n  = fbm3(p * 2.4 + vec3(uTime*0.28, uTime*0.19, uTime*0.14));
    float n2 = fbm3(p * 4.2 - vec3(0., uTime*0.35, uTime*0.22)) * 0.5;
    float turb = (n + n2) * (0.11 + audio * 0.08 + uScrollVel * 0.04);
    return length(p) - (r + turb);
  }

  /* ── Numeric normal ── */
  vec3 orbNormal(vec3 p, float r, float audio) {
    const float e = 0.003;
    return normalize(vec3(
      orbSDF(p+vec3(e,0,0),r,audio) - orbSDF(p-vec3(e,0,0),r,audio),
      orbSDF(p+vec3(0,e,0),r,audio) - orbSDF(p-vec3(0,e,0),r,audio),
      orbSDF(p+vec3(0,0,e),r,audio) - orbSDF(p-vec3(0,0,e),r,audio)
    ));
  }

  /* ── Plasma vein pattern ── */
  float veinPattern(vec3 p) {
    float v1 = snoise3(p * 3.2 + vec3(uTime*0.45, 0., 0.));
    float v2 = snoise3(p * 5.5 - vec3(0., uTime*0.38, 0.));
    float v3 = snoise3(p * 8.1 + vec3(uTime*0.20, uTime*0.28, 0.));
    /* Vein: sharp ridges */
    return 1. - abs(v1*0.5 + v2*0.3 + v3*0.2);
  }

  void main() {
    vec2 aspect = uResolution / min(uResolution.x, uResolution.y);
    vec2 pixPos  = vUv * aspect;
    vec2 mPos    = uMouse * aspect;

    /* Velocity squeeze */
    float spd    = length(uVelocity) * 280.;
    vec2 velDir  = spd > .001 ? normalize(uVelocity) : vec2(1,0);
    vec2 perp    = vec2(-velDir.y, velDir.x);
    vec2 diff2D  = pixPos - mPos;
    float along  = dot(diff2D, velDir);
    float side   = dot(diff2D, perp);
    float sqX    = 1. + spd * .011 + uScrollVel * .16;
    float sqY    = max(.5, 1. - spd * .007);
    vec2  diffS  = velDir * along / sqX + perp * side / sqY;

    /* Cursor radius in aspect space */
    float audioScale = 1. + uAudioBass*.32 + uAudioMid*.10;
    float breath = 1. + .06*sin(uTime*1.6 + uPulse*6.28) + uPulse*.10;
    float R      = 0.050 * breath * audioScale;
    float hoverR = R * (1. + uHover*.48 + uBlackHole*.3);

    /* ── Early discard ── */
    float dist2D = length(diffS);
    if(dist2D > hoverR * 9.) { gl_FragColor = vec4(0.); return; }

    /* ── Set up perspective ray in cursor's local 3D space ── */
    float aspect2 = uResolution.x / uResolution.y;
    /* localUV maps cursor area to unit sphere view */
    vec2  localUV = diffS / hoverR;
    vec3  ro = vec3(0., 0., 2.2);           // camera above orb
    vec3  rd = normalize(vec3(localUV * .7, -2.2));

    /* Analytic ray-sphere intersection (bounding sphere radius 1.6) */
    float bR  = 1.6;
    float a   = dot(rd, rd);
    float b   = 2.*dot(ro, rd);
    float c   = dot(ro, ro) - bR*bR;
    float disc = b*b - 4.*a*c;

    vec3  col   = vec3(0.);
    float alpha = 0.;
    float audio = uAudioBass + uAudioMid * .5;

    if(disc > 0.) {
      /* March only between sphere entry and exit */
      float t0 = max((-b - sqrt(disc)) / (2.*a), 0.);
      float t1 = (-b + sqrt(disc)) / (2.*a);
      float t  = t0;
      vec3  hitPos = vec3(0.);
      bool  hit    = false;

      for(int i = 0; i < 40; i++) {
        if(t > t1 + .05) break;
        vec3  p = ro + rd * t;
        float d = orbSDF(p, 1., audio);
        if(d < .006) { hitPos = p; hit = true; break; }
        t += max(d * .55, .012);
      }

      if(hit) {
        vec3 N = orbNormal(hitPos, 1., audio);
        vec3 V = -rd;
        float NdV = max(dot(N, V), 0.);

        /* ── Fresnel ── */
        float fresnel = pow(1. - NdV, 2.8);

        /* ── Depth-based light scattering ── */
        /* simulate 'thickness' by tracing a secondary ray inward */
        float thickness = 0.;
        vec3 innerP = hitPos - N * .15;
        for(int j = 0; j < 6; j++) {
          innerP -= N * .06;
          thickness += max(.5 - orbSDF(innerP, 1., audio), 0.);
        }
        thickness = clamp(thickness * .35, 0., 1.);

        /* ── Plasma veins ── */
        float vein = veinPattern(hitPos);
        float veinSharp = pow(vein, 3.5);     // sharp bright ridge

        /* ── Energy currents (animated surface flow) ── */
        float flow = snoise3(hitPos * 5. + vec3(0., 0., uTime*.55));
        float flowAnim = flow * .5 + .5;

        /* ── Volumetric fog colour ── */
        vec3 plasma    = vec3(.92, .97, 1.0);     // hot white core
        float colorMix = smoothstep(0., .8, length(hitPos)*.6 + fresnel*.4);
        vec3 coreCol   = mix(plasma, uColorA, .45);
        col            = mix(coreCol, uColorB, colorMix);

        /* Deep volumetric light (scattering inside) */
        col         += uColorA * thickness * .55;
        col          = mix(col, plasma * 1.15, NdV * NdV * .5);

        /* Plasma vein brightening */
        col += mix(uColorA, vec3(.9,.98,1.), .5) * veinSharp * .7;
        col += uColorB * flowAnim * .25;

        /* Audio enhancement */
        col += uColorA * uAudioBass * .40;
        col += mix(uColorA, uColorB, .5) * uAudioMid * .25;
        col += plasma * uAudioHigh * veinSharp * .22;

        /* Scroll warm-shift */
        col += vec3(.28, 0., -.08) * uScrollVel * (1.-NdV) * .5;

        /* Fresnel  edge */
        col += uColorB * fresnel * 1.6;
        col += plasma  * fresnel * .5;

        /* Depth chromatic (parallax) */
        col.r += uDepthX * .06 * fresnel;
        col.b += -uDepthX * .06 * fresnel;

        /* Pulse energy */
        col += uColorA * uPulse * .38;
        col += uColorB * uPulseRing * .28;

        /* ── Alpha ── */
        alpha = (.90 + fresnel*.10 + thickness*.08) * uFadeIn;
        alpha = min(alpha + uPulse*.08, 1.);

        /* Click flash */
        col  += vec3(.68, .95, 1.) * uClick * (1.-NdV) * 1.4;
        alpha = min(alpha + uClick * .25, 1.);

        /* ── Hover brightness ── */
        col *= 1. + uHover * .38;
      }
    }

    /* ── Volumetric halo  (outside march) ── */
    float halo    = smoothstep(hoverR * 3.8, 0., dist2D)
                  * (1. - smoothstep(hoverR * .85, hoverR * 1.15, dist2D));
    float farGlow = exp(-dist2D / (hoverR * 2.8)) * .14;
    col  += mix(uColorA, uColorB, .38) * (halo*.42 + farGlow);
    col  += uColorA * uAudioBass * farGlow * .6;
    alpha = max(alpha, (halo*.38 + farGlow*.5) * uFadeIn);

    /* ── AI Pulse rings ── */
    {
      float pr  = hoverR * (1.9 + 2.0 * fract(uTime * .29 + uPulse));
      float prd = abs(dist2D - pr);
      float pA  = smoothstep(hoverR*.45, 0., prd) * uPulse * .65;
      col   += mix(uColorA, vec3(.9,.98,1.), .55) * pA;
      alpha  = max(alpha, pA * .55 * uFadeIn);

      float pr2  = hoverR * (1.2 + 3.6 * fract(uTime*.20 + uPulseRing + .5));
      float prd2 = abs(dist2D - pr2);
      float pA2  = smoothstep(hoverR*.38, 0., prd2) * uPulseRing * .48;
      col   += uColorB * pA2;
      alpha  = max(alpha, pA2 * .42 * uFadeIn);
    }

    /* ══════════════════════════════════════════════════════════
       PHASE 2 — BLACK HOLE HOVER MODE
    ══════════════════════════════════════════════════════════ */
    if(uBlackHole > 0.01) {
      float bh = uBlackHole;

      /* Accretion disk: ring at 1.4–1.9×R, spinning */
      float diskR   = hoverR * (1.5 + bh * .35);
      float diskT   = hoverR * (.30 - bh * .08);
      float toOrb   = length(diff2D);
      float diskD   = abs(toOrb - diskR);
      float angle   = atan(diff2D.y, diff2D.x)
                    + uTime * (1.4 + bh * 1.2)
                    + dist2D * .4;

      /* Multiple disk arms with varying width */
      float diskPattern = sin(angle * 5.) * .35 + sin(angle * 11.) * .22
                        + sin(angle * 19.) * .10;
      diskPattern = diskPattern * .5 + .72;

      float diskAlpha = smoothstep(diskT, 0., diskD) * bh * diskPattern;
      vec3  diskHot   = mix(vec3(1.,.55,.05), vec3(.1,.75,1.), diskPattern);
      diskHot        += vec3(1.) * diskPattern * diskPattern * .6;

      col    = mix(col, diskHot, diskAlpha * .75);
      alpha  = max(alpha, diskAlpha * .78 * uFadeIn);

      /* Inner disk  */
      float innerDiskD = max(diskD * .6, 0.);
      float innerGlow  = exp(-innerDiskD / (hoverR * .18)) * bh * .4;
      col  += vec3(.4,.9,1.) * innerGlow;
      alpha = max(alpha, innerGlow * .3 * uFadeIn);

      /* Gravitational lensing: subtle background warp ring */
      float lensRadius = hoverR * (2.2 + bh * .5);
      float lensD      = abs(toOrb - lensRadius);
      float lensGlow   = smoothstep(hoverR * .8, 0., lensD) * bh * .18;
      col  += uColorA * lensGlow;
      alpha = max(alpha, lensGlow * .12 * uFadeIn);

      /* Collapse darkening of core */
      float collapse = smoothstep(hoverR * 1.2, 0., toOrb) * bh;
      col    *= 1. - collapse * .65;
      alpha  *= 1. - collapse * .25;
    }

    /* ══════════════════════════════════════════════════════════
       CLICK — Singularity burst + shockwave
    ══════════════════════════════════════════════════════════ */
    if(uClick > .001) {
      /* Primary shockwave ring */
      float wave1 = (1. - uClick) * hoverR * 9.;
      float wd1   = abs(dist2D - wave1);
      float wA1   = smoothstep(hoverR*.55, 0., wd1) * uClick * 1.1;
      col  += mix(uColorA, vec3(.8,.95,1.),.45) * wA1 * 1.5;
      alpha = max(alpha, wA1 * .88 * uFadeIn);

      /* Secondary ring */
      float wave2 = (1. - uClick*.75) * hoverR * 5.5;
      float wd2   = abs(dist2D - wave2);
      float wA2   = smoothstep(hoverR*.38, 0., wd2) * uClick * .55;
      col  += uColorB * wA2;
      alpha = max(alpha, wA2 * .6 * uFadeIn);

      /* Chromatic aberration flash */
      float caStr = uClick * dist2D / (hoverR * 6. + .001);
      col.r += caStr * .35;
      col.b -= caStr * .20;
    }

    /* Scroll streak */
    float scrollGlow = uScrollVel
      * smoothstep(hoverR*4., 0., abs(diff2D.y) - hoverR)
      * smoothstep(hoverR*8., 0., dist2D) * .55;
    col   += uColorA * scrollGlow;
    alpha  = max(alpha, scrollGlow * .28 * uFadeIn);

    alpha = clamp(alpha, 0., 1.) * uFadeIn;
    gl_FragColor = vec4(col, alpha);
  }
`

/* ── Utilities ──────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const isInteractive = el =>
    !!el?.closest('a, button, input, textarea, select, [role="button"], .nav-item, label, [tabindex], .magnetic')

const getMagneticPull = (tx, ty) => {
    let best = Infinity, pull = { x: 0, y: 0 }
    document.querySelectorAll('button, a, [role="button"], .magnetic').forEach(el => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.hypot(tx - cx, ty - cy)
        const thr = Math.max(r.width, r.height) * .75
        if (d < thr && d < best) {
            best = d
            const str = (1 - d / thr) * .24
            pull = { x: (cx - tx) * str, y: (cy - ty) * str }
        }
    })
    return pull
}

const SECTIONS = [
    { id: 'hero', colors: [[0.0, 0.96, 1.0], [0.545, 0.361, 0.965]] },
    { id: 'about', colors: [[0.0, 0.90, 0.92], [0.42, 0.28, 0.82]] },
    { id: 'features', colors: [[0.15, 0.45, 1.0], [0.96, 0.28, 0.72]] },
    { id: 'contact', colors: [[0.28, 0.0, 0.62], [0.0, 0.90, 0.95]] },
]

const detectSection = () => {
    const scrollY = window.scrollY, vh = window.innerHeight
    let active = 0
    SECTIONS.forEach((sec, i) => {
        const el = document.getElementById(sec.id)
            || document.querySelector(`[data-section="${sec.id}"]`)
            || document.querySelector(`.section-${sec.id}`)
        if (el) {
            if (scrollY >= el.getBoundingClientRect().top + scrollY - vh * .5) active = i
        } else {
            if (scrollY >= (document.body.scrollHeight / SECTIONS.length) * i) active = i
        }
    })
    return active
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function VolumetricCursor() {
    const mountRef = useRef(null)
    const ripplesRef = useRef(null)
    const sparksRef = useRef(null)
    const rendererRef = useRef(null)
    const materialRef = useRef(null)
    const rafRef = useRef(null)

    const { velocityRef } = useScrollVelocity()
    const { audioRef } = useAudioReactive()

    const state = useRef({
        tx: -9999, ty: -9999,
        bx: -9999, by: -9999,
        vx: 0, vy: 0,
        prevTx: 0, prevTy: 0,
        speed: 0,

        hovered: false,
        blackHoleTarget: 0, blackHole: 0,     // collapse intensity
        clickDecay: 0,
        magnetX: 0, magnetY: 0,
        visible: false,
        fadeIn: 0,

        depthX: 0, depthY: 0,
        depthXS: 0, depthYS: 0,

        pulseIntensity: 0, pulseDecay: 0,
        pulseTimer: 0, pulseRing: 0, pulseRingDecay: 0,
        nextPulseIn: 0,
        idleTime: 0, lastMoveTime: 0,

        sectionIndex: 0,
        colorA: [0.0, 0.96, 1.0],
        colorAT: [0.0, 0.96, 1.0],
        colorB: [0.545, 0.361, 0.965],
        colorBT: [0.545, 0.361, 0.965],

        startTime: performance.now(),
    })

    /* DOM effects */
    const spawnRipple = useCallback((x, y) => {
        if (!ripplesRef.current) return
        const div = document.createElement('div')
        div.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      width:0;height:0;border-radius:50%;
      background:radial-gradient(circle,rgba(0,245,255,.26) 0%,rgba(139,92,246,.12) 50%,transparent 70%);
      transform:translate(-50%,-50%);pointer-events:none;
      animation:vcShockwave .85s cubic-bezier(.1,.9,.32,1) forwards;`
        ripplesRef.current.appendChild(div)
        setTimeout(() => div.remove(), 900)

        const flash = document.createElement('div')
        flash.style.cssText = `
      position:fixed;inset:0;pointer-events:none;
      background:radial-gradient(circle at ${x}px ${y}px,rgba(0,245,255,.06) 0%,transparent 50%);
      animation:vcFlash .4s ease-out forwards;`
        ripplesRef.current.appendChild(flash)
        setTimeout(() => flash.remove(), 420)
    }, [])

    const spawnSpark = useCallback((x, y) => {
        if (!sparksRef.current) return
        for (let i = 0; i < 7; i++) {
            const sp = document.createElement('div')
            const ang = Math.random() * 360
            const d = 16 + Math.random() * 30
            const sz = 1.2 + Math.random() * 2
            sp.style.cssText = `
        position:fixed;left:${x}px;top:${y}px;
        width:${sz}px;height:${sz}px;border-radius:50%;
        background:rgba(0,245,255,.94);
        box-shadow:0 0 6px rgba(0,245,255,.8);
        transform:translate(-50%,-50%);pointer-events:none;
        animation:vcSpark .44s ease-out forwards;
        --tx:${Math.cos(ang * .01745) * d}px;
        --ty:${Math.sin(ang * .01745) * d}px;`
            sparksRef.current.appendChild(sp)
            setTimeout(() => sp.remove(), 460)
        }
    }, [])

    /* Three.js init */
    useEffect(() => {
        const canvas = mountRef.current
        if (!canvas) return

        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: false,
            powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 10)
        camera.position.z = 1.0

        const scene = new THREE.Scene()
        const geo = new THREE.PlaneGeometry(2, 2)
        const s = state.current

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(.5, .5) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uHover: { value: 0 },
            uBlackHole: { value: 0 },
            uClick: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uFadeIn: { value: 0 },
            uScrollVel: { value: 0 },
            uAudioBass: { value: 0 },
            uAudioMid: { value: 0 },
            uAudioHigh: { value: 0 },
            uPulse: { value: 0 },
            uPulseRing: { value: 0 },
            uColorA: { value: new THREE.Color(...s.colorA) },
            uColorB: { value: new THREE.Color(...s.colorB) },
            uDepthX: { value: 0 },
            uDepthY: { value: 0 },
        }

        const mat = new THREE.ShaderMaterial({
            vertexShader: VERTEX, fragmentShader: FRAGMENT,
            uniforms, transparent: true, depthTest: false, depthWrite: false,
            blending: THREE.AdditiveBlending,
        })
        materialRef.current = mat
        scene.add(new THREE.Mesh(geo, mat))

        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        let sectionTimer = 0

        const animate = () => {
            rafRef.current = requestAnimationFrame(animate)
            const st = state.current
            const u = mat.uniforms
            const now = performance.now()
            const elapsed = (now - st.startTime) * .001

            /* Fade-in */
            st.fadeIn = clamp(st.fadeIn + .011, 0, 1)
            u.uFadeIn.value = st.fadeIn
            u.uTime.value = elapsed

            /* Velocity */
            st.vx = st.tx - st.prevTx; st.vy = st.ty - st.prevTy
            st.prevTx = st.tx; st.prevTy = st.ty
            st.speed = Math.hypot(st.vx, st.vy)

            /* Idle */
            if (st.speed > .5) st.lastMoveTime = now
            st.idleTime = (now - st.lastMoveTime) / 1000

            /* 3D depth parallax (cinematic camera tilt) */
            const normX = st.tx / window.innerWidth * 2 - 1
            const normY = st.ty / window.innerHeight * 2 - 1
            st.depthX = lerp(st.depthX, normX, .035)
            st.depthY = lerp(st.depthY, normY, .035)
            camera.position.x = st.depthX * .045
            camera.position.y = -st.depthY * .045
            camera.lookAt(0, 0, 0)
            u.uDepthX.value = st.depthX
            u.uDepthY.value = st.depthY

            /* Magnetic */
            const pull = getMagneticPull(st.tx, st.ty)
            st.magnetX = lerp(st.magnetX, pull.x, .09)
            st.magnetY = lerp(st.magnetY, pull.y, .09)

            /* Blob follow */
            const blobLerp = st.hovered ? .13 : .09
            st.bx = lerp(st.bx, st.tx + st.magnetX, blobLerp)
            st.by = lerp(st.by, st.ty + st.magnetY, blobLerp)

            /* Hover */
            u.uHover.value = lerp(u.uHover.value, st.hovered ? 1. : 0., .09)

            /* Black hole collapse */
            st.blackHoleTarget = st.hovered ? 1. : 0.
            st.blackHole = lerp(st.blackHole ?? 0, st.blackHoleTarget, .07)
            u.uBlackHole.value = st.blackHole

            /* Click decay */
            st.clickDecay = Math.max(0, st.clickDecay - .024)
            u.uClick.value = st.clickDecay

            /* Scroll */
            u.uScrollVel.value = lerp(u.uScrollVel.value, velocityRef.current.normalized, .07)

            /* Audio */
            const audio = audioRef.current
            u.uAudioBass.value = lerp(u.uAudioBass.value, audio.bass, .14)
            u.uAudioMid.value = lerp(u.uAudioMid.value, audio.mid, .14)
            u.uAudioHigh.value = lerp(u.uAudioHigh.value, audio.high, .14)

            /* AI Pulse engine */
            {
                const idleMod = Math.max(.25, 1 - st.idleTime * .11)
                const hoverMod = 1 + u.uHover.value * .75
                st.pulseTimer += 16
                if (st.pulseTimer >= st.nextPulseIn || st.speed > 17) {
                    st.nextPulseIn = 850 + Math.random() * 2800 / (hoverMod * idleMod)
                    st.pulseTimer = 0
                    const strength = .50 + Math.random() * .5 + u.uHover.value * .28 + audio.bass * .28
                    st.pulseDecay = strength
                    st.pulseIntensity = strength
                    if (Math.random() < .42) st.pulseRingDecay = .55 + Math.random() * .45
                }
                st.pulseDecay = Math.max(0, st.pulseDecay - .017)
                st.pulseIntensity = st.pulseDecay
                st.pulseRingDecay = Math.max(0, st.pulseRingDecay - .020)
                u.uPulse.value = lerp(u.uPulse.value, st.pulseIntensity, .22)
                u.uPulseRing.value = lerp(u.uPulseRing.value, st.pulseRingDecay, .18)
            }

            /* Section colour */
            sectionTimer++
            if (sectionTimer >= 22) {
                sectionTimer = 0
                const idx = detectSection()
                if (idx !== st.sectionIndex) {
                    st.sectionIndex = idx
                    st.colorAT = SECTIONS[idx].colors[0]
                    st.colorBT = SECTIONS[idx].colors[1]
                }
            }
            for (let c = 0; c < 3; c++) {
                st.colorA[c] = lerp(st.colorA[c], st.colorAT[c], .013)
                st.colorB[c] = lerp(st.colorB[c], st.colorBT[c], .013)
            }
            u.uColorA.value.setRGB(...st.colorA)
            u.uColorB.value.setRGB(...st.colorB)

            /* NDC */
            u.uMouse.value.set(st.bx / window.innerWidth, 1 - st.by / window.innerHeight)
            u.uVelocity.value.set(st.vx / window.innerWidth, st.vy / window.innerHeight)

            /* Snowfall / Reality Engine coupling */
            window.__quantumCursor = window.__liquidCursor = {
                x: st.bx, y: st.by,
                speed: st.speed,
                click: st.clickDecay,
                hovered: st.hovered,
                pulse: u.uPulse.value,
                blackHole: st.blackHole,
            }

            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', onResize)
            renderer.dispose(); mat.dispose(); geo.dispose()
        }
    }, [velocityRef, audioRef])

    /* Event listeners */
    useEffect(() => {
        const st = state.current
        let lastHoverEl = null

        const onMove = e => {
            if (!st.visible) {
                st.visible = true
                st.bx = e.clientX; st.by = e.clientY
                st.prevTx = e.clientX; st.prevTy = e.clientY
                st.lastMoveTime = performance.now()
            }
            st.tx = e.clientX; st.ty = e.clientY
        }

        const onOver = e => {
            st.hovered = isInteractive(e.target)
            const btn = e.target.closest('button, a, [role="button"]')
            if (btn && btn !== lastHoverEl) {
                lastHoverEl = btn
                const r = btn.getBoundingClientRect()
                spawnSpark(r.left + r.width / 2, r.top + r.height / 2)
            }
            if (!btn) lastHoverEl = null
        }

        const onDown = e => {
            st.clickDecay = 1.0
            st.pulseDecay = 1.0; st.pulseIntensity = 1.0; st.pulseRingDecay = .8
            spawnRipple(e.clientX, e.clientY)
        }

        window.addEventListener('mousemove', onMove, { passive: true })
        window.addEventListener('mouseover', onOver, { passive: true })
        window.addEventListener('mousedown', onDown, { passive: true })

        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseover', onOver)
            window.removeEventListener('mousedown', onDown)
        }
    }, [spawnRipple, spawnSpark])

    return (
        <>
            <canvas ref={mountRef} aria-hidden="true" style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                pointerEvents: 'none', zIndex: 99995,
                mixBlendMode: 'screen', filter: 'blur(0.3px)',
            }} />
            <div ref={ripplesRef} aria-hidden="true" style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99996, overflow: 'hidden',
            }} />
            <div ref={sparksRef} aria-hidden="true" style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99997, overflow: 'hidden',
            }} />
            <style>{`
        *, *::before, *::after { cursor: none !important; }
        @keyframes vcShockwave {
          0%   { width:0;     height:0;     opacity:.9; }
          100% { width:200px; height:200px; opacity:0;  }
        }
        @keyframes vcFlash { 0% { opacity:1; } 100% { opacity:0; } }
        @keyframes vcSpark {
          0%   { transform:translate(-50%,-50%) translate(0,0);            opacity:1; }
          100% { transform:translate(-50%,-50%) translate(var(--tx),var(--ty)); opacity:0; }
        }
      `}</style>
        </>
    )
}

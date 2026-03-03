import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useScrollVelocity } from '../../hooks/useScrollVelocity'
import { useAudioReactive } from '../../hooks/useAudioReactive'

/* ══════════════════════════════════════════════════════════════════════════════
   QUANTUM ENERGY CURSOR SYSTEM
   ─────────────────────────────
   Architecture
   ├── GLSL vertex shader   — subtle 3-D tilt via camera Z + perspective warp
   ├── GLSL fragment shader — volumetric orb, FBM plasma, energy pulses,
   │                          audio bands, scroll distortion, section colors,
   │                          chromatic aberration, shockwave ring, micro particles
   ├── useScrollVelocity    — real-time scroll speed → uScrollVel uniform
   ├── useAudioReactive     — mic / system audio → bass/mid/high uniforms
   ├── Section detection    — maps scrollY to named page zones
   ├── Magnetic field       — cursor bends toward interactive elements
   ├── Spark particles      — DOM sparks on button hover
   ├── Click shockwave      — 3-D ripple ring + chromatic burst + DOM overlay
   └── Snowfall coupling    — window.__quantumCursor for snow integration

   Performance:  60fps rAF — zero React re-renders on hot path
                 All mutable state lives in useRef
══════════════════════════════════════════════════════════════════════════════ */

/* ─── GLSL: Vertex ────────────────────────────────────────────────────────── */
const VERTEX = /* glsl */`
  uniform float uDepthX;
  uniform float uDepthY;
  varying vec2  vUv;

  void main() {
    vUv = uv;

    /*  Subtle perspective warp — positions shift slightly in Z based on
        mouse position to create a volumetric depth illusion              */
    vec3 pos = position;
    pos.z += sin(uv.x * 3.14159) * uDepthX * 0.08
           + sin(uv.y * 3.14159) * uDepthY * 0.08;

    gl_Position = vec4(pos, 1.0);
  }
`

/* ─── GLSL: Fragment ──────────────────────────────────────────────────────── */
const FRAGMENT = /* glsl */`
  precision highp float;

  /* ── Core uniforms ── */
  uniform float uTime;
  uniform vec2  uMouse;           // 0..1 NDC
  uniform vec2  uVelocity;        // normalized pixels/frame
  uniform float uHover;           // 0..1
  uniform float uClick;           // 0..1 decay
  uniform vec2  uResolution;
  uniform float uFadeIn;

  /* ── Scroll reactive ── */
  uniform float uScrollVel;       // 0..1

  /* ── Audio reactive ── */
  uniform float uAudioBass;       // 0..1
  uniform float uAudioMid;        // 0..1
  uniform float uAudioHigh;       // 0..1

  /* ── AI pulse ── */
  uniform float uPulse;           // 0..1 blended pulse intensity
  uniform float uPulseRing;       // secondary ring pulse

  /* ── Section color blend ── */
  uniform vec3  uColorA;          // primary color (core)
  uniform vec3  uColorB;          // secondary color (outer)

  /* ── Depth tilt (for chromatic offset) ── */
  uniform float uDepthX;
  uniform float uDepthY;

  varying vec2 vUv;

  /* ── Noise infrastructure ── */
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float snoise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i  = floor(p + (p.x + p.y) * K1);
    vec2 a  = p - i + (i.x + i.y) * K2;
    float m = step(a.y, a.x);
    vec2 o  = vec2(m, 1.0 - m);
    vec2 b  = a - o + K2;
    vec2 c  = a - 1.0 + 2.0 * K2;
    vec3 h  = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
    vec3 n  = h*h*h*h * vec3(
      dot(a, hash2(i      )),
      dot(b, hash2(i + o  )),
      dot(c, hash2(i + 1.0))
    );
    return dot(n, vec3(70.0));
  }

  /* ── FBM 4 octaves ── */
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    vec2  s = vec2(1.0);
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p * s + uTime * 0.16);
      s *= 2.15;
      a *= 0.5;
    }
    return v;
  }

  /* ── Radial gradient helper ── */
  float radial(float d, float r) {
    return smoothstep(r, 0.0, d);
  }

  void main() {
    vec2 aspect = uResolution / min(uResolution.x, uResolution.y);
    vec2 uv     = vUv * aspect;
    vec2 mouse  = uMouse * aspect;

    /* ── Speed physics ── */
    float spd    = length(uVelocity) * 300.0;            // scale to px/frame ish
    float sqX    = 1.0 + spd * 0.013 + uScrollVel * 0.18;
    float sqY    = 1.0 - spd * 0.008;
    vec2  velDir = spd > 0.001 ? normalize(uVelocity) : vec2(1.0, 0.0);
    vec2  perp   = vec2(-velDir.y, velDir.x);

    vec2 diff    = uv - mouse;
    float along  = dot(diff, velDir);
    float side   = dot(diff, perp);
    vec2  diffS  = velDir * along / sqX + perp * side / sqY;
    float dist   = length(diff);
    float distS  = length(diffS);

    /* ── Audio-blown radius ── */
    float audioScale = 1.0 + uAudioBass * 0.35 + uAudioMid * 0.12;

    /* ── AI pulse radius breathing ── */
    float breath  = 1.0 + 0.055 * sin(uTime * 1.7 + uPulse * 6.28)
                        + uPulse * 0.12;

    /* ── FBM plasma warp ── */
    vec2 noiseCoord = uv * 2.6 + uTime * 0.11;
    /* Extra turbulence when scrolling fast */
    float scrollTurb = uScrollVel * 1.4;
    float n1 = fbm(noiseCoord);
    float n2 = fbm(noiseCoord + vec2(3.7, 1.3) + scrollTurb * 0.3);
    float n3 = fbm(noiseCoord * 1.8 - vec2(1.1, 0.5));
    vec2  warp = vec2(n1, n2) * (0.052 + scrollTurb * 0.025 + uAudioMid * 0.02);

    float distWarp  = length(diffS + warp);

    /* ── Radius ── */
    float baseR  = 0.048 * breath * audioScale;
    float hoverR = baseR * (1.0 + uHover * 0.52 + uPulse * 0.08);

    /* ────────────── DEPTH GRADIENT LAYERS (volumetric illusion) ────── */
    float innerCore = radial(distWarp, hoverR * 0.28);           // hot center
    float inner     = radial(distWarp, hoverR * 0.62);           // core plasma
    float mid       = radial(distWarp, hoverR * 1.75);           // mid glow
    float outer     = radial(distWarp, hoverR * 3.6);            // outer corona
    float glow      = radial(dist,     hoverR * 7.5);            // ambient glow
    float audioGlow = glow * (1.0 + uAudioBass * 0.8);          // bass-driven halo

    /* ── Scroll vertical stretch glow ── */
    float scrollGlow = uScrollVel * radial(abs(diff.y) - hoverR, hoverR * 4.0)
                     * radial(dist, hoverR * 8.0) * 0.6;

    /* ─────────────────── AI ENERGY PULSES ─────────────────────────── */
    float pulse1 = 0.0, pulse2 = 0.0;
    {
      /* Primary neural ring */
      float pr  = hoverR * (1.8 + 2.2 * fract(uTime * 0.28 + uPulse));
      float pdist = abs(dist - pr);
      pulse1 = smoothstep(hoverR * 0.5, 0.0, pdist) * uPulse * 0.7
             * (0.5 + 0.5 * sin(uTime * 3.0 + n3 * 4.0));

      /* Secondary irregular ring */
      float pr2 = hoverR * (1.2 + 3.8 * fract(uTime * 0.19 + uPulseRing + 0.5));
      float pdist2 = abs(dist - pr2);
      pulse2 = smoothstep(hoverR * 0.4, 0.0, pdist2) * uPulseRing * 0.5;
    }

    /* ─────────────────── CLICK SHOCKWAVE ───────────────────────────── */
    float ring = 0.0;
    if (uClick > 0.001) {
      float wave  = uClick * hoverR * 9.0;
      float thick = hoverR * 0.5;
      float rd    = abs(dist - wave);
      ring = smoothstep(thick, 0.0, rd) * uClick * 1.1;

      /* Secondary inner ring */
      float wave2 = uClick * hoverR * 5.5;
      rd  = abs(dist - wave2);
      ring += smoothstep(thick * 0.6, 0.0, rd) * uClick * 0.5;
    }

    /* ─────────────────── CHROMATIC ABERRATION ──────────────────────── */
    float aberrBase = spd * 0.0035 + 0.0012
                    + uScrollVel * 0.008
                    + uClick * 0.012;
    vec2 aberrDir   = velDir + vec2(uDepthX, uDepthY) * 0.3;
    vec2 aberrR     = diff - aberrBase * aberrDir;
    vec2 aberrB     = diff + aberrBase * aberrDir;
    float cAberR    = smoothstep(hoverR * 1.5, 0.0, length(aberrR));
    float cAberB    = smoothstep(hoverR * 1.5, 0.0, length(aberrB));

    /* ─────────────────── MICRO INTERNAL PARTICLES ──────────────────── */
    float particles = 0.0;
    for (int pi = 0; pi < 8; pi++) {
      float fi    = float(pi);
      /* Orbit radius varies with audio */
      float orbit = hoverR * (0.18 + fi * 0.065 + uAudioMid * 0.04);
      float speed = 0.75 + fi * 0.11 + uAudioHigh * 0.4;
      float phase = fi * 0.7854;                               // PI/4 spacing
      float angle = uTime * speed + phase;
      /* Slight inclination for 3-D feel */
      vec2 pPos   = mouse + vec2(cos(angle), sin(angle) * 0.72) * orbit;
      float pDist = length(uv - pPos);
      float pSize = hoverR * (0.06 + uAudioHigh * 0.03);
      float pb    = smoothstep(pSize, 0.0, pDist);
      /* Audio-driven flicker */
      float flicker = 1.0 + sin(uTime * 8.0 + fi * 1.5) * uAudioHigh * 0.5;
      particles  += pb * 0.4 * flicker;
    }

    /* ─────────────────── COLOR SYSTEM ──────────────────────────────── */
    vec3 plasma = vec3(0.88, 0.97, 1.0);

    /* Section-reactive core → outer blend */
    float colorMix = smoothstep(0.0, hoverR * 1.8, distWarp);
    vec3 coreColor = mix(plasma, uColorA, 0.55);
    vec3 color     = mix(coreColor, uColorB, colorMix);

    /* Volumetric inner depth (very hot white-cyan core) */
    color = mix(color, plasma * 1.2, innerCore * 0.65);

    /* FBM plasma swirl */
    float plasmaMix = fbm(uv * 4.2 - uTime * 0.22) * 0.5 + 0.5;
    color = mix(color, uColorB, plasmaMix * inner * 0.38);

    /* Scroll distortion — slight hue shift toward warm */
    color += vec3(0.3, 0.0, -0.1) * uScrollVel * outer * 0.6;

    /* Audio bass — brightens outer corona */
    color += uColorA * uAudioBass * audioGlow * 0.45;

    /* Audio mid — internal turbulence color */
    color += mix(uColorA, uColorB, 0.5) * uAudioMid * inner * 0.3;

    /* Audio high — micro sparkle */
    color += plasma * uAudioHigh * particles * 0.25;

    /* Chromatic blush */
    color.r += cAberR * 0.28;
    color.b += cAberB * 0.34;
    color.g += (cAberR + cAberB) * 0.05;

    /* Halo */
    vec3 haloColor = mix(uColorA, uColorB, 0.35) * audioGlow;
    color += haloColor * 0.18;

    /* AI pulse rings */
    color += mix(uColorA, plasma, 0.6) * pulse1;
    color += uColorB * pulse2;

    /* Scroll vertical streak */
    color += uColorA * scrollGlow;

    /* Micro particles */
    color += uColorA * particles * 0.5;

    /* Click ring flash */
    color += mix(uColorA, plasma, 0.4) * ring * 1.3;

    /* ─────────────────── ALPHA ─────────────────────────────────────── */
    float alpha = 0.0;
    alpha += innerCore * 0.92;
    alpha += inner     * 0.7;
    alpha += mid       * 0.28;
    alpha += outer     * 0.10;
    alpha += audioGlow * 0.06;
    alpha += pulse1    * 0.55;
    alpha += pulse2    * 0.40;
    alpha += ring      * 0.85;
    alpha += particles * 0.55;
    alpha += scrollGlow * 0.3;
    alpha  = clamp(alpha, 0.0, 1.0) * uFadeIn;

    gl_FragColor = vec4(color, alpha);
  }
`

/* ─── Utilities ────────────────────────────────────────────────────────────── */
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const isInteractive = (el) =>
    !!el?.closest('a, button, input, textarea, select, [role="button"], .nav-item, label, [tabindex], .magnetic')

/* ── Magnetic pull ── */
const getMagneticPull = (tx, ty) => {
    let best = Infinity
    let pull = { x: 0, y: 0 }
    document.querySelectorAll('button, a, [role="button"], .magnetic').forEach(el => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const d = Math.hypot(tx - cx, ty - cy)
        const thr = Math.max(r.width, r.height) * 0.72
        if (d < thr && d < best) {
            best = d
            const str = (1 - d / thr) * 0.26
            pull = { x: (cx - tx) * str, y: (cy - ty) * str }
        }
    })
    return pull
}

/* ── Section palette definitions ── */
const SECTIONS = [
    { id: 'hero', colors: [[0.0, 0.96, 1.0], [0.545, 0.361, 0.965]] },   // Electric Blue → Neon Violet
    { id: 'about', colors: [[0.0, 0.9, 0.92], [0.42, 0.28, 0.82]] },   // Cyan → Soft Purple
    { id: 'features', colors: [[0.15, 0.45, 1.0], [0.96, 0.28, 0.72]] },   // Blue → Pink energy
    { id: 'contact', colors: [[0.28, 0.0, 0.62], [0.0, 0.9, 0.95]] },   // Deep Purple → Electric Cyan
]

/* ── Detect which section the page is currently in ── */
const detectSection = () => {
    const scrollY = window.scrollY
    const vh = window.innerHeight
    let active = 0
    SECTIONS.forEach((sec, i) => {
        const el = document.getElementById(sec.id) ||
            document.querySelector(`[data-section="${sec.id}"]`) ||
            document.querySelector(`.section-${sec.id}`)
        if (el) {
            const top = el.getBoundingClientRect().top + scrollY
            if (scrollY >= top - vh * 0.5) active = i
        } else {
            /* Fallback: divide page into equal quarters */
            const docH = document.body.scrollHeight
            if (scrollY >= (docH / SECTIONS.length) * i) active = i
        }
    })
    return active
}

/* ════════════════════════════════════════════════════════════════════════════ */

export default function QuantumCursor() {
    const mountRef = useRef(null)
    const ripplesRef = useRef(null)
    const sparksRef = useRef(null)

    /* Three.js refs */
    const rendererRef = useRef(null)
    const materialRef = useRef(null)
    const rafRef = useRef(null)

    /* Hook data */
    const { velocityRef } = useScrollVelocity()
    const { audioRef } = useAudioReactive()

    /* ── Mutable physics state (no re-renders) ── */
    const state = useRef({
        tx: -9999, ty: -9999,         // raw mouse target
        bx: -9999, by: -9999,         // smooth blob pos
        vx: 0, vy: 0,
        prevTx: 0, prevTy: 0,
        speed: 0,

        hovered: false,
        clickDecay: 0,
        magnetX: 0, magnetY: 0,
        visible: false,
        fadeIn: 0,

        /* 3-D depth */
        depthX: 0, depthY: 0,         // target (normalised -1..1)
        depthXS: 0, depthYS: 0,       // smoothed

        /* AI pulse state */
        pulseIntensity: 0,
        pulseDecay: 0,
        pulseTimer: 0,
        pulseRing: 0,
        pulseRingDecay: 0,
        nextPulseIn: 0,               // ms until next autonomous pulse
        idleTime: 0,
        lastMoveTime: 0,

        /* Section */
        sectionIndex: 0,
        colorA: [0.0, 0.96, 1.0],
        colorAT: [0.0, 0.96, 1.0],
        colorB: [0.545, 0.361, 0.965],
        colorBT: [0.545, 0.361, 0.965],

        startTime: performance.now(),
    })

    /* ── Spawn DOM ripple overlay ── */
    const spawnRipple = useCallback((x, y) => {
        if (!ripplesRef.current) return
        const div = document.createElement('div')
        div.style.cssText = `
          position:fixed;left:${x}px;top:${y}px;
          width:0;height:0;border-radius:50%;
          background:radial-gradient(circle,rgba(0,245,255,0.28) 0%,rgba(139,92,246,0.15) 50%,transparent 70%);
          transform:translate(-50%,-50%);pointer-events:none;
          animation:qShockwave 0.85s cubic-bezier(0.1,0.9,0.32,1) forwards;
        `
        ripplesRef.current.appendChild(div)
        setTimeout(() => div.remove(), 900)

        /* Chromatic burst flash */
        const flash = document.createElement('div')
        flash.style.cssText = `
          position:fixed;inset:0;pointer-events:none;
          background:radial-gradient(circle at ${x}px ${y}px, rgba(0,245,255,0.07) 0%, transparent 50%);
          animation:qFlash 0.4s ease-out forwards;
        `
        ripplesRef.current.appendChild(flash)
        setTimeout(() => flash.remove(), 420)
    }, [])

    /* ── Spawn hover sparks ── */
    const spawnSpark = useCallback((x, y) => {
        if (!sparksRef.current) return
        for (let i = 0; i < 6; i++) {
            const sp = document.createElement('div')
            const angle = (Math.random() * 360) | 0
            const dist = 18 + Math.random() * 28
            const size = 1.5 + Math.random() * 2
            sp.style.cssText = `
              position:fixed;left:${x}px;top:${y}px;
              width:${size}px;height:${size}px;border-radius:50%;
              background:rgba(0,245,255,0.95);
              box-shadow:0 0 6px rgba(0,245,255,0.8);
              transform:translate(-50%,-50%);pointer-events:none;
              animation:qSpark 0.45s ease-out forwards;
              --tx:${Math.cos(angle * 0.01745) * dist}px;
              --ty:${Math.sin(angle * 0.01745) * dist}px;
            `
            sparksRef.current.appendChild(sp)
            setTimeout(() => sp.remove(), 480)
        }
    }, [])

    /* ── Three.js init ── */
    useEffect(() => {
        const canvas = mountRef.current
        if (!canvas) return

        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        rendererRef.current = renderer

        /* Perspective camera for subtle 3-D parallax */
        const camera = new THREE.PerspectiveCamera(
            65,
            window.innerWidth / window.innerHeight,
            0.1,
            10
        )
        camera.position.z = 1.0

        const scene = new THREE.Scene()
        const geo = new THREE.PlaneGeometry(2, 2, 1, 1)

        /* Initial section colors */
        const s = state.current

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uHover: { value: 0 },
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
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            uniforms,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        })
        materialRef.current = mat

        const mesh = new THREE.Mesh(geo, mat)
        scene.add(mesh)

        /* Window resize */
        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        /* ─── ANIMATION LOOP ─── */
        let sectionCheckTimer = 0

        const animate = () => {
            rafRef.current = requestAnimationFrame(animate)
            const st = state.current
            const u = mat.uniforms
            const now = performance.now()
            const elapsed = (now - st.startTime) * 0.001

            /* Fade-in */
            st.fadeIn = clamp(st.fadeIn + 0.012, 0, 1)
            u.uFadeIn.value = st.fadeIn

            /* Time */
            u.uTime.value = elapsed

            /* ── Velocity ── */
            st.vx = st.tx - st.prevTx
            st.vy = st.ty - st.prevTy
            st.prevTx = st.tx
            st.prevTy = st.ty
            st.speed = Math.hypot(st.vx, st.vy)

            /* Idle detection */
            if (st.speed > 0.5) st.lastMoveTime = now
            st.idleTime = (now - st.lastMoveTime) / 1000   // seconds

            /* ── 3-D Depth parallax ── */
            const normX = st.tx / window.innerWidth * 2 - 1   // -1..1
            const normY = st.ty / window.innerHeight * 2 - 1
            st.depthX = lerp(st.depthX, normX, 0.04)
            st.depthY = lerp(st.depthY, normY, 0.04)
            camera.position.x = st.depthX * 0.04
            camera.position.y = -st.depthY * 0.04
            camera.lookAt(0, 0, 0)
            u.uDepthX.value = st.depthX
            u.uDepthY.value = st.depthY

            /* ── Magnetic pull ── */
            const pull = getMagneticPull(st.tx, st.ty)
            st.magnetX = lerp(st.magnetX, pull.x, 0.1)
            st.magnetY = lerp(st.magnetY, pull.y, 0.1)

            /* ── Smooth blob follow ── */
            const blobLerp = st.hovered ? 0.14 : 0.10
            st.bx = lerp(st.bx, st.tx + st.magnetX, blobLerp)
            st.by = lerp(st.by, st.ty + st.magnetY, blobLerp)

            /* ── Hover spring ── */
            u.uHover.value = lerp(u.uHover.value, st.hovered ? 1.0 : 0.0, 0.1)

            /* ── Click decay ── */
            st.clickDecay = Math.max(0, st.clickDecay - 0.025)
            u.uClick.value = st.clickDecay

            /* ── Scroll velocity ── */
            u.uScrollVel.value = lerp(u.uScrollVel.value, velocityRef.current.normalized, 0.08)

            /* ── Audio ── */
            const audio = audioRef.current
            u.uAudioBass.value = lerp(u.uAudioBass.value, audio.bass, 0.15)
            u.uAudioMid.value = lerp(u.uAudioMid.value, audio.mid, 0.15)
            u.uAudioHigh.value = lerp(u.uAudioHigh.value, audio.high, 0.15)

            /* ── AI Pulse engine ── */
            {
                /* Autonomous pulse rate: faster on hover, slower on idle */
                const idleMod = Math.max(0.25, 1 - st.idleTime * 0.12)
                const hoverMod = 1 + u.uHover.value * 0.8
                const baseRate = 0.0008 * idleMod * hoverMod

                st.pulseTimer += 16       // ~16ms/frame

                /*  Fire a pulse on timer OR on fast movement */
                if (st.pulseTimer >= st.nextPulseIn || st.speed > 18) {
                    /* Irregular neural cadence */
                    st.nextPulseIn = 900 + Math.random() * 2600 / (hoverMod * idleMod)
                    st.pulseTimer = 0

                    const strength = 0.55 + Math.random() * 0.45 + u.uHover.value * 0.3
                        + audio.bass * 0.3
                    st.pulseDecay = strength
                    st.pulseIntensity = strength

                    /* Occasionally fire a second ring too */
                    if (Math.random() < 0.45) {
                        st.pulseRingDecay = 0.6 + Math.random() * 0.4
                    }
                }

                st.pulseDecay = Math.max(0, st.pulseDecay - 0.018)
                st.pulseIntensity = st.pulseDecay
                st.pulseRingDecay = Math.max(0, st.pulseRingDecay - 0.022)

                u.uPulse.value = lerp(u.uPulse.value, st.pulseIntensity, 0.25)
                u.uPulseRing.value = lerp(u.uPulseRing.value, st.pulseRingDecay, 0.20)
            }

            /* ── Section color shift (check every ~20 frames) ── */
            sectionCheckTimer++
            if (sectionCheckTimer >= 20) {
                sectionCheckTimer = 0
                const idx = detectSection()
                if (idx !== st.sectionIndex) {
                    st.sectionIndex = idx
                    st.colorAT = SECTIONS[idx].colors[0]
                    st.colorBT = SECTIONS[idx].colors[1]
                }
            }
            /* Smooth color interpolation */
            st.colorA[0] = lerp(st.colorA[0], st.colorAT[0], 0.015)
            st.colorA[1] = lerp(st.colorA[1], st.colorAT[1], 0.015)
            st.colorA[2] = lerp(st.colorA[2], st.colorAT[2], 0.015)
            st.colorB[0] = lerp(st.colorB[0], st.colorBT[0], 0.015)
            st.colorB[1] = lerp(st.colorB[1], st.colorBT[1], 0.015)
            st.colorB[2] = lerp(st.colorB[2], st.colorBT[2], 0.015)
            u.uColorA.value.setRGB(...st.colorA)
            u.uColorB.value.setRGB(...st.colorB)

            /* ── NDC uniforms ── */
            u.uMouse.value.set(
                st.bx / window.innerWidth,
                1 - st.by / window.innerHeight
            )
            u.uVelocity.value.set(
                st.vx / window.innerWidth,
                st.vy / window.innerHeight
            )

            /* ── Snowfall coupling ── */
            window.__quantumCursor = {
                x: st.bx,
                y: st.by,
                speed: st.speed,
                click: st.clickDecay,
                hovered: st.hovered,
                pulse: u.uPulse.value,
            }
            /* Legacy alias for Snowfall.jsx */
            window.__liquidCursor = window.__quantumCursor

            renderer.render(scene, camera)
        }

        animate()

        return () => {
            cancelAnimationFrame(rafRef.current)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            mat.dispose()
            geo.dispose()
        }
    }, [velocityRef, audioRef])

    /* ── Event listeners ── */
    useEffect(() => {
        const st = state.current
        let lastHoverEl = null

        const onMove = (e) => {
            if (!st.visible) {
                st.visible = true
                st.bx = e.clientX; st.by = e.clientY
                st.prevTx = e.clientX; st.prevTy = e.clientY
                st.lastMoveTime = performance.now()
            }
            st.tx = e.clientX
            st.ty = e.clientY
        }

        const onOver = (e) => {
            st.hovered = isInteractive(e.target)
            const btn = e.target.closest('button, a, [role="button"]')
            if (btn && btn !== lastHoverEl) {
                lastHoverEl = btn
                const r = btn.getBoundingClientRect()
                spawnSpark(r.left + r.width / 2, r.top + r.height / 2)
            }
            if (!btn) lastHoverEl = null
        }

        const onDown = (e) => {
            st.clickDecay = 1.0
            /* Force big pulse on click */
            st.pulseDecay = 1.0
            st.pulseIntensity = 1.0
            st.pulseRingDecay = 0.8
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
            {/* Three.js WebGL canvas */}
            <canvas
                ref={mountRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 99995,
                    mixBlendMode: 'screen',
                    filter: 'blur(0.4px)',
                }}
            />

            {/* DOM ripple + flash container */}
            <div
                ref={ripplesRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 99996,
                    overflow: 'hidden',
                }}
            />

            {/* DOM spark container */}
            <div
                ref={sparksRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 99997,
                    overflow: 'hidden',
                }}
            />

            {/* Global styles */}
            <style>{`
              *, *::before, *::after { cursor: none !important; }

              @keyframes qShockwave {
                0%   { width:0;     height:0;     opacity:0.9; }
                100% { width:180px; height:180px; opacity:0;   }
              }

              @keyframes qFlash {
                0%   { opacity:1; }
                100% { opacity:0; }
              }

              @keyframes qSpark {
                0%   { transform: translate(-50%,-50%) translate(0px, 0px);    opacity:1;   }
                100% { transform: translate(-50%,-50%) translate(var(--tx), var(--ty)); opacity:0; }
              }
            `}</style>
        </>
    )
}

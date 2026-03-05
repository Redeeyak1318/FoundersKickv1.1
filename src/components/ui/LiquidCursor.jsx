import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

/* ══════════════════════════════════════════════════════════════════
   LIQUID CURSOR — Three.js WebGL Shader Edition
   
   Architecture:
   • Fullscreen orthographic Three.js scene (pointer-events: none)
   • GLSL fragment shader — simplex noise, plasma distortion, 
   • Uniforms: uTime, uMouse, uVelocity, uHover, uClick
   • Lerp physics: smooth follow, velocity squish, click shockwave
   • Snowfall coupling: exports cursor position via window.__liquidCursor
   • Magnetic buttons, chromatic aberration, energy breathing
   60fps rAF loop — zero React re-renders on hot path
══════════════════════════════════════════════════════════════════ */

/* ── GLSL: Vertex Shader ── */
const VERTEX = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/* ── GLSL: Fragment Shader ── */
const FRAGMENT = /* glsl */`
  precision highp float;

  uniform float uTime;
  uniform vec2  uMouse;      // 0..1 NDC
  uniform vec2  uVelocity;   // pixels/frame
  uniform float uHover;      // 0..1
  uniform float uClick;      // 0..1 decays
  uniform vec2  uResolution;
  uniform float uFadeIn;     // 0..1 on mount

  varying vec2 vUv;

  /* ── Simplex-style hash ── */
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  /* ── Simplex noise 2D ── */
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

  /* ── FBM (3 octaves) ── */
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2  s = vec2(1.0);
    for (int i = 0; i < 3; i++) {
      v += a * snoise(p * s + uTime * 0.18);
      s *= 2.2;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 aspect = uResolution / min(uResolution.x, uResolution.y);

    /* Pixel coords in aspect-corrected space */
    vec2 uv      = vUv * aspect;
    vec2 mouse   = uMouse * aspect;

    /* Speed-based squish on the cursor blob */
    float spd    = length(uVelocity);
    float sqX    = 1.0 + spd * 0.012;
    float sqY    = 1.0 - spd * 0.007;
    vec2  velDir = spd > 0.001 ? normalize(uVelocity) : vec2(1.0, 0.0);
    vec2  perp   = vec2(-velDir.y, velDir.x);

    /* Distorted offset from mouse */
    vec2 diff = uv - mouse;
    /* Decompose into along-velocity / perpendicular */
    float along = dot(diff, velDir);
    float side  = dot(diff, perp);
    /* Squish */
    vec2  diffS = velDir * along / sqX + perp * side / sqY;
    float dist  = length(diffS);

    /* ── Organic plasma distortion via FBM ── */
    vec2 noiseCoord = uv * 2.8 + uTime * 0.12;
    float n1 = fbm(noiseCoord);
    float n2 = fbm(noiseCoord + vec2(3.7, 1.3));
    vec2  warp = vec2(n1, n2) * 0.055;

    float distWarp = length(diffS + warp);

    /* ── Energy breathing ── */
    float breath = 1.0 + 0.06 * sin(uTime * 1.6);

    /* ── Cursor radius ── */
    float baseR  = 0.045 * breath;
    float hoverR = baseR * (1.0 + uHover * 0.55);

    /* ── Soft  fall-off ── */
    float inner  = smoothstep(hoverR * 0.6,  0.0,  distWarp);
    float mid    = smoothstep(hoverR * 1.8,  0.0,  distWarp);
    float outer  = smoothstep(hoverR * 3.8,  0.0,  distWarp);
    float    = smoothstep(hoverR * 7.0,  0.0,  dist);

    /* ── Click shockwave ── */
    float ring   = 0.0;
    if (uClick > 0.001) {
      float wave   = uClick * hoverR * 7.0;
      float thick  = hoverR * 0.4;
      float ripDist= abs(dist - wave);
      ring = smoothstep(thick, 0.0, ripDist) * uClick * 0.9;
    }

    /* ── Chromatic aberration ── */
    float aberrAmt = spd * 0.004 + 0.001;
    vec2  aberrR   = uv - mouse - aberrAmt * velDir;
    vec2  aberrB   = uv - mouse + aberrAmt * velDir;
    float distR    = length(aberrR);
    float distB    = length(aberrB);
    float cAberR   = smoothstep(hoverR * 1.4, 0.0, distR);
    float cAberB   = smoothstep(hoverR * 1.4, 0.0, distB);

    /* ── Micro particles inside blob ── */
    float particles = 0.0;
    for (int pi = 0; pi < 5; pi++) {
      float fi    = float(pi);
      float angle = uTime * 0.9 + fi * 1.2566; // 2PI/5
      float orbit = hoverR * (0.25 + fi * 0.07);
      vec2  pPos  = mouse + vec2(cos(angle), sin(angle)) * orbit;
      vec2  pOffset = uv - pPos;
      float pDist   = length(pOffset);
      float pSize   = hoverR * 0.08;
      particles    += smoothstep(pSize, 0.0, pDist) * 0.35;
    }

    /* ── Color palette ── */
    //  Electric Cyan   #00f5ff  →  0.0, 0.96, 1.0
    //  Neon Violet     #8b5cf6  →  0.545, 0.361, 0.965
    //  Plasma White    #e0f7ff
    vec3 cyan    = vec3(0.0,  0.960, 1.0);
    vec3 violet  = vec3(0.545, 0.361, 0.965);
    vec3 plasma  = vec3(0.88, 0.97, 1.0);
    vec3 deepPurple = vec3(0.12, 0.06, 0.29);

    /* Blend between cyan core and violet outer */
    float colorMix = smoothstep(0.0, hoverR * 1.6, distWarp);
    vec3  coreColor = mix(plasma, cyan, 0.6);
    vec3  color = mix(coreColor, violet, colorMix);

    /* Noise-driven plasma swirl inside */
    float plasmaMix = fbm(uv * 4.0 - uTime * 0.25) * 0.5 + 0.5;
    color = mix(color, violet, plasmaMix * inner * 0.45);

    /* Chromatic blush */
    color.r += cAberR * 0.25;
    color.b += cAberB * 0.30;

    /* Glow halo color */
    vec3 haloColor  = mix(cyan, violet, 0.4) * ;
    color += haloColor * 0.22;

    /* Micro particles */
    color += cyan * particles;

    /* Ring */
    color += mix(cyan, violet, 0.5) * ring;

    /* ── Alpha composition ── */
    float alpha = 0.0;
    alpha += inner  * 0.88;
    alpha += mid    * 0.35;
    alpha += outer  * 0.12;
    alpha +=    * 0.07;
    alpha += ring   * 0.75;
    alpha += particles * 0.6;
    alpha  = clamp(alpha, 0.0, 1.0);

    /* Fade in on mount */
    alpha *= uFadeIn;

    gl_FragColor = vec4(color, alpha);
  }
`

/* ── Lerp utility ── */
const lerp = (a, b, t) => a + (b - a) * t

/* ── Clamp ── */
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/* ── Is interactive? ── */
const isInteractive = (el) =>
    !!el?.closest('a, button, input, textarea, select, [role="button"], .nav-item, label, [tabindex]')

/* ── Magnetic pull ── */
const getMagneticPull = (tx, ty) => {
    let bestDist = Infinity
    let pull = { x: 0, y: 0 }
    document.querySelectorAll('button, a, [role="button"]').forEach(el => {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dist = Math.hypot(tx - cx, ty - cy)
        const threshold = Math.max(r.width, r.height) * 0.68
        if (dist < threshold && dist < bestDist) {
            bestDist = dist
            const strength = (1 - dist / threshold) * 0.24
            pull = { x: (cx - tx) * strength, y: (cy - ty) * strength }
        }
    })
    return pull
}

/* ══════════════════════════════════════════════════════════════════ */

export default function LiquidCursor() {
    const mountRef = useRef(null)
    const rendererRef = useRef(null)
    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const materialRef = useRef(null)
    const rafRef = useRef(null)
    const ripplesRef = useRef(null)

    /* Mutable physics state — zero React re-renders */
    const state = useRef({
        /* Raw mouse target */
        tx: -9999, ty: -9999,
        /* Smooth blob position */
        bx: -9999, by: -9999,
        /* Velocity */
        vx: 0, vy: 0,
        prevTx: 0, prevTy: 0,
        speed: 0,
        /* Hover / click */
        hovered: false,
        clickDecay: 0,
        /* Magnetic */
        magnetX: 0, magnetY: 0,
        /* Visible */
        visible: false,
        /* Mount time */
        startTime: performance.now(),
        /* FadeIn */
        fadeIn: 0,
    })

    /* ── Spawn ripple DOM overlay (extra CSS ring effect) ── */
    const spawnRipple = useCallback((x, y) => {
        if (!ripplesRef.current) return
        const div = document.createElement('div')
        div.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      width:0;height:0;border-radius:50%;
      background:radial-gradient(circle,rgba(0,245,255,0.30),transparent 70%);
      transform:translate(-50%,-50%);pointer-events:none;
      animation:liquidRipple 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
    `
        ripplesRef.current.appendChild(div)
        setTimeout(() => div.remove(), 750)
    }, [])

    /* ── Three.js setup ── */
    useEffect(() => {
        const canvas = mountRef.current
        if (!canvas) return

        /* Renderer — transparent, no alpha-premultiplication issue */
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

        /* Camera — orthographic fullscreen */
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        cameraRef.current = camera

        /* Scene */
        const scene = new THREE.Scene()
        sceneRef.current = scene

        /* Fullscreen quad */
        const geo = new THREE.PlaneGeometry(2, 2)

        /* Uniforms */
        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uVelocity: { value: new THREE.Vector2(0, 0) },
            uHover: { value: 0 },
            uClick: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uFadeIn: { value: 0 },
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

        /* Resize */
        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        /* ── Animation loop ── */
        const animate = () => {
            rafRef.current = requestAnimationFrame(animate)
            const s = state.current
            const u = mat.uniforms
            const now = performance.now()
            const elapsed = (now - s.startTime) * 0.001 // seconds

            /* Fade-in */
            s.fadeIn = clamp(s.fadeIn + 0.015, 0, 1)
            u.uFadeIn.value = s.fadeIn

            /* Time */
            u.uTime.value = elapsed

            /* Velocity */
            s.vx = s.tx - s.prevTx
            s.vy = s.ty - s.prevTy
            s.prevTx = s.tx
            s.prevTy = s.ty
            s.speed = Math.hypot(s.vx, s.vy)

            /* Magnetic pull */
            const pull = getMagneticPull(s.tx, s.ty)
            s.magnetX = lerp(s.magnetX, pull.x, 0.1)
            s.magnetY = lerp(s.magnetY, pull.y, 0.1)

            /* Smooth blob follow */
            const blobLerp = s.hovered ? 0.13 : 0.09
            s.bx = lerp(s.bx, s.tx + s.magnetX, blobLerp)
            s.by = lerp(s.by, s.ty + s.magnetY, blobLerp)

            /* Hover spring */
            const targetHover = s.hovered ? 1.0 : 0.0
            u.uHover.value = lerp(u.uHover.value, targetHover, 0.1)

            /* Click decay */
            s.clickDecay = Math.max(0, s.clickDecay - 0.028)
            u.uClick.value = s.clickDecay

            /* Convert pixel position → 0..1 NDC for shader */
            u.uMouse.value.set(
                s.bx / window.innerWidth,
                1 - s.by / window.innerHeight // flip Y
            )

            /* Velocity uniform (normalized pixel/frame) */
            u.uVelocity.value.set(
                s.vx / window.innerWidth,
                s.vy / window.innerHeight
            )

            /* Expose cursor position for Snowfall integration */
            window.__liquidCursor = {
                x: s.bx,
                y: s.by,
                speed: s.speed,
            }

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
    }, [])

    /* ── Event listeners (separate effect for clean deps) ── */
    useEffect(() => {
        const s = state.current

        const onMove = (e) => {
            if (!s.visible) {
                s.visible = true
                s.bx = e.clientX
                s.by = e.clientY
                s.prevTx = e.clientX
                s.prevTy = e.clientY
            }
            s.tx = e.clientX
            s.ty = e.clientY
        }

        const onOver = (e) => {
            s.hovered = isInteractive(e.target)
        }

        const onDown = (e) => {
            s.clickDecay = 1.0
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
    }, [spawnRipple])

    return (
        <>
            {/* ── Three.js canvas ── */}
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
                }}
            />

            {/* ── Ripple container ── */}
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

            {/* ── Global styles: hide cursor + ripple keyframe ── */}
            <style>{`
        *, *::before, *::after { cursor: none !important; }

        @keyframes liquidRipple {
          0%   { width: 0px;   height: 0px;   opacity: 0.8; }
          100% { width: 120px; height: 120px; opacity: 0; }
        }
      `}</style>
        </>
    )
}

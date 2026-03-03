/**
 * FluidSimulation.jsx — Phase 3
 * ──────────────────────────────
 * GPU fluid simulation via Three.js ping-pong FBOs.
 * Navier-Stokes approximation: advection + curl + splat + display.
 *
 * Architecture:
 *   Two pairs of WebGLRenderTargets:
 *   ├── velocity[A/B]  — 2-channel float velocity field
 *   └── density[A/B]  — 4-channel colour/density
 *
 *   Per-frame passes:
 *   1. curlPass      — compute curl of velocity (autonomous swirling)
 *   2. advectVel     — advect velocity along itself (momentum)
 *   3. splatVel      — inject mouse force into velocity
 *   4. advectDens    — advect density along velocity
 *   5. splatDens     — inject colour at cursor
 *   6. displayPass   — render density to screen with neon palette
 *
 * Performance:
 *   – Half resolution (simResX × simResY)
 *   – Linear sampling on float textures
 *   – Each pass is a single fullscreen draw
 *   – 60fps on mid-range GPU
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ── Shared fullscreen vertex ─────────────────────────────────────────── */
const FSVert = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position, 1.); }
`

/* ── Advection pass ───────────────────────────────────────────────────── */
const AdvectFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tVelocity;
  uniform sampler2D tSource;
  uniform vec2      uResolution;
  uniform float     uDissipation;
  uniform float     uDt;
  varying vec2 vUv;

  void main() {
    vec2 vel  = texture2D(tVelocity, vUv).xy;
    vec2 prev = vUv - vel * uDt;
    /* Manual bilinear clamp */
    prev = clamp(prev, 1./uResolution, 1. - 1./uResolution);
    gl_FragColor = texture2D(tSource, prev) * uDissipation;
  }
`

/* ── Curl (vorticity) computation ────────────────────────────────────── */
const CurlFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tVelocity;
  uniform vec2      uResolution;
  varying vec2 vUv;

  void main() {
    vec2 texel = 1. / uResolution;
    float L = texture2D(tVelocity, vUv - vec2(texel.x, 0.)).y;
    float R = texture2D(tVelocity, vUv + vec2(texel.x, 0.)).y;
    float T = texture2D(tVelocity, vUv + vec2(0., texel.y)).x;
    float B = texture2D(tVelocity, vUv - vec2(0., texel.y)).x;
    float curl = (R - L - T + B) * .5;
    gl_FragColor = vec4(curl, 0., 0., 1.);
  }
`

/* ── Vorticity confinement ────────────────────────────────────────────── */
const VorticityFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tVelocity;
  uniform sampler2D tCurl;
  uniform vec2      uResolution;
  uniform float     uConfinement;
  uniform float     uDt;
  varying vec2 vUv;

  void main() {
    vec2 texel = 1. / uResolution;
    float L = texture2D(tCurl, vUv - vec2(texel.x, 0.)).x;
    float R = texture2D(tCurl, vUv + vec2(texel.x, 0.)).x;
    float T = texture2D(tCurl, vUv + vec2(0., texel.y)).x;
    float B = texture2D(tCurl, vUv - vec2(0., texel.y)).x;
    float C = texture2D(tCurl, vUv).x;
    vec2 force = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    float len  = max(length(force), .0001);
    force = force / len * uConfinement * C;
    vec2 vel = texture2D(tVelocity, vUv).xy + force * uDt;
    gl_FragColor = vec4(vel, 0., 1.);
  }
`

/* ── Splat (inject force / colour) ───────────────────────────────────── */
const SplatFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tTarget;
  uniform vec2      uPoint;
  uniform vec3      uColor;
  uniform float     uRadius;
  uniform float     uAspect;
  varying vec2 vUv;

  void main() {
    vec2 d = vUv - uPoint;
    d.x   *= uAspect;
    float sp = exp(-dot(d,d) / uRadius);
    vec4  cur = texture2D(tTarget, vUv);
    gl_FragColor = cur + vec4(uColor * sp, sp * .5);
  }
`

/* ── Display pass — neon ink aesthetic ───────────────────────────────── */
const DisplayFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tDensity;
  uniform float     uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }

  void main() {
    vec4 d = texture2D(tDensity, vUv);

    /* Neon colour mapping: r→cyan, g→violet, b→pink */
    vec3 col  = vec3(0.);
    col += vec3(0., .82, 1.)  * d.r;  /* cyan  */
    col += vec3(.65,.10, 1.)  * d.g;  /* violet */
    col += vec3(1., .20, .45) * d.b;  /* pink  */
    col += vec3(.10,.72, .90) * d.a * .6;

    /* HDR boost — bright regions become white-hot */
    float lum   = dot(col, vec3(.299,.587,.114));
    col += col * col * 1.2;

    /* Film grain (very subtle) */
    col += (hash(vUv + fract(uTime)) - .5) * .018;

    /* Alpha from luminance so ink looks transparent on dark */
    float alpha = clamp(lum * 1.6, 0., 1.);

    gl_FragColor = vec4(col, alpha);
  }
`

/* ── Autonomous curl-noise velocity injection (no mouse needed) ───────── */
const SeedFrag = /* glsl */`
  precision highp float;
  uniform sampler2D tVelocity;
  uniform float     uTime;
  uniform vec2      uResolution;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }

  void main() {
    /* Slowly evolving autonomous flow */
    float s  = uTime * .08;
    float n1 = noise(vUv * 3.4 + vec2(s, s*.7));
    float n2 = noise(vUv * 2.8 - vec2(s*.5, s));
    vec2 vel = texture2D(tVelocity, vUv).xy;
    vec2 autoFlow = vec2(n1 - .5, n2 - .5) * .004;
    gl_FragColor = vec4(vel + autoFlow, 0., 1.);
  }
`

/* ── Factory: create a float render target ────────────────────────────── */
function makeRT(w, h, type = THREE.HalfFloatType) {
    const rt = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type,
        depthBuffer: false,
        stencilBuffer: false,
    })
    return rt
}

/* ── Build a fullscreen pass material ────────────────────────────────── */
function makeMat(frag, uniforms = {}) {
    return new THREE.ShaderMaterial({
        vertexShader: FSVert, fragmentShader: frag,
        uniforms, depthTest: false, depthWrite: false,
    })
}

const SIM_SCALE = .5    // half resolution factor
const DISSIPATION_VEL = .985
const DISSIPATION_DENS = .975
const CONFINEMENT = 18.0

/* ══════════════════════════════════════════════════════════════════════ */
export default function FluidSimulation() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const W = Math.floor(window.innerWidth * SIM_SCALE)
        const H = Math.floor(window.innerHeight * SIM_SCALE)

        const renderer = new THREE.WebGLRenderer({
            canvas, alpha: true, antialias: false,
            powerPreference: 'high-performance',
        })
        renderer.setPixelRatio(1)           // sim always at 1x
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setClearColor(0x000000, 0)
        renderer.autoClear = false

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const scene = new THREE.Scene()
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
        scene.add(quad)

        /* Render targets */
        let velA = makeRT(W, H), velB = makeRT(W, H)
        let denA = makeRT(W, H), denB = makeRT(W, H)
        let curlRT = makeRT(W, H)

        /* Pass materials */
        const advectVelMat = makeMat(AdvectFrag, {
            tVelocity: { value: null },
            tSource: { value: null },
            uResolution: { value: new THREE.Vector2(W, H) },
            uDissipation: { value: DISSIPATION_VEL },
            uDt: { value: .016 },
        })
        const advectDenMat = makeMat(AdvectFrag, {
            tVelocity: { value: null },
            tSource: { value: null },
            uResolution: { value: new THREE.Vector2(W, H) },
            uDissipation: { value: DISSIPATION_DENS },
            uDt: { value: .016 },
        })
        const curlMat = makeMat(CurlFrag, {
            tVelocity: { value: null },
            uResolution: { value: new THREE.Vector2(W, H) },
        })
        const vortMat = makeMat(VorticityFrag, {
            tVelocity: { value: null },
            tCurl: { value: null },
            uResolution: { value: new THREE.Vector2(W, H) },
            uConfinement: { value: CONFINEMENT },
            uDt: { value: .016 },
        })
        const splatMat = makeMat(SplatFrag, {
            tTarget: { value: null },
            uPoint: { value: new THREE.Vector2(.5, .5) },
            uColor: { value: new THREE.Vector3(0, 0, 0) },
            uRadius: { value: .0012 },
            uAspect: { value: W / H },
        })
        const seedMat = makeMat(SeedFrag, {
            tVelocity: { value: null },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(W, H) },
        })
        const displayMat = makeMat(DisplayFrag, {
            tDensity: { value: null },
            uTime: { value: 0 },
        })

        /* ── Helper: render a pass to a target ── */
        const pass = (mat, target) => {
            renderer.setRenderTarget(target)
            renderer.clear(true, false, false)
            quad.material = mat
            renderer.render(scene, camera)
        }

        /* ── Mouse state ── */
        const mouse = { x: .5, y: .5, dx: 0, dy: 0, moved: false }
        let prevMX = window.innerWidth / 2
        let prevMY = window.innerHeight / 2

        const onMove = e => {
            mouse.moved = true
            mouse.x = e.clientX / window.innerWidth
            mouse.y = 1 - e.clientY / window.innerHeight
            mouse.dx = (e.clientX - prevMX) / window.innerWidth * .6
            mouse.dy = -(e.clientY - prevMY) / window.innerHeight * .6
            prevMX = e.clientX; prevMY = e.clientY
        }
        window.addEventListener('mousemove', onMove, { passive: true })

        /* ── Colour palette for splats ── */
        const PALETTE = [
            new THREE.Vector3(.0, .9, 1.0),   // cyan
            new THREE.Vector3(.65, .1, 1.0),   // violet
            new THREE.Vector3(1., .18, .45),   // pink
            new THREE.Vector3(.12, .75, .9),   // teal
            new THREE.Vector3(.8, .4, 1.0),   // lavender
        ]
        let paletteIdx = 0
        let frameCount = 0

        /* ── Animation ── */
        let raf, lastTime = performance.now()

        const animate = () => {
            raf = requestAnimationFrame(animate)
            const now = performance.now()
            const dt = Math.min((now - lastTime) * .001, .033)
            lastTime = now
            frameCount++

            const T = now * .001

            /* Update dt uniforms */
            advectVelMat.uniforms.uDt.value = dt
            advectDenMat.uniforms.uDt.value = dt
            vortMat.uniforms.uDt.value = dt

            /* 1. Autonomous seed (slow evolving flow) */
            seedMat.uniforms.tVelocity.value = velA.texture
            seedMat.uniforms.uTime.value = T
            pass(seedMat, velB)
                ;[velA, velB] = [velB, velA]

            /* 2. Curl */
            curlMat.uniforms.tVelocity.value = velA.texture
            pass(curlMat, curlRT)

            /* 3. Vorticity confinement */
            vortMat.uniforms.tVelocity.value = velA.texture
            vortMat.uniforms.tCurl.value = curlRT.texture
            pass(vortMat, velB)
                ;[velA, velB] = [velB, velA]

            /* 4. Advect velocity */
            advectVelMat.uniforms.tVelocity.value = velA.texture
            advectVelMat.uniforms.tSource.value = velA.texture
            pass(advectVelMat, velB)
                ;[velA, velB] = [velB, velA]

            /* 5. Mouse splat into velocity */
            const cursorData = window.__quantumCursor || { x: -9999, y: -9999, speed: 0 }
            const cx = cursorData.x / window.innerWidth
            const cy = 1 - cursorData.y / window.innerHeight

            if (mouse.moved && (Math.abs(mouse.dx) + Math.abs(mouse.dy)) > .0002) {
                splatMat.uniforms.tTarget.value = velA.texture
                splatMat.uniforms.uPoint.value.set(cx, cy)
                splatMat.uniforms.uColor.value.set(mouse.dx * 14., mouse.dy * 14., 0.)
                splatMat.uniforms.uRadius.value = .0016
                pass(splatMat, velB)
                    ;[velA, velB] = [velB, velA]

                /* Colour splat into density */
                paletteIdx = (paletteIdx + 1) % PALETTE.length
                const pc = PALETTE[paletteIdx]
                splatMat.uniforms.tTarget.value = denA.texture
                splatMat.uniforms.uColor.value.copy(pc).multiplyScalar(.55)
                splatMat.uniforms.uRadius.value = .0004
                pass(splatMat, denB)
                    ;[denA, denB] = [denB, denA]

                mouse.moved = false
            }

            /* Autonomous colour injection every 80 frames */
            if (frameCount % 80 === 0) {
                const autoX = .2 + Math.random() * .6
                const autoY = .2 + Math.random() * .6
                const autoC = PALETTE[Math.floor(Math.random() * PALETTE.length)]
                splatMat.uniforms.tTarget.value = denA.texture
                splatMat.uniforms.uPoint.value.set(autoX, autoY)
                splatMat.uniforms.uColor.value.copy(autoC).multiplyScalar(.28)
                splatMat.uniforms.uRadius.value = .0008
                pass(splatMat, denB)
                    ;[denA, denB] = [denB, denA]
            }

            /* 6. Advect density */
            advectDenMat.uniforms.tVelocity.value = velA.texture
            advectDenMat.uniforms.tSource.value = denA.texture
            pass(advectDenMat, denB)
                ;[denA, denB] = [denB, denA]

            /* 7. Display to screen */
            displayMat.uniforms.tDensity.value = denA.texture
            displayMat.uniforms.uTime.value = T
            renderer.setRenderTarget(null)
            renderer.clear(true, false, false)
            quad.material = displayMat
            renderer.render(scene, camera)
        }
        animate()

        /* Resize */
        const onResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight)
            /* On resize recreate RTs at new half-res (skip for brevity — fluid resets) */
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('resize', onResize)
                ;[velA, velB, denA, denB, curlRT].forEach(rt => rt.dispose())
                ;[advectVelMat, advectDenMat, curlMat, vortMat, splatMat, seedMat, displayMat]
                    .forEach(m => m.dispose())
            renderer.dispose()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                pointerEvents: 'none',
                zIndex: 3,
                mixBlendMode: 'screen',
                opacity: .72,
            }}
        />
    )
}

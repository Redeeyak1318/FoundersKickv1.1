import { useEffect, useRef, useCallback } from 'react'

/* ══════════════════════════════════════════════════════════════════
   LIQUID CURSOR — Premium Physics-Based Cursor
   
   Architecture:
   • Main blob   — lerp-follows mouse with organic morphing
   • Inner dot   — instant snap, chromatic aberration split
   • Trailing    — 6 ghost particles with staggered lerp decay
   • Click ripple — canvas-free SVG burst
   • SVG filter  — feTurbulence for real liquid distortion
   • Magnetic    — buttons pull the cursor slightly
   • Velocity    — dynamic blur + squish based on speed
   
   60fps via rAF + lerp (no Framer springs on the hot path)
══════════════════════════════════════════════════════════════════ */

/* ── Lerp utility ── */
const lerp = (a, b, t) => a + (b - a) * t

/* ── Clamp ── */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v))

/* ── Is interactive element? ── */
const isInteractive = (el) =>
    !!el?.closest('a, button, input, textarea, select, [role="button"], .nav-item, label, [tabindex]')

/* ──────────────────────────────────────────────────────────────── */

export default function LiquidCursor() {
    /* DOM refs for zero-React-render-overhead updates */
    const blobRef = useRef(null)
    const dotRedRef = useRef(null)
    const dotBlueRef = useRef(null)
    const trailRefs = useRef([])
    const ripplesRef = useRef(null)
    const rafRef = useRef(null)

    /* Mutable state — no setState to avoid re-renders */
    const state = useRef({
        // Target (raw mouse)
        tx: -200, ty: -200,
        // Blob current
        bx: -200, by: -200,
        // Dot current  
        dx: -200, dy: -200,
        // Trail positions
        trail: Array.from({ length: 6 }, () => ({ x: -200, y: -200 })),
        // Velocity
        vx: 0, vy: 0,
        prevTx: 0, prevTy: 0,
        speed: 0,
        // State flags
        hovered: false,
        clicked: false,
        visible: false,
        // Magnetic pull
        magnetX: 0, magnetY: 0,
        // Morphing
        morphPhase: 0,
    })

    /* ── Ripple on click ── */
    const spawnRipple = useCallback((x, y) => {
        if (!ripplesRef.current) return
        const div = document.createElement('div')
        div.style.cssText = `
            position:fixed;left:${x}px;top:${y}px;
            width:0;height:0;border-radius:50%;
            background:radial-gradient(circle,rgba(0,214,255,0.35),transparent 70%);
            transform:translate(-50%,-50%);pointer-events:none;
            animation:lc-ripple 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        `
        ripplesRef.current.appendChild(div)
        setTimeout(() => div.remove(), 700)
    }, [])

    /* ── Find nearest magnetic button ── */
    const getMagneticPull = useCallback((tx, ty) => {
        let bestDist = Infinity, pull = { x: 0, y: 0 }

        document.querySelectorAll('button, a, [role="button"]').forEach(el => {
            const r = el.getBoundingClientRect()
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const dist = Math.hypot(tx - cx, ty - cy)
            const threshold = Math.max(r.width, r.height) * 0.72

            if (dist < threshold && dist < bestDist) {
                bestDist = dist
                const strength = (1 - dist / threshold) * 0.28
                pull = { x: (cx - tx) * strength, y: (cy - ty) * strength }
            }
        })
        return pull
    }, [])

    /* ── Main animation loop ── */
    const tick = useCallback(() => {
        const s = state.current
        const B = blobRef.current
        const DR = dotRedRef.current
        const DB = dotBlueRef.current
        if (!B) { rafRef.current = requestAnimationFrame(tick); return }

        /* --- velocity --- */
        s.vx = s.tx - s.prevTx
        s.vy = s.ty - s.prevTy
        s.speed = Math.hypot(s.vx, s.vy)
        s.prevTx = s.tx
        s.prevTy = s.ty

        /* --- magnetic pull --- */
        const pull = getMagneticPull(s.tx, s.ty)
        s.magnetX = lerp(s.magnetX, pull.x, 0.12)
        s.magnetY = lerp(s.magnetY, pull.y, 0.12)

        /* --- blob (slow lerp + magnetic) --- */
        const blobLerp = s.hovered ? 0.14 : 0.10
        s.bx = lerp(s.bx, s.tx + s.magnetX, blobLerp)
        s.by = lerp(s.by, s.ty + s.magnetY, blobLerp)

        /* --- inner dot (fast lerp) --- */
        s.dx = lerp(s.dx, s.tx, 0.55)
        s.dy = lerp(s.dy, s.ty, 0.55)

        /* --- morph phase (organic wobble) --- */
        s.morphPhase += 0.018

        /* --- squish based on velocity --- */
        const spd = clamp(s.speed, 0, 28)
        const angle = Math.atan2(s.vy, s.vx) * (180 / Math.PI)
        const scaleX = 1 + spd * 0.018
        const scaleY = 1 - spd * 0.010
        const baseScale = s.hovered ? 1.55 : 1.0

        /* --- dynamic blur based on speed --- */
        const blurAmount = clamp(spd * 0.25, 0, 4)

        /* --- organic border-radius morphing --- */
        const m = Math.sin(s.morphPhase)
        const n = Math.cos(s.morphPhase * 1.3)
        const radius = s.hovered
            ? `${48 + m * 6}% ${52 - m * 6}% / ${50 + n * 5}% ${50 - n * 5}%`
            : `${42 + m * 12}% ${58 - m * 12}% ${50 + n * 8}% ${50 - n * 8}% / ${55 + m * 8}% ${45 - m * 8}% ${52 + n * 10}% ${48 - n * 10}%`

        /* --- apply to blob --- */
        B.style.transform = `
            translate(${s.bx}px, ${s.by}px)
            translate(-50%, -50%)
            rotate(${angle}deg)
            scale(${baseScale * scaleX}, ${baseScale * scaleY})
        `
        B.style.borderRadius = radius
        B.style.filter = `blur(${blurAmount}px) url(#lc-distort)`

        /* --- inner dot split (chromatic aberration) --- */
        if (DR && DB) {
            const aberr = clamp(spd * 0.8, 0, 6)
            DR.style.transform = `translate(${s.dx - aberr * 0.5}px, ${s.dy}px) translate(-50%,-50%)`
            DB.style.transform = `translate(${s.dx + aberr * 0.5}px, ${s.dy}px) translate(-50%,-50%)`
        }

        /* --- trail particles --- */
        trailRefs.current.forEach((el, i) => {
            if (!el) return
            const decay = 0.055 + i * 0.018
            const prev = i === 0
                ? { x: s.bx, y: s.by }
                : s.trail[i - 1]

            s.trail[i].x = lerp(s.trail[i].x, prev.x, decay)
            s.trail[i].y = lerp(s.trail[i].y, prev.y, decay)

            const trailScale = (1 - i / 8) * 0.38 * (s.hovered ? 0.5 : 1)
            const trailOpacity = (1 - i / 7) * 0.28 * (1 - blurAmount / 6)

            el.style.transform = `translate(${s.trail[i].x}px, ${s.trail[i].y}px) translate(-50%,-50%) scale(${trailScale})`
            el.style.opacity = trailOpacity
        })

        rafRef.current = requestAnimationFrame(tick)
    }, [getMagneticPull])

    /* ── Event listeners ── */
    useEffect(() => {
        const s = state.current

        const onMove = (e) => {
            s.tx = e.clientX
            s.ty = e.clientY
            if (!s.visible) {
                s.visible = true
                s.bx = e.clientX
                s.by = e.clientY
                s.dx = e.clientX
                s.dy = e.clientY
                if (blobRef.current) blobRef.current.style.opacity = '1'
                if (dotRedRef.current) dotRedRef.current.style.opacity = '1'
                if (dotBlueRef.current) dotBlueRef.current.style.opacity = '1'
            }
        }

        const onOver = (e) => {
            s.hovered = isInteractive(e.target)
        }

        const onDown = (e) => {
            spawnRipple(e.clientX, e.clientY)
            /* Blob quick scale pulse */
            if (blobRef.current) {
                blobRef.current.style.transition = 'transform 0.06s'
                setTimeout(() => {
                    if (blobRef.current) blobRef.current.style.transition = ''
                }, 120)
            }
        }

        const onLeave = () => {
            s.visible = false
            if (blobRef.current) blobRef.current.style.opacity = '0'
            if (dotRedRef.current) dotRedRef.current.style.opacity = '0'
            if (dotBlueRef.current) dotBlueRef.current.style.opacity = '0'
        }

        window.addEventListener('mousemove', onMove, { passive: true })
        window.addEventListener('mouseover', onOver, { passive: true })
        window.addEventListener('mousedown', onDown, { passive: true })
        document.addEventListener('mouseleave', onLeave, { passive: true })

        /* Start rAF loop */
        rafRef.current = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseover', onOver)
            window.removeEventListener('mousedown', onDown)
            document.removeEventListener('mouseleave', onLeave)
            cancelAnimationFrame(rafRef.current)
        }
    }, [tick, spawnRipple])

    return (
        <>
            {/* ── SVG Filter — liquid distortion ── */}
            <svg
                aria-hidden="true"
                style={{ position: 'fixed', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', zIndex: -1 }}
            >
                <defs>
                    <filter id="lc-distort" x="-30%" y="-30%" width="160%" height="160%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.0"
                            numOctaves="2"
                            seed="2"
                            result="noise"
                        >
                            <animate
                                attributeName="baseFrequency"
                                values="0.015 0.015;0.025 0.018;0.015 0.015"
                                dur="4s"
                                repeatCount="indefinite"
                            />
                        </feTurbulence>
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="5"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* ── Ripple container ── */}
            <div
                ref={ripplesRef}
                aria-hidden="true"
                style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99990, overflow: 'hidden' }}
            />

            {/* ── Trail particles ── */}
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    ref={el => { trailRefs.current[i] = el }}
                    aria-hidden="true"
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(0,214,255,0.5) 0%, rgba(108,92,231,0.2) 60%, transparent 100%)',
                        pointerEvents: 'none',
                        zIndex: 99991,
                        willChange: 'transform, opacity',
                        opacity: 0,
                    }}
                />
            ))}

            {/* ── Main liquid blob ── */}
            <div
                ref={blobRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: 32, height: 32,
                    background: 'radial-gradient(circle at 35% 35%, rgba(0,214,255,0.9) 0%, rgba(108,92,231,0.75) 45%, rgba(0,80,255,0.55) 100%)',
                    pointerEvents: 'none',
                    zIndex: 99995,
                    willChange: 'transform, border-radius, filter',
                    opacity: 0,
                    mixBlendMode: 'screen',
                    boxShadow: [
                        '0 0 12px 4px rgba(0,214,255,0.45)',
                        '0 0 28px 8px rgba(108,92,231,0.25)',
                        '0 0 48px 16px rgba(0,80,255,0.12)',
                    ].join(', '),
                }}
            />

            {/* ── Inner dot — RED channel (chromatic aberration) ── */}
            <div
                ref={dotRedRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: 'rgba(255,100,200,0.9)',
                    pointerEvents: 'none',
                    zIndex: 99997,
                    willChange: 'transform',
                    opacity: 0,
                    boxShadow: '0 0 6px 2px rgba(255,80,180,0.6)',
                    mixBlendMode: 'screen',
                }}
            />

            {/* ── Inner dot — BLUE channel ── */}
            <div
                ref={dotBlueRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: 'rgba(0,220,255,0.9)',
                    pointerEvents: 'none',
                    zIndex: 99997,
                    willChange: 'transform',
                    opacity: 0,
                    boxShadow: '0 0 6px 2px rgba(0,200,255,0.6)',
                    mixBlendMode: 'screen',
                }}
            />

            {/* ── Ripple keyframe injection ── */}
            <style>{`
                @keyframes lc-ripple {
                    0%   { width: 0;   height: 0;   opacity: 0.7; }
                    100% { width: 80px; height: 80px; opacity: 0; }
                }
                *, *::before, *::after { cursor: none !important; }
            `}</style>
        </>
    )
}

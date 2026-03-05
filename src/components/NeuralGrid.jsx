/**
 * NeuralGrid.jsx — Phase 4
 * ─────────────────────────
 * Animated neural network background grid — canvas 2D, zero framework overhead.
 *
 * Features:
 *   • 72 nodes drifting with subtle autonomous velocity
 *   • Distance-based  connections (threshold 200px)
 *   • Line alpha + width falloff by distance
 *   • Parallax drift toward cursor (depth illusion)
 *   • Node  via shadowBlur — brighter near cursor
 *   • Pulse wave on AI cursor pulse event
 *   • Hover-nearest: topmost nodes highlight on proximity
 *   • Zero React re-renders on hot path
 */

import { useEffect, useRef } from 'react'

const NODE_COUNT = 72
const CONNECT_DIST = 210   // px
const PARALLAX_STR = 0.022  // how much nodes drift toward cursor

const lerp = (a, b, t) => a + (b - a) * t

export default function NeuralGrid() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let raf, W, H

        const resize = () => {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        /* ── Node factory ── */
        const nodes = Array.from({ length: NODE_COUNT }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - .5) * .38,
            vy: (Math.random() - .5) * .38,
            r: 1.5 + Math.random() * 2.2,   // base radius
            brightness: Math.random(),         // base  level
            phase: Math.random() * Math.PI * 2,
            /* Parallax depth layer (0=foreground, 1=background) */
            depth: Math.random(),
        }))

        /* ── Mouse / cursor ── */
        const mouse = { x: W / 2, y: H / 2 }
        let offsetX = 0, offsetY = 0   // smooth parallax offset

        const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY }
        window.addEventListener('mousemove', onMove, { passive: true })

        const animate = () => {
            raf = requestAnimationFrame(animate)
            const T = performance.now() * .001

            /* Smooth parallax */
            const targetOffX = (mouse.x / W - .5) * W * PARALLAX_STR
            const targetOffY = (mouse.y / H - .5) * H * PARALLAX_STR
            offsetX = lerp(offsetX, targetOffX, .04)
            offsetY = lerp(offsetY, targetOffY, .04)

            /* Cursor data from VolumetricCursor */
            const cursor = window.__quantumCursor || { x: mouse.x, y: mouse.y, pulse: 0, blackHole: 0 }

            ctx.clearRect(0, 0, W, H)

            /* ── Update + draw connections ── */
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i]

                /* Drift */
                n.x += n.vx; n.y += n.vy

                /* Wrap */
                if (n.x < -20) n.x = W + 20
                if (n.x > W + 20) n.x = -20
                if (n.y < -20) n.y = H + 20
                if (n.y > H + 20) n.y = -20

                /* Parallax offset (depth layer) */
                const layerStr = (1 - n.depth) * .7 + .3
                const drawX = n.x + offsetX * layerStr
                const drawY = n.y + offsetY * layerStr

                /* Cursor proximity  */
                const dCursor = Math.hypot(drawX - cursor.x, drawY - cursor.y)
                const cursorProx = Math.max(0, 1 - dCursor / 280)
                const baseBright = .12 + n.brightness * .22
                const  = baseBright + cursorProx * .55 + cursor.pulse * .35
                    + Math.sin(T * 1.1 + n.phase) * .08

                /* ── Connections ── */
                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j]
                    const mDepth = (1 - m.depth) * .7 + .3
                    const mx = m.x + offsetX * mDepth
                    const my = m.y + offsetY * mDepth
                    const d = Math.hypot(drawX - mx, drawY - my)

                    if (d < CONNECT_DIST) {
                        const t = 1 - d / CONNECT_DIST
                        const lineAlpha = t * t * ( + .25 * cursorProx) * .7

                        /* Pick color: cyan → violet gradient by connection length */
                        const colorT = d / CONNECT_DIST
                        const r = Math.round(lerp(0, 90, colorT))
                        const g = Math.round(lerp(220, 60, colorT))
                        const b = Math.round(lerp(255, 255, colorT))

                        ctx.beginPath()
                        ctx.moveTo(drawX, drawY)
                        ctx.lineTo(mx, my)
                        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(lineAlpha, .6)})`
                        ctx.lineWidth = lerp(.8, .2, d / CONNECT_DIST)
                        /* Glow on lines near cursor */
                        if (cursorProx > .3) {
                            ctx.shadowColor = `rgba(0,220,255,${cursorProx * .35})`
                            ctx.shadowBlur = 6
                        } else {
                            ctx.shadowBlur = 0
                        }
                        ctx.stroke()
                        ctx.shadowBlur = 0
                    }
                }

                /* ── Node dot ── */
                const nr = n.r * (1 + cursorProx * 1.1)
                const nAlpha = Math.min( + .1, .85)

                ctx.beginPath()
                ctx.arc(drawX, drawY, nr, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(0,220,255,${nAlpha})`
                ctx.shadowColor = `rgba(0,220,255,${nAlpha * .8})`
                ctx.shadowBlur = 8 + cursorProx * 12
                ctx.fill()
                ctx.shadowBlur = 0

                /* Inner bright core */
                ctx.beginPath()
                ctx.arc(drawX, drawY, nr * .45, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(180,240,255,${nAlpha * .7})`
                ctx.fill()
            }

            /* ── Black hole vortex effect: spiral nearby nodes toward cursor ── */
            if (cursor.blackHole > 0.05) {
                const bh = cursor.blackHole
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i]
                    const dx = cursor.x - n.x
                    const dy = cursor.y - n.y
                    const d = Math.hypot(dx, dy)
                    if (d < 300 && d > 2) {
                        const force = (bh * 0.4) / (d * 0.08 + 1)
                        n.vx += (dx / d) * force * 0.012
                        n.vy += (dy / d) * force * 0.012
                        /* Speed limit */
                        const s = Math.hypot(n.vx, n.vy)
                        if (s > 3) { n.vx = n.vx / s * 3; n.vy = n.vy / s * 3 }
                    }
                }
            } else {
                /* Gently restore velocity toward baseline */
                for (let i = 0; i < nodes.length; i++) {
                    const n = nodes[i]
                    const s = Math.hypot(n.vx, n.vy)
                    if (s > .5) {
                        n.vx *= .985; n.vy *= .985
                    }
                }
            }
        }
        animate()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMove)
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
                zIndex: 1,
                opacity: .55,
            }}
        />
    )
}

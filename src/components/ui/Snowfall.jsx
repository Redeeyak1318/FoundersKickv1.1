import { useEffect, useRef } from 'react'

/* ══════════════════════════════════════════════════════════════════
   SNOWFALL — Quantum Cursor Edition
   
   Integrates with window.__quantumCursor:
   ├── cursor.x / cursor.y        → repulsion center
   ├── cursor.speed               → turbulence strength
   ├── cursor.click               → shockwave scatter
   ├── cursor.hovered             → subtle glow increase
   └── cursor.pulse               → pulse-sync glow flicker

   Features:
   • Repulsion field (inverse-square force)
   • Click shockwave → explosive scatter
   • Proximity glow (cyan → white gradient)
   • Turbulence trail on fast move
   • Pulse-sync brightness flicker
   • 60fps canvas 2D — zero framework overhead
══════════════════════════════════════════════════════════════════ */

const REPEL_RADIUS = 110   // px — repulsion zone
const REPEL_STRENGTH = 2.6
const GLOW_RADIUS = 160   // px — glow tint zone
const SHOCK_RADIUS = 200   // px — click shockwave scatter zone

const COUNT = 70

export default function Snowfall() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let raf

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        /* Spawn particles */
        const particles = Array.from({ length: COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.9 + 0.5,
            speedY: Math.random() * 0.55 + 0.18,
            speedX: (Math.random() - 0.5) * 0.28,
            opacity: Math.random() * 0.30 + 0.08,
            /* Displacement */
            dispX: 0,
            dispY: 0,
            /* Shock velocity */
            shockVX: 0,
            shockVY: 0,
        }))

        let prevClick = 0     // last known click value to detect new clicks

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const cursor = window.__quantumCursor || { x: -9999, y: -9999, speed: 0, click: 0, hovered: false, pulse: 0 }
            const turbulence = Math.min(cursor.speed / 28, 1)

            /* Detect rising edge of click */
            if (cursor.click > 0.9 && prevClick < 0.9) {
                /* Scatter all particles inside shock radius */
                particles.forEach(p => {
                    const dx = p.x - cursor.x
                    const dy = p.y - cursor.y
                    const d = Math.hypot(dx, dy)
                    if (d < SHOCK_RADIUS && d > 0.5) {
                        const force = (1 - d / SHOCK_RADIUS) * 14
                        p.shockVX += (dx / d) * force
                        p.shockVY += (dy / d) * force - 2   // upward bias
                    }
                })
            }
            prevClick = cursor.click

            particles.forEach(p => {
                /* Gravity drift */
                p.y += p.speedY
                p.x += p.speedX

                /* Cursor turbulence */
                if (turbulence > 0.05) {
                    p.x += (Math.random() - 0.5) * turbulence * 2.0
                    p.y += (Math.random() - 0.5) * turbulence * 1.0
                }

                /* Cursor repulsion */
                const dx = p.x - cursor.x
                const dy = p.y - cursor.y
                const dist = Math.hypot(dx, dy)

                if (dist < REPEL_RADIUS && dist > 0.5) {
                    const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH
                    p.dispX += (dx / dist) * force
                    p.dispY += (dy / dist) * force
                }

                /* Shock velocity dampen */
                p.shockVX *= 0.92
                p.shockVY *= 0.92
                p.dispX = (p.dispX + p.shockVX) * 0.87
                p.dispY = (p.dispY + p.shockVY) * 0.87

                const rx = p.x + p.dispX
                const ry = p.y + p.dispY

                /* Wrap */
                if (p.y > canvas.height) { p.y = -p.size; p.x = Math.random() * canvas.width }
                if (p.x > canvas.width) p.x = 0
                if (p.x < 0) p.x = canvas.width

                /* Glow proximity */
                const glowDist = dist < GLOW_RADIUS ? (1 - dist / GLOW_RADIUS) : 0
                /* Pulse sync flicker */
                const pulseFactor = 1 + cursor.pulse * 0.35 * Math.sin(Date.now() * 0.008 + p.x)
                const hoverBoost = cursor.hovered ? 0.15 : 0
                const glowAlpha = (p.opacity + glowDist * 0.55 + hoverBoost) * pulseFactor

                if (glowDist > 0.02) {
                    /* Glowing cyan-white */
                    const r = Math.round(lerp(255, 0, glowDist))
                    const g = Math.round(lerp(255, 245, glowDist))
                    ctx.beginPath()
                    ctx.arc(rx, ry, p.size * (1 + glowDist * 0.9), 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(${r},${g},255,${Math.min(glowAlpha, 0.92)})`
                    ctx.shadowColor = `rgba(0,245,255,${glowDist * 0.65})`
                    ctx.shadowBlur = 9 * glowDist
                    ctx.fill()
                    ctx.shadowBlur = 0
                } else {
                    /* Normal */
                    ctx.beginPath()
                    ctx.arc(rx, ry, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
                    ctx.fill()
                }
            })

            raf = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(raf)
        }
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
                zIndex: 1,
                background: 'transparent',
            }}
        />
    )
}

function lerp(a, b, t) { return a + (b - a) * t }

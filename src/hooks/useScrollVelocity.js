import { useEffect, useRef } from 'react'

/**
 * useScrollVelocity
 * ─────────────────
 * Tracks scroll speed in pixels/second.
 * Exposes a mutable ref so the animation loop can read it at 60fps
 * without any React re-renders.
 *
 * Returns: { velocityRef }
 *   velocityRef.current = { y: number, normalized: 0..1 }
 */
export function useScrollVelocity() {
    const velocityRef = useRef({ y: 0, normalized: 0 })

    useEffect(() => {
        let lastScrollY = window.scrollY
        let lastTime    = performance.now()
        let rafId       = null
        let rawVelocity = 0

        const onScroll = () => {
            const now   = performance.now()
            const dt    = Math.max(now - lastTime, 1)          // ms
            const dy    = window.scrollY - lastScrollY         // px
            rawVelocity = Math.abs(dy / dt) * 1000             // px/s
            lastScrollY = window.scrollY
            lastTime    = now
        }

        /* Decay loop — smoothly brings velocity back to 0 after scrolling stops */
        const decay = () => {
            rawVelocity *= 0.92
            const norm  = Math.min(rawVelocity / 2400, 1)     // 2400px/s = max
            velocityRef.current = { y: rawVelocity, normalized: norm }
            rafId = requestAnimationFrame(decay)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        rafId = requestAnimationFrame(decay)

        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(rafId)
        }
    }, [])

    return { velocityRef }
}

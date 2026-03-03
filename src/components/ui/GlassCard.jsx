import { motion } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'

/* ──────────────────────────────────────────────────────────────
   GlassCard — Design System aligned
   - Soft glow border on hover (no heavy shadow)
   - Subtle mouse-tracking glow (no aggressive tilt)
   - Unified easing: cubic-bezier(0.22, 1, 0.36, 1)
────────────────────────────────────────────────────────────── */

export default function GlassCard({
    children,
    className = '',
    glowColor = 'rgba(0, 214, 255, 0.12)',
    disableGlow = false,
    style = {},
    ...props
}) {
    const cardRef = useRef(null)
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
    const [hovered, setHovered] = useState(false)

    const handleMouseMove = useCallback((e) => {
        if (disableGlow || !cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        setGlowPos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
        })
    }, [disableGlow])

    return (
        <motion.div
            ref={cardRef}
            className={`glass-card ${className}`}
            onMouseMove={handleMouseMove}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                transition: [
                    'background 250ms cubic-bezier(0.22,1,0.36,1)',
                    'border-color 250ms cubic-bezier(0.22,1,0.36,1)',
                    'box-shadow 250ms cubic-bezier(0.22,1,0.36,1)',
                    'transform 250ms cubic-bezier(0.22,1,0.36,1)',
                ].join(', '),
                ...style,
            }}
            {...props}
        >
            {/* Mouse-tracking ambient glow blob */}
            {!disableGlow && (
                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        width: 220,
                        height: 220,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 68%)`,
                        left: `${glowPos.x}%`,
                        top: `${glowPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        opacity: hovered ? 1 : 0,
                        transition: [
                            'opacity 300ms cubic-bezier(0.22,1,0.36,1)',
                            'left 100ms linear',
                            'top  100ms linear',
                        ].join(', '),
                        zIndex: 0,
                    }}
                />
            )}

            {/* Content sits above glow */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </motion.div>
    )
}

# Components

## GlassCard
- Source: `src/components/ui/GlassCard.jsx`
- Description: Design system aligned glass card with soft borders and subtle mouse-tracking glow.
- Props: `glowColor`, `disableGlow`, etc.

```jsx
import { motion } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'

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
            className={`-card ${className}`}
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

            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </motion.div>
    )
}
```

## MagneticButton
- Source: `src/components/ui/MagneticButton.jsx`
- Description: Animated magnetic button with hover ripples.
- Props: `variant`, `strength`, `onClick`

```jsx
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { springConfig } from '../../utils/motion'

const VARIANT_STYLES = {
    primary: {
        background: 'linear-gradient(135deg, #F97316 0%, #ea580c 100%)',
        color: '#fff',
        border: 'none',
        boxShadow: '0 0 20px rgba(249,115,22,0.20)',
    },
    secondary: {
        color: 'rgba(255,255,255,0.70)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'none',
    },
    ghost: {
        color: '#fb923c',
        border: '1px solid rgba(249,115,22,0.28)',
        boxShadow: 'none',
    },
    danger: {
        color: '#fb7185',
        border: '1px solid rgba(251,113,133,0.25)',
        boxShadow: 'none',
    }
}

const HOVER_STYLES = {
    primary: { boxShadow: '0 0 36px rgba(249,115,22,0.30)', transform: 'translateY(-1px)' },
    secondary: { borderColor: 'rgba(249,115,22,0.22)', color: '#fff', boxShadow: '0 0 16px rgba(249,115,22,0.08)' },
    ghost: { boxShadow: '0 0 16px rgba(249,115,22,0.14)' },
    danger: { boxShadow: '0 0 14px rgba(251,113,133,0.20)' },
}

export default function MagneticButton({
    children,
    variant = 'primary',
    onClick,
    className = '',
    strength = 0.22,
    style = {},
    ...props
}) {
    const ref = useRef(null)
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [hovered, setHovered] = useState(false)
    const [ripples, setRipples] = useState([])

    const handleMouseMove = useCallback((e) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        setPos({
            x: (e.clientX - rect.left - rect.width / 2) * strength,
            y: (e.clientY - rect.top - rect.height / 2) * strength,
        })
    }, [strength])

    const handleMouseLeave = useCallback(() => {
        setPos({ x: 0, y: 0 })
        setHovered(false)
    }, [])

    const handleClick = useCallback((e) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const id = Date.now()
        setRipples(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }])
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
        onClick?.(e)
    }, [onClick])

    const base = VARIANT_STYLES[variant] || VARIANT_STYLES.primary
    const hover = HOVER_STYLES[variant] || HOVER_STYLES.primary

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            animate={{ x: pos.x, y: pos.y }}
            whileTap={{ scale: 0.96 }}
            transition={{ ...springConfig, duration: undefined }}
            className={`magnetic-btn magnetic-btn-${variant} ${className}`}
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '10px 24px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                borderRadius: 10,
                cursor: 'pointer',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'box-shadow 250ms cubic-bezier(0.22,1,0.36,1), background 250ms cubic-bezier(0.22,1,0.36,1), border-color 250ms cubic-bezier(0.22,1,0.36,1)',
                ...base,
                ...(hovered ? hover : {}),
                ...style,
            }}
            {...props}
        >
            {children}

            {ripples.map(r => (
                <motion.span
                    key={r.id}
                    initial={{ opacity: 0.35, scale: 0, width: 12, height: 12 }}
                    animate={{ opacity: 0, scale: 10 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        left: r.x - 6,
                        top: r.y - 6,
                        pointerEvents: 'none',
                    }}
                />
            ))}
        </motion.button>
    )
}
```

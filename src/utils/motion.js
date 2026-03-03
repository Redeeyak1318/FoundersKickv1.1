/* =========================================================
   MOTION SYSTEM v2 — Unified with FoundersKick Design System
   All easings align with cubic-bezier(0.22, 1, 0.36, 1)
   No bounce. No elastic. Precision & calm.
   ========================================================= */

/* ── Easing constants (arrays for Framer Motion) ── */
export const easings = {
    // Primary — all standard transitions
    smooth: [0.22, 1, 0.36, 1],

    // In-out for deliberate transitions (modal open, tab change)
    precise: [0.76, 0, 0.24, 1],

    // No more elastic/spring in CSS — use only for intentional reveals
    reveal: [0.22, 1, 0.36, 1],

    // Legacy aliases — keep backward compat
    expoOut: [0.22, 1, 0.36, 1],
    quartInOut: [0.76, 0, 0.24, 1],
    spring: [0.22, 1, 0.36, 1],  // was elastic — now calm
}

/* ── Duration constants ── */
export const durations = {
    fast: 0.15,
    normal: 0.25,
    slow: 0.40,
    slower: 0.60,
}

/* ── Page transitions ── */
export const pageTransition = {
    initial: { opacity: 0, y: 16 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: durations.slow, ease: easings.smooth }
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: durations.normal, ease: easings.precise }
    }
}

/* ── Stagger container (for feeding lists, grids) ── */
export const staggerContainer = (staggerDelay = 0.07) => ({
    animate: {
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.05,
        }
    }
})

/* ── Stagger item ── */
export const staggerItem = {
    initial: { opacity: 0, y: 18 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: durations.slow, ease: easings.smooth }
    }
}

/* ── Card hover — subtle lift with no bounce ── */
export const cardHover = {
    rest: {
        y: 0,
        scale: 1,
        transition: { duration: durations.normal, ease: easings.smooth }
    },
    hover: {
        y: -3,
        scale: 1.005,
        transition: { duration: durations.normal, ease: easings.smooth }
    }
}

/* ── Directional slide in ── */
export const slideIn = (direction = 'up', distance = 24) => {
    const axis = (direction === 'left' || direction === 'right') ? 'x' : 'y'
    const sign = (direction === 'right' || direction === 'down') ? 1 : -1

    return {
        initial: { opacity: 0, [axis]: sign * distance },
        animate: {
            opacity: 1,
            [axis]: 0,
            transition: { duration: durations.slow, ease: easings.smooth }
        },
        exit: {
            opacity: 0,
            [axis]: sign * distance * -0.4,
            transition: { duration: durations.normal, ease: easings.precise }
        }
    }
}

/* ── Scale up ── */
export const scaleUp = {
    initial: { opacity: 0, scale: 0.94 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: durations.normal, ease: easings.smooth }
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        transition: { duration: durations.fast, ease: easings.precise }
    }
}

/* ── Blur fade ── */
export const blurFade = {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: durations.slow, ease: easings.smooth }
    },
    exit: {
        opacity: 0,
        filter: 'blur(8px)',
        transition: { duration: durations.normal, ease: easings.precise }
    }
}

/* ── Fade in up (utility shorthand) ── */
export const fadeInUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: durations.slow, ease: easings.smooth, delay }
    }
})

/* ── Magnetic button mouse tracking helper ── */
export const magneticEffect = (e, ref, strength = 0.25) => {
    if (!ref.current) return { x: 0, y: 0 }
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    return { x, y }
}

/* ── Spring config for Framer Motion (no bounce) ── */
export const springConfig = {
    type: 'spring',
    stiffness: 320,
    damping: 32,
    mass: 0.6,
}

/* ── Counter spring (number roll) ── */
export const counterSpring = {
    type: 'spring',
    stiffness: 80,
    damping: 22,
}

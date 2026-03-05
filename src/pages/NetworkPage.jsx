import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'

/* ─────────────────────── Connection States ───────────────────────
   idle        → "Connect"
   requested   → "Request Sent" (you sent it, they haven't replied)
   pending     → incoming request  → Accept / Reject
   connected   → "Connected"
   rejected    → fades back to idle
──────────────────────────────────────────────────────────────────── */

const INITIAL_PEOPLE = [
    { id: 1, name: 'Sarah Chen', role: 'CEO @ NexaAI', initials: 'SC', color: '#F97316', mutual: 12, state: 'connected' },
    { id: 2, name: 'Marcus Rivera', role: 'CTO @ FlowStack', initials: 'MR', color: '#3B82F6', mutual: 8, state: 'connected' },
    { id: 3, name: 'Emily Zhang', role: 'Founder @ GreenLoop', initials: 'EZ', color: '#f472b6', mutual: 15, state: 'connected' },
    { id: 4, name: 'Raj Patel', role: 'Builder @ DevForge', initials: 'RP', color: '#34d399', mutual: 5, state: 'pending' },
    { id: 5, name: 'Aisha Williams', role: 'PM @ CloudBase', initials: 'AW', color: '#fbbf24', mutual: 3, state: 'pending' },
    { id: 6, name: 'Tom Wright', role: 'Designer @ PixelLab', initials: 'TW', color: '#fb923c', mutual: 9, state: 'idle' },
    { id: 7, name: 'Luna Kim', role: 'Growth @ RapidScale', initials: 'LK', color: '#f472b6', mutual: 7, state: 'idle' },
    { id: 8, name: 'Jake Morrison', role: 'Engineer @ ByteCraft', initials: 'JM', color: '#3B82F6', mutual: 4, state: 'idle' },
]

/* ─────────────────────── Tiny Particle Burst ─────────────────────── */
function ParticleBurst({ active, color = '#34d399' }) {
    const count = 8
    const angles = Array.from({ length: count }, (_, i) => (i / count) * 360)
    return (
        <AnimatePresence>
            {active && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
                    {angles.map((angle, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                            animate={{
                                opacity: 0,
                                x: Math.cos((angle * Math.PI) / 180) * 28,
                                y: Math.sin((angle * Math.PI) / 180) * 28,
                                scale: 0.3,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.55, delay: i * 0.02, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: '50%', left: '50%',
                                width: 5, height: 5, borderRadius: '50%',
                                background: color,
                                marginTop: -2.5, marginLeft: -2.5,
                                boxShadow: `0 0 6px ${color}`,
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    )
}

/* ─────────────────────── Connect Button ─────────────────────── */
function ConnectButton({ state, onConnect, onAccept, onReject, color }) {
    const [burst, setBurst] = useState(false)
    const [glowSweep, setGlowSweep] = useState(false)

    const handleConnect = () => {
        onConnect()
    }

    const handleAccept = () => {
        setBurst(true)
        setGlowSweep(true)
        setTimeout(() => setBurst(false), 700)
        setTimeout(() => setGlowSweep(false), 900)
        onAccept()
    }

    const handleReject = () => {
        onReject()
    }

    /* ── Idle: "Connect" ── */
    if (state === 'idle') {
        return (
            <motion.button
                layout
                layoutId={`btn-${color}`}
                whileHover={{ scale: 1.04, boxShadow: `0 0 20px ${color}40` }}
                whileTap={{ scale: 0.94 }}
                onClick={handleConnect}
                style={{
                    padding: '7px 18px', borderRadius: 10, fontSize: '0.75rem',
                    fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer',
                    border: '1px solid rgba(249,115,22,0.3)',
                    color: '#fb923c', transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
                + Connect
            </motion.button>
        )
    }

    /* ── Requested: "Request Sent" with pulse ── */
    if (state === 'requested') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 16px', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-display)',
                    color: 'var(--color-text-secondary)', whiteSpace: 'nowrap',
                    cursor: 'default',
                }}
            >
                {/* Pulsing dot */}
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#fbbf24',
                        boxShadow: '0 0 8px rgba(251,191,36,0.6)',
                        flexShrink: 0,
                    }}
                />
                Request Sent
            </motion.div>
        )
    }

    /* ── Pending (incoming): Accept / Reject ── */
    if (state === 'pending') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ display: 'flex', gap: 6, position: 'relative' }}
            >
                {/* Accept */}
                <motion.button
                    whileHover={{ scale: 1.06, boxShadow: '0 4px 20px rgba(52,211,153,0.35)' }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleAccept}
                    style={{
                        padding: '7px 14px', borderRadius: 10, fontSize: '0.75rem',
                        fontWeight: 600, fontFamily: 'var(--font-display)', cursor: 'pointer',
                        background: 'linear-gradient(90deg, #059669, #34d399)',
                        border: 'none', color: '#fff',
                        boxShadow: '0 2px 10px rgba(52,211,153,0.2)',
                        position: 'relative', overflow: 'hidden',
                        transition: 'all 0.25s ease', whiteSpace: 'nowrap',
                    }}
                >
                    {/*  sweep on accept click */}
                    <AnimatePresence>
                        {glowSweep && (
                            <motion.div
                                initial={{ left: '-100%' }}
                                animate={{ left: '150%' }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute', top: 0, bottom: 0, width: '60%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                    transform: 'skewX(-15deg)', pointerEvents: 'none',
                                }}
                            />
                        )}
                    </AnimatePresence>
                    Accept
                </motion.button>

                {/* Reject */}
                <motion.button
                    whileHover={{ scale: 1.06, borderColor: 'rgba(251,113,133,0.5)', color: '#fb7185' }}
                    whileTap={{ scale: 0.92 }}
                    onClick={handleReject}
                    style={{
                        padding: '7px 12px', borderRadius: 10, fontSize: '0.75rem',
                        fontWeight: 500, fontFamily: 'var(--font-display)', cursor: 'pointer',
                        border: '1px solid rgba(251,113,133,0.2)',
                        color: 'rgba(251,113,133,0.65)',
                        transition: 'all 0.25s ease', whiteSpace: 'nowrap',
                    }}
                >
                    Decline
                </motion.button>

                {/* Particle burst anchored to accept button area */}
                <div style={{ position: 'absolute', right: 60, top: '50%', transform: 'translateY(-50%)' }}>
                    <ParticleBurst active={burst} color="#34d399" />
                </div>
            </motion.div>
        )
    }

    /* ── Connected ── */
    if (state === 'connected') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                style={{ position: 'relative', display: 'flex', gap: 6 }}
            >
                {/* Connected badge */}
                <motion.div
                    animate={{ boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 14px rgba(52,211,153,0.35)', '0 0 0px rgba(52,211,153,0)'] }}
                    transition={{ duration: 1.8, repeat: 2 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 10,
                        border: '1px solid rgba(52,211,153,0.3)',
                        fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                        color: '#34d399', cursor: 'default', whiteSpace: 'nowrap',
                    }}
                >
                    <motion.svg
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        width="11" height="11" viewBox="0 0 24 24"
                        fill="none" stroke="#34d399" strokeWidth="3"
                        strokeLinecap="round" strokeLinejoin="round"
                    >
                        <motion.polyline points="20 6 9 17 4 12" />
                    </motion.svg>
                    Connected
                </motion.div>

                {/* Message button */}
                <motion.button
                    whileHover={{ scale: 1.06, borderColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                        padding: '7px 12px', borderRadius: 10, fontSize: '0.75rem',
                        fontWeight: 500, fontFamily: 'var(--font-display)', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: 'var(--color-text-tertiary)',
                        transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                    }}
                >
                    Message
                </motion.button>
            </motion.div>
        )
    }

    return null
}

/* ─────────────────────── Connection Card ─────────────────────── */
function ConnectionCard({ person, onStateChange }) {
    const [state, setState] = useState(person.state)
    const [isRejecting, setIsRejecting] = useState(false)

    const handleConnect = () => {
        setState('requested')
        onStateChange?.(person.id, 'requested')
    }

    const handleAccept = () => {
        setState('connected')
        onStateChange?.(person.id, 'connected')
    }

    const handleReject = () => {
        setIsRejecting(true)
        setTimeout(() => {
            setState('idle')
            setIsRejecting(false)
            onStateChange?.(person.id, 'idle')
        }, 400)
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{
                opacity: isRejecting ? 0 : 1,
                scale: isRejecting ? 0.96 : 1,
                y: 0,
            }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            style={{
                background: state === 'connected'
                    ? 'rgba(52,211,153,0.04)'
                    : state === 'pending'
                        ? 'rgba(251,191,36,0.04)'
                        : 'rgba(255,255,255,0.025)',
                border: `1px solid ${state === 'connected' ? 'rgba(52,211,153,0.15)'
                    : state === 'pending' ? 'rgba(251,191,36,0.15)'
                        : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 18, padding: '1.1rem 1.25rem',
                position: 'relative', overflow: 'hidden',
                transition: 'background 0.5s ease, border-color 0.5s ease',
            }}
        >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    style={{
                        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                        background: `linear-gradient(135deg, ${person.color}, ${person.color}80)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.82rem', color: '#fff',
                        boxShadow: `0 0 16px ${person.color}35`,
                        cursor: 'pointer',
                    }}
                >
                    {person.initials}
                </motion.div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{person.name}</span>
                        {state === 'pending' && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    fontSize: '0.6rem', padding: '2px 8px', borderRadius: 999,
                                    border: '1px solid rgba(251,191,36,0.3)',
                                    color: '#fbbf24', fontWeight: 600
                                }}
                            >
                                Wants to connect
                            </motion.span>
                        )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{person.role}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                        {person.mutual} mutual connection{person.mutual !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Action Buttons */}
                <AnimatePresence mode="wait">
                    <motion.div key={state}>
                        <ConnectButton
                            state={state}
                            color={person.color}
                            onConnect={handleConnect}
                            onAccept={handleAccept}
                            onReject={handleReject}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

/* ─────────────────────── Network Graph ─────────────────────── */
function NetworkGraph() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const resize = () => {
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * dpr
            canvas.height = rect.height * dpr
            ctx.scale(dpr, dpr)
        }
        resize()

        const nodeCount = 28
        const rect = canvas.getBoundingClientRect()
        const nodes = Array.from({ length: nodeCount }, (_, i) => ({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: 2.5 + Math.random() * 4,
            color: ['#F97316', '#fb923c', '#3B82F6', '#ea580c', '#34d399'][i % 5],
        }))

        let animId
        const animate = () => {
            ctx.clearRect(0, 0, rect.width, rect.height)
            nodes.forEach((node, i) => {
                node.x += node.vx
                node.y += node.vy
                if (node.x < 0 || node.x > rect.width) node.vx *= -1
                if (node.y < 0 || node.y > rect.height) node.vy *= -1

                nodes.forEach((other, j) => {
                    if (j <= i) return
                    const dx = other.x - node.x, dy = other.y - node.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < 110) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(108,92,231,${0.14 * (1 - dist / 110)})`
                        ctx.lineWidth = 0.8
                        ctx.moveTo(node.x, node.y)
                        ctx.lineTo(other.x, other.y)
                        ctx.stroke()
                    }
                })

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
                ctx.fillStyle = node.color + '90'
                ctx.fill()

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2)
                ctx.fillStyle = node.color + '18'
                ctx.fill()
            })
            animId = requestAnimationFrame(animate)
        }
        animate()
        return () => cancelAnimationFrame(animId)
    }, [])

    return (
        <canvas ref={canvasRef} style={{
            width: '100%', height: 220, borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.07)',
        }} />
    )
}

/* ─────────────────────── Pulsing Badge ─────────────────────── */
function PulsingBadge({ count }) {
    if (!count) return null
    return (
        <motion.span
            animate={{
                boxShadow: [
                    '0 0 0 0 rgba(251,191,36,0.5)',
                    '0 0 0 5px rgba(251,191,36,0)',
                ],
                scale: [1, 1.08, 1],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
                marginLeft: 7,
                color: '#0A0A0C', borderRadius: 99, padding: '1px 7px',
                fontSize: '0.58rem', fontWeight: 800, display: 'inline-block',
                verticalAlign: 'middle', lineHeight: '1.4',
            }}
        >
            {count}
        </motion.span>
    )
}

/* ─────────────────────── Main Page ─────────────────────── */
export default function NetworkPage() {
    const [people, setPeople] = useState(INITIAL_PEOPLE)
    const [filter, setFilter] = useState('all')

    const handleStateChange = useCallback((id, newState) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, state: newState } : p))
    }, [])

    const pendingCount = people.filter(p => p.state === 'pending').length
    const connectedCount = people.filter(p => p.state === 'connected').length

    const filtered = people.filter(p => {
        if (filter === 'all') return true
        if (filter === 'connected') return p.state === 'connected'
        if (filter === 'pending') return p.state === 'pending'
        if (filter === 'discover') return p.state === 'idle' || p.state === 'requested'
        return true
    })

    const TABS = [
        { key: 'all', label: 'All' },
        { key: 'connected', label: 'Connected' },
        { key: 'pending', label: 'Pending', badge: pendingCount },
        { key: 'discover', label: 'Discover' },
    ]

    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ marginBottom: '1.75rem' }}
            >
                <h1 style={{
                    fontSize: '1.6rem', fontWeight: 800,
                    fontFamily: 'var(--font-display)', marginBottom: '0.25rem'
                }}>Network</h1>
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                    {connectedCount} connections &mdash; grow your founder network
                </p>
            </motion.div>

            {/* Graph */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5 }}
                style={{ marginBottom: '1.75rem' }}
            >
                <NetworkGraph />
            </motion.div>

            {/* Stats row */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}
            >
                {[
                    { label: 'Connected', value: connectedCount, color: '#34d399' },
                    { label: 'Pending', value: pendingCount, color: '#fbbf24' },
                    { label: 'To Discover', value: people.filter(p => p.state === 'idle').length, color: '#fb923c' },
                ].map(stat => (
                    <div key={stat.label} style={{
                        flex: 1, minWidth: 100, padding: '1rem',
                        border: `1px solid ${stat.color}25`,
                        borderRadius: 14, textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{stat.label}</div>
                    </div>
                ))}
            </motion.div>

            {/* Tab bar */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{
                    display: 'flex', gap: 4, marginBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            position: 'relative', padding: '0.65rem 1.1rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: filter === tab.key ? 600 : 400,
                            fontFamily: 'var(--font-display)',
                            color: filter === tab.key ? '#fff' : 'var(--color-text-tertiary)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        {tab.label}
                        {tab.badge ? <PulsingBadge count={tab.badge} /> : null}

                        {/* Sliding underline */}
                        <AnimatePresence>
                            {filter === tab.key && (
                                <motion.div
                                    layoutId="network-tab-line"
                                    style={{
                                        position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                                        background: 'linear-gradient(90deg, #F97316, #fb923c)',
                                        borderRadius: 1, boxShadow: '0 0 8px rgba(249,115,22,0.4)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                                />
                            )}
                        </AnimatePresence>
                    </button>
                ))}
            </motion.div>

            {/* Cards */}
            <motion.div style={{ display: 'grid', gap: '0.85rem' }} layout>
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}
                        >
                            No people in this category.
                        </motion.div>
                    ) : (
                        filtered.map((person, i) => (
                            <motion.div
                                key={person.id}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05, duration: 0.35 }}
                            >
                                <ConnectionCard
                                    person={person}
                                    onStateChange={handleStateChange}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

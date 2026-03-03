import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import AntigravityBackground from '../components/AntigravityBackground'
import '../cinematic.css'

/* =========================================================
   CONSTANTS
   ========================================================= */
const TOTAL_FRAMES = 240
const SCROLL_HEIGHT_VH = 500 // more scroll distance = more granular control
const FRAME_PATH = (i) => `/frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`

/* Scroll beat ranges (0-1 normalised) */
const BEATS = {
    connect: { start: 0, end: 0.20 },
    commit: { start: 0.20, end: 0.60 },
    collaborate: { start: 0.60, end: 0.85 },
    resolve: { start: 0.85, end: 1.00 },
}

/* Utility: linear interpolation */
function lerp(a, b, t) {
    return a + (b - a) * t
}

/* =========================================================
   SCROLL FRAME CANVAS – Ultra-smooth image sequence engine
   
   Key techniques for smoothness:
   1. Continuous rAF render loop (not triggered per scroll event)
   2. Lerped frame index → eliminates frame jumps
   3. Cross-fade blending between adjacent frames
   4. DPR-aware canvas for crisp rendering
   ========================================================= */
function ScrollFrameCanvas({ progress }) {
    const canvasRef = useRef(null)
    const imagesRef = useRef([])
    const loadedSetRef = useRef(new Set())
    const renderFrameRef = useRef(0)        // current lerped frame (float)
    const targetFrameRef = useRef(0)         // target frame from scroll
    const rafIdRef = useRef(null)
    const isRunningRef = useRef(false)

    // Preload all frames efficiently
    useEffect(() => {
        const images = []

        // Preload in priority order: first frame, key frames, then fill
        const priorityOrder = [1] // first frame loaded immediately
        // Add key beat boundary frames
        const keyFrames = [1, 48, 96, 144, 192, 204, 240]
        keyFrames.forEach(f => {
            if (!priorityOrder.includes(f)) priorityOrder.push(f)
        })
        // Fill remaining
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            if (!priorityOrder.includes(i)) priorityOrder.push(i)
        }

        // Create Image objects array (indexed 0 to TOTAL_FRAMES-1)
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            images.push(null)
        }

        // Batch preload
        let batchIndex = 0
        const BATCH_SIZE = 8

        function loadBatch() {
            const end = Math.min(batchIndex + BATCH_SIZE, priorityOrder.length)
            for (let b = batchIndex; b < end; b++) {
                const frameNum = priorityOrder[b]
                const idx = frameNum - 1
                const img = new Image()
                img.src = FRAME_PATH(frameNum)
                img.onload = () => {
                    loadedSetRef.current.add(idx)
                }
                images[idx] = img
            }
            batchIndex = end
            if (batchIndex < priorityOrder.length) {
                setTimeout(loadBatch, 16) // load next batch on next frame
            }
        }

        loadBatch()
        imagesRef.current = images

        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
            isRunningRef.current = false
        }
    }, [])

    // Setup canvas sizing (DPR-aware)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            canvas.width = window.innerWidth * dpr
            canvas.height = window.innerHeight * dpr
            canvas.style.width = window.innerWidth + 'px'
            canvas.style.height = window.innerHeight + 'px'
            const ctx = canvas.getContext('2d')
            if (ctx) ctx.scale(dpr, dpr)
        }

        resize()
        window.addEventListener('resize', resize)
        return () => window.removeEventListener('resize', resize)
    }, [])

    // Update target frame from progress
    useEffect(() => {
        targetFrameRef.current = progress * (TOTAL_FRAMES - 1)
    }, [progress])

    // Continuous render loop with lerped frame index + cross-fade
    useEffect(() => {
        isRunningRef.current = true
        const LERP_SPEED = 0.12 // smoothing factor (0.05 = very smooth, 0.2 = responsive)

        function renderLoop() {
            if (!isRunningRef.current) return

            const canvas = canvasRef.current
            if (!canvas) {
                rafIdRef.current = requestAnimationFrame(renderLoop)
                return
            }

            const ctx = canvas.getContext('2d')
            if (!ctx) {
                rafIdRef.current = requestAnimationFrame(renderLoop)
                return
            }

            const target = targetFrameRef.current
            const current = renderFrameRef.current

            // Lerp toward target
            const diff = Math.abs(target - current)
            let newFrame
            if (diff < 0.01) {
                newFrame = target // snap when close enough
            } else {
                newFrame = lerp(current, target, LERP_SPEED)
            }
            renderFrameRef.current = newFrame

            // Get integer frame indices for cross-fade
            const frameA = Math.floor(newFrame)
            const frameB = Math.min(frameA + 1, TOTAL_FRAMES - 1)
            const blend = newFrame - frameA // 0-1 blend factor

            const images = imagesRef.current
            const imgA = images[frameA]
            const imgB = images[frameB]

            const cw = window.innerWidth
            const ch = window.innerHeight

            // Clear
            ctx.clearRect(0, 0, cw, ch)

            // Draw frame A
            if (imgA && imgA.complete && imgA.naturalWidth > 0) {
                ctx.globalAlpha = 1
                drawCover(ctx, imgA, cw, ch)
            }

            // Cross-fade frame B on top if blend > 0
            if (blend > 0.01 && imgB && imgB.complete && imgB.naturalWidth > 0 && frameA !== frameB) {
                ctx.globalAlpha = blend
                drawCover(ctx, imgB, cw, ch)
                ctx.globalAlpha = 1
            }

            rafIdRef.current = requestAnimationFrame(renderLoop)
        }

        rafIdRef.current = requestAnimationFrame(renderLoop)

        return () => {
            isRunningRef.current = false
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    )
}

/* Cover-fit draw helper */
function drawCover(ctx, img, cw, ch) {
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const scale = Math.max(cw / iw, ch / ih)
    const dw = iw * scale
    const dh = ih * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)
}

/* =========================================================
   TEXT OVERLAY BEAT – Fade in/out based on scroll position
   ========================================================= */
function BeatOverlay({ progress, beat, align = 'center', children }) {
    const { start, end } = BEATS[beat]
    const range = end - start
    // First beat (start === 0) should appear immediately, no fade-in
    const isFirstBeat = start === 0
    const fadeIn = isFirstBeat ? 0 : range * 0.15
    const fadeOut = range * 0.15

    let opacity = 0
    let translateY = isFirstBeat ? 0 : 30

    if (progress >= start && progress <= end) {
        if (isFirstBeat) {
            // First beat: full visibility from start, only fade out near end
            if (progress < end - fadeOut) {
                opacity = 1
                translateY = 0
            } else {
                const t = (end - progress) / fadeOut
                const eased = t * t * (3 - 2 * t)
                opacity = eased
                translateY = -15 * (1 - eased)
            }
        } else {
            // Other beats: fade in → hold → fade out
            if (progress < start + fadeIn) {
                const t = (progress - start) / fadeIn
                const eased = t * t * (3 - 2 * t)
                opacity = eased
                translateY = 30 * (1 - eased)
            } else if (progress < end - fadeOut) {
                opacity = 1
                translateY = 0
            } else {
                const t = (end - progress) / fadeOut
                const eased = t * t * (3 - 2 * t)
                opacity = eased
                translateY = -15 * (1 - eased)
            }
        }
    }

    const alignmentStyles = {
        center: { textAlign: 'center', alignItems: 'center', justifyContent: 'center' },
        left: { textAlign: 'left', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: '8vw' },
        right: { textAlign: 'right', alignItems: 'flex-end', justifyContent: 'center', paddingRight: '8vw' },
    }

    return (
        <div
            className="beat-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 2,
                pointerEvents: opacity > 0.3 ? 'auto' : 'none',
                opacity: Math.max(0, Math.min(1, opacity)),
                transform: `translateY(${translateY}px)`,
                transition: 'none',
                willChange: 'opacity, transform',
                ...alignmentStyles[align],
            }}
        >
            {children}
        </div>
    )
}

/* =========================================================
   NAVBAR – Apple-style SaaS nav
   ========================================================= */
function Navbar({ scrolled, progress }) {
    return (
        <nav
            className={`cinematic-nav ${scrolled ? 'cinematic-nav--scrolled' : ''}`}
            id="main-nav"
        >
            <div className="cinematic-nav__inner">
                {/* Left – Logo */}
                <Link to="/" className="cinematic-nav__brand" id="nav-brand">
                    <span className="cinematic-nav__brand-text" style={{ fontFamily: 'DELTHA, sans-serif' }}>FoundersKick</span>
                </Link>

                {/* Center – Links */}
                <div className="cinematic-nav__links">
                    <NavLink to="/dashboard" className={({ isActive }) => `cinematic-nav__link ${isActive ? 'active' : ''}`} id="nav-home">Home</NavLink>
                    <NavLink to="/network" className={({ isActive }) => `cinematic-nav__link ${isActive ? 'active' : ''}`} id="nav-network">Network</NavLink>
                    <NavLink to="/startups" className={({ isActive }) => `cinematic-nav__link ${isActive ? 'active' : ''}`} id="nav-startups">Startups</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `cinematic-nav__link ${isActive ? 'active' : ''}`} id="nav-about">About</NavLink>
                </div>

                {/* Right – Actions */}
                <div className="cinematic-nav__actions">
                    <Link to="/signup" className="cinematic-nav__cta" id="nav-launch-btn">
                        Launch Startup
                    </Link>
                </div>
            </div>
        </nav>
    )
}

/* =========================================================
   LOADING SCREEN
   ========================================================= */
function LoadingScreen({ loaded, total }) {
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0
    const done = percent >= 95

    return (
        <div
            className={`cinematic-loader ${done ? 'cinematic-loader--done' : ''}`}
            id="loading-screen"
        >
            <div className="cinematic-loader__content">
                <div className="cinematic-loader__brand">FoundersKick</div>
                <div className="cinematic-loader__bar-track">
                    <div
                        className="cinematic-loader__bar-fill"
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <div className="cinematic-loader__percent">{percent}%</div>
            </div>
        </div>
    )
}

/* =========================================================
   LANDING PAGE
   ========================================================= */
export default function Landing() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [navScrolled, setNavScrolled] = useState(false)
    const [framesLoaded, setFramesLoaded] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const stickyRef = useRef(null)
    const rawProgressRef = useRef(0)
    const smoothProgressRef = useRef(0)
    const scrollRafRef = useRef(null)

    // Preload tracking
    useEffect(() => {
        const checkInterval = setInterval(() => {
            let count = 0
            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const img = new Image()
                img.src = FRAME_PATH(i)
                if (img.complete) count++
            }
            setFramesLoaded(count)
            if (count >= TOTAL_FRAMES * 0.85) {
                setIsReady(true)
                clearInterval(checkInterval)
            }
        }, 300)

        const timeout = setTimeout(() => {
            setIsReady(true)
            clearInterval(checkInterval)
        }, 5000)

        return () => {
            clearInterval(checkInterval)
            clearTimeout(timeout)
        }
    }, [])

    // rAF-smoothed scroll handler — captures raw scroll, lerps to smooth
    useEffect(() => {
        // Passive scroll listener: just captures raw progress
        const captureScroll = () => {
            const el = stickyRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const stickyHeight = el.offsetHeight - window.innerHeight
            const scrolled = -rect.top
            rawProgressRef.current = Math.max(0, Math.min(1, scrolled / stickyHeight))
            setNavScrolled(window.scrollY > 50)
        }

        // Smooth rAF loop: lerps displayed progress toward raw
        const SCROLL_LERP = 0.18 // higher = more responsive, lower = smoother
        let running = true

        function smoothLoop() {
            if (!running) return

            const raw = rawProgressRef.current
            const smooth = smoothProgressRef.current
            const diff = Math.abs(raw - smooth)

            if (diff > 0.0005) {
                const next = lerp(smooth, raw, SCROLL_LERP)
                smoothProgressRef.current = next
                setScrollProgress(next)
            }

            scrollRafRef.current = requestAnimationFrame(smoothLoop)
        }

        window.addEventListener('scroll', captureScroll, { passive: true })
        captureScroll()
        scrollRafRef.current = requestAnimationFrame(smoothLoop)

        return () => {
            running = false
            window.removeEventListener('scroll', captureScroll)
            if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
        }
    }, [])

    return (
        <div className="cinematic-landing" id="cinematic-landing">
            {/* Loading */}
            {!isReady && (
                <LoadingScreen loaded={framesLoaded} total={TOTAL_FRAMES} />
            )}

            {/* Navbar */}
            <Navbar scrolled={navScrolled} progress={scrollProgress} />

            {/* ====== STICKY SCROLL SECTION ====== */}
            <div
                ref={stickyRef}
                className="cinematic-sticky-wrapper"
                style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
                id="hero"
            >
                {/* Canvas */}
                <ScrollFrameCanvas progress={scrollProgress} />

                {/* Vignette overlay for edge blending */}
                <div className="cinematic-vignette" />

                {/* ── BEAT 1: CONNECT ── */}
                <BeatOverlay progress={scrollProgress} beat="connect" align="center">
                    <section className="relative overflow-hidden" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                        <AntigravityBackground />
                        <div className="relative z-10" style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="beat-content beat-content--hero">
                                <div className="beat-eyebrow">FoundersKick Ecosystem</div>
                                <h1 className="beat-title beat-title--hero" id="hero-title">
                                    Connect<span className="beat-title__dot">.</span>
                                </h1>
                                <p className="beat-subtitle" id="hero-subtitle">
                                    The world's founders, builders, and visionaries —<br />
                                    in one intelligent network.
                                </p>
                                <p className="beat-accent-line">Where ambition meets alignment.</p>
                                <div className="beat-scroll-cue">
                                    <div className="beat-scroll-cue__line" />
                                    <span className="beat-scroll-cue__text">Scroll to explore</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </BeatOverlay>

                {/* ── BEAT 2: COMMIT ── */}
                <BeatOverlay progress={scrollProgress} beat="commit" align="left">
                    <div className="beat-content beat-content--commit" id="network">
                        <div className="beat-eyebrow beat-eyebrow--accent">Phase II</div>
                        <h2 className="beat-title beat-title--section" id="commit-title">
                            Commit<span className="beat-title__dot">.</span>
                        </h2>
                        <p className="beat-body">
                            Momentum begins when ideas find belief.
                        </p>
                        <p className="beat-body">
                            Energy moves when founders move.
                        </p>
                        <div className="beat-label">
                            Real connections. Real collaboration.
                        </div>
                    </div>
                </BeatOverlay>

                {/* ── BEAT 3: COLLABORATE ── */}
                <BeatOverlay progress={scrollProgress} beat="collaborate" align="right">
                    <div className="beat-content beat-content--collab" id="startups">
                        <div className="beat-eyebrow beat-eyebrow--accent">Phase III</div>
                        <h2 className="beat-title beat-title--section" id="collaborate-title">
                            Collaborate<span className="beat-title__dot">.</span>
                        </h2>
                        <p className="beat-body beat-body--punchy">Startups form.</p>
                        <p className="beat-body beat-body--punchy">Teams align.</p>
                        <p className="beat-body beat-body--punchy">Products launch.</p>
                    </div>
                </BeatOverlay>

                {/* ── BEAT 4: RESOLUTION / CTA ── */}
                <BeatOverlay progress={scrollProgress} beat="resolve" align="center">
                    <div className="beat-content beat-content--resolve" id="about">
                        <h2 className="beat-title beat-title--resolve" id="resolve-title">
                            Build the future together.
                        </h2>
                        <p className="beat-resolve-tagline">
                            FoundersKick — Connect. Commit. Collaborate.
                        </p>
                        <div className="beat-cta-group">
                            <Link to="/signup" className="beat-cta-primary" id="cta-enter-network">
                                Enter the Network
                            </Link>
                            <Link to="/startups" className="beat-cta-secondary" id="cta-explore-startups">
                                Explore Startups
                            </Link>
                        </div>
                        <div className="beat-cta-glow" />
                    </div>
                </BeatOverlay>
            </div>

            {/* ====== POST-SCROLL FOOTER ====== */}
            <footer className="cinematic-footer" id="footer">
                <div className="cinematic-footer__inner">
                    <div className="cinematic-footer__grid">
                        <div className="cinematic-footer__brand-col">
                            <div className="cinematic-footer__brand">FoundersKick</div>
                            <p className="cinematic-footer__desc">
                                The platform where founders connect, commit, and collaborate to build the future.
                            </p>
                        </div>
                        <div className="cinematic-footer__links-col">
                            <div className="cinematic-footer__section">
                                <div className="cinematic-footer__section-title">Platform</div>
                                <a href="#" className="cinematic-footer__link">Explore Startups</a>
                                <a href="#" className="cinematic-footer__link">Find Co-Founders</a>
                                <a href="#" className="cinematic-footer__link">Launch Startup</a>
                                <a href="#" className="cinematic-footer__link">Dashboard</a>
                            </div>
                            <div className="cinematic-footer__section">
                                <div className="cinematic-footer__section-title">Resources</div>
                                <a href="#" className="cinematic-footer__link">Blog</a>
                                <a href="#" className="cinematic-footer__link">Guides</a>
                                <a href="#" className="cinematic-footer__link">Success Stories</a>
                                <a href="#" className="cinematic-footer__link">FAQ</a>
                            </div>
                            <div className="cinematic-footer__section">
                                <div className="cinematic-footer__section-title">Company</div>
                                <a href="#" className="cinematic-footer__link">About</a>
                                <a href="#" className="cinematic-footer__link">Careers</a>
                                <a href="#" className="cinematic-footer__link">Contact</a>
                                <a href="#" className="cinematic-footer__link">Legal</a>
                            </div>
                        </div>
                    </div>
                    <div className="cinematic-footer__bottom">
                        <span>© 2026 FoundersKick. All rights reserved.</span>
                        <span>Built with precision for founders, by founders.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

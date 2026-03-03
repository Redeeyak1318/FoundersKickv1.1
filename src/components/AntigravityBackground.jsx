"use client";
import React, { useState, useEffect, Suspense, Component } from 'react';

// ── Tiny self-contained error boundary so a Three.js crash
//    never tears down the whole page ──
class ThreeErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(err, info) {
        console.warn('[AntigravityBackground] Three.js error caught — hiding component:', err);
    }
    render() {
        if (this.state.hasError) return null;   // gracefully vanish
        return this.props.children;
    }
}

// Lazy-load the heavy Three.js pieces so they never block initial paint
const LazyCanvas = React.lazy(() =>
    import('@react-three/fiber').then(mod => ({ default: mod.Canvas }))
);

const LazyContent = React.lazy(() =>
    import('./AntigravityContent').then(mod => ({ default: mod.default }))
);

export default function AntigravityBackground({
    count = 300,
    magnetRadius = 6,
    ringRadius = 7,
    waveSpeed = 0.4,
    className = "",
    color = "#5227FF"
}) {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(true);

    useEffect(() => {
        setMounted(true);

        // Check WebGL support before even trying
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl2') || c.getContext('webgl');
            if (!gl) setHasWebGL(false);
        } catch {
            setHasWebGL(false);
        }

        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted || isMobile || !hasWebGL) return null;
    if (!count) return null;

    return (
        <div
            className={`absolute inset-0 ${className}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
                animation: 'fadeCanvasIn 3s ease-in-out forwards',
                opacity: 0
            }}
        >
            <style>{`
                @keyframes fadeCanvasIn {
                    from { opacity: 0; }
                    to { opacity: 0.8; }
                }
            `}</style>

            <ThreeErrorBoundary>
                <Suspense fallback={null}>
                    <LazyCanvas
                        camera={{ position: [0, 0, 20], fov: 60 }}
                        gl={{ alpha: true }}
                        onCreated={({ gl }) => {
                            // Defensive: if gl context is lost, hide gracefully
                            gl.domElement.addEventListener('webglcontextlost', (e) => {
                                e.preventDefault();
                                console.warn('[AntigravityBackground] WebGL context lost');
                            });
                        }}
                    >
                        <Suspense fallback={null}>
                            <ambientLight intensity={1} />
                            <directionalLight position={[10, 10, 10]} intensity={2} />

                            <LazyContent
                                count={count}
                                magnetRadius={magnetRadius}
                                ringRadius={ringRadius}
                                waveSpeed={waveSpeed}
                                color={color}
                            />
                        </Suspense>
                    </LazyCanvas>
                </Suspense>
            </ThreeErrorBoundary>
        </div>
    );
}

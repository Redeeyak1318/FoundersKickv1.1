import React, { useEffect, useRef, useState } from "react";

import { ArrowRight } from "lucide-react";

export default function ScrollHero({ startFrame = 1, endFrame = 1122, onComplete }) {
    const frameRef = useRef(startFrame);
    const velocityRef = useRef(0);
    const rafRef = useRef(null);
    const [currentFrame, setCurrentFrame] = useState(startFrame);
    const isLockedRef = useRef(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const totalFrames = endFrame - startFrame + 1;

    useEffect(() => {
        // Preload frames progressively to prevent flickering and lag
        const preloadFrames = async () => {
            for (let i = startFrame; i <= endFrame; i++) {
                const img = new Image();
                img.src = `/frames/frame_${i.toString().padStart(4, "0")}.jpg`;
                // Yield thread occasionally to avoid completely blocking
                if (i % 50 === 0) await new Promise((r) => setTimeout(r, 1));
            }
        };
        preloadFrames();

        // Lock scroll at mount
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        isLockedRef.current = true;

        const updateFrame = () => {
            if (Math.abs(velocityRef.current) > 0.05) {
                frameRef.current += velocityRef.current;

                // Active friction
                velocityRef.current *= 0.9;

                // Clamp within bounds
                if (frameRef.current < startFrame) {
                    frameRef.current = startFrame;
                    velocityRef.current = 0;
                }
                if (frameRef.current > endFrame) {
                    frameRef.current = endFrame;
                    velocityRef.current = 0;
                }

                const roundedFrame = Math.round(frameRef.current);

                setCurrentFrame(prev => {
                    // Unlock criteria (reach final frame while locked)
                    if (roundedFrame >= endFrame && isLockedRef.current) {
                        isLockedRef.current = false;
                        setIsUnlocked(true); // 🔥 KEY

                        document.documentElement.style.overflow = "auto";
                        document.body.style.overflow = "auto";

                        if (onComplete) onComplete();
                    }
                    if (roundedFrame !== prev) {
                        return roundedFrame;
                    }
                    return prev;
                });
            } else {
                velocityRef.current = 0;
            }

            // Re-lock if scrolled back to top
            if (!isLockedRef.current && window.scrollY <= 0 && velocityRef.current < -0.1) {
                isLockedRef.current = true;
                document.body.style.overflow = "hidden";
            }

            rafRef.current = requestAnimationFrame(updateFrame);
        };

        rafRef.current = requestAnimationFrame(updateFrame);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            document.body.style.overflow = "auto"; // Cleanup
        };
    }, [startFrame, endFrame]);

    // Scroll event listeners
    useEffect(() => {
        const handleWheel = (e) => {
            if (isLockedRef.current) {
                e.preventDefault();
                velocityRef.current += e.deltaY * 0.03; // Adjust sensitivity
            } else if (window.scrollY <= 0 && e.deltaY < 0) {
                // Relock and smoothly scroll backwards
                window.scrollTo(0, 0);
                isLockedRef.current = true;
                document.body.style.overflow = "hidden";
                e.preventDefault();
                velocityRef.current += e.deltaY * 0.03;
            }
        };

        let touchStartY = 0;
        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            if (isLockedRef.current) {
                e.preventDefault();
                const deltaY = touchStartY - e.touches[0].clientY;
                touchStartY = e.touches[0].clientY;
                velocityRef.current += deltaY * 0.15;
            } else if (window.scrollY <= 0 && (touchStartY - e.touches[0].clientY) < 0) {
                // Relock for mobile when pulling down at top
                window.scrollTo(0, 0);
                isLockedRef.current = true;
                document.body.style.overflow = "hidden";
                e.preventDefault();
                const deltaY = touchStartY - e.touches[0].clientY;
                touchStartY = e.touches[0].clientY;
                velocityRef.current += deltaY * 0.15;
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: false });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    // Visual enhancements
    const progress = (currentFrame - startFrame) / Math.max(1, totalFrames - 1);
    const scale = 1 + (progress * 0.05); // Subtle zoom

    return (
        <section
            className={`top-0 left-0 w-full h-screen overflow-hidden ${isUnlocked ? "relative z-0" : "fixed z-[9999]"}`}>
            {/* Image Frame Layer */}
            <div className="absolute inset-0 z-0 transform-gpu overflow-hidden">
                <img
                    src={`/frames/frame_${currentFrame.toString().padStart(4, "0")}.jpg`}
                    alt="Cinematic frame"
                    className="w-full h-full object-cover"
                    style={{
                        transform: `scale(${scale})`,
                    }}
                />
            </div>

            {/* Overlays / Gradients */}
            <div className="absolute inset-0 z-[1] pointer-events-none">
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-5xl">
                <div className="overflow-hidden mb-2">
                    <p className="hero-subtitle text-[#a3a195] uppercase tracking-[0.3em] text-sm md:text-base mb-6 font-light">
                        Chapter I. The Anomaly
                    </p>
                </div>
                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.85] font-black uppercase text-white mb-8">
                    <div className="overflow-hidden"><span className="hero-title-line block">Forging</span></div>
                    <div className="overflow-hidden"><span className="hero-title-line block text-[#9b1b30] italic">The Future</span></div>
                    <div className="overflow-hidden"><span className="hero-title-line block">Legacy</span></div>
                </h1>
                <div className="overflow-hidden mt-10">
                    <button className="hero-subtitle btn-brutal flex items-center gap-3">
                        <span>Enter the Ecosystem</span> <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </section>
    );
}

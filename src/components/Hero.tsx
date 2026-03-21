"use client";

import { useEffect, useRef } from "react";

const START_FRAME = 1101;
const END_FRAME = 1122;

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const currentFrame = useRef(START_FRAME);
  const targetFrame = useRef(START_FRAME);
  const velocity = useRef(0);
  const isUnlocked = useRef(false);
  const touchStartY = useRef<number | null>(null);

  // Preload frames
  useEffect(() => {
    for (let i = START_FRAME; i <= END_FRAME; i++) {
      const img = new Image();
      img.src = `/frames/frame_${i}.jpg`;
    }
  }, []);

  useEffect(() => {
    // Lock scroll on mount
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let animationFrameId: number;

    const animate = () => {
      if (!isUnlocked.current) {
        // 1. Apply velocity to target with friction
        velocity.current *= 0.92;
        targetFrame.current += velocity.current;

        // 2. Clamp target frame strictly
        targetFrame.current = Math.max(START_FRAME, Math.min(END_FRAME, targetFrame.current));

        // 3. Smoothly interpolate current frame to target frame
        currentFrame.current += (targetFrame.current - currentFrame.current) * 0.08;

        // 4. Update image source
        const frameIndex = Math.min(END_FRAME, Math.max(START_FRAME, Math.round(currentFrame.current)));
        if (imgRef.current) {
          imgRef.current.src = `/frames/frame_${frameIndex}.jpg`;
        }

        // 5. Check unlock condition
        if (currentFrame.current >= END_FRAME - 1) {
          isUnlocked.current = true;
          document.documentElement.style.overflow = "auto";
          document.body.style.overflow = "auto";
          
          if (containerRef.current) {
            containerRef.current.style.position = "relative";
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isUnlocked.current) return;
      e.preventDefault();
      velocity.current += e.deltaY * 0.02;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isUnlocked.current) return;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isUnlocked.current) return;
      e.preventDefault();
      if (touchStartY.current === null) return;
      
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY.current - currentY;
      touchStartY.current = currentY; 
      
      velocity.current += deltaY * 0.02;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked.current) return;
      if (["ArrowUp","ArrowDown","PageUp","PageDown","Space"].includes(e.code)) {
        e.preventDefault();
        if (["ArrowDown", "PageDown", "Space"].includes(e.code)) {
          velocity.current += 100 * 0.02;
        } else if (["ArrowUp", "PageUp"].includes(e.code)) {
          velocity.current -= 100 * 0.02;
        }
      }
    };

    const options = { passive: false };

    // Intercept scroll inputs at window level
    window.addEventListener("wheel", handleWheel, options);
    window.addEventListener("touchstart", handleTouchStart, options);
    window.addEventListener("touchmove", handleTouchMove, options);
    window.addEventListener("keydown", handleKeyDown, options);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-[100vh] z-[999] overflow-hidden bg-black flex items-center justify-center"
    >
      <img 
        ref={imgRef}
        src={`/frames/frame_${START_FRAME}.jpg`}
        alt="Cinematic Scroll Animation"
        className="absolute inset-0 w-full h-full object-cover z-10"
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-20" />

      {/* Overlay text */}
      <div className="relative z-30 text-center text-white pointer-events-none px-6 drop-shadow-2xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Experience Perfection
        </h1>
        <p className="text-lg md:text-xl font-light opacity-80 max-w-2xl mx-auto">
          Scroll to unveil. The page remains locked until the journey completes.
        </p>
      </div>
    </section>
  );
}

"use client";

import { animate, AnimationPlaybackControls, useMotionValue } from "framer-motion";
import { CSSProperties, useEffect, useId, useRef } from "react";

/* ----------------------------- TYPES ----------------------------- */

interface AnimationConfig {
    scale: number;
    speed: number;
}

interface NoiseConfig {
    opacity: number;
    scale: number;
}

interface ShadowOverlayProps {
    sizing?: "fill" | "stretch";
    color?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
}

/* ----------------------------- HELPERS ----------------------------- */

function mapRange(
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
) {
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = () => {
    const id = useId();
    return `shadowoverlay-${id.replace(/:/g, "")}`;
};

/* ----------------------------- COMPONENT ----------------------------- */

export function Component({
    sizing = "fill",
    color = "rgba(249,115,22,1)",
    animation,
    noise,
    style,
    className
}: ShadowOverlayProps) {
    const id = useInstanceId();

    const animationEnabled = animation && animation.scale > 0;

    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);

    const hueRotate = useMotionValue(180);
    const animRef = useRef<AnimationPlaybackControls | null>(null);

    const displacementScale = animation
        ? mapRange(animation.scale, 1, 100, 20, 100)
        : 0;

    const animationDuration = animation
        ? mapRange(animation.speed, 1, 100, 1000, 50)
        : 1;

    /* ---------------- animation ---------------- */

    useEffect(() => {
        if (!animationEnabled || !feColorMatrixRef.current) return;

        if (animRef.current) animRef.current.stop();

        hueRotate.set(0);

        animRef.current = animate(hueRotate, 360, {
            duration: animationDuration / 65,
            repeat: Infinity,
            ease: "linear",
            onUpdate: (v) => {
                feColorMatrixRef.current?.setAttribute("values", String(v));
            }
        });

        return () => animRef.current?.stop();
    }, [animationEnabled, animationDuration, hueRotate]);

    /* ---------------- render ---------------- */

    return (
        <div
            className={className}
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 0,
                ...style
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: -displacementScale,
                    filter: animationEnabled ? `url(#${id}) blur(4px)` : "none"
                }}
            >
                {animationEnabled && (
                    <svg style={{ position: "absolute" }}>
                        <defs>
                            <filter id={id}>
                                <feTurbulence
                                    result="undulation"
                                    numOctaves="2"
                                    baseFrequency={`${mapRange(animation.scale, 0, 100, 0.001, 0.0005)},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`}
                                    seed="0"
                                    type="turbulence"
                                />

                                <feColorMatrix
                                    ref={feColorMatrixRef}
                                    in="undulation"
                                    type="hueRotate"
                                    values="180"
                                />

                                <feColorMatrix
                                    in="dist"
                                    result="circulation"
                                    type="matrix"
                                    values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                                />

                                <feDisplacementMap
                                    in="SourceGraphic"
                                    in2="circulation"
                                    scale={displacementScale}
                                    result="dist"
                                />

                                <feDisplacementMap
                                    in="dist"
                                    in2="undulation"
                                    scale={displacementScale}
                                    result="output"
                                />
                            </filter>
                        </defs>
                    </svg>
                )}

                <div
                    style={{
                        backgroundColor: color,
                        maskImage:
                            "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
                        maskSize: sizing === "stretch" ? "100% 100%" : "cover",
                        maskRepeat: "no-repeat",
                        maskPosition: "center",
                        width: "100%",
                        height: "100%"
                    }}
                />
            </div>

            {noise && noise.opacity > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                            'url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")',
                        backgroundSize: noise.scale * 200,
                        backgroundRepeat: "repeat",
                        opacity: noise.opacity / 2
                    }}
                />
            )}
        </div>
    );
}

export default Component;
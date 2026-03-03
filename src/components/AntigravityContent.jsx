"use client";
import React, { Suspense } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Antigravity from './ui/Antigravity';

export default function AntigravityContent({
    count = 300,
    magnetRadius = 6,
    ringRadius = 7,
    waveSpeed = 0.4,
    color = "#5227FF"
}) {
    return (
        <>
            <Antigravity
                count={count || 300}
                magnetRadius={magnetRadius || 6}
                ringRadius={ringRadius || 7}
                waveSpeed={waveSpeed || 0.4}
                waveAmplitude={1}
                particleSize={1.5}
                lerpSpeed={0.05}
                color={color || "#5227FF"}
                autoAnimate={true}
                particleVariance={1}
                rotationSpeed={0.1}
                depthFactor={1.2}
                pulseSpeed={3}
                particleShape="capsule"
                fieldStrength={10}
            />

            <EffectComposer disableNormalPass>
                <Bloom
                    intensity={1.3}
                    luminanceThreshold={0.25}
                    radius={0.5}
                />
            </EffectComposer>
        </>
    );
}

"use client";
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Antigravity({
    count = 300,
    magnetRadius = 6,
    ringRadius = 7,
    waveSpeed = 0.4,
    waveAmplitude = 1,
    particleSize = 1.5,
    lerpSpeed = 0.05,
    color = '#5227FF',
    autoAnimate = true,
    particleVariance = 1,
    rotationSpeed = 0.1,
    depthFactor = 1.2,
    pulseSpeed = 3,
    particleShape = 'capsule',
    fieldStrength = 10,
}) {
    const meshRef = useRef(null);
    const pointer = useRef(new THREE.Vector3());
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Initialize properties of each instanced particle
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            // Distribute on a spherical/cylindrical shell
            const t = Math.random() * Math.PI * 2;
            const p = Math.acos((Math.random() * 2) - 1);

            const radius = ringRadius + (Math.random() - 0.5) * particleVariance;
            const x = Math.sin(p) * Math.cos(t) * radius;
            const y = Math.sin(p) * Math.sin(t) * radius * 0.5; // flatten slightly
            const z = Math.cos(p) * radius * depthFactor;

            temp.push({
                x, y, z,
                originalX: x, originalY: y, originalZ: z,
                phase: Math.random() * Math.PI * 2,
                speedMultiplier: 0.5 + Math.random() * 1.5,
                scale: Math.random() * particleSize + 0.5,
                rotX: Math.random() * Math.PI * 2,
                rotY: Math.random() * Math.PI * 2,
                rotZ: Math.random() * Math.PI * 2,
                rotSpeedX: (Math.random() - 0.5) * rotationSpeed,
                rotSpeedY: (Math.random() - 0.5) * rotationSpeed,
                rotSpeedZ: (Math.random() - 0.5) * rotationSpeed,
            });
        }
        return temp;
    }, [count, ringRadius, particleVariance, particleSize, depthFactor, rotationSpeed]);

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        const time = autoAnimate ? state.clock.getElapsedTime() : 0;

        // Convert screen coordinates to world
        pointer.current.set(
            (state.pointer.x * state.viewport.width / 2),
            (state.pointer.y * state.viewport.height / 2),
            0
        );

        particles.forEach((p, i) => {
            // Waving motion
            const waveX = Math.sin(time * waveSpeed * p.speedMultiplier + p.phase) * waveAmplitude;
            const waveY = Math.cos(time * waveSpeed * p.speedMultiplier + p.phase) * waveAmplitude;
            const waveZ = Math.sin(time * (waveSpeed * 0.5) * p.speedMultiplier + p.phase) * waveAmplitude;

            let targetX = p.originalX + waveX;
            let targetY = p.originalY + waveY;
            let targetZ = p.originalZ + waveZ;

            // Simple Magnet repelling
            const currentPos = new THREE.Vector3(targetX, targetY, targetZ);
            const dist = currentPos.distanceTo(pointer.current);

            if (dist < magnetRadius) {
                const dir = currentPos.clone().sub(pointer.current).normalize();
                const force = (magnetRadius - dist) / magnetRadius;
                targetX += dir.x * force * fieldStrength;
                targetY += dir.y * force * fieldStrength;
                targetZ += dir.z * force * fieldStrength;
            }

            p.x += (targetX - p.x) * lerpSpeed;
            p.y += (targetY - p.y) * lerpSpeed;
            p.z += (targetZ - p.z) * lerpSpeed;

            p.rotX += p.rotSpeedX * delta * 60;
            p.rotY += p.rotSpeedY * delta * 60;
            p.rotZ += p.rotSpeedZ * delta * 60;

            const scaleMulti = 1 + Math.sin(time * pulseSpeed + p.phase) * 0.2;
            const currentScale = Math.max(0.01, p.scale * scaleMulti);

            dummy.position.set(p.x, p.y, p.z);
            dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
            dummy.scale.set(currentScale, currentScale, currentScale);
            dummy.updateMatrix();

            meshRef.current.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    const _geometry = useMemo(() => {
        let GeometryComponent = THREE.CapsuleGeometry;
        let geometryArgs = [0.1, 0.4, 4, 8];
        if (particleShape === 'sphere') {
            GeometryComponent = THREE.SphereGeometry;
            geometryArgs = [0.2, 8, 8];
        } else if (particleShape === 'box') {
            GeometryComponent = THREE.BoxGeometry;
            geometryArgs = [0.3, 0.3, 0.3];
        }
        return new GeometryComponent(...geometryArgs);
    }, [particleShape]);

    return (
        <instancedMesh ref={meshRef} args={[_geometry, undefined, count]}>
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5} // slightly elevated for bloom setup
                roughness={0.2}
                metalness={0.8}
            />
        </instancedMesh>
    );
}

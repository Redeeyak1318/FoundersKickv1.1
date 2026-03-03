import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import useMousePosition from '../../hooks/useMousePosition'

/* =========================================================
   PARTICLE FIELD — Ambient floating particles
   ========================================================= */
function ParticleField({ count = 300 }) {
    const meshRef = useRef()

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const speeds = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30
            sizes[i] = Math.random() * 2 + 0.5
            speeds[i] = Math.random() * 0.3 + 0.1
        }

        return { positions, sizes, speeds }
    }, [count])

    useFrame((state) => {
        if (!meshRef.current) return
        const positions = meshRef.current.geometry.attributes.position.array
        const time = state.clock.elapsedTime

        for (let i = 0; i < count; i++) {
            const speed = particles.speeds[i]
            positions[i * 3 + 1] += Math.sin(time * speed + i) * 0.003
            positions[i * 3] += Math.cos(time * speed * 0.5 + i) * 0.002
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={particles.sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                color="#a78bfa"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}

/* =========================================================
   FOUNDER NODE — Glowing orb representing a founder
   ========================================================= */
function FounderNode({ position, color, scale = 1, index }) {
    const meshRef = useRef()
    const glowRef = useRef()

    useFrame((state) => {
        if (!meshRef.current) return
        const time = state.clock.elapsedTime

        // Floating motion
        meshRef.current.position.y = position[1] + Math.sin(time * 0.5 + index * 1.7) * 0.3
        meshRef.current.position.x = position[0] + Math.cos(time * 0.3 + index * 2.1) * 0.2

        // Subtle pulse
        const pulseScale = scale + Math.sin(time * 1.5 + index * 3) * 0.05
        meshRef.current.scale.setScalar(pulseScale)

        if (glowRef.current) {
            glowRef.current.scale.setScalar(pulseScale * 2.5)
            glowRef.current.material.opacity = 0.1 + Math.sin(time * 2 + index) * 0.05
        }
    })

    return (
        <group>
            {/* Glow sphere */}
            <mesh ref={glowRef} position={position}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* Core sphere */}
            <mesh ref={meshRef} position={position}>
                <sphereGeometry args={[0.18, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    roughness={0.1}
                    metalness={0.9}
                />
            </mesh>
        </group>
    )
}

/* =========================================================
   CONNECTION LINES — Dynamic lines between nodes
   ========================================================= */
function ConnectionLines({ nodes }) {
    const linesRef = useRef()

    const connections = useMemo(() => {
        const conns = []
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(nodes[i].pos[0] - nodes[j].pos[0], 2) +
                    Math.pow(nodes[i].pos[1] - nodes[j].pos[1], 2) +
                    Math.pow(nodes[i].pos[2] - nodes[j].pos[2], 2)
                )
                if (dist < 5) {
                    conns.push({ from: nodes[i].pos, to: nodes[j].pos, dist })
                }
            }
        }
        return conns
    }, [nodes])

    useFrame((state) => {
        if (!linesRef.current) return
        linesRef.current.children.forEach((line, i) => {
            if (line.material) {
                const opacity = 0.08 + Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.04
                line.material.opacity = opacity
            }
        })
    })

    return (
        <group ref={linesRef}>
            {connections.map((conn, i) => {
                const points = [
                    new THREE.Vector3(...conn.from),
                    new THREE.Vector3(...conn.to)
                ]
                const geometry = new THREE.BufferGeometry().setFromPoints(points)

                return (
                    <line key={i} geometry={geometry}>
                        <lineBasicMaterial
                            color="#6c5ce7"
                            transparent
                            opacity={0.08}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </line>
                )
            })}
        </group>
    )
}

/* =========================================================
   NEBULA BACKGROUND — Volumetric glow clouds
   ========================================================= */
function NebulaCloud({ position, color, scale }) {
    const meshRef = useRef()

    useFrame((state) => {
        if (!meshRef.current) return
        const time = state.clock.elapsedTime
        meshRef.current.rotation.z = time * 0.02
        meshRef.current.scale.x = scale + Math.sin(time * 0.2) * 0.3
        meshRef.current.scale.y = scale + Math.cos(time * 0.3) * 0.2
    })

    return (
        <mesh ref={meshRef} position={position}>
            <planeGeometry args={[15, 15]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.04}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

/* =========================================================
   CAMERA RIG — Mouse-following camera
   ========================================================= */
function CameraRig({ mouseNormalized }) {
    useFrame((state) => {
        const targetX = mouseNormalized.x * 0.5
        const targetY = mouseNormalized.y * 0.3
        state.camera.position.x += (targetX - state.camera.position.x) * 0.02
        state.camera.position.y += (targetY - state.camera.position.y) * 0.02
        state.camera.lookAt(0, 0, 0)
    })

    return null
}

/* =========================================================
   MAIN SCENE — Assembled 3D Hero
   ========================================================= */
function HeroSceneContent({ mouseNormalized }) {
    const nodeColors = ['#6c5ce7', '#a78bfa', '#22d3ee', '#f472b6', '#34d399', '#c4b5fd']

    const nodes = useMemo(() => {
        const result = []
        for (let i = 0; i < 18; i++) {
            result.push({
                pos: [
                    (Math.random() - 0.5) * 12,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 6 - 2
                ],
                color: nodeColors[i % nodeColors.length],
                scale: Math.random() * 0.5 + 0.7
            })
        }
        return result
    }, [])

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 10, 10]} intensity={0.5} color="#6c5ce7" />
            <pointLight position={[-10, -5, 5]} intensity={0.3} color="#22d3ee" />
            <pointLight position={[0, 5, -10]} intensity={0.2} color="#f472b6" />

            {/* Camera */}
            <CameraRig mouseNormalized={mouseNormalized} />

            {/* Starfield */}
            <Stars
                radius={50}
                depth={50}
                count={3000}
                factor={3}
                saturation={0.3}
                fade
                speed={0.5}
            />

            {/* Particles */}
            <ParticleField count={250} />

            {/* Nebula clouds */}
            <NebulaCloud position={[-5, 3, -10]} color="#6c5ce7" scale={4} />
            <NebulaCloud position={[6, -2, -12]} color="#22d3ee" scale={3} />
            <NebulaCloud position={[0, -4, -8]} color="#f472b6" scale={3.5} />

            {/* Founder nodes */}
            {nodes.map((node, i) => (
                <FounderNode
                    key={i}
                    position={node.pos}
                    color={node.color}
                    scale={node.scale}
                    index={i}
                />
            ))}

            {/* Connection lines */}
            <ConnectionLines nodes={nodes} />
        </>
    )
}

/* =========================================================
   EXPORT — Canvas Wrapped Scene
   ========================================================= */
export default function HeroScene() {
    const { normalized } = useMousePosition()

    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            }}
            onCreated={({ gl, scene }) => {
                gl.setClearColor(0x000000, 0)
                scene.background = null
            }}
            style={{ background: 'transparent', pointerEvents: 'none' }}
        >
            <HeroSceneContent mouseNormalized={normalized} />
        </Canvas>
    )
}

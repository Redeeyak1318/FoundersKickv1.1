import { useState, useEffect, useCallback } from 'react'

export default function useMousePosition() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [normalized, setNormalized] = useState({ x: 0, y: 0 })

    const handleMouse = useCallback((e) => {
        setPosition({ x: e.clientX, y: e.clientY })
        setNormalized({
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        })
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouse)
        return () => window.removeEventListener('mousemove', handleMouse)
    }, [handleMouse])

    return { position, normalized }
}

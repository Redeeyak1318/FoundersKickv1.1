import { useState, useEffect } from 'react'

export default function useScrollProgress() {
    const [progress, setProgress] = useState(0)
    const [scrollY, setScrollY] = useState(0)
    const [direction, setDirection] = useState('down')

    useEffect(() => {
        let lastScrollY = 0

        const handleScroll = () => {
            const currentY = window.scrollY
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight
            const currentProgress = maxScroll > 0 ? currentY / maxScroll : 0

            setScrollY(currentY)
            setProgress(currentProgress)
            setDirection(currentY > lastScrollY ? 'down' : 'up')
            lastScrollY = currentY
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return { progress, scrollY, direction }
}

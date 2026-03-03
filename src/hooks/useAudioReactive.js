import { useEffect, useRef } from 'react'

/**
 * useAudioReactive
 * ────────────────
 * Connects to the microphone (getUserMedia) and extracts frequency bands.
 * Falls back gracefully to ambient sine-wave oscillation if audio isn't
 * available or is denied.
 *
 * Returns: { audioRef }
 *   audioRef.current = { bass: 0..1, mid: 0..1, high: 0..1, active: bool }
 */
export function useAudioReactive() {
    const audioRef = useRef({ bass: 0, mid: 0, high: 0, active: false })

    useEffect(() => {
        let audioCtx = null
        let analyser = null
        let source = null
        let stream = null
        let data = null
        let rafId = null
        let mounted = true

        /* ── Ambient fallback oscillation ── */
        const startFallback = () => {
            let t = 0
            const tick = () => {
                if (!mounted) return
                t += 0.016
                audioRef.current = {
                    bass: 0.12 + Math.sin(t * 0.7) * 0.08,
                    mid: 0.08 + Math.sin(t * 1.3) * 0.06,
                    high: 0.04 + Math.sin(t * 2.1) * 0.04,
                    active: false,
                }
                rafId = requestAnimationFrame(tick)
            }
            rafId = requestAnimationFrame(tick)
        }

        /* ── Live audio ── */
        const startLive = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                analyser = audioCtx.createAnalyser()
                analyser.fftSize = 256
                analyser.smoothingTimeConstant = 0.82
                source = audioCtx.createMediaStreamSource(stream)
                source.connect(analyser)
                data = new Uint8Array(analyser.frequencyBinCount)     // 128 bins

                const tick = () => {
                    if (!mounted) return
                    analyser.getByteFrequencyData(data)

                    /* Bin ranges (assuming ~44100Hz sample rate, 128 bins → ~172Hz/bin) */
                    /* Bass:  0–4   ≈ 0–688 Hz     */
                    /* Mid:   5–20  ≈ 688–3440 Hz  */
                    /* High:  21–60 ≈ 3440–10320Hz */
                    const avg = (lo, hi) => {
                        let s = 0
                        for (let i = lo; i <= hi; i++) s += data[i]
                        return s / ((hi - lo + 1) * 255)
                    }

                    audioRef.current = {
                        bass: avg(0, 4),
                        mid: avg(5, 20),
                        high: avg(21, 60),
                        active: true,
                    }
                    rafId = requestAnimationFrame(tick)
                }
                rafId = requestAnimationFrame(tick)
            } catch {
                startFallback()
            }
        }

        startLive()

        return () => {
            mounted = false
            cancelAnimationFrame(rafId)
            try {
                source?.disconnect()
                stream?.getTracks().forEach(t => t.stop())
                audioCtx?.close()
            } catch { }
        }
    }, [])

    return { audioRef }
}

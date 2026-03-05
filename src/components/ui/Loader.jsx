import { motion } from 'framer-motion'

export default function Loader() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#06060b',
            zIndex: 9999,
        }}>
            <div style={{ textAlign: 'center' }}>
                {/* Animated logo */}
                <motion.div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #F97316, #fb923c, #3B82F6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontWeight: 800,
                        fontSize: 24,
                        color: 'white',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 40px rgba(108, 92, 231, 0.4)',
                    }}
                    animate={{
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 0.95, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    FK
                </motion.div>

                {/* Loading dots */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: '#a78bfa',
                            }}
                            animate={{
                                y: [0, -10, 0],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

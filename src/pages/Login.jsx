import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'
import { blurFade } from '../utils/motion'

/* Simple particle background for auth pages */
function AuthParticles() {
    return (
        <div className="auth-bg">
            {/* Gradient nebula */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `
          radial-gradient(ellipse at 20% 50%, rgba(108, 92, 231, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 50%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(244, 114, 182, 0.06) 0%, transparent 40%)
        `,
            }} />

            {/* Floating particles */}
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 2 + Math.random() * 4,
                        height: 2 + Math.random() * 4,
                        borderRadius: '50%',
                        background: ['#6c5ce7', '#a78bfa', '#22d3ee', '#f472b6'][i % 4],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: 0.3,
                    }}
                    animate={{
                        y: [0, -30 + Math.random() * 60, 0],
                        x: [0, -20 + Math.random() * 40, 0],
                        opacity: [0.1, 0.5, 0.1],
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                    }}
                />
            ))}
        </div>
    )
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [focused, setFocused] = useState(null)
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        navigate('/dashboard')
    }

    return (
        <div className="auth-page">
            <AuthParticles />

            <motion.div
                className="auth-card"
                initial={blurFade.initial}
                animate={blurFade.animate}
            >
                {/* Logo */}
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem',
                        boxShadow: 'var(--shadow-glow)',
                    }}>FK</div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                        FoundersKick
                    </span>
                </Link>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to continue building the future</p>

                {/* Google Auth */}
                <motion.button
                    className="google-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </motion.button>

                <div className="auth-divider">or</div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <motion.div
                        className="input-group"
                        animate={focused === 'email' ? { scale: 1.01 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            className="input-field"
                            type="email"
                            placeholder="founder@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                        />
                    </motion.div>

                    <motion.div
                        className="input-group"
                        animate={focused === 'password' ? { scale: 1.01 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            className="input-field"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocused('password')}
                            onBlur={() => setFocused(null)}
                        />
                    </motion.div>

                    <div style={{
                        display: 'flex', justifyContent: 'flex-end',
                        marginBottom: '1.5rem', marginTop: '-0.5rem'
                    }}>
                        <a href="#" style={{
                            fontSize: '0.8rem', color: 'var(--color-accent-secondary)',
                            transition: 'color 0.2s',
                        }}>
                            Forgot password?
                        </a>
                    </div>

                    <MagneticButton
                        variant="primary"
                        type="submit"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Log In
                    </MagneticButton>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/signup">Sign up</Link>
                </div>
            </motion.div>
        </div>
    )
}

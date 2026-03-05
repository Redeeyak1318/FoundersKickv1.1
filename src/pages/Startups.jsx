import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'
import GlassCard from '../components/ui/GlassCard'

const mockStartups = [
    {
        id: 1, name: 'NexaAI', desc: 'Autonomous AI agents for enterprise workflow automation',
        stage: 'Scale', emoji: '🤖', color: '#F97316',
        founders: ['SC', 'MR'], tags: ['AI', 'Enterprise'],
    },
    {
        id: 2, name: 'GreenLoop', desc: 'Real-time carbon tracking and sustainability platform for businesses',
        stage: 'Growth', emoji: '🌱', color: '#34d399',
        founders: ['EZ', 'LP'], tags: ['CleanTech', 'SaaS'],
    },
    {
        id: 3, name: 'FlowStack', desc: 'Developer-first API infrastructure with built-in monitoring',
        stage: 'MVP', emoji: '⚡', color: '#3B82F6',
        founders: ['MR', 'JM'], tags: ['DevTools', 'API'],
    },
    {
        id: 4, name: 'DevForge', desc: 'AI-powered code review and pair programming assistant',
        stage: 'Idea', emoji: '🔨', color: '#fbbf24',
        founders: ['RP'], tags: ['AI', 'DevTools'],
    },
    {
        id: 5, name: 'HealthBridge', desc: 'Telemedicine platform connecting patients with specialists worldwide',
        stage: 'Growth', emoji: '🏥', color: '#f472b6',
        founders: ['PS', 'AW'], tags: ['HealthTech', 'Marketplace'],
    },
    {
        id: 6, name: 'CloudBase', desc: 'Serverless database platform with real-time sync',
        stage: 'MVP', emoji: '☁️', color: '#fb923c',
        founders: ['AW', 'TW'], tags: ['Infrastructure', 'Database'],
    },
]

const stages = ['All', 'Idea', 'MVP', 'Growth', 'Scale']

/* Launch Startup Modal */
function LaunchModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [sweepSweep, setSweepSweep] = useState(false);
    const [formData, setFormData] = useState({
        startupName: '', ownerName: '', founderName: '', coFounderName: '', stage: '',
        problem: '', solution: '', targetMarket: '', marketStrategy: '',
        skills: '', email: '', phone: '', website: '', social: ''
    });
    const [focusedField, setFocusedField] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            return formData.startupName && formData.ownerName && formData.founderName && formData.stage;
        }
        if (currentStep === 2) {
            return formData.problem && formData.solution;
        }
        if (currentStep === 3) {
            return formData.email;
        }
        return true;
    };

    const isValid = (field) => {
        const val = formData[field];
        if (!val) return false;
        if (field === 'email') return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
        return val.length > 1;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setSweepSweep(true);
            setTimeout(() => setSweepSweep(false), 500);
            setStep(s => s + 1);
        }
    };

    const handleSubmit = () => {
        if (validateStep(3)) {
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setTimeout(() => {
                    setStep(1);
                    setIsSuccess(false);
                    setFormData({
                        startupName: '', ownerName: '', founderName: '', coFounderName: '', stage: '',
                        problem: '', solution: '', targetMarket: '', marketStrategy: '',
                        skills: '', email: '', phone: '', website: '', social: ''
                    });
                }, 500);
            }, 3000);
        }
    };

    const renderInput = (label, field, type = 'text', required = false, isTextArea = false) => {
        const valid = isValid(field);
        const focused = focusedField === field;

        return (
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
                <label style={{
                    display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)',
                    marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label} {required && <span style={{ color: '#fb923c' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                    {isTextArea ? (
                        <textarea
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            onFocus={() => setFocusedField(field)}
                            onBlur={() => setFocusedField(null)}
                            rows={4}
                            style={{
                                width: '100%',
                                border: `1px solid ${focused ? '#fb923c' : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-display)',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box',
                                boxShadow: focused ? '0 0 15px rgba(249, 115, 22, 0.15)' : 'none',
                                resize: 'vertical'
                            }}
                        />
                    ) : (
                        <input
                            type={type}
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            onFocus={() => setFocusedField(field)}
                            onBlur={() => setFocusedField(null)}
                            style={{
                                width: '100%',
                                border: `1px solid ${focused ? '#fb923c' : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: '#fff',
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-display)',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease',
                                boxShadow: focused ? '0 0 15px rgba(249, 115, 22, 0.15)' : 'none'
                            }}
                        />
                    )}
                    <AnimatePresence>
                        {valid && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                style={{
                                    position: 'absolute', right: 16, top: isTextArea ? 24 : '50%',
                                    transform: isTextArea ? 'none' : 'translateY(-50%)',
                                    color: '#fb923c', fontSize: '1.2rem',
                                    pointerEvents: 'none'
                                }}
                            >
                                ✓
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    const getBgGradient = () => {
        if (step === 1) return 'radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.15) 0%, transparent 70%)';
        if (step === 2) return 'radial-gradient(circle at 100% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)';
        if (step === 3) return 'radial-gradient(circle at 0% 100%, rgba(249, 115, 22, 0.12) 0%, transparent 70%)';
        return 'none';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Cinematic Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isSuccess ? onClose : undefined}
                        style={{
                            position: 'fixed', inset: 0,
                            zIndex: 9999,
                        }}
                    />

                    {/* Premium Glass Card */}
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                            style={{
                                position: 'relative', pointerEvents: 'auto',
                                width: '90%', maxWidth: 640,
                                maxHeight: '90vh', overflowY: 'auto',
                                background: '#0A0A0C',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '24px',
                                padding: '3rem',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
                                fontFamily: 'var(--font-display)'
                            }}
                            className="hide-scrollbar"
                        >
                            {/* Decorative clip wrapper — clips blobs without locking scroll on the card */}
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                                {/* Dynamic Background Blob */}
                                <motion.div
                                    animate={{ background: getBgGradient() }}
                                    transition={{ duration: 1 }}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        mixBlendMode: 'screen'
                                    }}
                                />

                                {/* Sweep Animation Overlay */}
                                <AnimatePresence>
                                    {sweepSweep && (
                                        <motion.div
                                            initial={{ left: '-100%' }}
                                            animate={{ left: '200%' }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.5, ease: 'linear' }}
                                            style={{
                                                position: 'absolute', top: 0, bottom: 0, width: '100%',
                                                background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)',
                                                transform: 'skewX(-20deg)', zIndex: 9999
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem 0' }}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: [0, 1.2, 1] }}
                                        transition={{ duration: 1, times: [0, 0.8, 1] }}
                                        style={{
                                            width: 100, height: 100, borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #F97316, #fb923c)',
                                            margin: '0 auto 2rem', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '3rem', color: '#fff',
                                            boxShadow: '0 0 40px rgba(249, 115, 22, 0.4)'
                                        }}
                                    >
                                        🚀
                                    </motion.div>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #a0a0a0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Startup Launched
                                    </h2>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>Welcome to the next generation of building.</p>
                                </motion.div>
                            ) : (
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    {/* Progress Indicator */}
                                    <div style={{ display: 'flex', gap: 12, marginBottom: '3rem', justifyContent: 'center' }}>
                                        {[1, 2, 3].map(s => (
                                            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                                <motion.div
                                                    style={{
                                                        width: s === step ? 40 : 12, height: 4, borderRadius: 2,
                                                        background: s <= step ? '#fb923c' : 'rgba(255, 255, 255, 0.1)',
                                                        boxShadow: s === step ? '0 0 10px rgba(249, 115, 22, 0.4)' : 'none'
                                                    }}
                                                    animate={{
                                                        width: s === step ? 40 : 12,
                                                        background: s <= step ? '#fb923c' : 'rgba(255, 255, 255, 0.1)',
                                                    }}
                                                    transition={{ duration: 0.4, ease: "anticipate" }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        >
                                            {step === 1 && (
                                                <>
                                                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Startup Identity</h2>
                                                        <p style={{ color: 'var(--color-text-tertiary)' }}>Define the core of your new venture.</p>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Startup Name', 'startupName', 'text', true)}
                                                        </div>
                                                        {renderInput('Owner Name', 'ownerName', 'text', true)}
                                                        {renderInput('Founder Name', 'founderName', 'text', true)}
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Co-founder Name (Optional)', 'coFounderName')}
                                                        </div>
                                                        <div style={{ gridColumn: '1 / -1', marginBottom: '1.25rem' }}>
                                                            <label style={{
                                                                display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)',
                                                                marginBottom: '0.5rem', fontFamily: 'var(--font-display)', textTransform: 'uppercase',
                                                                letterSpacing: '0.05em'
                                                            }}>
                                                                Stage <span style={{ color: '#fb923c' }}>*</span>
                                                            </label>
                                                            <div style={{ position: 'relative' }}>
                                                                <select
                                                                    value={formData.stage}
                                                                    onChange={(e) => handleInputChange('stage', e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px',
                                                                        padding: '12px 16px', color: '#fff', fontSize: '0.9rem',
                                                                        fontFamily: 'var(--font-display)', outline: 'none', appearance: 'none',
                                                                        cursor: 'pointer',
                                                                        boxSizing: 'border-box'
                                                                    }}
                                                                >
                                                                    <option value="" disabled style={{ background: '#0A0A0C' }}>Select Stage</option>
                                                                    <option value="Idea" style={{ background: '#0A0A0C' }}>Idea</option>
                                                                    <option value="MVP" style={{ background: '#0A0A0C' }}>MVP</option>
                                                                    <option value="Growing" style={{ background: '#0A0A0C' }}>Growing</option>
                                                                    <option value="Funded" style={{ background: '#0A0A0C' }}>Funded</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {step === 2 && (
                                                <>
                                                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>The Vision</h2>
                                                        <p style={{ color: 'var(--color-text-tertiary)' }}>Articulate the problem and your masterful solution.</p>
                                                    </div>
                                                    {renderInput('Problem Statement', 'problem', 'text', true, true)}
                                                    {renderInput('Your Solution', 'solution', 'text', true, true)}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Target Market', 'targetMarket')}
                                                        </div>
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Market Strategy', 'marketStrategy')}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {step === 3 && (
                                                <>
                                                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                                                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Build With Us</h2>
                                                        <p style={{ color: 'var(--color-text-tertiary)' }}>How can the community engage and help?</p>
                                                    </div>
                                                    {renderInput('Skills Required', 'skills', 'text', false, true)}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Contact Email', 'email', 'email', true)}
                                                        </div>
                                                        {renderInput('Phone Number', 'phone', 'tel')}
                                                        {renderInput('Optional Website', 'website', 'url')}
                                                        <div style={{ gridColumn: '1 / -1' }}>
                                                            {renderInput('Social Links', 'social', 'text')}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                                        <button
                                            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
                                            style={{
                                                background: 'transparent', color: 'var(--color-text-secondary)',
                                                border: 'none', fontSize: '0.9rem', fontFamily: 'var(--font-display)',
                                                cursor: 'pointer', padding: '12px 24px', transition: 'color 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#fff'}
                                            onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary)'}
                                        >
                                            {step === 1 ? 'Cancel' : '← Back'}
                                        </button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={step === 3 ? handleSubmit : handleNext}
                                            style={{
                                                background: 'linear-gradient(90deg, #F97316, #fb923c)',
                                                color: '#fff', border: 'none', borderRadius: '12px',
                                                padding: '12px 32px', fontSize: '0.9rem', fontWeight: 600,
                                                fontFamily: 'var(--font-display)', cursor: 'pointer',
                                                boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)',
                                                opacity: validateStep(step) ? 1 : 0.5,
                                                pointerEvents: validateStep(step) ? 'auto' : 'none'
                                            }}
                                        >
                                            {step === 3 ? 'Launch Startup 🚀' : 'Continue →'}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default function Startups() {
    const [activeStage, setActiveStage] = useState('All')
    const [showModal, setShowModal] = useState(false)

    const filtered = mockStartups.filter(s =>
        activeStage === 'All' ? true : s.stage === activeStage
    )

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}
            >
                <div>
                    <h1 className="text-display" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        Startups
                    </h1>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                        Discover and launch innovative startups
                    </p>
                </div>
                <MagneticButton variant="primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.75rem', padding: '10px 24px' }}>
                    🚀 Launch Startup
                </MagneticButton>
            </motion.div>

            {/* Filter */}
            <motion.div
                className="tabs"
                style={{ marginBottom: '2rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {stages.map(stage => (
                    <button
                        key={stage}
                        className={`tab-btn ${activeStage === stage ? 'active' : ''}`}
                        onClick={() => setActiveStage(stage)}
                    >
                        {stage}
                    </button>
                ))}
            </motion.div>

            {/* Grid */}
            <motion.div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}
                layout
            >
                <AnimatePresence mode="popLayout">
                    {filtered.map((startup, i) => (
                        <motion.div
                            key={startup.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                            <GlassCard
                                className="startup-card"
                                style={{ padding: '1.5rem', height: '100%' }}
                                glowColor={startup.color}
                            >
                                <div className="startup-card-header">
                                    <div className="startup-card-icon" style={{
                                        background: `linear-gradient(135deg, ${startup.color}, ${startup.color}80)`,
                                        fontSize: '1.2rem',
                                    }}>
                                        {startup.emoji}
                                    </div>
                                    <span className={`startup-stage-badge badge-${startup.stage.toLowerCase()}`}>
                                        {startup.stage}
                                    </span>
                                </div>
                                <div className="startup-card-title">{startup.name}</div>
                                <div className="startup-card-desc">{startup.desc}</div>

                                {/* Tags */}
                                <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
                                    {startup.tags.map(tag => (
                                        <span key={tag} style={{
                                            padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                            fontSize: '0.65rem', color: 'var(--color-text-tertiary)',
                                            fontWeight: 500,
                                        }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="startup-card-footer">
                                    <div className="startup-card-founders">
                                        {startup.founders.map((f, fi) => (
                                            <div key={fi} className="startup-founder-avatar" style={{
                                                background: `linear-gradient(135deg, ${['#F97316', '#3B82F6', '#fb7185', '#34d399'][fi % 4]
                                                    }, ${['#fb923c', '#60a5fa', '#fb7185', '#6ee7b7'][fi % 4]
                                                    })`
                                            }}>
                                                {f}
                                            </div>
                                        ))}
                                    </div>
                                    <MagneticButton variant="secondary" style={{ padding: '6px 14px', fontSize: '0.65rem' }}>
                                        View
                                    </MagneticButton>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Launch Modal */}
            <LaunchModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    )
}

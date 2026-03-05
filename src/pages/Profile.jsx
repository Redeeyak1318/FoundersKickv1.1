import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MagneticButton from '../components/ui/MagneticButton'
import GlassCard from '../components/ui/GlassCard'

const TABS = ['About', 'Startups', 'Posts', 'Reposts', 'Collaborations']

const mockPosts = [
    {
        id: 1, type: 'post',
        content: 'Just shipped real-time collaborative editing for startup teams. The future of building together is finally here.',
        time: '2h ago', likes: 142, comments: 34, reposts: 18,
        tag: 'Product Update'
    },
    {
        id: 2, type: 'post',
        content: 'Pricing strategy for B2B SaaS is one of the most under-discussed topics in founder circles. Here is what I have learned after 3 years.',
        time: '1d ago', likes: 289, comments: 67, reposts: 44,
        tag: 'Insights'
    },
    {
        id: 3, type: 'post',
        content: 'We just crossed 1,000 daily active users. A thousand real humans choosing our product, every single day. Thank you.',
        time: '3d ago', likes: 512, comments: 98, reposts: 76,
        tag: 'Milestone'
    },
    {
        id: 4, type: 'post',
        content: 'The best code is the code you never had to write. Shipping fast does not mean quality debt - it means making purposeful tradeoffs.',
        time: '5d ago', likes: 94, comments: 22, reposts: 11,
        tag: 'Philosophy'
    },
]

const mockReposts = [
    {
        id: 1, originalAuthor: 'Arjun Mehta', handle: '@arjunbuilds',
        content: 'Distribution beats product every single time in the early days. Build in public. Ship relentlessly. Audience is a moat.',
        time: '4h ago', likes: 1200
    },
    {
        id: 2, originalAuthor: 'Priya Nair', handle: '@priyavc',
        content: 'Investors do not fund ideas. They fund momentum. Show traction - even if it is tiny - and the conversation changes completely.',
        time: '2d ago', likes: 876
    },
]

const mockStartups = [
    {
        id: 1, name: 'NexaFlow', emoji: '\u26A1',
        desc: 'AI-powered workflow automation for modern teams. Automate the boring, amplify the human.',
        stage: 'MVP', color: '#3B82F6', role: 'Founder & CEO', year: '2024',
        metrics: [{ label: 'DAU', value: '1.2k' }, { label: 'MRR', value: '$4.8k' }]
    },
    {
        id: 2, name: 'CodeBridge', emoji: '\uD83C\uDF09',
        desc: 'Bridging the gap between design and engineering - a dev toolchain built for modern product teams.',
        stage: 'Growth', color: '#34d399', role: 'Co-Founder', year: '2022',
        metrics: [{ label: 'Users', value: '8.4k' }, { label: 'Revenue', value: 'Acquired' }]
    },
]

const mockCollabs = [
    {
        id: 1, project: 'OpenFoundry', partner: 'Samantha Wei', handle: '@samwei',
        role: 'Technical Lead', desc: 'Open-source tooling for early-stage founder teams.',
        status: 'Active', color: '#fb923c'
    },
    {
        id: 2, project: 'Launchpad AI', partner: 'Raj Patel', handle: '@rajpatel',
        role: 'Product Advisor', desc: 'AI-accelerated go-to-market strategy platform.',
        status: 'Completed', color: '#f472b6'
    },
    {
        id: 3, project: 'EcoTrack', partner: 'Lena Park', handle: '@lenapark',
        role: 'System Architect', desc: 'Real-time carbon footprint analytics for SMBs.',
        status: 'Active', color: '#34d399'
    },
]

const skills = ['React', 'Node.js', 'AI/ML', 'SaaS', 'Product Design', 'Growth Hacking', 'System Architecture', 'Fundraising']

const socialLinks = [
    { icon: 'X', label: 'Twitter', href: '#' },
    { icon: 'in', label: 'LinkedIn', href: '#' },
    { icon: 'GH', label: 'GitHub', href: '#' },
    { icon: 'WEB', label: 'Website', href: '#' },
]

/* ── Stat Pill ── */
function StatPill({ value, label }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span style={{
                fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #fff, #a0a0b0)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>{value}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {label}
            </span>
        </div>
    )
}

/* ── Social Icon ── */
function SocialIcon({ icon, label, href }) {
    const [hov, setHov] = useState(false)
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.92 }}
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            style={{
                width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hov ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hov ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: hov ? '#fb923c' : 'var(--color-text-tertiary)',
                fontSize: '0.6rem', fontWeight: 700, fontFamily: 'var(--font-display)',
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: hov ? '0 0 14px rgba(249,115,22,0.25)' : 'none'
            }}
            title={label}
        >
            {icon}
        </motion.a>
    )
}

/* ── Post Card ── */
function PostCard({ post, index }) {
    const [liked, setLiked] = useState(false)
    const [reposted, setReposted] = useState(false)
    const tagColors = {
        'Product Update': '#fb923c', 'Insights': '#a78bfa',
        'Milestone': '#34d399', 'Philosophy': '#f472b6'
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            whileHover={{ y: -2 }}
            style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '1.5rem',
                cursor: 'default'
            }}
            onHoverStart={e => {
                if (e.currentTarget) {
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
                }
            }}
            onHoverEnd={e => {
                if (e.currentTarget) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.boxShadow = 'none'
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F97316, #fb923c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0
                }}>A</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Alex Johnson</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>@alexj &middot; {post.time}</div>
                </div>
                {post.tag && (
                    <span style={{
                        padding: '3px 10px', borderRadius: 999,
                        background: `${tagColors[post.tag]}18`,
                        border: `1px solid ${tagColors[post.tag]}40`,
                        fontSize: '0.62rem', color: tagColors[post.tag],
                        fontWeight: 600, letterSpacing: '0.04em'
                    }}>{post.tag}</span>
                )}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '1.25rem' }}>
                {post.content}
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                    { icon: liked ? '\u2764\uFE0F' : '\uD83E\uDD0D', count: post.likes + (liked ? 1 : 0), action: () => setLiked(l => !l), active: liked },
                    { icon: '\uD83D\uDCAC', count: post.comments, action: null, active: false },
                    { icon: '\u21A9\uFE0F', count: post.reposts + (reposted ? 1 : 0), action: () => setReposted(r => !r), active: reposted },
                ].map((btn, i) => (
                    <motion.button
                        key={i} whileTap={{ scale: 0.85 }}
                        onClick={btn.action}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'none', border: 'none', cursor: btn.action ? 'pointer' : 'default',
                            fontSize: '0.75rem', color: btn.active ? '#fb923c' : 'var(--color-text-tertiary)',
                            fontFamily: 'var(--font-display)', padding: 0,
                            transition: 'color 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '0.9rem' }}>{btn.icon}</span> {btn.count}
                    </motion.button>
                ))}
            </div>
        </motion.div>
    )
}

/* ── Repost Card ── */
function RepostCard({ post, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '1.25rem',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>&#8617; You reposted</span>
            </div>
            <div style={{
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F97316, #ea580c)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: '#fff'
                    }}>{post.originalAuthor[0]}</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{post.originalAuthor}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>{post.handle} &middot; {post.time}</div>
                    </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{post.content}</p>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.75rem' }}>
                    &#10084; {post.likes.toLocaleString()} likes
                </div>
            </div>
        </motion.div>
    )
}

/* ── Startup Card ── */
function StartupCard({ startup, index }) {
    const [hov, setHov] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            whileHover={{ y: -4 }}
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            style={{
                border: `1px solid ${hov ? startup.color + '50' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 20, padding: '1.5rem',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: hov ? `0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px ${startup.color}20` : 'none',
                cursor: 'pointer', position: 'relative', overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute', top: '-30%', right: '-10%',
                width: 160, height: 160, borderRadius: '50%',
                background: `radial-gradient(circle, ${startup.color}20 0%, transparent 70%)`,
                opacity: hov ? 1 : 0.3, transition: 'opacity 0.4s ease',
                pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `linear-gradient(135deg, ${startup.color}40, ${startup.color}20)`,
                    border: `1px solid ${startup.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    boxShadow: hov ? `0 0 20px ${startup.color}30` : 'none',
                    transition: 'box-shadow 0.3s ease'
                }}>{startup.emoji}</div>
                <span style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: '0.65rem', fontWeight: 600,
                    background: startup.stage === 'Growth' ? 'rgba(52,211,153,0.12)' : 'rgba(34,211,238,0.12)',
                    color: startup.stage === 'Growth' ? '#34d399' : '#3B82F6',
                    border: `1px solid ${startup.stage === 'Growth' ? '#34d39940' : '#3B82F640'}`,
                    letterSpacing: '0.04em'
                }}>{startup.stage}</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)' }}>{startup.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '1.25rem' }}>{startup.desc}</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.65rem', color: 'var(--color-text-tertiary)'
                }}>{startup.role}</span>
                <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.65rem', color: 'var(--color-text-tertiary)'
                }}>Since {startup.year}</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {startup.metrics.map(m => (
                    <div key={m.label}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: startup.color }}>{m.value}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

/* ── Collab Card ── */
function CollabCard({ collab, index }) {
    const statusColor = collab.status === 'Active' ? '#34d399' : '#a0a0a0'
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ x: 4 }}
            style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                cursor: 'default'
            }}
        >
            <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${collab.color}40, ${collab.color}15)`,
                border: `1px solid ${collab.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: collab.color,
                fontFamily: 'var(--font-display)'
            }}>
                {collab.project[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{collab.project}</span>
                    <span style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: '0.6rem',
                        background: `${statusColor}18`, color: statusColor,
                        border: `1px solid ${statusColor}40`, fontWeight: 600
                    }}>{collab.status}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>{collab.desc}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>
                    with <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>{collab.partner}</span>
                    {' '}&middot; {collab.role}
                </div>
            </div>
        </motion.div>
    )
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function Profile() {
    const [activeTab, setActiveTab] = useState('About')
    const [avatarHovered, setAvatarHovered] = useState(false)


    const tabContent = {
        About: (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                    style={{
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20, padding: '2rem'
                    }}
                >
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fb923c', marginBottom: '1rem', fontWeight: 600 }}>
                        About
                    </div>
                    <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.85, marginBottom: '1.5rem' }}>
                        Serial founder with a deep obsession for building developer tools and SaaS platforms that feel inevitable in hindsight.
                        Previously founded two startups - one acquired, one growing fast. I believe the best products are built at the intersection
                        of deep empathy and technical craft.
                    </p>
                    <p style={{ fontSize: '0.925rem', color: 'var(--color-text-secondary)', lineHeight: 1.85 }}>
                        Currently heads-down building NexaFlow. Always excited to connect with ambitious founders, engineers, and designers
                        who want to change how teams work.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.45 }}
                    style={{
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20, padding: '2rem'
                    }}
                >
                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fb923c', marginBottom: '1.25rem', fontWeight: 600 }}>
                        Expertise
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {skills.map((skill, i) => (
                            <motion.span
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ scale: 1.06, y: -1 }}
                                style={{
                                    padding: '6px 14px', borderRadius: 999,
                                    border: '1px solid rgba(249,115,22,0.18)',
                                    fontSize: '0.75rem', fontWeight: 500,
                                    color: 'rgba(249,115,22,0.9)', cursor: 'default'
                                }}
                            >{skill}</motion.span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}
                    style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 20, padding: '1.5rem', gap: '1rem'
                    }}
                >
                    {[
                        { label: 'Founded', value: '2021' },
                        { label: 'Exits', value: '1' },
                        { label: 'Raised', value: '$320k' },
                        { label: 'Based', value: 'India' },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, fontFamily: 'var(--font-display)' }}>{item.value}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        ),

        Startups: (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {mockStartups.map((s, i) => <StartupCard key={s.id} startup={s} index={i} />)}
            </div>
        ),

        Posts: (
            <div style={{ display: 'grid', gap: '1rem' }}>
                {mockPosts.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
            </div>
        ),

        Reposts: (
            <div style={{ display: 'grid', gap: '1rem' }}>
                {mockReposts.map((p, i) => <RepostCard key={p.id} post={p} index={i} />)}
            </div>
        ),

        Collaborations: (
            <div style={{ display: 'grid', gap: '1rem' }}>
                {mockCollabs.map((c, i) => <CollabCard key={c.id} collab={c} index={i} />)}
            </div>
        ),
    }

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '4rem' }}>

            {/* ── Hero Section ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', marginBottom: '5.5rem' }}
            >
                {/* Banner */}
                <div style={{
                    height: 200, borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(135deg, #060614 0%, #0d0d2b 30%, #050B1F 60%, #0A0A0C 100%)',
                    position: 'relative', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none'
                }}>
                    <motion.div animate={{ x: [0, 25, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', top: '-60%', right: '15%', background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 65%)' }} />
                    <motion.div animate={{ x: [0, -18, 0], y: [0, 14, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', bottom: '-50%', left: '8%', background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 65%)' }} />
                    <motion.div animate={{ x: [0, 10, 0], y: [0, -8, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', top: '20%', left: '40%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)' }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '40px 40px', opacity: 0.5
                    }} />
                    <div style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)' }} />
                </div>

                {/* Info Strip */}
                <div style={{
                    border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none',
                    borderRadius: '0 0 24px 24px',
                    padding: '1.75rem 2.5rem 2rem',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: '1.5rem', flexWrap: 'wrap'
                }}>
                    <div style={{ flex: 1, minWidth: 220, paddingLeft: '6.5rem' }}>
                        <h1 style={{
                            fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                            margin: '0 0 0.15rem',
                            background: 'linear-gradient(135deg, #fff 30%, #a0a0b0)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Alex Johnson</h1>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }}>
                            @alexj &middot; <span style={{ color: '#fb923c', fontWeight: 500 }}>Founder &amp; Builder</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginBottom: '1.1rem', maxWidth: 360, lineHeight: 1.6 }}>
                            Building tools that help founders move faster. Previously 2x founder (1 exit). Love shipping.
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            {socialLinks.map(s => <SocialIcon key={s.label} {...s} />)}
                            <div style={{ width: 1, height: 20, margin: '0 6px' }} />
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <StatPill value="847" label="Connections" />
                                <StatPill value="2" label="Startups" />
                                <StatPill value="4.8k" label="Posts" />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            style={{
                                padding: '9px 22px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600,
                                fontFamily: 'var(--font-display)', cursor: 'pointer',
                                background: 'linear-gradient(90deg, #F97316, #fb923c)',
                                border: 'none', color: '#fff',
                                boxShadow: '0 4px 16px rgba(249,115,22,0.3)'
                            }}
                        >
                            Edit Profile
                        </motion.button>
                    </div>
                </div>

                {/* Floating Avatar */}
                <motion.div
                    onHoverStart={() => setAvatarHovered(true)}
                    onHoverEnd={() => setAvatarHovered(false)}
                    whileHover={{ scale: 1.06 }}
                    style={{
                        position: 'absolute', left: '2.5rem', bottom: -28,
                        width: 88, height: 88, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F97316, #fb923c)',
                        border: '3px solid #0A0A0C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2rem', fontWeight: 800, color: '#fff',
                        fontFamily: 'var(--font-display)',
                        boxShadow: avatarHovered
                            ? '0 0 0 6px rgba(249,115,22,0.15), 0 0 40px rgba(249,115,22,0.3)'
                            : '0 0 0 3px rgba(249,115,22,0.08), 0 8px 24px rgba(0,0,0,0.5)',
                        transition: 'box-shadow 0.4s ease', cursor: 'pointer', zIndex: 10
                    }}
                >
                    A
                </motion.div>
            </motion.div>

            {/* ── Tab Navigation ── */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                    display: 'flex', gap: 4,
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    marginBottom: '2rem',
                }}
            >
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            position: 'relative', padding: '0.75rem 1.2rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.82rem', fontWeight: activeTab === tab ? 600 : 400,
                            fontFamily: 'var(--font-display)',
                            color: activeTab === tab ? '#fff' : 'var(--color-text-tertiary)',
                            transition: 'color 0.25s ease', whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                        <AnimatePresence>
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="profile-tab-line"
                                    style={{
                                        position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                                        background: 'linear-gradient(90deg, #F97316, #fb923c)',
                                        borderRadius: 1,
                                        boxShadow: '0 0 10px rgba(249,115,22,0.5)'
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                                />
                            )}
                        </AnimatePresence>
                    </button>
                ))}
            </motion.div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    {tabContent[activeTab]}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

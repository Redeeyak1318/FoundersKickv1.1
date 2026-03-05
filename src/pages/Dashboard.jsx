import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { staggerContainer, staggerItem } from '../utils/motion'
import MagneticButton from '../components/ui/MagneticButton'

/* ─────────────────────── Avatar Colours ─────────────────────── */
const AVATAR_GRADIENTS = [
    ['#F97316', '#fb923c'],
    ['#3B82F6', '#22D3EE'],
    ['#f472b6', '#fb7185'],
    ['#34d399', '#6ee7b7'],
    ['#f59e0b', '#fcd34d'],
    ['#3B82F6', '#60a5fa'],
]

/* ─────────────────────── Mock Data ─────────────────────── */
const INITIAL_POSTS = [
    {
        id: 1,
        author: 'Sarah Chen', initials: 'SC', role: 'CEO @ NexaAI', time: '2h',
        content: 'Just closed our seed round - $3.2M from top-tier VCs. None of this would have been possible without the connections I made here on FoundersKick. If you are looking for a co-founder or early advisors, this is the place.',
        likes: 142, comments: 38, reposts: 24, liked: false,
        tag: 'Milestone', colorIdx: 0,
    },
    {
        id: 2,
        author: 'Marcus Rivera', initials: 'MR', role: 'CTO @ FlowStack', time: '5h',
        content: 'Hot take: The best startups are not built by solo founders. They are built by complementary teams who trust each other deeply. Finding that trust is the hardest part - and it is exactly what this community helps with.',
        likes: 89, comments: 22, reposts: 15, liked: true,
        tag: 'Insights', colorIdx: 1,
    },
    {
        id: 3,
        author: 'Emily Zhang', initials: 'EZ', role: 'Founder @ GreenLoop', time: '8h',
        content: 'Shipped v2.0 of GreenLoop today! New features: real-time carbon tracking, team dashboards, and API integrations. Huge thanks to our beta testers from the FoundersKick community for the incredible feedback.',
        likes: 203, comments: 56, reposts: 41, liked: false,
        tag: 'Product', colorIdx: 2,
    },
    {
        id: 4,
        author: 'Raj Patel', initials: 'RP', role: 'Builder @ DevForge', time: '12h',
        content: 'Looking for a design-focused co-founder for an AI-powered prototyping tool. We have validated the idea with 50+ designers and have strong PMF signals. DM me if you are passionate about design tools and AI.',
        likes: 67, comments: 44, reposts: 12, liked: false,
        tag: 'Co-Founder', colorIdx: 3,
    },
    {
        id: 5,
        author: 'Priya Nair', initials: 'PN', role: 'Partner @ IndexVC', time: '1d',
        content: 'We just published our thesis on the next wave of B2B SaaS. The short version: companies that win will obsess over workflow depth, not feature breadth. The era of horizontal SaaS is giving way to vertical dominance.',
        likes: 318, comments: 77, reposts: 95, liked: false,
        tag: 'Fundraising', colorIdx: 4,
    },
    {
        id: 6,
        author: 'Leon Wu', initials: 'LW', role: 'Founder @ CloudBase', time: '2d',
        content: 'We went from 0 to 10,000 users in 90 days with zero paid marketing. The playbook: build in public, serve a niche obsessively, and let your users become your salesforce. Happy to share the full breakdown.',
        likes: 441, comments: 103, reposts: 128, liked: false,
        tag: 'Growth', colorIdx: 5,
    },
]

const EXTRA_POSTS = [
    {
        id: 7,
        author: 'Aisha Patel', initials: 'AP', role: 'ML Engineer @ Stealth', time: '3d',
        content: 'After 18 months of deep research in multimodal AI, I am finally ready to talk about what we have been building. Spoiler: it makes existing vision models look like calculators. Stay tuned.',
        likes: 612, comments: 89, reposts: 201, liked: false,
        tag: 'AI', colorIdx: 0,
    },
    {
        id: 8,
        author: 'Tom Wright', initials: 'TW', role: 'Product @ Figma Alum', time: '4d',
        content: 'Design systems are not about consistency. They are about speed of decision-making. When your team stops debating padding and starts debating product - that is when a design system is working.',
        likes: 234, comments: 61, reposts: 44, liked: false,
        tag: 'Design', colorIdx: 1,
    },
]

const TAG_COLORS = {
    Milestone: '#34d399', Insights: '#8B5CF6', Product: '#3B82F6',
    'Co-Founder': '#fb7185', Fundraising: '#f59e0b', Growth: '#3B82F6',
    AI: '#F97316', Design: '#fb7185'
}

/* ─────────────────────── Ripple Hook ─────────────────────── */
function useRipple() {
    const [ripples, setRipples] = useState([])
    const trigger = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const id = Date.now()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setRipples(r => [...r, { id, x, y }])
        setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600)
    }, [])
    return { ripples, trigger }
}

/* ─────────────────────── Dot Menu ─────────────────────── */
function DotMenu() {
    const [open, setOpen] = useState(false)
    const items = ['Save post', 'Hide post', 'Report', 'Copy link']
    return (
        <div style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(o => !o)}
                style={{
                    width: 32, height: 32, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--text-tertiary)', fontSize: '1rem',
                    transition: 'background 0.2s ease', letterSpacing: 2
                }}
            >
                &bull;&bull;&bull;
            </motion.button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                            background: 'rgba(15,15,25,0.95)', border: '1px solid var(--border-subtle)',
                            borderRadius: 12, padding: '0.4rem', zIndex: 50,
                            minWidth: 150, boxShadow: 'var(--shadow-xl)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {items.map(item => (
                            <button key={item} onClick={() => setOpen(false)} style={{
                                display: 'block', width: '100%', padding: '8px 14px',
                                background: 'none', border: 'none', borderRadius: 8,
                                color: 'var(--text-secondary)', fontSize: '0.8rem',
                                fontFamily: 'var(--font-display)', cursor: 'pointer',
                                textAlign: 'left', transition: 'background 0.15s ease'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >{item}</button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─────────────────────── Premium Post Card ─────────────────────── */
function PostCard({ post, index }) {
    const [liked, setLiked] = useState(post.liked)
    const [likes, setLikes] = useState(post.likes)
    const [reposts, setReposts] = useState(post.reposts)
    const [reposted, setReposted] = useState(false)
    const [commentOpen, setCommentOpen] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [bookmarked, setBookmarked] = useState(false)
    const [likeAnim, setLikeAnim] = useState(false)
    const [repostAnim, setRepostAnim] = useState(false)
    const [cardHovered, setCardHovered] = useState(false)
    const { ripples, trigger: triggerRipple } = useRipple()
    const [grad1, grad2] = AVATAR_GRADIENTS[post.colorIdx % AVATAR_GRADIENTS.length]
    const tagColor = TAG_COLORS[post.tag] || '#3B82F6'

    const handleLike = (e) => {
        triggerRipple(e)
        if (!liked) {
            setLikeAnim(true)
            setTimeout(() => setLikeAnim(false), 600)
        }
        setLiked(l => !l)
        setLikes(prev => liked ? prev - 1 : prev + 1)
    }

    const handleRepost = () => {
        if (!reposted) {
            setRepostAnim(true)
            setTimeout(() => setRepostAnim(false), 700)
        }
        setReposted(r => !r)
        setReposts(prev => reposted ? prev - 1 : prev + 1)
    }

    return (
        <motion.div
            variants={staggerItem}
            layout
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            onHoverStart={() => setCardHovered(true)}
            onHoverEnd={() => setCardHovered(false)}
            style={{
                marginBottom: '1.25rem',
                background: cardHovered
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${cardHovered ? 'rgba(99,102,241,0.2)' : 'var(--border-subtle)'}`,
                borderRadius: 20,
                padding: '1.5rem',
                boxShadow: cardHovered
                    ? '0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.06) inset'
                    : 'var(--shadow-md)',
                transition: 'all 0.35s var(--ease)',
                position: 'relative', overflow: 'hidden',
                transform: cardHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
        >
            {/* Ripple effects on like */}
            {ripples.map(r => (
                <motion.div key={r.id}
                    initial={{ opacity: 0.4, scale: 0, width: 80, height: 80 }}
                    animate={{ opacity: 0, scale: 3 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{
                        position: 'absolute', borderRadius: '50%',
                        left: r.x - 40, top: r.y - 40,
                        pointerEvents: 'none', zIndex: 0
                    }}
                />
            ))}

            {/* Card top accent line */}
            <motion.div
                animate={{ opacity: cardHovered ? 1 : 0, scaleX: cardHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
                    transformOrigin: 'center', pointerEvents: 'none'
                }}
            />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    style={{
                        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${grad1}, ${grad2})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                        cursor: 'pointer', boxShadow: `0 0 16px ${grad1}40`
                    }}
                >
                    {post.initials}
                </motion.div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{post.author}</span>
                        {post.tag && (
                            <span style={{
                                padding: '2px 9px', borderRadius: 999, fontSize: '0.6rem',
                                background: `${tagColor}18`, border: `1px solid ${tagColor}40`,
                                color: tagColor, fontWeight: 600, letterSpacing: '0.04em'
                            }}>{post.tag}</span>
                        )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {post.role} &middot; {post.time}
                    </div>
                </div>
                <DotMenu />
            </div>

            {/* Content */}
            <p style={{
                fontSize: '0.9rem', color: 'var(--text-secondary)',
                lineHeight: 1.82, marginBottom: '1.25rem',
                position: 'relative', zIndex: 1
            }}>
                {post.content}
            </p>

            {/* Engagement Row */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                position: 'relative', zIndex: 1
            }}>
                {/* Like */}
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleLike}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                        borderRadius: 10, background: liked ? 'rgba(251,113,133,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${liked ? 'rgba(251,113,133,0.3)' : 'var(--border-subtle)'}`,
                        color: liked ? '#fb7185' : 'var(--text-tertiary)',
                        fontSize: '0.78rem', fontWeight: liked ? 600 : 400,
                        fontFamily: 'var(--font-display)', cursor: 'pointer',
                        transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden'
                    }}
                >
                    <motion.span
                        animate={likeAnim ? { scale: [1, 1.6, 0.9, 1.1, 1], rotate: [-10, 10, -5, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        {liked ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        )}
                    </motion.span>
                    {likes}
                </motion.button>

                {/* Comment */}
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setCommentOpen(o => !o)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                        borderRadius: 10,
                        background: commentOpen ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${commentOpen ? 'rgba(99,102,241,0.25)' : 'var(--border-subtle)'}`,
                        color: commentOpen ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                        fontSize: '0.78rem', fontFamily: 'var(--font-display)', cursor: 'pointer',
                        transition: 'all 0.25s ease'
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {post.comments}
                </motion.button>

                {/* Repost */}
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleRepost}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
                        borderRadius: 10, position: 'relative', overflow: 'hidden',
                        background: reposted ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${reposted ? 'rgba(52,211,153,0.3)' : 'var(--border-subtle)'}`,
                        color: reposted ? '#34d399' : 'var(--text-tertiary)',
                        fontSize: '0.78rem', fontWeight: reposted ? 600 : 400,
                        fontFamily: 'var(--font-display)', cursor: 'pointer',
                        transition: 'all 0.25s ease'
                    }}
                >
                    <AnimatePresence>
                        {repostAnim && (
                            <motion.div
                                initial={{ left: '-100%' }}
                                animate={{ left: '150%' }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute', top: 0, bottom: 0, width: '60%',
                                    background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)',
                                    transform: 'skewX(-15deg)', pointerEvents: 'none'
                                }}
                            />
                        )}
                    </AnimatePresence>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    {reposts}
                </motion.button>

                <div style={{ flex: 1 }} />

                {/* Bookmark */}
                <motion.button
                    whileTap={{ scale: 0.82 }}
                    onClick={() => setBookmarked(b => !b)}
                    style={{
                        width: 34, height: 34, borderRadius: 10, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: bookmarked ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${bookmarked ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
                        color: bookmarked ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                        cursor: 'pointer', transition: 'all 0.25s ease'
                    }}
                >
                    <motion.span animate={bookmarked ? { y: [0, -3, 0] } : {}} transition={{ duration: 0.3 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </motion.span>
                </motion.button>

                {/* Share */}
                <motion.button
                    whileTap={{ scale: 0.82 }}
                    style={{
                        width: 34, height: 34, borderRadius: 10, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-tertiary)', background: 'transparent',
                        cursor: 'pointer', transition: 'all 0.25s ease'
                    }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </motion.button>
            </div>

            {/* Comment Expand */}
            <AnimatePresence>
                {commentOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ paddingTop: '1rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ marginBottom: '1rem', display: 'grid', gap: '0.75rem' }}>
                                {[
                                    { initials: 'AK', name: 'Alex Kim', text: 'This is incredible! Congrats on the momentum.', grad: AVATAR_GRADIENTS[1] },
                                    { initials: 'LP', name: 'Lena Park', text: 'Would love to connect and learn more about your journey!', grad: AVATAR_GRADIENTS[2] },
                                ].map((c, i) => (
                                    <motion.div key={i}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                                    >
                                        <div style={{
                                            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                            background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.6rem', fontWeight: 700, color: '#fff'
                                        }}>{c.initials}</div>
                                        <div style={{
                                            flex: 1,
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: 12, padding: '8px 12px'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 3, color: 'var(--text-primary)' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--gradient-accent)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.65rem', fontWeight: 700, color: '#fff'
                                }}>A</div>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        autoFocus
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                        style={{
                                            width: '100%',
                                            border: '1px solid rgba(99,102,241,0.2)',
                                            borderRadius: 12, padding: '9px 44px 9px 14px',
                                            color: 'var(--text-primary)', fontSize: '0.82rem',
                                            fontFamily: 'var(--font-display)', outline: 'none',
                                            boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)',
                                            boxShadow: '0 0 12px rgba(99,102,241,0.1)'
                                        }}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => { if (commentText.trim()) setCommentText('') }}
                                        style={{
                                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                            background: commentText.trim() ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.06)',
                                            border: 'none', borderRadius: 8, width: 28, height: 28,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/* ─────────────────────── Composer ─────────────────────── */
function PostComposer({ onPost }) {
    const [text, setText] = useState('')
    const [focused, setFocused] = useState(false)

    const handlePost = () => {
        if (text.trim()) {
            onPost(text)
            setText('')
            setFocused(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
                marginBottom: '1.5rem',
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${focused ? 'rgba(99,102,241,0.25)' : 'var(--border-subtle)'}`,
                borderRadius: 20, padding: '1.25rem',
                boxShadow: focused ? '0 0 32px rgba(99,102,241,0.08)' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--gradient-accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: '#fff'
                }}>A</div>
                <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => !text && setFocused(false)}
                    placeholder="Share an update, idea, or milestone..."
                    rows={focused || text ? 3 : 1}
                    style={{
                        flex: 1, background: 'transparent', border: 'none',
                        color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-display)',
                        outline: 'none', resize: 'none', lineHeight: 1.7,
                        transition: 'all 0.3s ease', paddingTop: '0.15rem'
                    }}
                />
            </div>
            <AnimatePresence>
                {(focused || text) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {[
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>, tip: 'Image' },
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>, tip: 'Video' },
                                    { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>, tip: 'Link' },
                                ].map((btn, i) => (
                                    <motion.button key={i} whileHover={{ scale: 1.1, color: 'var(--accent-primary)' }} whileTap={{ scale: 0.9 }} title={btn.tip}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', padding: 6, borderRadius: 8, transition: 'color 0.2s ease' }}>
                                        {btn.icon}
                                    </motion.button>
                                ))}
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handlePost}
                                style={{
                                    padding: '8px 22px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600,
                                    fontFamily: 'var(--font-display)', cursor: 'pointer',
                                    background: text.trim() ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.06)',
                                    border: 'none', color: text.trim() ? '#fff' : 'var(--text-tertiary)',
                                    boxShadow: text.trim() ? '0 4px 16px rgba(99,102,241,0.25)' : 'none',
                                    transition: 'all 0.25s ease'
                                }}
                            >
                                Post
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

/* ─────────────────────── Trending Widget ─────────────────────── */
function TrendingWidget() {
    const topics = [
        { tag: 'AI-Agents', count: '2.4k', trend: '+12%' },
        { tag: 'SaaS-Growth', count: '1.8k', trend: '+8%' },
        { tag: 'Seed-Round', count: '1.2k', trend: '+5%' },
        { tag: 'DevTools', count: '890', trend: '+3%' },
        { tag: 'Climate-Tech', count: '650', trend: '+19%' },
    ]
    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20, padding: '1.5rem', marginBottom: '1.25rem'
        }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', marginBottom: '1.1rem', fontWeight: 600 }}>
                Trending Now
            </div>
            {topics.map((t, i) => (
                <motion.div key={t.tag} whileHover={{ x: 4 }} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 0',
                    borderBottom: i < topics.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer'
                }}>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>#{t.tag}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{t.count} posts</div>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600, padding: '2px 7px', borderRadius: 999 }}>{t.trend}</span>
                </motion.div>
            ))}
        </div>
    )
}

/* ─────────────────────── Suggested Founders ─────────────────────── */
function SuggestedFounders() {
    const founders = [
        { name: 'Aisha Patel', role: 'ML Engineer', initials: 'AP', colorIdx: 0 },
        { name: 'Tom Wright', role: 'Product Designer', initials: 'TW', colorIdx: 1 },
        { name: 'Luna Kim', role: 'Growth Lead', initials: 'LK', colorIdx: 2 },
    ]
    const [states, setStates] = useState(() => Object.fromEntries(founders.map((_, i) => [i, 'idle'])))
    return (
        <div style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20, padding: '1.5rem'
        }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)', marginBottom: '1.1rem', fontWeight: 600 }}>
                Suggested for You
            </div>
            {founders.map((f, i) => {
                const [g1, g2] = AVATAR_GRADIENTS[f.colorIdx]
                const connState = states[i] || 'idle'
                const advance = () => {
                    setStates(s => ({
                        ...s,
                        [i]: s[i] === 'idle' ? 'requested' : s[i] === 'requested' ? 'connected' : 'connected'
                    }))
                }
                return (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 0',
                        borderBottom: i < founders.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${g1}, ${g2})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                            boxShadow: `0 0 10px ${g1}40`
                        }}>{f.initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{f.name}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{f.role}</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {connState === 'idle' && (
                                <motion.button key="idle"
                                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                                    whileHover={{ scale: 1.06, boxShadow: `0 0 16px ${g1}50` }}
                                    whileTap={{ scale: 0.92 }}
                                    onClick={advance}
                                    style={{
                                        padding: '5px 12px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 600,
                                        fontFamily: 'var(--font-display)', cursor: 'pointer', flexShrink: 0,
                                        border: '1px solid rgba(99,102,241,0.3)',
                                        color: 'var(--accent-primary)', background: 'transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                >+ Connect</motion.button>
                            )}
                            {connState === 'requested' && (
                                <motion.div key="requested"
                                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '5px 10px', borderRadius: 8,
                                        border: '1px solid var(--border-subtle)',
                                        fontSize: '0.65rem', color: 'var(--text-tertiary)',
                                        fontFamily: 'var(--font-display)', flexShrink: 0, cursor: 'default'
                                    }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.8, repeat: Infinity }}
                                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px rgba(251,191,36,0.6)', flexShrink: 0 }}
                                    />
                                    Sent
                                </motion.div>
                            )}
                            {connState === 'connected' && (
                                <motion.div key="connected"
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '5px 10px', borderRadius: 8,
                                        border: '1px solid rgba(52,211,153,0.3)',
                                        fontSize: '0.65rem', color: '#34d399', fontWeight: 600,
                                        fontFamily: 'var(--font-display)', flexShrink: 0, cursor: 'default'
                                    }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Connected
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            })}
        </div>
    )
}

/* ─────────────────────── Load More Divider ─────────────────────── */
function LoadMoreButton({ onClick, loading }) {
    return (
        <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}
                whileTap={{ scale: 0.96 }}
                onClick={onClick}
                style={{
                    padding: '8px 20px', borderRadius: 10, fontSize: '0.78rem',
                    fontFamily: 'var(--font-display)', cursor: 'pointer',
                    border: '1px solid rgba(99,102,241,0.2)', background: 'transparent',
                    color: 'var(--accent-primary)', fontWeight: 500, transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'center', gap: 8
                }}
            >
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 12, height: 12, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}
                    />
                ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                )}
                {loading ? 'Loading...' : 'Load more posts'}
            </motion.button>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </motion.div>
    )
}

/* ─────────────────────── Main Dashboard ─────────────────────── */
export default function Dashboard() {
    const [posts, setPosts] = useState(INITIAL_POSTS)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const { scrollY } = useScroll()
    const yParallax = useTransform(scrollY, [0, 1000], [0, -40])

    const handleLoadMore = () => {
        setLoadingMore(true)
        setTimeout(() => {
            setPosts(p => [...p, ...EXTRA_POSTS.map(ep => ({ ...ep, id: ep.id + Date.now() }))])
            setLoadingMore(false)
            setHasMore(false)
        }, 1200)
    }

    const handleNewPost = (text) => {
        const newPost = {
            id: Date.now(),
            author: 'Alex Johnson', initials: 'AJ', role: 'Founder @ NexaFlow', time: 'Just now',
            content: text, likes: 0, comments: 0, reposts: 0, liked: false,
            tag: 'Update', colorIdx: 1
        }
        setPosts(p => [newPost, ...p])
    }

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ marginBottom: '1.75rem' }}
            >
                <h1 style={{
                    fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                    marginBottom: '0.25rem', color: 'var(--text-primary)',
                    background: 'var(--gradient-text)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                    Home Feed
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    Latest from your network
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start' }}>
                {/* ── Main Feed ── */}
                <div>
                    <PostComposer onPost={handleNewPost} />

                    <AnimatePresence>
                        {posts.map((post, i) => (
                            <PostCard key={post.id} post={post} index={i} />
                        ))}
                    </AnimatePresence>

                    {hasMore && (
                        <LoadMoreButton onClick={handleLoadMore} loading={loadingMore} />
                    )}

                    {!hasMore && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}
                        >
                            You are all caught up &mdash; check back later for more posts.
                        </motion.div>
                    )}
                </div>

                {/* ── Sidebar ── */}
                <motion.div style={{ position: 'sticky', top: 'calc(var(--navbar-height, 72px) + 2rem)', y: yParallax }}>
                    <TrendingWidget />
                    <SuggestedFounders />
                </motion.div>
            </div>
        </div>
    )
}

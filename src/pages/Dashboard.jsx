import {
    Search, Bell, Image as ImageIcon, BarChart2, Link2, BadgeCheck,
    MoreHorizontal, TrendingUp, Heart, MessageSquare, Share2, Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {

    const navigate = useNavigate()

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getSession()

            if (!data.session) {
                navigate("/login")
            }
        }

        checkUser()
    }, [navigate])

    const [user, setUser] = useState(null)

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }

        getUser()
    }, [])

    const [posts, setPosts] = useState([])
    const [trending, setTrending] = useState([])
    const [connections, setConnections] = useState([])
    const [status, setStatus] = useState(null)
    const feedRef = useRef(null)
    const widgetRef = useRef(null)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) return

                const res = await fetch(
                    "https://founderskickv11-production.up.railway.app/dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`
                        }
                    }
                )

                const data = await res.json()

                setPosts(data.posts)
                setTrending(data.trending)
                setConnections(data.connections)
                setStatus(data.status)

            } catch (err) {
                console.error("dashboard error:", err)
            }
        }

        loadDashboard()
    }, [])

    useEffect(() => {
        if (feedRef.current) {
            gsap.fromTo(feedRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            )
        }

        if (widgetRef.current) {
            gsap.fromTo(widgetRef.current.children,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.4 }
            )
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }



    return (
        <section className="flex-1 flex flex-col xl:flex-row relative h-full">
            {/* Central Feed Section */}
            <div className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-8 w-full" ref={feedRef}>

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Morning, {user?.email?.split('@')[0] || "Founder"}</h1>
                        <p className="text-gray-500 text-sm mt-1">Here's what happened in the ecosystem overnight.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <Search className="text-gray-400 w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 relative">
                            <Bell className="text-gray-400 w-5 h-5" />
                            <span className="absolute top-2.5 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0E1116]" />
                        </button>
                    </div>
                </header>

                <button onClick={handleLogout}>
                    Logout
                </button>

                {/* Post Composer */}
                <div className="glass-panel rounded-2xl p-5 mb-8 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all">
                    <div className="flex gap-4">
                        <img
                            src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
                            alt="User"
                            className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white/10"
                        />
                        <div className="flex-1">
                            <textarea
                                className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-600 resize-none h-20 text-white outline-none"
                                placeholder="Share a milestone or insight..."
                            ></textarea>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="hover:text-rose-500 transition-colors"><ImageIcon className="w-5 h-5" /></button>
                                    <button className="hover:text-rose-500 transition-colors"><BarChart2 className="w-5 h-5" /></button>
                                    <button className="hover:text-rose-500 transition-colors"><Link2 className="w-5 h-5" /></button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="accent-gradient px-6 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                                >
                                    Post Update
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Cards */}
                <div className="space-y-6">
                    {posts.map(post => (
                        <article key={post.id} className="glass-panel rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <img src={post.author.avatar} alt={post.author.name} className="w-11 h-11 rounded-xl object-cover bg-white/10" />
                                    <div>
                                        <h3 className="font-bold flex items-center gap-2 text-white">
                                            {post.author.name}
                                            {!post.isCompanyPost && <BadgeCheck className="text-rose-500 w-4 h-4" />}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {post.author.role} @ {post.author.company} • {post.timestamp}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-gray-600 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-[15px] leading-relaxed mb-4 text-gray-300 whitespace-pre-wrap">
                                {post.content}
                            </p>

                            {post.image && (
                                <img src={post.image} className="w-full h-[250px] object-cover rounded-xl mt-4 mb-4 border border-white/5" />
                            )}

                            {post.metrics && (
                                <div className="bg-[#111418] rounded-xl p-4 border border-white/5 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <TrendingUp className="text-green-500 w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{post.metrics.label}</p>
                                            <p className="text-lg font-bold text-white">{post.metrics.value} <span className="text-xs text-gray-500 font-normal ml-1">{post.metrics.sub}</span></p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-24 bg-white/5 rounded flex items-end gap-1 p-1 px-2">
                                        {[20, 40, 60, 80, 100].map((h, i) => (
                                            <div key={i} className={`w-2 h-${Math.ceil((h / 100) * 7)} bg-rose-500/${h} rounded-sm`}
                                                style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-6 text-gray-500 pt-4 border-t border-white/5">
                                <button className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
                                    <Heart className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
                                    <MessageSquare className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
                                    <Share2 className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">{post.shares}</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Right Sidebar: Widgets */}
            <aside className="w-full xl:w-[360px] px-4 md:px-8 xl:pr-8 py-8 space-y-8 border-l border-white/5 bg-[#0E1116]" ref={widgetRef}>

                {/* Quick Insight Card (Glassmorphism + soft glow) */}
                <div className="glass-panel overflow-hidden relative rounded-3xl p-6 shadow-xl">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">My Ecosystem Health</h4>
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 font-medium">Network Value</span>
                            <span className="text-sm font-bold text-white">{status?.networkValue}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden shrink-0">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${status?.progress}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="bg-rose-500 h-full rounded-full"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 font-medium">Referral Rank</span>
                            <span className="text-sm font-bold text-white">{status?.rank}</span>
                        </div>
                    </div>
                </div>

                {/* Trending Topics */}
                <div className="glass-panel rounded-3xl p-6">
                    <h4 className="text-sm font-bold mb-5 flex items-center justify-between text-white">
                        Trending Now
                        <Sparkles className="text-rose-500 w-4 h-4" />
                    </h4>
                    <div className="space-y-5">
                        {trending.map(topic => (
                            <a href="#" key={topic.id} className="block group">
                                <p className="text-xs text-rose-500/70 font-bold mb-1 tracking-wide">{topic.tag}</p>
                                <h5 className="text-sm font-semibold text-gray-300 group-hover:text-rose-500 transition-colors leading-tight">{topic.title}</h5>
                                <p className="text-[10px] text-gray-600 mt-1.5 font-medium">{topic.count} Founders discussing</p>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Suggested Founders */}
                <div className="glass-panel rounded-3xl p-6">
                    <h4 className="text-sm font-bold mb-5 text-white">Founders to Connect</h4>
                    <div className="space-y-4">
                        {connections.map(conn => (
                            <div key={conn.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <img src={conn.user.avatar} alt={conn.user.name} className="w-9 h-9 rounded-lg bg-white/10" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{conn.user.name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{conn.industry}</p>
                                    </div>
                                </div>
                                <button className="px-3 py-1.5 bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 rounded-lg text-xs font-bold transition-all border border-white/5 text-gray-400">
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">Ecosystem Operational</span>
                </div>

            </aside>
        </section>
    )
}

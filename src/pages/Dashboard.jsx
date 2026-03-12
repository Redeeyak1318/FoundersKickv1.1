import {
    Search, Bell, Image as ImageIcon, BarChart2, Link2, Heart, MessageSquare,
    Trash2, Loader2
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
    const [posts, setPosts] = useState([])
    const [connections, setConnections] = useState([])
    const [loading, setLoading] = useState(true)
    const [postContent, setPostContent] = useState('')
    const [posting, setPosting] = useState(false)

    const feedRef = useRef(null)
    const widgetRef = useRef(null)

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser()
            setUser(data.user)
        }

        getUser()
    }, [])

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                // ✅ POSTS WITH AUTHOR + COUNTS
                const { data: postsData } = await supabase
                    .from("posts")
                    .select(`
          *,
          profiles(full_name, avatar_url),
          post_likes(count),
          post_comments(count)
        `)
                    .order("created_at", { ascending: false })

                setPosts(postsData || [])

                // ✅ CONNECTION SUGGESTIONS (REAL)
                const { data: connData } = await supabase
                    .from("profiles")
                    .select("*")
                    .neq("id", session.user.id)
                    .limit(5)

                setConnections(connData || [])

            } catch (err) {
                console.error("dashboard error:", err)
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel("posts-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "posts" },
                async (payload) => {

                    if (payload.eventType === "INSERT") {

                        const { data } = await supabase
                            .from("posts")
                            .select(`
              *,
              profiles(full_name, avatar_url),
              post_likes(count),
              post_comments(count)
            `)
                            .eq("id", payload.new.id)
                            .single()

                        setPosts(prev => {
                            const exists = prev.some(p => p.id === data.id)
                            if (exists) return prev
                            return [data, ...prev]
                        })
                    }

                    if (payload.eventType === "DELETE") {
                        setPosts(prev => prev.filter(p => p.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
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
    }, [loading])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const handleCreatePost = async () => {
        if (!postContent.trim() || posting || !user) return
        setPosting(true)

        try {
            const { data, error } = await supabase
                .from("posts")
                .insert([{ content: postContent, user_id: user.id }])
                .select()
                .single()

            if (!error) {

                const { data: fullPost } = await supabase
                    .from("posts")
                    .select(`
          *,
          profiles(full_name, avatar_url),
          post_likes(count),
          post_comments(count)
        `)
                    .eq("id", data.id)
                    .single()

                setPosts(prev => [fullPost, ...prev])
                setPostContent('')
            }

        } catch (err) {
            console.error("create post error:", err)
        } finally {
            setPosting(false)
        }
    }

    const handleLike = async (postId) => {

        const { data: existing } = await supabase
            .from("post_likes")
            .select("*")
            .eq("post_id", postId)
            .eq("user_id", user.id)
            .single()

        if (existing) return

        const { error } = await supabase
            .from("post_likes")
            .insert([{ post_id: postId, user_id: user.id }])

        if (!error) {
            setPosts(prev =>
                prev.map(p =>
                    p.id === postId
                        ? {
                            ...p,
                            post_likes: [{ count: (p.post_likes?.[0]?.count || 0) + 1 }]
                        }
                        : p
                )
            )
        }
    }


    const handleDelete = async (postId) => {
        await supabase.from("posts").delete().eq("id", postId)
        setPosts(prev => prev.filter(p => p.id !== postId))
    }

    return (
        <section className="flex-1 flex flex-col xl:flex-row relative h-full">
            {/* Central Feed Section */}
            <div className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-8 w-full" ref={feedRef}>

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Morning, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Founder"}</h1>
                        <p className="text-gray-500 text-sm mt-1">Here's what happened in the ecosystem overnight.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <Search className="text-gray-400 w-5 h-5" />
                        </button>
                        <button onClick={() => navigate('/notifications')} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 relative">
                            <Bell className="text-gray-400 w-5 h-5" />
                        </button>
                    </div>
                </header>

                <button onClick={handleLogout} className="text-gray-500 text-sm hover:text-white transition-colors mb-4">
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
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
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
                                    onClick={handleCreatePost}
                                    disabled={posting || !postContent.trim()}
                                    className="accent-gradient px-6 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Update'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Cards */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="glass-panel rounded-2xl p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-300 mb-2">No posts yet</h3>
                            <p className="text-sm text-gray-500">Be the first to share an update with the ecosystem.</p>
                        </div>
                    ) : posts.map(post => (
                        <article key={post.id} className="glass-panel rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <img
                                        src={post.profiles?.avatar_url || "/default-avatar.png"}
                                        className="w-11 h-11 rounded-xl object-cover bg-white/10"
                                    />

                                    <div>
                                        <h3 className="font-bold text-white">
                                            {post.profiles?.full_name || "Founder"}
                                        </h3>

                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(post.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {post.user_id === user?.id && (
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-gray-600 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-[15px] leading-relaxed mb-4 text-gray-300 whitespace-pre-wrap">
                                {post.content}
                            </p>

                            {post.image && (
                                <img src={post.image} className="w-full h-[250px] object-cover rounded-xl mt-4 mb-4 border border-white/5" />
                            )}


                            <div className="flex items-center gap-6 text-gray-500 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-2 hover:text-rose-500 transition-colors group"
                                >
                                    <Heart className="w-[18px] h-[18px]" />
                                    <span className="text-sm font-medium">
                                        {post.post_likes?.[0]?.count || 0}
                                    </span>
                                </button>

                                <button className="flex items-center gap-2 opacity-70 cursor-default">
                                    <MessageSquare className="w-[18px] h-[18px]" />
                                    <span className="text-sm font-medium">
                                        {post.post_comments?.[0]?.count || 0}
                                    </span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Right Sidebar: Widgets */}
            <aside className="w-full xl:w-[360px] px-4 md:px-8 xl:pr-8 py-8 space-y-8 border-l border-white/5 bg-[#0E1116]" ref={widgetRef}>

                {/* Suggested Founders */}
                <div className="glass-panel rounded-3xl p-6">
                    <h4 className="text-sm font-bold mb-5 text-white">Founders to Connect</h4>
                    {connections.length === 0 ? (
                        <p className="text-sm text-gray-500">No connection suggestions yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {connections.map(conn => (
                                <div key={conn.id} className="flex items-center gap-3">
                                    <img
                                        src={conn.avatar_url || "/default-avatar.png"}
                                        className="w-9 h-9 rounded-lg"
                                    />
                                    <p className="text-sm text-gray-200">{conn.full_name}</p>
                                </div>
                            ))}
                        </div>
                    )}
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

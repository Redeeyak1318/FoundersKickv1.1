import {
    Search, Bell, Image as ImageIcon, BarChart2, Link2, Heart, MessageSquare,
    Trash2, Loader2, Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
    getPosts, createPost, deletePost, toggleLike,
    getComments, createComment, getNetworkSuggestions
} from '../services/api'

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, profile } = useAuth()

    const [posts, setPosts] = useState([])
    const [connections, setConnections] = useState([])
    const [loading, setLoading] = useState(true)
    const [postContent, setPostContent] = useState('')
    const [posting, setPosting] = useState(false)
    const [activeComments, setActiveComments] = useState(null)
    const [comments, setComments] = useState({})
    const [commentText, setCommentText] = useState('')
    const [commenting, setCommenting] = useState(false)
    const [likedPosts, setLikedPosts] = useState(new Set())

    const feedRef = useRef(null)
    const widgetRef = useRef(null)

    // Load dashboard data
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const postsData = await getPosts()
                setPosts(postsData || [])

                // Check which posts the current user has liked
                if (user) {
                    const { data: userLikes } = await supabase
                        .from('post_likes')
                        .select('post_id')
                        .eq('user_id', user.id)
                    setLikedPosts(new Set((userLikes || []).map(l => l.post_id)))
                }

                // Connection suggestions
                try {
                    const connData = await getNetworkSuggestions()
                    setConnections((connData || []).slice(0, 5))
                } catch (_) { }

            } catch (err) {
                console.error("dashboard error:", err)
            } finally {
                setLoading(false)
            }
        }

        loadDashboard()
    }, [user])

    // Realtime subscriptions
    useEffect(() => {
        const channel = supabase
            .channel("dashboard-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, async (payload) => {
                if (payload.eventType === "INSERT") {
                    const { data } = await supabase
                        .from("posts")
                        .select(`
                            id, content, image, created_at, user_id,
                            profiles!posts_user_id_fkey(id, name, avatar_url),
                            post_likes(count),
                            post_comments(count)
                        `)
                        .eq("id", payload.new.id)
                        .maybeSingle()

                    if (!data) return
                    setPosts(prev => {
                        if (prev.some(p => p?.id === data.id)) return prev
                        return [data, ...prev]
                    })
                }
                if (payload.eventType === "DELETE") {
                    setPosts(prev => prev.filter(p => p.id !== payload.old.id))
                }
            })
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "post_comments" }, async (payload) => {
                const postId = payload.new.post_id

                const { data: fullComment } = await supabase
                    .from("post_comments")
                    .select(`id, text, created_at, user_id, profiles!post_comments_user_id_fkey(name, avatar_url)`)
                    .eq("id", payload.new.id)
                    .maybeSingle()

                if (fullComment) {
                    setComments(prev => {
                        const existing = prev[postId] || []
                        if (existing.some(c => c.id === fullComment.id)) return prev
                        return { ...prev, [postId]: [...existing, fullComment].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }
                    })
                    setPosts(prev => prev.map(p => p.id === postId ? { ...p, post_comments: [{ count: (p.post_comments?.[0]?.count || 0) + 1 }] } : p))
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    // GSAP animations
    useEffect(() => {
        if (feedRef.current && !loading) {
            gsap.fromTo(feedRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            )
        }
        if (widgetRef.current && !loading) {
            gsap.fromTo(widgetRef.current.children,
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.4 }
            )
        }
    }, [loading])

    const handleCreatePost = async () => {
        if (!postContent.trim() || posting || !user) return
        setPosting(true)
        try {
            const data = await createPost({ content: postContent })
            if (data) {
                setPosts(prev => {
                    if (prev.some(p => p.id === data.id)) return prev
                    return [data, ...prev]
                })
            }
            setPostContent("")
        } catch (err) {
            console.error("create post error:", err)
        } finally {
            setPosting(false)
        }
    }

    const handleLike = async (postId) => {
        if (!user) return
        try {
            const wasLiked = likedPosts.has(postId)

            // Optimistic update
            setPosts(prev => prev.map(p => p.id === postId ? {
                ...p,
                post_likes: [{ count: Math.max(0, (p.post_likes?.[0]?.count || 0) + (wasLiked ? -1 : 1)) }]
            } : p))
            setLikedPosts(prev => {
                const next = new Set(prev)
                wasLiked ? next.delete(postId) : next.add(postId)
                return next
            })

            await toggleLike(postId)
        } catch (err) {
            console.error("like error", err)
        }
    }

    const handleDelete = async (postId) => {
        try {
            setPosts(prev => prev.filter(p => p.id !== postId))
            await deletePost(postId)
        } catch (e) {
            console.error(e)
        }
    }

    const toggleCommentsPanel = async (postId) => {
        if (activeComments === postId) {
            setActiveComments(null)
            return
        }
        setActiveComments(postId)
        if (!comments[postId]) {
            try {
                const data = await getComments(postId)
                setComments(prev => ({ ...prev, [postId]: data || [] }))
            } catch (err) {
                console.error("fetch comments error", err)
            }
        }
    }

    const handlePostComment = async (postId) => {
        if (!commentText.trim() || commenting || !user) return
        setCommenting(true)
        try {
            const data = await createComment(postId, commentText)
            if (data) {
                setComments(prev => {
                    const existing = prev[postId] || []
                    if (existing.some(c => c.id === data.id)) return prev
                    return { ...prev, [postId]: [...existing, data] }
                })
                setPosts(prev => prev.map(p => p.id === postId ? { ...p, post_comments: [{ count: (p.post_comments?.[0]?.count || 0) + 1 }] } : p))
            }
            setCommentText("")
        } catch (err) {
            console.error("post comment error", err)
        } finally {
            setCommenting(false)
        }
    }

    const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Founder"
    const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "/default-avatar.png"

    return (
        <section className="flex-1 flex flex-col xl:flex-row relative h-full">
            {/* Central Feed Section */}
            <div className="flex-1 max-w-3xl mx-auto px-4 md:px-8 py-8 w-full" ref={feedRef}>

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome, {displayName}</h1>
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

                {/* Post Composer */}
                <div className="glass-panel rounded-2xl p-5 mb-8 focus-within:ring-1 focus-within:ring-rose-500/50 transition-all">
                    <div className="flex gap-4">
                        <img src={displayAvatar} alt="User" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white/10" />
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
                    ) : posts.filter(Boolean).map(post => (
                        <article key={post.id} className="glass-panel rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <img
                                        src={post?.profiles?.avatar_url || "/default-avatar.png"}
                                        className="w-11 h-11 rounded-xl object-cover bg-white/10"
                                    />
                                    <div>
                                        <h3 className="font-bold text-white">
                                            {post?.profiles?.name || "Founder"}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            {new Date(post?.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {post.user_id === user?.id && (
                                    <button onClick={() => handleDelete(post.id)} className="text-gray-600 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-[15px] leading-relaxed mb-4 text-gray-300 whitespace-pre-wrap">
                                {post?.content}
                            </p>

                            {post?.image && (
                                <img src={post?.image} className="w-full h-[250px] object-cover rounded-xl mt-4 mb-4 border border-white/5" />
                            )}

                            <div className="flex items-center gap-6 text-gray-500 pt-4 border-t border-white/5 mb-2">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 transition-colors group ${likedPosts.has(post.id) ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                >
                                    <Heart className="w-[18px] h-[18px]" fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                                    <span className="text-sm font-medium">
                                        {post?.post_likes?.[0]?.count || 0}
                                    </span>
                                </button>

                                <button
                                    onClick={() => toggleCommentsPanel(post.id)}
                                    className="flex items-center gap-2 hover:text-emerald-500 transition-colors group"
                                >
                                    <MessageSquare className="w-[18px] h-[18px]" />
                                    <span className="text-sm font-medium">
                                        {post?.post_comments?.[0]?.count || 0}
                                    </span>
                                </button>
                            </div>

                            <AnimatePresence>
                                {activeComments === post.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-white/5 pt-4 mt-2"
                                    >
                                        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                                            {(comments[post.id] || []).length === 0 ? (
                                                <p className="text-sm text-gray-500 py-2">No comments yet. Be the first!</p>
                                            ) : (
                                                (comments[post.id] || []).map((comment) => (
                                                    <div key={comment.id} className="flex gap-3">
                                                        <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full bg-white/5 object-cover" />
                                                        <div className="bg-white/5 rounded-xl px-4 py-2 flex-1">
                                                            <div className="flex justify-between items-baseline mb-1">
                                                                <span className="text-sm font-bold text-white">{comment.profiles?.name || 'Founder'}</span>
                                                                <span className="text-[10px] text-gray-500">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-300">{comment.content || comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment(post.id)}
                                                placeholder="Write a comment..."
                                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50"
                                            />
                                            <button
                                                onClick={() => handlePostComment(post.id)}
                                                disabled={commenting || !commentText.trim()}
                                                className="w-10 h-10 flex items-center justify-center rounded-xl accent-gradient text-white disabled:opacity-50 shrink-0"
                                            >
                                                {commenting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                                    <img src={conn?.avatar_url || conn?.avatar || "/default-avatar.png"} className="w-9 h-9 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 truncate">{conn?.name || 'Founder'}</p>
                                        {conn?.role && <p className="text-xs text-gray-500 truncate">{conn.role}</p>}
                                    </div>
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

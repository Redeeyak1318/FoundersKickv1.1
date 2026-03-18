import { Search, Filter, MapPin, Briefcase, Link, UserPlus, UserMinus, Loader2, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getNetworkSuggestions, followUser, unfollowUser } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function NetworkPage() {
    const { user } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [followingMap, setFollowingMap] = useState({})
    const [processing, setProcessing] = useState({})
    const [query, setQuery] = useState("")

    useEffect(() => {
        const channel = supabase
            .channel("follows-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "follows" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    setFollowingMap(prev => ({ ...prev, [payload.new.following_id]: true }))
                }
                if (payload.eventType === "DELETE") {
                    setFollowingMap(prev => ({ ...prev, [payload.old.following_id]: false }))
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    useEffect(() => {
        const loadNetwork = async () => {
            try {
                const data = await getNetworkSuggestions()
                const list = data || []
                setUsers(list)

                const fMap = {}
                list.forEach(u => { fMap[u.id] = u.is_following || false })
                setFollowingMap(fMap)
            } catch (err) {
                console.error('network error:', err)
            } finally {
                setLoading(false)
            }
        }

        loadNetwork()
    }, [])

    const handleToggleFollow = async (userId) => {
        if (processing[userId]) return
        const isFollowing = followingMap[userId]

        setProcessing(prev => ({ ...prev, [userId]: true }))
        setFollowingMap(prev => ({ ...prev, [userId]: !isFollowing }))

        try {
            if (isFollowing) {
                await unfollowUser(userId)
            } else {
                await followUser(userId)
            }
        } catch (err) {
            setFollowingMap(prev => ({ ...prev, [userId]: isFollowing }))
            console.error('follow toggle error:', err)
        } finally {
            setProcessing(prev => ({ ...prev, [userId]: false }))
        }
    }

    const filteredUsers = users.filter(u => {
        const q = query.toLowerCase()
        return (
            u.name?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q) ||
            u.company?.toLowerCase().includes(q) ||
            u.location?.toLowerCase().includes(q)
        )
    })

    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Network</h1>
                    <p className="text-gray-400">Discover founders, investors, and potential collaborators.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="neumorphic-input flex items-center px-4 py-2.5 rounded-xl w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search network..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-gray-600"
                        />
                    </div>
                    <button className="h-10 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">Filters</span>
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 text-center">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No network suggestions yet</h3>
                    <p className="text-sm text-gray-500">As more founders join, you'll see connection suggestions here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((u, idx) => (
                        <motion.div
                            key={u.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-panel rounded-3xl p-6 group hover:border-[#F43F5E]/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <img src={u.avatar || u.avatar_url || '/default-avatar.png'} className="w-14 h-14 rounded-2xl object-cover bg-white/10" alt={u.name || 'User'} />
                                <button
                                    onClick={() => handleToggleFollow(u.id)}
                                    disabled={processing[u.id]}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${followingMap[u.id]
                                        ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
                                        : 'text-gray-400 bg-white/5 hover:text-[#F43F5E] hover:bg-[#F43F5E]/10'
                                        }`}
                                >
                                    {processing[u.id]
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : followingMap[u.id]
                                            ? <UserMinus className="w-4 h-4" />
                                            : <UserPlus className="w-4 h-4" />
                                    }
                                </button>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-[#F43F5E] transition-colors">{u.name || 'Unnamed'}</h3>
                            <p className="text-sm text-rose-500/80 font-medium mb-4">{u.role || 'Founder'}{u.company ? ` @ ${u.company}` : ''}</p>

                            <div className="space-y-2 mb-6 text-sm text-gray-400">
                                {u.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{u.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2" />
                                <button
                                    onClick={() => handleToggleFollow(u.id)}
                                    disabled={processing[u.id]}
                                    className="text-[#F43F5E] text-sm font-semibold flex items-center gap-1 hover:opacity-80"
                                >
                                    {followingMap[u.id] ? 'Following' : 'Connect'} <Link className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    )
}

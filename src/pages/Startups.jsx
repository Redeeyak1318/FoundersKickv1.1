import { Search, TrendingUp, Bookmark, ChevronRight, Loader2, Plus, Briefcase, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getStartups, createStartup } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Startups() {
    const { user } = useAuth()
    const [startups, setStartups] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newStartup, setNewStartup] = useState({
        name: '', tagline: '', stage: 'Seed', tags: ''
    })

    useEffect(() => {
        const loadStartups = async () => {
            try {
                const data = await getStartups()
                setStartups(data || [])
            } catch (err) {
                console.error('startups error:', err)
            } finally {
                setLoading(false)
            }
        }
        loadStartups()
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel("startups-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "startups" }, (payload) => {
                setStartups(prev => {
                    const exists = prev.some(s => s.id === payload.new.id)
                    return exists ? prev : [payload.new, ...prev]
                })
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [])

    const handleCreate = async () => {
        if (!newStartup.name.trim() || creating) return
        setCreating(true)
        try {
            const payload = {
                ...newStartup,
                tags: newStartup.tags.split(',').map(t => t.trim()).filter(Boolean)
            }
            const data = await createStartup(payload)
            if (data.startup) {
                setStartups(prev => [data.startup, ...prev])
            }
            setNewStartup({ name: '', tagline: '', stage: 'Seed', tags: '' })
            setShowCreate(false)
        } catch (err) {
            console.error('create startup error:', err)
        } finally {
            setCreating(false)
        }
    }

    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Startups Showcase</h1>
                    <p className="text-gray-400">Discover and track the fastest-growing startups in the ecosystem.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-full accent-gradient text-sm font-medium text-white transition flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Submit Startup
                    </button>
                </div>
            </header>

            {/* Create Startup Modal */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-6 rounded-3xl mb-8 relative"
                >
                    <button onClick={() => {
                        setShowCreate(false)
                        setNewStartup({ name: '', tagline: '', stage: 'Seed', tags: '' })
                    }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-bold text-white mb-4">Submit Your Startup</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" value={newStartup.name} onChange={(e) => setNewStartup(prev => ({ ...prev, name: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50" placeholder="Startup Name" />
                        <select value={newStartup.stage} onChange={(e) => setNewStartup(prev => ({ ...prev, stage: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50">
                            <option value="Pre-Seed">Pre-Seed</option>
                            <option value="Seed">Seed</option>
                            <option value="Series A">Series A</option>
                            <option value="Series B">Series B</option>
                            <option value="Growth">Growth</option>
                        </select>
                        <input type="text" value={newStartup.tagline} onChange={(e) => setNewStartup(prev => ({ ...prev, tagline: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50 md:col-span-2" placeholder="One-line tagline" />
                        <input type="text" value={newStartup.tags} onChange={(e) => setNewStartup(prev => ({ ...prev, tags: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50 md:col-span-2" placeholder="Tags (comma-separated, e.g. #AI, #B2B)" />
                    </div>
                    <button onClick={handleCreate} disabled={creating || !newStartup.name.trim()} className="accent-gradient px-6 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                    </button>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </div>
            ) : startups.length === 0 ? (
                <div className="glass-panel rounded-3xl p-16 text-center">
                    <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No startups yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Be the first to showcase your startup in the ecosystem.</p>
                    <button onClick={() => setShowCreate(true)} className="accent-gradient px-6 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                        Submit Your Startup
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {startups.map((startup, idx) => (
                        <motion.div
                            key={startup.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                            className="glass-panel p-6 rounded-3xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-4">
                                    <img src={startup.logo || '/default-avatar.png'} alt={startup.name} className="w-16 h-16 rounded-2xl bg-white/5 p-1 border border-white/5" />
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{startup.name}</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">{startup.tagline}</p>
                                    </div>
                                </div>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-white/5">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {startup.stage && (
                                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-semibold tracking-wide text-gray-300 border border-white/5">{startup.stage}</span>
                                )}
                                {(Array.isArray(startup.tags) ? startup.tags : []).map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[#111418] rounded-lg text-xs font-medium text-gray-500 border border-white/5">{tag}</span>
                                ))}
                            </div>
                            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors border border-white/5 flex items-center justify-center gap-2">
                                View Deep Dive <ChevronRight className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    )
}

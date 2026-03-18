import { MapPin, ExternalLink, MessageSquare, Briefcase, Plus, Loader2, Edit3, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { getStartups, updateProfile } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'

export default function Profile() {
    const { user, profile, refreshProfile } = useAuth()
    const [startup, setStartup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editData, setEditData] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const loadExtras = async () => {
            try {
                const startupsData = await getStartups()
                const list = startupsData || []
                if (list.length > 0) setStartup(list[0])
            } catch (e) { /* No startups yet */ }
            setLoading(false)
        }
        loadExtras()
    }, [])

    const handleEdit = () => {
        setEditData({
            name: profile?.name || user?.user_metadata?.full_name || '',
            bio: profile?.bio || '',
            location: profile?.location || '',
            role: profile?.role || '',
            company: profile?.company || ''
        })
        setEditing(true)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateProfile(editData)
            await refreshProfile()
            setEditing(false)
        } catch (err) {
            console.error('update profile error:', err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <section className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </section>
        )
    }

    const displayName = profile?.name || user?.user_metadata?.full_name || 'Unnamed Founder'
    const displayRole = profile?.role || 'Founder'
    const displayCompany = profile?.company || ''
    const displayBio = profile?.bio || ''
    const displayLocation = profile?.location || ''
    const displayAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || '/default-avatar.png'

    return (
        <section className="flex-1 w-full relative">
            {/* Cover Photo */}
            <div className="w-full h-64 bg-gradient-to-tr from-rose-900/30 via-[#16181D] to-rose-500/10 border-b border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116] to-transparent" />
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-8 w-full relative -mt-24 pb-20">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column: Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full md:w-80 shrink-0"
                    >
                        <div className="glass-panel rounded-3xl p-6 relative">
                            {/* Avatar */}
                            <img src={displayAvatar} alt={displayName} className="w-32 h-32 rounded-3xl object-cover bg-[#0E1116] border-4 border-[#0E1116] shadow-xl relative z-10 -mt-20 mx-auto md:mx-0 mb-4" />

                            {editing ? (
                                <div className="space-y-3 mb-6">
                                    <input type="text" value={editData.name} onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50" placeholder="Your name" />
                                    <input type="text" value={editData.role} onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50" placeholder="Your role" />
                                    <input type="text" value={editData.company} onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50" placeholder="Company" />
                                    <textarea value={editData.bio} onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50 resize-none h-20" placeholder="Your bio" />
                                    <input type="text" value={editData.location} onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-rose-500/50" placeholder="Location" />
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} disabled={saving} className="flex-1 accent-gradient h-10 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                                        </button>
                                        <button onClick={() => setEditing(false)} className="flex-1 glass-panel h-10 rounded-xl text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center md:text-left mb-6">
                                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{displayName}</h1>
                                        <p className="text-sm font-semibold text-rose-500">{displayRole}{displayCompany && ` @ ${displayCompany}`}</p>
                                    </div>

                                    {displayBio && (
                                        <p className="text-sm text-gray-400 leading-relaxed mb-6 italic text-center md:text-left">
                                            "{displayBio}"
                                        </p>
                                    )}

                                    <div className="space-y-3 mb-8">
                                        {displayLocation && (
                                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                                <MapPin className="w-4 h-4 text-gray-500" /> {displayLocation}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={handleEdit} className="accent-gradient h-11 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                            <Edit3 className="w-4 h-4" /> Edit
                                        </button>
                                        <button className="glass-panel h-11 rounded-xl text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="glass-panel p-6 rounded-3xl mt-6 space-y-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Founder Stats</h4>
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <span className="text-sm font-medium text-gray-400">Connections</span>
                                <span className="text-xl font-bold text-white">{profile?.connections_count ?? '—'}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <span className="text-sm font-medium text-gray-400">Followers</span>
                                <span className="text-xl font-bold text-white">{profile?.followers_count ?? '—'}</span>
                            </div>
                            <div className="flex justify-between items-end pb-1">
                                <span className="text-sm font-medium text-gray-400">Profile Views</span>
                                <span className="text-xl font-bold text-white">{profile?.views_count ?? '—'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Timeline & Highlights */}
                    <div className="flex-1 min-w-0 w-full pt-10 md:pt-28 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-400" /> Current Venture
                            </h3>
                            {startup ? (
                                <div className="glass-panel p-6 rounded-3xl group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <img src={startup.logo || '/default-avatar.png'} className="w-14 h-14 rounded-2xl bg-[#111418] border border-white/5" />
                                            <div>
                                                <h4 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors">{startup.name}</h4>
                                                <p className="text-sm text-gray-400">{startup.tagline}</p>
                                            </div>
                                        </div>
                                        <button className="text-gray-500 hover:text-white transition-colors">
                                            <ExternalLink className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {startup.metrics && startup.metrics.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {startup.metrics.map(m => (
                                                <div key={m.label} className="bg-[#111418] rounded-xl p-3 border border-white/5 text-center">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                                                    <p className="text-base font-bold text-white">{m.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="glass-panel rounded-3xl p-6 h-32 flex items-center justify-center flex-col text-center">
                                    <p className="text-gray-400 text-sm font-medium">No venture added yet.</p>
                                    <p className="text-xs text-gray-500 mt-1">Add your startup in the Launchpad section.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">Activity Timeline</h3>
                            </div>
                            <div className="glass-panel rounded-3xl p-6 h-48 flex items-center justify-center flex-col text-center">
                                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                    <Plus className="w-6 h-6 text-gray-500" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Activity timeline is currently empty.</p>
                                <p className="text-xs text-gray-500 mt-1">Founders post updates to build in public here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

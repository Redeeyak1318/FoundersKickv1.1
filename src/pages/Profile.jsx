import { MapPin, Link2, ExternalLink, MessageSquare, Briefcase, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_USERS, MOCK_STARTUPS } from '../data/mockData'

export default function Profile() {
    const user = MOCK_USERS.currentUser
    const company = MOCK_STARTUPS[0]

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
                            <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-3xl object-cover bg-[#0E1116] border-4 border-[#0E1116] shadow-xl relative z-10 -mt-20 mx-auto md:mx-0 mb-4" />

                            <div className="text-center md:text-left mb-6">
                                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{user.name}</h1>
                                <p className="text-sm font-semibold text-rose-500">{user.role} @ {user.company}</p>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed mb-6 italic text-center md:text-left">
                                "{user.bio}"
                            </p>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <MapPin className="w-4 h-4 text-gray-500" /> {user.location}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <Link2 className="w-4 h-4 text-gray-500" /> sarahjin.dev
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="accent-gradient h-11 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                                    Follow
                                </button>
                                <button className="glass-panel h-11 rounded-xl text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats side card */}
                        <div className="glass-panel p-6 rounded-3xl mt-6 space-y-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Founder Stats</h4>
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <span className="text-sm font-medium text-gray-400">Connections</span>
                                <span className="text-xl font-bold text-white">432</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-3">
                                <span className="text-sm font-medium text-gray-400">Followers</span>
                                <span className="text-xl font-bold text-white">615</span>
                            </div>
                            <div className="flex justify-between items-end pb-1">
                                <span className="text-sm font-medium text-gray-400">Profile Views</span>
                                <span className="text-xl font-bold text-white">1.2k</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Timeline & Highlights */}
                    <div className="flex-1 min-w-0 w-full pt-10 md:pt-28 space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-gray-400" /> Current Venture
                            </h3>
                            <div className="glass-panel p-6 rounded-3xl group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img src={company.logo} className="w-14 h-14 rounded-2xl bg-[#111418] border border-white/5" />
                                        <div>
                                            <h4 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors">{company.name}</h4>
                                            <p className="text-sm text-gray-400">{company.tagline}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {company.metrics.map(m => (
                                        <div key={m.label} className="bg-[#111418] rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                                            <p className="text-base font-bold text-white">{m.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

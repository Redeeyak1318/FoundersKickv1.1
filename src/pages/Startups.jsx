import { Search, MapPin, TrendingUp, Users, Bookmark, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_STARTUPS } from '../data/mockData'

export default function Startups() {
    return (
        <section className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-10 w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Startups Showcase</h1>
                    <p className="text-gray-400">Discover and track the fastest-growing startups in the ecosystem.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-sm font-medium text-white hover:bg-white/10 transition">All Stages</button>
                    <button className="px-5 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-sm font-medium text-rose-500 transition">Seed</button>
                    <button className="px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-sm font-medium text-white hover:bg-white/10 transition">Series A</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {MOCK_STARTUPS.map((startup, idx) => (
                    <motion.div
                        key={startup.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel p-6 rounded-3xl relative overflow-hidden group"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl group-hover:bg-rose-500/10 transition-colors pointer-events-none" />

                        <div className="flex items-start justify-between mb-5 relative z-10">
                            <div className="flex items-center gap-4">
                                <img src={startup.logo} alt={startup.name} className="w-16 h-16 rounded-2xl bg-white/5 p-1 border border-white/5" />
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{startup.name}</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{startup.tagline}</p>
                                </div>
                            </div>
                            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${startup.bookmark ? 'text-rose-500 bg-rose-500/10' : 'text-gray-500 hover:bg-white/5'}`}>
                                <Bookmark className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-semibold tracking-wide text-gray-300 border border-white/5">{startup.stage}</span>
                            {startup.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-[#111418] rounded-lg text-xs font-medium text-gray-500 border border-white/5">{tag}</span>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {startup.metrics.map(m => (
                                <div key={m.label} className="bg-[#111418] rounded-xl p-3 border border-white/5 text-center">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">{m.label}</p>
                                    <p className="text-base font-bold text-white">{m.value}</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors border border-white/5 flex items-center justify-center gap-2">
                            View Deep Dive <ChevronRight className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
